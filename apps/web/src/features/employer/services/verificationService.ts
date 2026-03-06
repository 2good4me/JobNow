import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { storage, db } from '@/config/firebase';

export interface VerificationRequestData {
    employerId: string;
    frontImageUrl: string;
    status: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export const uploadVerificationDocument = async (file: File, employerId: string): Promise<string> => {
    // Compression or resizing would be ideal but for MVP we upload directly
    // A service worker or canvas could do compression, but we stick to native
    const fileExt = file.name.split('.').pop();
    const fileName = `id_front_${Date.now()}.${fileExt}`;
    const storageRef = ref(storage, `verification_documents/${employerId}/${fileName}`);

    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
};

export const submitVerificationRequest = async (employerId: string, frontImageUrl: string): Promise<void> => {
    // 1. Create a verification request record
    const requestRef = doc(db, `users/${employerId}/verification_requests`, 'current');
    const requestData = {
        employerId,
        frontImageUrl,
        status: 'PENDING',
        submittedAt: serverTimestamp(),
    };

    await setDoc(requestRef, requestData);

    // 2. Update the user's profile status to PENDING
    const userRef = doc(db, 'users', employerId);
    await updateDoc(userRef, {
        verification_status: 'PENDING',
        updated_at: serverTimestamp(),
    });
};
