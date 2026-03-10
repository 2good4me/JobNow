import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { storage, db } from '@/config/firebase';

export interface CandidateVerificationData {
    candidateId: string;
    frontImageUrl: string;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export const uploadCandidateID = async (file: File, candidateId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `id_front_${Date.now()}.${fileExt}`;
    const storageRef = ref(storage, `verification_documents/${candidateId}/${fileName}`);

    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
};

export const submitCandidateVerification = async (candidateId: string, frontImageUrl: string): Promise<void> => {
    // 1. Create a verification request record
    const requestRef = doc(db, `users/${candidateId}/verification_requests`, 'current');
    const requestData = {
        candidateId,
        frontImageUrl,
        status: 'PENDING',
        submittedAt: serverTimestamp(),
    };

    await setDoc(requestRef, requestData);

    // 2. Update the user's profile status to PENDING
    const userRef = doc(db, 'users', candidateId);
    await updateDoc(userRef, {
        verification_status: 'PENDING',
        updated_at: serverTimestamp(),
    });
};
