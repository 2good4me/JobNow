import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface SystemSettings {
    platformFeePercentage: number;
    minHourlyWage: number;
    maintenanceMode: boolean;
    autoApproveJobs: boolean;
    contactEmail: string;
    updatedAt?: Date;
}

const DEFAULT_SETTINGS: SystemSettings = {
    platformFeePercentage: 10, // 10%
    minHourlyWage: 20000,     // 20k VND
    maintenanceMode: false,
    autoApproveJobs: false,
    contactEmail: 'support@jobnow.vn'
};

export async function fetchSystemSettings(): Promise<SystemSettings> {
    const docRef = doc(db, 'system', 'settings');
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
        return DEFAULT_SETTINGS;
    }
    const data = docSnap.data();
    return {
        platformFeePercentage: Number(data.platformFeePercentage ?? data.platform_fee_percentage ?? DEFAULT_SETTINGS.platformFeePercentage),
        minHourlyWage: Number(data.minHourlyWage ?? data.min_hourly_wage ?? DEFAULT_SETTINGS.minHourlyWage),
        maintenanceMode: Boolean(data.maintenanceMode ?? data.maintenance_mode ?? DEFAULT_SETTINGS.maintenanceMode),
        autoApproveJobs: Boolean(data.autoApproveJobs ?? data.auto_approve_jobs ?? DEFAULT_SETTINGS.autoApproveJobs),
        contactEmail: String(data.contactEmail ?? data.contact_email ?? DEFAULT_SETTINGS.contactEmail),
        updatedAt: data.updatedAt?.toDate() || data.updated_at?.toDate() || new Date(),
    };
}

export async function saveSystemSettings(settings: Partial<SystemSettings>): Promise<void> {
    const docRef = doc(db, 'system', 'settings');
    const updateData = {
        ...settings,
        updatedAt: serverTimestamp(),
        updated_at: serverTimestamp(),
    };
    await setDoc(docRef, updateData, { merge: true });
}
