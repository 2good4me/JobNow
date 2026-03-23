import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { onSchedule } from 'firebase-functions/v2/scheduler';

initializeApp();

const db = getFirestore();

interface ApplyJobInput {
  jobId: string;
  shiftId: string;
  candidateId: string;
  coverLetter?: string;
  idempotencyKey: string;
}

interface WithdrawApplicationInput {
  applicationId: string;
  candidateId: string;
}

interface UpdateApplicationStatusInput {
  applicationId: string;
  status: 'NEW' | 'PENDING' | 'REVIEWED' | 'APPROVED' | 'REJECTED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
}

interface CheckInInput {
  applicationId: string;
  candidateId: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  qrPayload?: string;
}

interface CheckOutInput {
  applicationId: string;
  candidateId: string;
}

interface RatingInput {
  applicationId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
}

interface StartConversationInput {
  applicationId: string;
}

interface SendChatMessageInput {
  conversationId?: string;
  applicationId?: string;
  text: string;
  clientMessageId: string;
}

interface MarkConversationReadInput {
  conversationId: string;
}

interface ProcessPaymentInput {
  applicationId: string;
  employerId: string;
}

interface MarkCashPaymentInput {
  applicationId: string;
  employerId: string;
}

interface ConfirmCashPaymentInput {
  applicationId: string;
  candidateId: string;
}

interface ProcessDepositInput {
  userId: string;
  amount: number;
  method: string;
  externalRef?: string;
}

interface ProcessWithdrawalInput {
  userId: string;
  amount: number;
  bankAccount: string;
  externalRef?: string;
}

interface ForceCheckOutInput {
  applicationId: string;
  employerId: string;
}

interface SimulateWorkTimeInput {
  applicationId: string;
  hoursAgo: number;
}

interface ReviewVerificationInput {
  userId: string;
  requestId: string;
  action: 'APPROVE' | 'REJECT';
  rejectionReason?: string;
}

interface AdminSetUserStatusInput {
  userId: string;
  action: 'LOCK' | 'UNLOCK' | 'BAN';
  reason?: string;
}

function assertAuth(context: { auth?: { uid?: string } }) {
  if (!context.auth?.uid) {
    throw new HttpsError('unauthenticated', 'Bạn cần đăng nhập để thực hiện thao tác này.');
  }
  return context.auth.uid;
}

function normalizeApplicationId(candidateId: string, jobId: string, shiftId: string): string {
  return `${candidateId}_${jobId}_${shiftId}`.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function normalizeDocumentId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
}

function haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function decodeQrPayload(payload: string): { jobId: string; shiftId: string; expiresAt: number } | null {
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8')) as {
      jobId: string;
      shiftId: string;
      expiresAt: number;
    };
    if (Date.now() > decoded.expiresAt) return null;
    return decoded;
  } catch {
    return null;
  }
}

function getCapacity(jobData: FirebaseFirestore.DocumentData, shiftId: string) {
  const shiftCapacity = (jobData.shift_capacity ?? {}) as Record<string, { total_slots: number; remaining_slots: number; applied_count: number }>;
  const capacity = shiftCapacity[shiftId];

  if (capacity) {
    return {
      totalSlots: Number(capacity.total_slots ?? 0),
      remainingSlots: Number(capacity.remaining_slots ?? 0),
      appliedCount: Number(capacity.applied_count ?? 0),
    };
  }

  const shifts = Array.isArray(jobData.shifts) ? jobData.shifts : [];
  const targetShift = shifts.find((item: any) => String(item.id) === shiftId);
  const quantity = Number(targetShift?.quantity ?? 0);

  return {
    totalSlots: quantity,
    remainingSlots: quantity,
    appliedCount: 0,
  };
}

function getChatPermissionFromApplicationStatus(status: string): 'NONE' | 'EMPLOYER_ONLY' | 'TWO_WAY' {
  if (['APPROVED', 'CHECKED_IN', 'COMPLETED'].includes(status)) {
    return 'TWO_WAY';
  }
  if (['REJECTED', 'CANCELLED'].includes(status)) {
    return 'NONE';
  }
  return 'EMPLOYER_ONLY';
}

function getConversationStatus(permission: 'NONE' | 'EMPLOYER_ONLY' | 'TWO_WAY'): 'PENDING' | 'ACTIVE' | 'CLOSED' {
  if (permission === 'NONE') return 'CLOSED';
  if (permission === 'TWO_WAY') return 'ACTIVE';
  return 'PENDING';
}

function normalizeMessageId(clientMessageId: string): string {
  const normalized = clientMessageId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  if (normalized.length > 0) return normalized;
  return `msg_${Date.now()}`;
}

function timestampToDate(value: unknown): Date | null {
  if (!value) return null;
  if (typeof value === 'object' && value && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    try {
      return (value as { toDate: () => Date }).toDate();
    } catch {
      return null;
    }
  }

  const parsed = new Date(value as string | number | Date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getShiftWindow(jobData: FirebaseFirestore.DocumentData, shiftId: string) {
  const shifts = Array.isArray(jobData.shifts) ? jobData.shifts : [];
  const targetShift = shifts.find((item: any) => String(item.id) === shiftId);
  const startDate = String(jobData.start_date ?? jobData.startDate ?? '').trim();
  const startTime = String(targetShift?.start_time ?? targetShift?.startTime ?? '').trim();
  const endTime = String(targetShift?.end_time ?? targetShift?.endTime ?? '').trim();

  if (!targetShift || !startDate || !startTime || !endTime) {
    return null;
  }

  const start = new Date(`${startDate}T${startTime}:00`);
  const end = new Date(`${startDate}T${endTime}:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }

  return {
    shift: targetShift,
    start,
    end,
    startTime,
    endTime,
    title: String(jobData.title ?? 'Công việc'),
  };
}

function calculatePayoutAmount(jobData: FirebaseFirestore.DocumentData, applicationData: FirebaseFirestore.DocumentData): number {
  const salary = Number(jobData.salary ?? 0);
  const salaryType = String(jobData.salary_type ?? jobData.salaryType ?? 'HOURLY').toUpperCase();

  if (salary <= 0) return 0;

  if (salaryType !== 'HOURLY') {
    return salary;
  }

  const checkInTime = timestampToDate(applicationData.check_in_time ?? applicationData.checkInTime);
  const checkOutTime = timestampToDate(applicationData.check_out_time ?? applicationData.checkOutTime);

  if (!checkInTime || !checkOutTime || checkOutTime <= checkInTime) {
    return salary;
  }

  const hoursWorked = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
  return Math.max(Math.round(hoursWorked * salary), 0);
}

function buildNotificationPayload(
  userId: string,
  type: string,
  title: string,
  body: string,
  data: Record<string, string> = {},
  category = 'APPLICATION'
) {
  return {
    userId,
    user_id: userId,
    type,
    category,
    title,
    body,
    data,
    isRead: false,
    is_read: false,
    created_at: FieldValue.serverTimestamp(),
    createdAt: FieldValue.serverTimestamp(),
  };
}

async function createNotification(
  tx: FirebaseFirestore.Transaction,
  userId: string,
  type: string,
  title: string,
  body: string,
  data: Record<string, string> = {},
  category = 'APPLICATION'
) {
  const notifRef = db.collection('notifications').doc();
  tx.set(notifRef, buildNotificationPayload(userId, type, title, body, data, category));
}

async function createNotificationDoc(
  userId: string,
  type: string,
  title: string,
  body: string,
  data: Record<string, string> = {},
  category = 'APPLICATION'
) {
  const notifRef = db.collection('notifications').doc();
  await notifRef.set(buildNotificationPayload(userId, type, title, body, data, category));
}

async function assertAdmin(uid: string) {
  const adminSnap = await db.collection('users').doc(uid).get();
  const role = String(adminSnap.data()?.role ?? '').toUpperCase();
  if (!adminSnap.exists || role !== 'ADMIN') {
    throw new HttpsError('permission-denied', 'Bạn không có quyền quản trị để thực hiện thao tác này.');
  }
  return adminSnap;
}

async function sendPushForNotification(notification: Record<string, unknown>) {
  const userId = String(notification.user_id ?? notification.userId ?? '').trim();
  if (!userId) return;

  const userSnap = await db.collection('users').doc(userId).get();
  if (!userSnap.exists) return;

  const userData = userSnap.data() ?? {};
  if (userData.notification_push === false) return;

  const rawTokens = [
    ...(Array.isArray(userData.fcm_tokens) ? userData.fcm_tokens : []),
    ...(Array.isArray(userData.fcmTokens) ? userData.fcmTokens : []),
  ];

  const tokens = Array.from(new Set(rawTokens.filter((item): item is string => typeof item === 'string' && item.length > 0)));
  if (tokens.length === 0) return;

  const data = Object.entries((notification.data ?? {}) as Record<string, unknown>).reduce<Record<string, string>>((acc, [key, value]) => {
    acc[key] = String(value ?? '');
    return acc;
  }, {});

  const response = await getMessaging().sendEachForMulticast({
    tokens,
    notification: {
      title: String(notification.title ?? 'JobNow'),
      body: String(notification.body ?? 'Bạn có thông báo mới.'),
    },
    data,
    webpush: {
      notification: {
        title: String(notification.title ?? 'JobNow'),
        body: String(notification.body ?? 'Bạn có thông báo mới.'),
      },
      fcmOptions: {
        link: data.jobId ? `/candidate/jobs/${data.jobId}` : '/',
      },
    },
  });

  const invalidTokens = response.responses.flatMap((item, index) => {
    const code = item.error?.code ?? '';
    if (code === 'messaging/invalid-registration-token' || code === 'messaging/registration-token-not-registered') {
      return [tokens[index]];
    }
    return [];
  });

  if (invalidTokens.length > 0) {
    await db.collection('users').doc(userId).set({
      fcm_tokens: FieldValue.arrayRemove(...invalidTokens),
      fcmTokens: FieldValue.arrayRemove(...invalidTokens),
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });
  }
}

export const applyJob = onCall<ApplyJobInput>({ region: 'asia-southeast1' }, async (request) => {
  const uid = assertAuth(request);
  const input = request.data;

  if (uid !== input.candidateId) {
    throw new HttpsError('permission-denied', 'Bạn không thể ứng tuyển thay người khác.');
  }

  if (!input.jobId || !input.shiftId) {
    throw new HttpsError('invalid-argument', 'Thiếu thông tin job hoặc ca làm.');
  }

  const applicationId = normalizeApplicationId(input.candidateId, input.jobId, input.shiftId);
  const applicationRef = db.collection('applications').doc(applicationId);
  const jobRef = db.collection('jobs').doc(input.jobId);

  const jobPreviewSnap = await jobRef.get();
  if (!jobPreviewSnap.exists) {
    throw new HttpsError('not-found', 'Công việc không tồn tại.');
  }

  const jobPreviewData = jobPreviewSnap.data() || {};
  const targetWindow = getShiftWindow(jobPreviewData, input.shiftId);
  if (targetWindow) {
    const approvedApps = await db
      .collection('applications')
      .where('candidate_id', '==', input.candidateId)
      .where('status', 'in', ['APPROVED', 'CHECKED_IN'])
      .get();

    for (const appDoc of approvedApps.docs) {
      if (appDoc.id === applicationId) continue;

      const otherAppData = appDoc.data();
      const otherJobId = String(otherAppData.job_id ?? otherAppData.jobId ?? '');
      const otherShiftId = String(otherAppData.shift_id ?? otherAppData.shiftId ?? '');
      if (!otherJobId || !otherShiftId) continue;

      const otherJobSnap = await db.collection('jobs').doc(otherJobId).get();
      if (!otherJobSnap.exists) continue;

      const otherWindow = getShiftWindow(otherJobSnap.data() || {}, otherShiftId);
      if (!otherWindow) continue;

      if (targetWindow.start < otherWindow.end && targetWindow.end > otherWindow.start) {
        throw new HttpsError(
          'failed-precondition',
          `Khung giờ này trùng với lịch làm việc "${otherWindow.title}" (${otherWindow.startTime}-${otherWindow.endTime}). Vui lòng chọn ca khác.`
        );
      }
    }
  }

  const result = await db.runTransaction(async (tx) => {
    const candidateRef = db.collection('users').doc(input.candidateId);
    const [jobSnap, appSnap, candidateSnap] = await Promise.all([
      tx.get(jobRef),
      tx.get(applicationRef),
      tx.get(candidateRef),
    ]);

    if (!jobSnap.exists) {
      throw new HttpsError('not-found', 'Công việc không tồn tại.');
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
      throw new HttpsError('failed-precondition', 'Công việc đã đóng tuyển.');
    }

    const capacity = getCapacity(jobData, input.shiftId);
    if (capacity.remainingSlots <= 0) {
      throw new HttpsError('failed-precondition', 'Ca làm đã đủ số lượng.');
    }

    const employerId = String(jobData.employer_id ?? jobData.employerId ?? '');
    const employerName = String(jobData.employer_name ?? jobData.employerName ?? '');
    const shiftWindow = getShiftWindow(jobData, input.shiftId);

    // ─── Denormalize candidate snapshot ───
    const candidateData = candidateSnap.exists ? (candidateSnap.data() || {}) : {};
    const candidateName = String(candidateData.full_name ?? candidateData.fullName ?? candidateData.display_name ?? candidateData.displayName ?? '');
    const candidateAvatar = String(candidateData.avatar_url ?? candidateData.avatarUrl ?? candidateData.photo_url ?? candidateData.photoURL ?? '');
    const candidateSkills = (candidateData.skills as string[]) ?? [];
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
      applied_at: FieldValue.serverTimestamp(),
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
      // ─── Denormalized candidate snapshot ───
      candidate_name: candidateName,
      candidate_avatar: candidateAvatar,
      candidate_skills: candidateSkills,
      candidate_rating: candidateRating,
      candidate_verified: candidateVerified,
      job_title: String(jobData.title ?? ''),
      shift_time: shiftWindow ? `${shiftWindow.startTime} - ${shiftWindow.endTime}` : '',
      employer_name: employerName,
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
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });

    return {
      applicationId,
      status: 'NEW',
      remainingSlots: nextRemaining,
    };
  });

  return result;
});

export const withdrawApplication = onCall<WithdrawApplicationInput>({ region: 'asia-southeast1' }, async (request) => {
  const uid = assertAuth(request);
  const input = request.data;

  if (uid !== input.candidateId) {
    throw new HttpsError('permission-denied', 'Bạn không thể hủy đơn của người khác.');
  }

  const applicationRef = db.collection('applications').doc(input.applicationId);

  await db.runTransaction(async (tx) => {
    const appSnap = await tx.get(applicationRef);
    if (!appSnap.exists) {
      throw new HttpsError('not-found', 'Đơn ứng tuyển không tồn tại.');
    }

    const appData = appSnap.data() || {};
    if (String(appData.candidate_id ?? '') !== uid) {
      throw new HttpsError('permission-denied', 'Bạn không có quyền hủy đơn này.');
    }

    const currentStatus = String(appData.status ?? 'NEW');
    if (['COMPLETED', 'CANCELLED'].includes(currentStatus)) {
      return;
    }

    tx.set(applicationRef, {
      status: 'CANCELLED',
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });

    const jobId = String(appData.job_id ?? '');
    const shiftId = String(appData.shift_id ?? '');
    if (!jobId || !shiftId) return;

    const jobRef = db.collection('jobs').doc(jobId);
    const jobSnap = await tx.get(jobRef);
    if (!jobSnap.exists) return;

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
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });

    let penalty = 0;
    let isUrgent = false;

    const shifts = Array.isArray(jobData.shifts) ? jobData.shifts : [];
    const targetShift = shifts.find((s: any) => String(s.id) === shiftId);
    if (jobData.start_date && targetShift?.start_time) {
      const shiftDateTimeStr = `${jobData.start_date}T${targetShift.start_time}:00`;
      const shiftTimeMs = new Date(shiftDateTimeStr).getTime();
      if (!isNaN(shiftTimeMs)) {
        const hoursUntilShift = (shiftTimeMs - Date.now()) / (1000 * 60 * 60);
        
        if (hoursUntilShift > 0 && hoursUntilShift < 12) {
          penalty = 30;
          isUrgent = true;
        } else if (hoursUntilShift >= 12 && hoursUntilShift <= 24) {
          penalty = 10;
        } else if (hoursUntilShift > 24) {
          penalty = 2;
        } else {
           penalty = 30;
        }
      }
    }

    if (penalty > 0) {
      const candidateRef = db.collection('users').doc(uid);
      tx.set(candidateRef, {
        reputation_score: FieldValue.increment(-penalty),
        updated_at: FieldValue.serverTimestamp()
      }, { merge: true });
      
      await createNotification(tx, uid, 'SYSTEM_ALERT', 'Trừ điểm uy tín', `Bạn bị trừ ${penalty} điểm uy tín do hủy đơn ứng tuyển!`);
    }

    if (isUrgent) {
      const shiftRef = jobRef.collection('shifts').doc(shiftId);
      tx.set(shiftRef, {
        status: 'OPEN',
        is_urgent: true,
        updated_at: FieldValue.serverTimestamp()
      }, { merge: true });

      const eventRef = db.collection('urgent_shift_events').doc();
      tx.set(eventRef, {
        job_id: jobId,
        shift_id: shiftId,
        employer_id: jobData.employer_id ?? jobData.employerId ?? '',
        location: jobData.location ?? null,
        created_at: FieldValue.serverTimestamp(),
        processed: false
      });
    }
  });

  return { success: true };
});

export const updateApplicationStatus = onCall<UpdateApplicationStatusInput>({ region: 'asia-southeast1' }, async (request) => {
  const uid = assertAuth(request);
  const input = request.data;

  const applicationRef = db.collection('applications').doc(input.applicationId);

  const application = await db.runTransaction(async (tx) => {
    const appSnap = await tx.get(applicationRef);
    if (!appSnap.exists) {
      throw new HttpsError('not-found', 'Đơn ứng tuyển không tồn tại.');
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
      throw new HttpsError('permission-denied', `Bạn không có quyền cập nhật trạng thái này. UID của bạn là ${uid}, nhưng cần là ${employerId} hoặc ${candidateId}.`);
    }

    tx.set(applicationRef, {
      status: input.status,
      updated_at: FieldValue.serverTimestamp(),
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
      updatedAt: Timestamp.now(),
    };

    return payload;
  });

  return { application };
});

export const checkIn = onCall<CheckInInput>({ region: 'asia-southeast1' }, async (request) => {
  const uid = assertAuth(request);
  const input = request.data;

  if (uid !== input.candidateId) {
    throw new HttpsError('permission-denied', 'Bạn không thể chấm công thay người khác.');
  }

  if (input.accuracy > 50) {
    throw new HttpsError('failed-precondition', 'Độ chính xác GPS không đạt yêu cầu.');
  }

  const applicationRef = db.collection('applications').doc(input.applicationId);

  const result = await db.runTransaction(async (tx) => {
    const appSnap = await tx.get(applicationRef);
    if (!appSnap.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy đơn ứng tuyển.');
    }

    const appData = appSnap.data() || {};
    if (String(appData.candidate_id ?? '') !== uid) {
      throw new HttpsError('permission-denied', 'Bạn không có quyền check-in đơn này.');
    }

    if (String(appData.status ?? 'NEW') !== 'APPROVED') {
      throw new HttpsError('failed-precondition', 'Đơn chưa ở trạng thái được nhận việc.');
    }

    const jobId = String(appData.job_id ?? '');
    const shiftId = String(appData.shift_id ?? '');
    const jobRef = db.collection('jobs').doc(jobId);
    const jobSnap = await tx.get(jobRef);
    if (!jobSnap.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy công việc.');
    }

    const jobData = jobSnap.data() || {};
    const location = (jobData.location ?? {}) as { latitude?: number; longitude?: number };
    const jobLat = Number(location.latitude ?? 0);
    const jobLng = Number(location.longitude ?? 0);
    const radius = Number(jobData.checkin_radius_m ?? 100);

    const distanceMeters = haversineDistanceMeters(input.latitude, input.longitude, jobLat, jobLng);

    let method: 'GPS' | 'QR' = 'GPS';
    if (distanceMeters > radius) {
      const decoded = input.qrPayload ? decodeQrPayload(input.qrPayload) : null;
      if (!decoded || decoded.jobId !== jobId || decoded.shiftId !== shiftId) {
        throw new HttpsError('failed-precondition', 'Bạn đang ở ngoài phạm vi check-in và QR không hợp lệ.');
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
      check_in_time: FieldValue.serverTimestamp(),
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });

    tx.set(applicationRef, {
      status: 'CHECKED_IN',
      check_in_time: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });

    return {
      checkinId: checkinRef.id,
      status: 'CHECKED_IN' as const,
      method,
      distanceMeters: Math.round(distanceMeters),
    };
  });

  return result;
});

export const checkOut = onCall<CheckOutInput>({ region: 'asia-southeast1' }, async (request) => {
  const uid = assertAuth(request);
  const input = request.data;

  if (uid !== input.candidateId) {
    throw new HttpsError('permission-denied', 'Bạn không thể check-out thay người khác.');
  }

  const applicationRef = db.collection('applications').doc(input.applicationId);

  const activeCheckins = await applicationRef
    .collection('checkins')
    .where('status', '==', 'CHECKED_IN')
    .limit(1)
    .get();

  if (activeCheckins.empty) {
    throw new HttpsError('failed-precondition', 'Không tìm thấy phiên check-in đang hoạt động.');
  }

  const checkinRef = activeCheckins.docs[0].ref;

  await db.runTransaction(async (tx) => {
    const appSnap = await tx.get(applicationRef);
    if (!appSnap.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy đơn ứng tuyển.');
    }

    const appData = appSnap.data() || {};
    if (String(appData.candidate_id ?? '') !== uid) {
      throw new HttpsError('permission-denied', 'Bạn không có quyền check-out đơn này.');
    }

    tx.set(checkinRef, {
      status: 'CHECKED_OUT',
      check_out_time: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });

    tx.set(applicationRef, {
      status: 'COMPLETED',
      check_out_time: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });
  });

  return { success: true };
});

export const forceCheckOut = onCall<ForceCheckOutInput>({ region: 'asia-southeast1' }, async (request) => {
  const uid = assertAuth(request);
  const input = request.data;

  if (uid !== input.employerId) {
    throw new HttpsError('permission-denied', 'Bạn không thể kết thúc ca thay nhà tuyển dụng khác.');
  }

  const applicationRef = db.collection('applications').doc(input.applicationId);

  const activeCheckins = await applicationRef
    .collection('checkins')
    .where('status', '==', 'CHECKED_IN')
    .limit(1)
    .get();

  if (activeCheckins.empty) {
    throw new HttpsError('failed-precondition', 'Không tìm thấy phiên check-in đang hoạt động.');
  }

  const checkinRef = activeCheckins.docs[0].ref;

  await db.runTransaction(async (tx) => {
    const appSnap = await tx.get(applicationRef);
    if (!appSnap.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy đơn ứng tuyển.');
    }

    const appData = appSnap.data() || {};
    const employerId = String(appData.employer_id ?? appData.employerId ?? '');
    if (employerId !== uid) {
      throw new HttpsError('permission-denied', 'Bạn không có quyền kết thúc ca của ứng viên này.');
    }

    tx.set(checkinRef, {
      status: 'CHECKED_OUT',
      check_out_time: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });

    tx.set(applicationRef, {
      status: 'COMPLETED',
      check_out_time: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });
  });

  return { success: true };
});

export const simulateWorkTime = onCall<SimulateWorkTimeInput>({ region: 'asia-southeast1' }, async (request) => {
  const uid = assertAuth(request);
  await assertAdmin(uid);

  const input = request.data;
  const applicationRef = db.collection('applications').doc(input.applicationId);
  const appSnap = await applicationRef.get();
  if (!appSnap.exists) {
    throw new HttpsError('not-found', 'Đơn ứng tuyển không tồn tại.');
  }

  const simulatedDate = new Date(Date.now() - Number(input.hoursAgo) * 60 * 60 * 1000);
  if (Number.isNaN(simulatedDate.getTime())) {
    throw new HttpsError('invalid-argument', 'Số giờ giả lập không hợp lệ.');
  }

  await applicationRef.set({
    check_in_time: Timestamp.fromDate(simulatedDate),
    updated_at: FieldValue.serverTimestamp(),
  }, { merge: true });

  return { success: true };
});

export const startConversation = onCall<StartConversationInput>({ region: 'asia-southeast1' }, async (request) => {
  const uid = assertAuth(request);
  const input = request.data;

  if (!input.applicationId) {
    throw new HttpsError('invalid-argument', 'Thiếu applicationId để mở hội thoại.');
  }

  const applicationRef = db.collection('applications').doc(input.applicationId);
  const conversationRef = db.collection('conversations').doc(input.applicationId);

  const result = await db.runTransaction(async (tx) => {
    const [applicationSnap, conversationSnap] = await Promise.all([
      tx.get(applicationRef),
      tx.get(conversationRef),
    ]);

    if (!applicationSnap.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy đơn ứng tuyển.');
    }

    const applicationData = applicationSnap.data() || {};
    const candidateId = String(applicationData.candidate_id ?? applicationData.candidateId ?? '');
    const employerId = String(applicationData.employer_id ?? applicationData.employerId ?? '');
    const applicationStatus = String(applicationData.status ?? 'NEW').toUpperCase();

    if (uid !== candidateId && uid !== employerId) {
      throw new HttpsError('permission-denied', 'Bạn không thuộc hội thoại này.');
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
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      });
    } else {
      tx.set(conversationRef, {
        status: conversationStatus,
        chat_permission: chatPermission,
        updated_at: FieldValue.serverTimestamp(),
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

export const sendChatMessage = onCall<SendChatMessageInput>({ region: 'asia-southeast1' }, async (request) => {
  const uid = assertAuth(request);
  const input = request.data;

  const text = String(input.text ?? '').trim();
  if (!text) {
    throw new HttpsError('invalid-argument', 'Nội dung tin nhắn không được để trống.');
  }
  if (text.length > 1000) {
    throw new HttpsError('invalid-argument', 'Tin nhắn vượt quá 1000 ký tự.');
  }

  const conversationId = String(input.conversationId ?? input.applicationId ?? '').trim();
  const applicationId = String(input.applicationId ?? input.conversationId ?? '').trim();
  if (!conversationId || !applicationId) {
    throw new HttpsError('invalid-argument', 'Thiếu conversationId/applicationId để gửi tin nhắn.');
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
        throw new HttpsError('not-found', 'Không tìm thấy đơn ứng tuyển.');
      }

      const applicationData = applicationSnap.data() || {};
      const candidateId = String(applicationData.candidate_id ?? applicationData.candidateId ?? '');
      const employerId = String(applicationData.employer_id ?? applicationData.employerId ?? '');
      const applicationStatus = String(applicationData.status ?? 'NEW').toUpperCase();

      if (uid !== candidateId && uid !== employerId) {
        throw new HttpsError('permission-denied', 'Bạn không thuộc hội thoại này.');
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
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      });
      conversationSnap = await tx.get(conversationRef);
    }

    const candidateId = String(conversationData.candidate_id ?? '');
    const employerId = String(conversationData.employer_id ?? '');
    const chatPermission = String(conversationData.chat_permission ?? 'EMPLOYER_ONLY');
    const conversationStatus = String(conversationData.status ?? 'PENDING');

    if (uid !== candidateId && uid !== employerId) {
      throw new HttpsError('permission-denied', 'Bạn không thuộc hội thoại này.');
    }

    if (conversationStatus === 'CLOSED' || conversationStatus === 'BLOCKED' || chatPermission === 'NONE') {
      throw new HttpsError('failed-precondition', 'Hội thoại đã bị khóa.');
    }

    if (chatPermission === 'EMPLOYER_ONLY' && uid !== employerId) {
      throw new HttpsError('permission-denied', 'Ứng viên chưa được phép gửi tin nhắn.');
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
        created_at: FieldValue.serverTimestamp(),
      });
    }

    const candidateUnreadCount = Number(conversationData.candidate_unread_count ?? 0);
    const employerUnreadCount = Number(conversationData.employer_unread_count ?? 0);

    tx.set(conversationRef, {
      status: chatPermission === 'TWO_WAY' ? 'ACTIVE' : conversationStatus,
      last_message_text: text,
      last_message_at: FieldValue.serverTimestamp(),
      last_message_by: uid,
      candidate_unread_count: senderRole === 'EMPLOYER' ? candidateUnreadCount + 1 : candidateUnreadCount,
      employer_unread_count: senderRole === 'CANDIDATE' ? employerUnreadCount + 1 : employerUnreadCount,
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });

    return {
      conversationId: conversationRef.id,
      messageId: normalizedMessageId,
      createdAt: new Date().toISOString(),
    };
  });

  return result;
});

export const markConversationRead = onCall<MarkConversationReadInput>({ region: 'asia-southeast1' }, async (request) => {
  const uid = assertAuth(request);
  const input = request.data;

  if (!input.conversationId) {
    throw new HttpsError('invalid-argument', 'Thiếu conversationId.');
  }

  const conversationRef = db.collection('conversations').doc(input.conversationId);
  await db.runTransaction(async (tx) => {
    const conversationSnap = await tx.get(conversationRef);
    if (!conversationSnap.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy hội thoại.');
    }

    const data = conversationSnap.data() || {};
    const candidateId = String(data.candidate_id ?? '');
    const employerId = String(data.employer_id ?? '');

    if (uid !== candidateId && uid !== employerId) {
      throw new HttpsError('permission-denied', 'Bạn không thuộc hội thoại này.');
    }

    if (uid === candidateId) {
      tx.set(conversationRef, {
        candidate_unread_count: 0,
        updated_at: FieldValue.serverTimestamp(),
      }, { merge: true });
      return;
    }

    tx.set(conversationRef, {
      employer_unread_count: 0,
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });
  });

  return { success: true };
});

export const submitRating = onCall<RatingInput>({ region: 'asia-southeast1' }, async (request) => {
  const uid = assertAuth(request);
  const input = request.data;

  if (uid !== input.reviewerId) {
    throw new HttpsError('permission-denied', 'Bạn không thể gửi đánh giá thay người khác.');
  }

  if (input.rating < 1 || input.rating > 5) {
    throw new HttpsError('invalid-argument', 'Điểm đánh giá phải nằm trong khoảng 1-5.');
  }

  const applicationRef = db.collection('applications').doc(input.applicationId);
  const reviewId = `${input.applicationId}_${uid}`.replace(/[^a-zA-Z0-9_-]/g, '_');
  const reviewRef = db.collection('reviews').doc(reviewId);

  await db.runTransaction(async (tx) => {
    const [appSnap, reviewSnap] = await Promise.all([tx.get(applicationRef), tx.get(reviewRef)]);

    if (!appSnap.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy đơn ứng tuyển.');
    }

    const appData = appSnap.data() || {};
    const appStatus = String(appData.status ?? 'NEW');
    if (appStatus !== 'COMPLETED') {
      throw new HttpsError('failed-precondition', 'Chỉ có thể đánh giá sau khi hoàn thành ca làm.');
    }

    const isParticipant = uid === String(appData.candidate_id ?? '') || uid === String(appData.employer_id ?? '');
    if (!isParticipant) {
      throw new HttpsError('permission-denied', 'Bạn không có quyền đánh giá đơn này.');
    }

    if (reviewSnap.exists) {
      throw new HttpsError('already-exists', 'Bạn đã đánh giá cho đơn này rồi.');
    }

    tx.set(reviewRef, {
      application_id: input.applicationId,
      reviewer_id: input.reviewerId,
      reviewee_id: input.revieweeId,
      rating: input.rating,
      comment: input.comment ?? '',
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
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
    updated_at: FieldValue.serverTimestamp(),
  }, { merge: true });

  return {
    reviewId,
    updatedReputationScore: average,
  };
});

export const processPayment = onCall<ProcessPaymentInput>({ region: 'asia-southeast1' }, async (request) => {
  const uid = assertAuth(request);
  const input = request.data;

  if (uid !== input.employerId) {
    throw new HttpsError('permission-denied', 'Bạn không thể thanh toán thay nhà tuyển dụng khác.');
  }

  const applicationRef = db.collection('applications').doc(input.applicationId);

  const result = await db.runTransaction(async (tx) => {
    const appSnap = await tx.get(applicationRef);
    if (!appSnap.exists) {
      throw new HttpsError('not-found', 'Đơn ứng tuyển không tồn tại.');
    }

    const appData = appSnap.data() || {};
    const employerId = String(appData.employer_id ?? appData.employerId ?? '');
    const candidateId = String(appData.candidate_id ?? appData.candidateId ?? '');
    const jobId = String(appData.job_id ?? appData.jobId ?? '');
    const currentStatus = String(appData.status ?? 'NEW').toUpperCase();
    const paymentStatus = String(appData.payment_status ?? appData.paymentStatus ?? 'UNPAID').toUpperCase();

    if (employerId !== uid) {
      throw new HttpsError('permission-denied', 'Bạn không có quyền thanh toán đơn này.');
    }

    if (!['COMPLETED', 'WORK_FINISHED'].includes(currentStatus)) {
      throw new HttpsError('failed-precondition', 'Chỉ có thể thanh toán khi ca làm đã hoàn thành.');
    }

    if (paymentStatus !== 'UNPAID') {
      throw new HttpsError('failed-precondition', 'Đơn này đã được thanh toán hoặc đang chờ xác nhận.');
    }

    const jobRef = db.collection('jobs').doc(jobId);
    const employerRef = db.collection('users').doc(employerId);
    const candidateRef = db.collection('users').doc(candidateId);
    const [jobSnap, employerSnap, candidateSnap] = await Promise.all([
      tx.get(jobRef),
      tx.get(employerRef),
      tx.get(candidateRef),
    ]);

    if (!jobSnap.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy công việc để tính lương.');
    }
    if (!employerSnap.exists || !candidateSnap.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy ví của nhà tuyển dụng hoặc ứng viên.');
    }

    const jobData = jobSnap.data() || {};
    const employerData = employerSnap.data() || {};
    const candidateData = candidateSnap.data() || {};
    const amount = calculatePayoutAmount(jobData, appData);
    const employerBalance = Number(employerData.balance ?? 0);

    if (amount <= 0) {
      throw new HttpsError('failed-precondition', 'Không thể xác định số tiền thanh toán cho đơn này.');
    }

    if (employerBalance < amount) {
      const deficit = amount - employerBalance;
      throw new HttpsError(
        'failed-precondition',
        `Số dư không đủ để thanh toán. Bạn cần nạp thêm ${deficit.toLocaleString('vi-VN')}đ.`
      );
    }

    const employerTxRef = db.collection('transactions').doc(normalizeDocumentId(`debit_${input.applicationId}`));
    const candidateTxRef = db.collection('transactions').doc(normalizeDocumentId(`credit_${input.applicationId}`));
    const jobTitle = String(jobData.title ?? 'Công việc');

    tx.set(employerRef, {
      balance: employerBalance - amount,
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });

    tx.set(candidateRef, {
      balance: Number(candidateData.balance ?? 0) + amount,
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });

    tx.set(applicationRef, {
      status: 'COMPLETED',
      payment_status: 'PAID',
      payment_method: 'APP',
      paid_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });

    tx.set(employerTxRef, {
      userId: employerId,
      user_id: employerId,
      type: 'PAYMENT',
      entry_type: 'DEBIT',
      amount: -amount,
      description: `Thanh toán lương cho "${jobTitle}"`,
      related_application_id: input.applicationId,
      related_job_id: jobId,
      status: 'COMPLETED',
      created_at: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });

    tx.set(candidateTxRef, {
      userId: candidateId,
      user_id: candidateId,
      type: 'PAYMENT',
      entry_type: 'CREDIT',
      amount,
      description: `Nhận lương từ "${jobTitle}"`,
      related_application_id: input.applicationId,
      related_job_id: jobId,
      status: 'COMPLETED',
      created_at: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });

    await createNotification(
      tx,
      candidateId,
      'PAYMENT_RECEIVED',
      'Bạn đã nhận lương',
      `Bạn đã nhận ${amount.toLocaleString('vi-VN')}đ từ công việc "${jobTitle}".`,
      { applicationId: input.applicationId, jobId },
      'PAYMENT'
    );

    return { amount, candidateId, employerId, jobTitle };
  });

  return result;
});

export const markCashPayment = onCall<MarkCashPaymentInput>({ region: 'asia-southeast1' }, async (request) => {
  const uid = assertAuth(request);
  const input = request.data;

  if (uid !== input.employerId) {
    throw new HttpsError('permission-denied', 'Bạn không thể xác nhận tiền mặt thay nhà tuyển dụng khác.');
  }

  const applicationRef = db.collection('applications').doc(input.applicationId);

  await db.runTransaction(async (tx) => {
    const appSnap = await tx.get(applicationRef);
    if (!appSnap.exists) {
      throw new HttpsError('not-found', 'Đơn ứng tuyển không tồn tại.');
    }

    const appData = appSnap.data() || {};
    const employerId = String(appData.employer_id ?? appData.employerId ?? '');
    const candidateId = String(appData.candidate_id ?? appData.candidateId ?? '');
    const jobId = String(appData.job_id ?? appData.jobId ?? '');
    const currentStatus = String(appData.status ?? 'NEW').toUpperCase();
    const paymentStatus = String(appData.payment_status ?? appData.paymentStatus ?? 'UNPAID').toUpperCase();

    if (employerId !== uid) {
      throw new HttpsError('permission-denied', 'Bạn không có quyền xác nhận thanh toán đơn này.');
    }

    if (!['COMPLETED', 'WORK_FINISHED'].includes(currentStatus)) {
      throw new HttpsError('failed-precondition', 'Chỉ có thể xác nhận tiền mặt sau khi ca làm đã hoàn thành.');
    }

    if (paymentStatus !== 'UNPAID') {
      throw new HttpsError('failed-precondition', 'Đơn này không còn ở trạng thái chờ thanh toán.');
    }

    const jobSnap = await tx.get(db.collection('jobs').doc(jobId));
    const jobTitle = String(jobSnap.data()?.title ?? 'Công việc');

    tx.set(applicationRef, {
      status: 'CASH_CONFIRMATION',
      payment_status: 'PROCESSING',
      payment_method: 'CASH',
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });

    await createNotification(
      tx,
      candidateId,
      'PAYMENT_CONFIRM_REQUIRED',
      'Xác nhận đã nhận tiền mặt',
      `Nhà tuyển dụng đã đánh dấu thanh toán tiền mặt cho công việc "${jobTitle}". Vui lòng xác nhận nếu bạn đã nhận đủ tiền.`,
      { applicationId: input.applicationId, jobId },
      'PAYMENT'
    );
  });

  return { success: true };
});

export const confirmCashPaymentReceived = onCall<ConfirmCashPaymentInput>({ region: 'asia-southeast1' }, async (request) => {
  const uid = assertAuth(request);
  const input = request.data;

  if (uid !== input.candidateId) {
    throw new HttpsError('permission-denied', 'Bạn không thể xác nhận tiền thay ứng viên khác.');
  }

  const applicationRef = db.collection('applications').doc(input.applicationId);

  await db.runTransaction(async (tx) => {
    const appSnap = await tx.get(applicationRef);
    if (!appSnap.exists) {
      throw new HttpsError('not-found', 'Đơn ứng tuyển không tồn tại.');
    }

    const appData = appSnap.data() || {};
    const candidateId = String(appData.candidate_id ?? appData.candidateId ?? '');
    if (candidateId !== uid) {
      throw new HttpsError('permission-denied', 'Bạn không có quyền xác nhận thanh toán cho đơn này.');
    }

    const paymentStatus = String(appData.payment_status ?? appData.paymentStatus ?? 'UNPAID').toUpperCase();
    if (paymentStatus !== 'PROCESSING') {
      throw new HttpsError('failed-precondition', 'Đơn này không ở trạng thái chờ xác nhận tiền mặt.');
    }

    tx.set(applicationRef, {
      status: 'COMPLETED',
      payment_status: 'PAID',
      paid_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });
  });

  return { success: true };
});

export const processDeposit = onCall<ProcessDepositInput>({ region: 'asia-southeast1' }, async (request) => {
  const uid = assertAuth(request);
  const input = request.data;

  if (uid !== input.userId) {
    throw new HttpsError('permission-denied', 'Bạn không thể nạp tiền thay người dùng khác.');
  }

  if (Number(input.amount) <= 0) {
    throw new HttpsError('invalid-argument', 'Số tiền nạp phải lớn hơn 0.');
  }

  const transactionId = normalizeDocumentId(input.externalRef ? `deposit_${input.externalRef}` : `deposit_${uid}_${Date.now()}`);
  const userRef = db.collection('users').doc(uid);
  const txRef = db.collection('transactions').doc(transactionId);

  await db.runTransaction(async (tx) => {
    const [userSnap, existingTxSnap] = await Promise.all([tx.get(userRef), tx.get(txRef)]);
    if (!userSnap.exists) {
      throw new HttpsError('not-found', 'Người dùng không tồn tại.');
    }

    if (existingTxSnap.exists) {
      return;
    }

    const currentBalance = Number(userSnap.data()?.balance ?? 0);
    tx.set(userRef, {
      balance: currentBalance + Number(input.amount),
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });

    tx.set(txRef, {
      userId: uid,
      user_id: uid,
      type: 'DEPOSIT',
      amount: Number(input.amount),
      description: `Nạp tiền qua ${input.method}`,
      external_ref: input.externalRef ?? null,
      status: 'COMPLETED',
      created_at: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });
  });

  return { success: true };
});

export const processWithdrawal = onCall<ProcessWithdrawalInput>({ region: 'asia-southeast1' }, async (request) => {
  const uid = assertAuth(request);
  const input = request.data;

  if (uid !== input.userId) {
    throw new HttpsError('permission-denied', 'Bạn không thể rút tiền thay người dùng khác.');
  }

  if (Number(input.amount) <= 0) {
    throw new HttpsError('invalid-argument', 'Số tiền rút phải lớn hơn 0.');
  }

  const transactionId = normalizeDocumentId(input.externalRef ? `withdraw_${input.externalRef}` : `withdraw_${uid}_${Date.now()}`);
  const userRef = db.collection('users').doc(uid);
  const txRef = db.collection('transactions').doc(transactionId);

  await db.runTransaction(async (tx) => {
    const [userSnap, existingTxSnap] = await Promise.all([tx.get(userRef), tx.get(txRef)]);
    if (!userSnap.exists) {
      throw new HttpsError('not-found', 'Người dùng không tồn tại.');
    }

    if (existingTxSnap.exists) {
      return;
    }

    const currentBalance = Number(userSnap.data()?.balance ?? 0);
    if (currentBalance < Number(input.amount)) {
      throw new HttpsError('failed-precondition', 'Số dư không đủ để thực hiện giao dịch.');
    }

    tx.set(userRef, {
      balance: currentBalance - Number(input.amount),
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });

    tx.set(txRef, {
      userId: uid,
      user_id: uid,
      type: 'WITHDRAW',
      amount: -Number(input.amount),
      description: `Rút tiền về ${input.bankAccount}`,
      external_ref: input.externalRef ?? null,
      bank_account: input.bankAccount,
      status: 'COMPLETED',
      created_at: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });
  });

  return { success: true };
});

export const reviewVerificationRequest = onCall<ReviewVerificationInput>({ region: 'asia-southeast1' }, async (request) => {
  const uid = assertAuth(request);
  const input = request.data;
  await assertAdmin(uid);

  const requestRef = db.collection('users_private').doc(input.userId).collection('verification_requests').doc(input.requestId);
  const userRef = db.collection('users').doc(input.userId);

  await db.runTransaction(async (tx) => {
    const [verificationSnap, userSnap] = await Promise.all([tx.get(requestRef), tx.get(userRef)]);
    if (!verificationSnap.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy hồ sơ xác thực.');
    }

    if (!userSnap.exists) {
      throw new HttpsError('not-found', 'Không tìm thấy người dùng cần xác thực.');
    }

    const action = input.action;
    const nextStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const rejectionReason = String(input.rejectionReason ?? '').trim();

    if (action === 'REJECT' && rejectionReason.length < 5) {
      throw new HttpsError('invalid-argument', 'Vui lòng nhập lý do từ chối rõ ràng.');
    }

    tx.set(requestRef, {
      status: nextStatus,
      rejection_reason: action === 'REJECT' ? rejectionReason : FieldValue.delete(),
      reviewed_by: uid,
      reviewed_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });

    tx.set(userRef, {
      verification_status: action === 'APPROVE' ? 'VERIFIED' : 'UNVERIFIED',
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });

    await createNotification(
      tx,
      input.userId,
      'VERIFICATION_UPDATE',
      action === 'APPROVE' ? 'Hồ sơ xác thực đã được duyệt' : 'Hồ sơ xác thực bị từ chối',
      action === 'APPROVE'
        ? 'Tài khoản của bạn đã được xác thực thành công.'
        : `Hồ sơ xác thực của bạn bị từ chối. Lý do: ${rejectionReason}`,
      { requestId: input.requestId, action },
      'SYSTEM'
    );
  });

  return { success: true };
});

export const adminSetUserStatus = onCall<AdminSetUserStatusInput>({ region: 'asia-southeast1' }, async (request) => {
  const uid = assertAuth(request);
  const input = request.data;
  await assertAdmin(uid);

  const statusMap = {
    LOCK: { status: 'LOCKED', disabled: true, title: 'Tài khoản bị khóa', action: 'LOCK_USER' },
    UNLOCK: { status: 'ACTIVE', disabled: false, title: 'Tài khoản được mở khóa', action: 'UNLOCK_USER' },
    BAN: { status: 'BANNED', disabled: true, title: 'Tài khoản bị cấm', action: 'BAN_USER' },
  } as const;

  const next = statusMap[input.action];
  if (!next) {
    throw new HttpsError('invalid-argument', 'Hành động cập nhật trạng thái không hợp lệ.');
  }

  const reason = String(input.reason ?? '').trim() || 'Cập nhật bởi quản trị viên.';

  await getAuth().updateUser(input.userId, { disabled: next.disabled });

  await db.runTransaction(async (tx) => {
    const userRef = db.collection('users').doc(input.userId);
    tx.set(userRef, {
      status: next.status,
      updated_at: FieldValue.serverTimestamp(),
    }, { merge: true });

    const auditRef = db.collection('admin_logs').doc();
    tx.set(auditRef, {
      admin_id: uid,
      action: next.action,
      target_type: 'USER',
      target_id: input.userId,
      reason,
      created_at: FieldValue.serverTimestamp(),
    });

    await createNotification(
      tx,
      input.userId,
      'SYSTEM',
      next.title,
      reason,
      { adminAction: input.action },
      'SYSTEM'
    );
  });

  return { success: true, status: next.status };
});

/* ── Firestore Triggers ────────────────────────── */

export const onApplicationCreated = onDocumentCreated({
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
    } else {
      console.warn(`[onApplicationCreated] Job ${jobId} not found in Firestore`);
    }
  } catch (err) {
    console.error(`[onApplicationCreated] Error fetching job ${jobId}:`, err);
  }

  if (!employerId) {
    console.error(`[onApplicationCreated] Still missing employerId for application ${event.params.applicationId}`);
    return;
  }

  const notifRef = db.collection('notifications').doc();
  const timestamp = FieldValue.serverTimestamp();
  
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

export const onNotificationCreated = onDocumentCreated({
  document: 'notifications/{notificationId}',
  region: 'asia-southeast1',
}, async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  try {
    await sendPushForNotification(snapshot.data() as Record<string, unknown>);
  } catch (error) {
    console.error(`[onNotificationCreated] Failed to send push for ${event.params.notificationId}:`, error);
  }
});

export const onJobCreated = onDocumentCreated({
  document: 'jobs/{jobId}',
  region: 'asia-southeast1',
}, async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const jobData = snapshot.data();
  const employerId = String(jobData.employer_id ?? jobData.employerId ?? '').trim();
  const jobTitle = String(jobData.title ?? 'Công việc mới').trim();
  if (!employerId) return;

  const followSnap = await db.collection('follows').where('employer_id', '==', employerId).get();
  if (followSnap.empty) return;

  await Promise.all(
    followSnap.docs.map(async (followDoc) => {
      const followerId = String(followDoc.data().follower_id ?? '').trim();
      if (!followerId) return;

      await createNotificationDoc(
        followerId,
        'JOB_RECOMMENDATION',
        'Nhà tuyển dụng bạn theo dõi vừa đăng tin mới',
        `${jobTitle}`,
        { jobId: event.params.jobId, employerId },
        'JOB'
      );
    })
  );
});

export const sendShiftReminders = onSchedule({
  schedule: 'every 30 minutes',
  region: 'asia-southeast1',
  timeZone: 'Asia/Ho_Chi_Minh',
}, async () => {
  const now = new Date();
  const approvedAppsSnap = await db.collection('applications').where('status', '==', 'APPROVED').get();

  await Promise.all(
    approvedAppsSnap.docs.map(async (appDoc) => {
      const appData = appDoc.data();
      if (appData.shift_reminder_sent_at) return;

      const candidateId = String(appData.candidate_id ?? appData.candidateId ?? '').trim();
      const employerId = String(appData.employer_id ?? appData.employerId ?? '').trim();
      const jobId = String(appData.job_id ?? appData.jobId ?? '').trim();
      const shiftId = String(appData.shift_id ?? appData.shiftId ?? '').trim();
      if (!candidateId || !jobId || !shiftId) return;

      const jobSnap = await db.collection('jobs').doc(jobId).get();
      if (!jobSnap.exists) return;

      const jobData = jobSnap.data() || {};
      const shiftWindow = getShiftWindow(jobData, shiftId);
      if (!shiftWindow) return;

      const minutesUntilShift = Math.round((shiftWindow.start.getTime() - now.getTime()) / (1000 * 60));
      if (minutesUntilShift < 0 || minutesUntilShift > 120) return;

      await createNotificationDoc(
        candidateId,
        'SHIFT_REMINDER',
        'Nhắc ca làm sắp bắt đầu',
        `Ca làm tại ${String(jobData.employer_name ?? jobData.employerName ?? employerId)} bắt đầu lúc ${shiftWindow.startTime}. Đừng quên!`,
        { applicationId: appDoc.id, jobId, shiftId },
        'SHIFT'
      );

      await appDoc.ref.set({
        shift_reminder_sent_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      }, { merge: true });
    })
  );
});
