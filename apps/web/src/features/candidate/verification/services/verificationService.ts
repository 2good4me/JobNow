import { doc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db } from '@/config/firebase';

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
    portrait_image_url?: string;
    document_type: 'ID_CARD_FRONT' | 'ID_WITH_PORTRAIT';
    ocr_data?: CandidateVerificationOcrData;
    submitted_at: unknown;
    created_at: unknown;
    updated_at: unknown;
}

function buildRequestId(candidateId: string): string {
    return `${candidateId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

async function uploadToCloudinary(file: File, folder: string): Promise<string> {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (!cloudName || !uploadPreset) throw new Error('Cloudinary chưa cấu hình');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Upload lỗi: ${response.status}`);
    }

    const data = await response.json() as { secure_url: string };
    return data.secure_url;
}

export const uploadCandidateID = async (
    file: File,
    candidateId: string,
    requestId: string
): Promise<string> => {
    return uploadToCloudinary(file, `jobnow/ekyc/${candidateId}/${requestId}`);
};

export const uploadCandidatePortrait = async (
    file: File,
    candidateId: string,
    requestId: string
): Promise<string> => {
    return uploadToCloudinary(file, `jobnow/ekyc/${candidateId}/${requestId}`);
};

export const submitCandidateVerification = async (
    candidateId: string,
    frontFile: File,
    portraitFile?: File | null,
    ocrData?: CandidateVerificationOcrData
): Promise<CandidateVerificationRequest> => {
    const requestId = buildRequestId(candidateId);
    
    const cccdRe = /^\d{12}$/;
    if (ocrData?.cccd_number && !cccdRe.test(ocrData.cccd_number)) {
        throw new Error('Số CCCD không hợp lệ (phải đúng 12 chữ số).');
    }

    const [frontImageUrl, portraitImageUrl] = await Promise.all([
        uploadCandidateID(frontFile, candidateId, requestId),
        portraitFile ? uploadCandidatePortrait(portraitFile, candidateId, requestId) : Promise.resolve(undefined)
    ]);

    const requestRef = doc(db, 'users_private', candidateId, 'verification_requests', requestId);
    const userRef = doc(db, 'users', candidateId);
    
    const requestData: CandidateVerificationRequest = {
        id: requestId,
        user_id: candidateId,
        status: ocrData?.cccd_number ? 'APPROVED' : 'PENDING',
        front_image_url: frontImageUrl,
        portrait_image_url: portraitImageUrl,
        document_type: portraitFile ? 'ID_WITH_PORTRAIT' : 'ID_CARD_FRONT',
        ...(ocrData ? { ocr_data: ocrData } : {}),
        submitted_at: serverTimestamp(),
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
    };

    await runTransaction(db, async (tx) => {
        if (ocrData?.cccd_number) {
            const registryRef = doc(db, 'cccd_registry', ocrData.cccd_number);
            const registrySnap = await tx.get(registryRef);
            if (registrySnap.exists()) {
                throw new Error('Số CCCD này đã được sử dụng bởi một tài khoản khác trong hệ thống.');
            }
            tx.set(registryRef, {
                uid: candidateId,
                created_at: serverTimestamp(),
            });
        }

        tx.set(requestRef, requestData);

        tx.update(userRef, {
            verification_status: ocrData?.cccd_number ? 'VERIFIED' : 'PENDING',
            ...(ocrData?.cccd_number ? { cccd_number: ocrData.cccd_number } : {}),
            ...(ocrData?.full_name ? { cccd_full_name: ocrData.full_name } : {}),
            ...(ocrData?.dob ? { cccd_dob: ocrData.dob } : {}),
            updated_at: serverTimestamp(),
        });
    });

    return requestData;
};
