import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/config/firebase';
import { updateUserDocument } from '@/lib/firestore';
import type { UserProfile } from '@/features/auth/types/user';

export type EmployerProfileUpdate = Pick<
    UserProfile,
    | 'full_name'
    | 'company_name'
    | 'company_tax_id'
    | 'industry'
    | 'company_description'
    | 'company_website'
    | 'phone_number'
    | 'address_text'
    | 'notification_push'
    | 'notification_email'
>;

/**
 * Update employer profile fields in Firestore.
 */
export async function updateEmployerProfile(
    uid: string,
    data: Partial<EmployerProfileUpdate>
): Promise<void> {
    await updateUserDocument(uid, data);
}

/**
 * Upload company logo to Firebase Storage and update Firestore.
 */
export async function uploadCompanyLogo(uid: string, file: File): Promise<string> {
    const storageRef = ref(storage, `company-logos/${uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    await updateUserDocument(uid, { company_logo_url: downloadUrl });
    return downloadUrl;
}

/**
 * Upload business license for E-KYC verification.
 * Sets verification_status to PENDING.
 */
export async function uploadBusinessLicense(uid: string, file: File): Promise<string> {
    const storageRef = ref(storage, `business-licenses/${uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(storageRef);
    await updateUserDocument(uid, {
        business_license_url: downloadUrl,
        verification_status: 'PENDING',
    });
    return downloadUrl;
}
