"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onApplicationCreated = exports.submitRating = exports.markConversationRead = exports.sendChatMessage = exports.startConversation = exports.checkOut = exports.checkIn = exports.updateApplicationStatus = exports.withdrawApplication = exports.applyJob = void 0;
const https_1 = require("firebase-functions/v2/https");
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const firestore_2 = require("firebase-functions/v2/firestore");
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
function assertAuth(context) {
    if (!context.auth?.uid) {
        throw new https_1.HttpsError('unauthenticated', 'Bạn cần đăng nhập để thực hiện thao tác này.');
    }
    return context.auth.uid;
}
function normalizeApplicationId(candidateId, jobId, shiftId) {
    return `${candidateId}_${jobId}_${shiftId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
}
function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function decodeQrPayload(payload) {
    try {
        const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
        if (Date.now() > decoded.expiresAt)
            return null;
        return decoded;
    }
    catch {
        return null;
    }
}
function getCapacity(jobData, shiftId) {
    const shiftCapacity = (jobData.shift_capacity ?? {});
    const capacity = shiftCapacity[shiftId];
    if (capacity) {
        return {
            totalSlots: Number(capacity.total_slots ?? 0),
            remainingSlots: Number(capacity.remaining_slots ?? 0),
            appliedCount: Number(capacity.applied_count ?? 0),
        };
    }
    const shifts = Array.isArray(jobData.shifts) ? jobData.shifts : [];
    const targetShift = shifts.find((item) => String(item.id) === shiftId);
    const quantity = Number(targetShift?.quantity ?? 0);
    return {
        totalSlots: quantity,
        remainingSlots: quantity,
        appliedCount: 0,
    };
}
function getChatPermissionFromApplicationStatus(status) {
    if (['APPROVED', 'CHECKED_IN', 'COMPLETED'].includes(status)) {
        return 'TWO_WAY';
    }
    if (['REJECTED', 'CANCELLED'].includes(status)) {
        return 'NONE';
    }
    return 'EMPLOYER_ONLY';
}
function getConversationStatus(permission) {
    if (permission === 'NONE')
        return 'CLOSED';
    if (permission === 'TWO_WAY')
        return 'ACTIVE';
    return 'PENDING';
}
function normalizeMessageId(clientMessageId) {
    const normalized = clientMessageId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
    if (normalized.length > 0)
        return normalized;
    return `msg_${Date.now()}`;
}
async function createNotification(tx, userId, type, title, body, data = {}) {
    const notifRef = db.collection('notifications').doc();
    tx.set(notifRef, {
        userId,
        user_id: userId,
        type,
        category: 'APPLICATION',
        title,
        body,
        data,
        isRead: false,
        is_read: false,
        created_at: firestore_1.FieldValue.serverTimestamp(),
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
}
exports.applyJob = (0, https_1.onCall)({ region: 'asia-southeast1' }, async (request) => {
    const uid = assertAuth(request);
    const input = request.data;
    if (uid !== input.candidateId) {
        throw new https_1.HttpsError('permission-denied', 'Bạn không thể ứng tuyển thay người khác.');
    }
    if (!input.jobId || !input.shiftId) {
        throw new https_1.HttpsError('invalid-argument', 'Thiếu thông tin job hoặc ca làm.');
    }
    const applicationId = normalizeApplicationId(input.candidateId, input.jobId, input.shiftId);
    const applicationRef = db.collection('applications').doc(applicationId);
    const jobRef = db.collection('jobs').doc(input.jobId);
    const result = await db.runTransaction(async (tx) => {
        const candidateRef = db.collection('users').doc(input.candidateId);
        const [jobSnap, appSnap, candidateSnap] = await Promise.all([
            tx.get(jobRef),
            tx.get(applicationRef),
            tx.get(candidateRef),
        ]);
        if (!jobSnap.exists) {
            throw new https_1.HttpsError('not-found', 'Công việc không tồn tại.');
        }
        if (appSnap.exists) {
            const appData = appSnap.data() || {};
            return {
                applicationId: appSnap.id,
                status: String(appData.status ?? 'NEW'),
                remainingSlots: undefined,
            };
        }
        const jobData = jobSnap.data() || {};
        const status = String(jobData.status ?? 'OPEN').toUpperCase();
        if (status !== 'OPEN' && status !== 'ACTIVE') {
            throw new https_1.HttpsError('failed-precondition', 'Công việc đã đóng tuyển.');
        }
        const capacity = getCapacity(jobData, input.shiftId);
        if (capacity.remainingSlots <= 0) {
            throw new https_1.HttpsError('failed-precondition', 'Ca làm đã đủ số lượng.');
        }
        const employerId = String(jobData.employer_id ?? jobData.employerId ?? '');
        // ─── Denormalize candidate snapshot ───
        const candidateData = candidateSnap.exists ? (candidateSnap.data() || {}) : {};
        const candidateName = String(candidateData.full_name ?? candidateData.fullName ?? candidateData.display_name ?? candidateData.displayName ?? '');
        const candidateAvatar = String(candidateData.avatar_url ?? candidateData.avatarUrl ?? candidateData.photo_url ?? candidateData.photoURL ?? '');
        const candidateSkills = candidateData.skills ?? [];
        const candidateRating = Number(candidateData.reputation_score ?? candidateData.reputationScore ?? 0);
        const candidateVerified = (candidateData.verification_status ?? candidateData.verificationStatus) === 'VERIFIED';
        tx.set(applicationRef, {
            job_id: input.jobId,
            shift_id: input.shiftId,
            employer_id: employerId,
            candidate_id: input.candidateId,
            status: 'NEW',
            payment_status: 'UNPAID',
            cover_letter: input.coverLetter ?? '',
            idempotency_key: input.idempotencyKey,
            applied_at: firestore_1.FieldValue.serverTimestamp(),
            created_at: firestore_1.FieldValue.serverTimestamp(),
            updated_at: firestore_1.FieldValue.serverTimestamp(),
            // ─── Denormalized candidate snapshot ───
            candidate_name: candidateName,
            candidate_avatar: candidateAvatar,
            candidate_skills: candidateSkills,
            candidate_rating: candidateRating,
            candidate_verified: candidateVerified,
        });
        const nextRemaining = Math.max(capacity.remainingSlots - 1, 0);
        tx.set(jobRef, {
            shift_capacity: {
                ...(jobData.shift_capacity ?? {}),
                [input.shiftId]: {
                    total_slots: capacity.totalSlots,
                    remaining_slots: nextRemaining,
                    applied_count: capacity.appliedCount + 1,
                },
            },
            updated_at: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
        return {
            applicationId,
            status: 'NEW',
            remainingSlots: nextRemaining,
        };
    });
    return result;
});
exports.withdrawApplication = (0, https_1.onCall)({ region: 'asia-southeast1' }, async (request) => {
    const uid = assertAuth(request);
    const input = request.data;
    if (uid !== input.candidateId) {
        throw new https_1.HttpsError('permission-denied', 'Bạn không thể hủy đơn của người khác.');
    }
    const applicationRef = db.collection('applications').doc(input.applicationId);
    await db.runTransaction(async (tx) => {
        const appSnap = await tx.get(applicationRef);
        if (!appSnap.exists) {
            throw new https_1.HttpsError('not-found', 'Đơn ứng tuyển không tồn tại.');
        }
        const appData = appSnap.data() || {};
        if (String(appData.candidate_id ?? '') !== uid) {
            throw new https_1.HttpsError('permission-denied', 'Bạn không có quyền hủy đơn này.');
        }
        const currentStatus = String(appData.status ?? 'NEW');
        if (['COMPLETED', 'CANCELLED'].includes(currentStatus)) {
            return;
        }
        tx.set(applicationRef, {
            status: 'CANCELLED',
            updated_at: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
        const jobId = String(appData.job_id ?? '');
        const shiftId = String(appData.shift_id ?? '');
        if (!jobId || !shiftId)
            return;
        const jobRef = db.collection('jobs').doc(jobId);
        const jobSnap = await tx.get(jobRef);
        if (!jobSnap.exists)
            return;
        const jobData = jobSnap.data() || {};
        const capacity = getCapacity(jobData, shiftId);
        tx.set(jobRef, {
            shift_capacity: {
                ...(jobData.shift_capacity ?? {}),
                [shiftId]: {
                    total_slots: capacity.totalSlots,
                    remaining_slots: Math.min(capacity.remainingSlots + 1, capacity.totalSlots),
                    applied_count: Math.max(capacity.appliedCount - 1, 0),
                },
            },
            updated_at: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
    });
    return { success: true };
});
exports.updateApplicationStatus = (0, https_1.onCall)({ region: 'asia-southeast1' }, async (request) => {
    const uid = assertAuth(request);
    const input = request.data;
    const applicationRef = db.collection('applications').doc(input.applicationId);
    const application = await db.runTransaction(async (tx) => {
        const appSnap = await tx.get(applicationRef);
        if (!appSnap.exists) {
            throw new https_1.HttpsError('not-found', 'Đơn ứng tuyển không tồn tại.');
        }
        const appData = appSnap.data() || {};
        const employerId = String(appData.employer_id ?? appData.employerId ?? '');
        const candidateId = String(appData.candidate_id ?? appData.candidateId ?? '');
        const byEmployer = uid === employerId && ['APPROVED', 'REJECTED', 'COMPLETED'].includes(input.status);
        const byCandidate = uid === candidateId && input.status === 'CANCELLED';
        console.log(`[updateApplicationStatus] Attempting to update application ${input.applicationId} to status ${input.status}`);
        console.log(`[updateApplicationStatus] Caller UID: ${uid}, App EmployerId: ${employerId}, App CandidateId: ${candidateId}`);
        console.log(`[updateApplicationStatus] Check result -> byEmployer: ${byEmployer}, byCandidate: ${byCandidate}`);
        if (!byEmployer && !byCandidate) {
            throw new https_1.HttpsError('permission-denied', `Bạn không có quyền cập nhật trạng thái này. UID của bạn là ${uid}, nhưng cần là ${employerId} hoặc ${candidateId}.`);
        }
        tx.set(applicationRef, {
            status: input.status,
            updated_at: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
        // ─── Notify Candidate ───
        if (input.status === 'APPROVED' || input.status === 'REJECTED') {
            const jobRef = db.collection('jobs').doc(String(appData.job_id ?? appData.jobId ?? ''));
            const jobSnap = await tx.get(jobRef);
            const jobData = jobSnap.exists ? jobSnap.data() : {};
            const jobTitle = String(jobData?.title ?? 'Công việc');
            const title = input.status === 'APPROVED' ? 'Ứng tuyển thành công' : 'Kết quả ứng tuyển';
            const body = input.status === 'APPROVED'
                ? `Đơn ứng tuyển của bạn cho công việc "${jobTitle}" đã được duyệt.`
                : `Rất tiếc, đơn ứng tuyển của bạn cho công việc "${jobTitle}" không được duyệt lần này.`;
            await createNotification(tx, candidateId, `APPLICATION_${input.status}`, title, body, {
                applicationId: appSnap.id,
                jobId: String(appData.job_id ?? appData.jobId ?? ''),
                status: input.status,
            });
        }
        const payload = {
            id: appSnap.id,
            jobId: String(appData.job_id ?? appData.jobId ?? ''),
            shiftId: String(appData.shift_id ?? appData.shiftId ?? ''),
            employerId,
            candidateId,
            status: input.status,
            paymentStatus: String(appData.payment_status ?? appData.paymentStatus ?? 'UNPAID'),
            coverLetter: String(appData.cover_letter ?? appData.coverLetter ?? ''),
            createdAt: appData.created_at ?? appData.createdAt,
            updatedAt: firestore_1.Timestamp.now(),
        };
        return payload;
    });
    return { application };
});
exports.checkIn = (0, https_1.onCall)({ region: 'asia-southeast1' }, async (request) => {
    const uid = assertAuth(request);
    const input = request.data;
    if (uid !== input.candidateId) {
        throw new https_1.HttpsError('permission-denied', 'Bạn không thể chấm công thay người khác.');
    }
    if (input.accuracy > 50) {
        throw new https_1.HttpsError('failed-precondition', 'Độ chính xác GPS không đạt yêu cầu.');
    }
    const applicationRef = db.collection('applications').doc(input.applicationId);
    const result = await db.runTransaction(async (tx) => {
        const appSnap = await tx.get(applicationRef);
        if (!appSnap.exists) {
            throw new https_1.HttpsError('not-found', 'Không tìm thấy đơn ứng tuyển.');
        }
        const appData = appSnap.data() || {};
        if (String(appData.candidate_id ?? '') !== uid) {
            throw new https_1.HttpsError('permission-denied', 'Bạn không có quyền check-in đơn này.');
        }
        if (String(appData.status ?? 'NEW') !== 'APPROVED') {
            throw new https_1.HttpsError('failed-precondition', 'Đơn chưa ở trạng thái được nhận việc.');
        }
        const jobId = String(appData.job_id ?? '');
        const shiftId = String(appData.shift_id ?? '');
        const jobRef = db.collection('jobs').doc(jobId);
        const jobSnap = await tx.get(jobRef);
        if (!jobSnap.exists) {
            throw new https_1.HttpsError('not-found', 'Không tìm thấy công việc.');
        }
        const jobData = jobSnap.data() || {};
        const location = (jobData.location ?? {});
        const jobLat = Number(location.latitude ?? 0);
        const jobLng = Number(location.longitude ?? 0);
        const radius = Number(jobData.checkin_radius_m ?? 100);
        const distanceMeters = haversineDistanceMeters(input.latitude, input.longitude, jobLat, jobLng);
        let method = 'GPS';
        if (distanceMeters > radius) {
            const decoded = input.qrPayload ? decodeQrPayload(input.qrPayload) : null;
            if (!decoded || decoded.jobId !== jobId || decoded.shiftId !== shiftId) {
                throw new https_1.HttpsError('failed-precondition', 'Bạn đang ở ngoài phạm vi check-in và QR không hợp lệ.');
            }
            method = 'QR';
        }
        const checkinRef = applicationRef.collection('checkins').doc();
        tx.set(checkinRef, {
            application_id: input.applicationId,
            candidate_id: uid,
            job_id: jobId,
            shift_id: shiftId,
            type: method,
            gps_location: {
                latitude: input.latitude,
                longitude: input.longitude,
                accuracy: input.accuracy,
            },
            distance_meters: Math.round(distanceMeters),
            status: 'CHECKED_IN',
            check_in_time: firestore_1.FieldValue.serverTimestamp(),
            created_at: firestore_1.FieldValue.serverTimestamp(),
            updated_at: firestore_1.FieldValue.serverTimestamp(),
        });
        tx.set(applicationRef, {
            status: 'CHECKED_IN',
            updated_at: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
        return {
            checkinId: checkinRef.id,
            status: 'CHECKED_IN',
            method,
            distanceMeters: Math.round(distanceMeters),
        };
    });
    return result;
});
exports.checkOut = (0, https_1.onCall)({ region: 'asia-southeast1' }, async (request) => {
    const uid = assertAuth(request);
    const input = request.data;
    if (uid !== input.candidateId) {
        throw new https_1.HttpsError('permission-denied', 'Bạn không thể check-out thay người khác.');
    }
    const applicationRef = db.collection('applications').doc(input.applicationId);
    const activeCheckins = await applicationRef
        .collection('checkins')
        .where('status', '==', 'CHECKED_IN')
        .limit(1)
        .get();
    if (activeCheckins.empty) {
        throw new https_1.HttpsError('failed-precondition', 'Không tìm thấy phiên check-in đang hoạt động.');
    }
    const checkinRef = activeCheckins.docs[0].ref;
    await db.runTransaction(async (tx) => {
        const appSnap = await tx.get(applicationRef);
        if (!appSnap.exists) {
            throw new https_1.HttpsError('not-found', 'Không tìm thấy đơn ứng tuyển.');
        }
        const appData = appSnap.data() || {};
        if (String(appData.candidate_id ?? '') !== uid) {
            throw new https_1.HttpsError('permission-denied', 'Bạn không có quyền check-out đơn này.');
        }
        tx.set(checkinRef, {
            status: 'CHECKED_OUT',
            check_out_time: firestore_1.FieldValue.serverTimestamp(),
            updated_at: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
        tx.set(applicationRef, {
            status: 'COMPLETED',
            updated_at: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
    });
    return { success: true };
});
exports.startConversation = (0, https_1.onCall)({ region: 'asia-southeast1' }, async (request) => {
    const uid = assertAuth(request);
    const input = request.data;
    if (!input.applicationId) {
        throw new https_1.HttpsError('invalid-argument', 'Thiếu applicationId để mở hội thoại.');
    }
    const applicationRef = db.collection('applications').doc(input.applicationId);
    const conversationRef = db.collection('conversations').doc(input.applicationId);
    const result = await db.runTransaction(async (tx) => {
        const [applicationSnap, conversationSnap] = await Promise.all([
            tx.get(applicationRef),
            tx.get(conversationRef),
        ]);
        if (!applicationSnap.exists) {
            throw new https_1.HttpsError('not-found', 'Không tìm thấy đơn ứng tuyển.');
        }
        const applicationData = applicationSnap.data() || {};
        const candidateId = String(applicationData.candidate_id ?? applicationData.candidateId ?? '');
        const employerId = String(applicationData.employer_id ?? applicationData.employerId ?? '');
        const applicationStatus = String(applicationData.status ?? 'NEW').toUpperCase();
        if (uid !== candidateId && uid !== employerId) {
            throw new https_1.HttpsError('permission-denied', 'Bạn không thuộc hội thoại này.');
        }
        const chatPermission = getChatPermissionFromApplicationStatus(applicationStatus);
        const conversationStatus = getConversationStatus(chatPermission);
        if (!conversationSnap.exists) {
            tx.set(conversationRef, {
                application_id: input.applicationId,
                job_id: String(applicationData.job_id ?? applicationData.jobId ?? ''),
                candidate_id: candidateId,
                employer_id: employerId,
                status: conversationStatus,
                chat_permission: chatPermission,
                candidate_unread_count: 0,
                employer_unread_count: 0,
                created_at: firestore_1.FieldValue.serverTimestamp(),
                updated_at: firestore_1.FieldValue.serverTimestamp(),
            });
        }
        else {
            tx.set(conversationRef, {
                status: conversationStatus,
                chat_permission: chatPermission,
                updated_at: firestore_1.FieldValue.serverTimestamp(),
            }, { merge: true });
        }
        return {
            conversationId: conversationRef.id,
            status: conversationStatus,
            chatPermission,
        };
    });
    return result;
});
exports.sendChatMessage = (0, https_1.onCall)({ region: 'asia-southeast1' }, async (request) => {
    const uid = assertAuth(request);
    const input = request.data;
    const text = String(input.text ?? '').trim();
    if (!text) {
        throw new https_1.HttpsError('invalid-argument', 'Nội dung tin nhắn không được để trống.');
    }
    if (text.length > 1000) {
        throw new https_1.HttpsError('invalid-argument', 'Tin nhắn vượt quá 1000 ký tự.');
    }
    const conversationId = String(input.conversationId ?? input.applicationId ?? '').trim();
    const applicationId = String(input.applicationId ?? input.conversationId ?? '').trim();
    if (!conversationId || !applicationId) {
        throw new https_1.HttpsError('invalid-argument', 'Thiếu conversationId/applicationId để gửi tin nhắn.');
    }
    const normalizedMessageId = normalizeMessageId(input.clientMessageId ?? '');
    const conversationRef = db.collection('conversations').doc(conversationId);
    const result = await db.runTransaction(async (tx) => {
        let conversationSnap = await tx.get(conversationRef);
        let conversationData = conversationSnap.data() || {};
        if (!conversationSnap.exists) {
            const applicationRef = db.collection('applications').doc(applicationId);
            const applicationSnap = await tx.get(applicationRef);
            if (!applicationSnap.exists) {
                throw new https_1.HttpsError('not-found', 'Không tìm thấy đơn ứng tuyển.');
            }
            const applicationData = applicationSnap.data() || {};
            const candidateId = String(applicationData.candidate_id ?? applicationData.candidateId ?? '');
            const employerId = String(applicationData.employer_id ?? applicationData.employerId ?? '');
            const applicationStatus = String(applicationData.status ?? 'NEW').toUpperCase();
            if (uid !== candidateId && uid !== employerId) {
                throw new https_1.HttpsError('permission-denied', 'Bạn không thuộc hội thoại này.');
            }
            const chatPermission = getChatPermissionFromApplicationStatus(applicationStatus);
            const conversationStatus = getConversationStatus(chatPermission);
            conversationData = {
                application_id: applicationId,
                job_id: String(applicationData.job_id ?? applicationData.jobId ?? ''),
                candidate_id: candidateId,
                employer_id: employerId,
                status: conversationStatus,
                chat_permission: chatPermission,
                candidate_unread_count: 0,
                employer_unread_count: 0,
            };
            tx.set(conversationRef, {
                ...conversationData,
                created_at: firestore_1.FieldValue.serverTimestamp(),
                updated_at: firestore_1.FieldValue.serverTimestamp(),
            });
            conversationSnap = await tx.get(conversationRef);
        }
        const candidateId = String(conversationData.candidate_id ?? '');
        const employerId = String(conversationData.employer_id ?? '');
        const chatPermission = String(conversationData.chat_permission ?? 'EMPLOYER_ONLY');
        const conversationStatus = String(conversationData.status ?? 'PENDING');
        if (uid !== candidateId && uid !== employerId) {
            throw new https_1.HttpsError('permission-denied', 'Bạn không thuộc hội thoại này.');
        }
        if (conversationStatus === 'CLOSED' || conversationStatus === 'BLOCKED' || chatPermission === 'NONE') {
            throw new https_1.HttpsError('failed-precondition', 'Hội thoại đã bị khóa.');
        }
        if (chatPermission === 'EMPLOYER_ONLY' && uid !== employerId) {
            throw new https_1.HttpsError('permission-denied', 'Ứng viên chưa được phép gửi tin nhắn.');
        }
        const senderRole = uid === employerId ? 'EMPLOYER' : 'CANDIDATE';
        const messageRef = conversationRef.collection('messages').doc(normalizedMessageId);
        const existingMessageSnap = await tx.get(messageRef);
        if (!existingMessageSnap.exists) {
            tx.set(messageRef, {
                conversation_id: conversationRef.id,
                application_id: String(conversationData.application_id ?? applicationId),
                sender_id: uid,
                sender_role: senderRole,
                message_type: 'TEXT',
                text,
                client_message_id: normalizedMessageId,
                created_at: firestore_1.FieldValue.serverTimestamp(),
            });
        }
        const candidateUnreadCount = Number(conversationData.candidate_unread_count ?? 0);
        const employerUnreadCount = Number(conversationData.employer_unread_count ?? 0);
        tx.set(conversationRef, {
            status: chatPermission === 'TWO_WAY' ? 'ACTIVE' : conversationStatus,
            last_message_text: text,
            last_message_at: firestore_1.FieldValue.serverTimestamp(),
            last_message_by: uid,
            candidate_unread_count: senderRole === 'EMPLOYER' ? candidateUnreadCount + 1 : candidateUnreadCount,
            employer_unread_count: senderRole === 'CANDIDATE' ? employerUnreadCount + 1 : employerUnreadCount,
            updated_at: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
        return {
            conversationId: conversationRef.id,
            messageId: normalizedMessageId,
            createdAt: new Date().toISOString(),
        };
    });
    return result;
});
exports.markConversationRead = (0, https_1.onCall)({ region: 'asia-southeast1' }, async (request) => {
    const uid = assertAuth(request);
    const input = request.data;
    if (!input.conversationId) {
        throw new https_1.HttpsError('invalid-argument', 'Thiếu conversationId.');
    }
    const conversationRef = db.collection('conversations').doc(input.conversationId);
    await db.runTransaction(async (tx) => {
        const conversationSnap = await tx.get(conversationRef);
        if (!conversationSnap.exists) {
            throw new https_1.HttpsError('not-found', 'Không tìm thấy hội thoại.');
        }
        const data = conversationSnap.data() || {};
        const candidateId = String(data.candidate_id ?? '');
        const employerId = String(data.employer_id ?? '');
        if (uid !== candidateId && uid !== employerId) {
            throw new https_1.HttpsError('permission-denied', 'Bạn không thuộc hội thoại này.');
        }
        if (uid === candidateId) {
            tx.set(conversationRef, {
                candidate_unread_count: 0,
                updated_at: firestore_1.FieldValue.serverTimestamp(),
            }, { merge: true });
            return;
        }
        tx.set(conversationRef, {
            employer_unread_count: 0,
            updated_at: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
    });
    return { success: true };
});
exports.submitRating = (0, https_1.onCall)({ region: 'asia-southeast1' }, async (request) => {
    const uid = assertAuth(request);
    const input = request.data;
    if (uid !== input.reviewerId) {
        throw new https_1.HttpsError('permission-denied', 'Bạn không thể gửi đánh giá thay người khác.');
    }
    if (input.rating < 1 || input.rating > 5) {
        throw new https_1.HttpsError('invalid-argument', 'Điểm đánh giá phải nằm trong khoảng 1-5.');
    }
    const applicationRef = db.collection('applications').doc(input.applicationId);
    const reviewId = `${input.applicationId}_${uid}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    const reviewRef = db.collection('reviews').doc(reviewId);
    await db.runTransaction(async (tx) => {
        const [appSnap, reviewSnap] = await Promise.all([tx.get(applicationRef), tx.get(reviewRef)]);
        if (!appSnap.exists) {
            throw new https_1.HttpsError('not-found', 'Không tìm thấy đơn ứng tuyển.');
        }
        const appData = appSnap.data() || {};
        const appStatus = String(appData.status ?? 'NEW');
        if (appStatus !== 'COMPLETED') {
            throw new https_1.HttpsError('failed-precondition', 'Chỉ có thể đánh giá sau khi hoàn thành ca làm.');
        }
        const isParticipant = uid === String(appData.candidate_id ?? '') || uid === String(appData.employer_id ?? '');
        if (!isParticipant) {
            throw new https_1.HttpsError('permission-denied', 'Bạn không có quyền đánh giá đơn này.');
        }
        if (reviewSnap.exists) {
            throw new https_1.HttpsError('already-exists', 'Bạn đã đánh giá cho đơn này rồi.');
        }
        tx.set(reviewRef, {
            application_id: input.applicationId,
            reviewer_id: input.reviewerId,
            reviewee_id: input.revieweeId,
            rating: input.rating,
            comment: input.comment ?? '',
            created_at: firestore_1.FieldValue.serverTimestamp(),
            updated_at: firestore_1.FieldValue.serverTimestamp(),
        });
    });
    const reviewsSnap = await db
        .collection('reviews')
        .where('reviewee_id', '==', input.revieweeId)
        .get();
    let total = 0;
    reviewsSnap.docs.forEach((docSnap) => {
        total += Number(docSnap.data().rating ?? 0);
    });
    const average = reviewsSnap.size > 0 ? Number((total / reviewsSnap.size).toFixed(2)) : 0;
    await db.collection('users').doc(input.revieweeId).set({
        reputation_score: average,
        updated_at: firestore_1.FieldValue.serverTimestamp(),
    }, { merge: true });
    return {
        reviewId,
        updatedReputationScore: average,
    };
});
/* ── Firestore Triggers ────────────────────────── */
exports.onApplicationCreated = (0, firestore_2.onDocumentCreated)({
    document: 'applications/{applicationId}',
    region: 'asia-southeast1',
}, async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        console.error(`[onApplicationCreated] No snapshot data for application ${event.params.applicationId}`);
        return;
    }
    const appData = snapshot.data();
    console.log(`[onApplicationCreated] Triggered for application: ${event.params.applicationId}`, appData);
    let employerId = String(appData.employer_id ?? appData.employerId ?? '');
    const candidateName = String(appData.candidate_name ?? appData.candidateName ?? 'Ứng viên');
    const candidateId = String(appData.candidate_id ?? appData.candidateId ?? '');
    const jobId = String(appData.job_id ?? appData.jobId ?? '');
    if (!jobId) {
        console.error(`[onApplicationCreated] Missing jobId for application ${event.params.applicationId}`);
        return;
    }
    // ─── Recover jobTitle and employerId if missing ───
    let jobTitle = String(appData.job_title ?? appData.jobTitle ?? 'Công việc');
    try {
        const jobSnap = await db.collection('jobs').doc(jobId).get();
        if (jobSnap.exists) {
            const jobData = jobSnap.data();
            if (jobData?.title) {
                jobTitle = String(jobData.title);
            }
            if (!employerId) {
                employerId = String(jobData?.employer_id ?? jobData?.employerId ?? '');
                console.log(`[onApplicationCreated] Recovered employerId ${employerId} from job ${jobId}`);
            }
        }
        else {
            console.warn(`[onApplicationCreated] Job ${jobId} not found in Firestore`);
        }
    }
    catch (err) {
        console.error(`[onApplicationCreated] Error fetching job ${jobId}:`, err);
    }
    if (!employerId) {
        console.error(`[onApplicationCreated] Still missing employerId for application ${event.params.applicationId}`);
        return;
    }
    const notifRef = db.collection('notifications').doc();
    const timestamp = firestore_1.FieldValue.serverTimestamp();
    const notificationPayload = {
        userId: employerId,
        user_id: employerId,
        type: 'NEW_APPLICATION',
        category: 'APPLICATION',
        title: 'Đơn ứng tuyển mới',
        body: `Bạn có đơn ứng tuyển mới từ ${candidateName} cho công việc: ${jobTitle}`,
        data: {
            applicationId: event.params.applicationId,
            jobId,
            candidateId,
        },
        isRead: false,
        is_read: false,
        created_at: timestamp,
        createdAt: timestamp,
    };
    await notifRef.set(notificationPayload);
    console.log(`[onApplicationCreated] Notification created for employer ${employerId} on application ${event.params.applicationId}`, notificationPayload);
});
