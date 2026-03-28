import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '@/config/firebase';

export interface CandidateVerificationOcrData {
    cccd_number?: string | null;
    full_name?: string | null;
    dob?: string | null;
}

export interface CandidateVerificationRequest {
    id: string;
    user_id: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    front_image_url: string;
    document_type: 'ID_CARD_FRONT';
    ocr_data?: CandidateVerificationOcrData;
    submitted_at: unknown;
    created_at: unknown;
    updated_at: unknown;
}

function buildRequestId(candidateId: string): string {
    return `${candidateId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const uploadCandidateID = async (
    file: File,
    candidateId: string,
    requestId: string
): Promise<string> => {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `id_front_${requestId}.${fileExt}`;
    const storageRef = ref(storage, `users_private/${candidateId}/verification_requests/${fileName}`);

    const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
            candidate_id: candidateId,
            request_id: requestId,
        },
    });
    return getDownloadURL(snapshot.ref);
};

export const submitCandidateVerification = async (
    candidateId: string,
    file: File,
    ocrData?: CandidateVerificationOcrData
): Promise<CandidateVerificationRequest> => {
    const requestId = buildRequestId(candidateId);
    const frontImageUrl = await uploadCandidateID(file, candidateId, requestId);

    const requestRef = doc(db, 'users_private', candidateId, 'verification_requests', requestId);
    const requestData: CandidateVerificationRequest = {
        id: requestId,
        user_id: candidateId,
        status: 'PENDING',
        front_image_url: frontImageUrl,
        document_type: 'ID_CARD_FRONT',
        ...(ocrData ? { ocr_data: ocrData } : {}),
        submitted_at: serverTimestamp(),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
    };

    await setDoc(requestRef, requestData);

    await updateDoc(doc(db, 'users', candidateId), {
        verification_status: 'PENDING',
        ...(ocrData?.cccd_number ? { cccd_number: ocrData.cccd_number } : {}),
        ...(ocrData?.full_name ? { cccd_full_name: ocrData.full_name } : {}),
        ...(ocrData?.dob ? { cccd_dob: ocrData.dob } : {}),
        updated_at: serverTimestamp(),
    });

    return requestData;
};
