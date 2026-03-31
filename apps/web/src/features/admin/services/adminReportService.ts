import { collection, query, orderBy, getDocs, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface ReportData {
    id: string;
    reporterId: string;
    reporterName?: string;
    targetId: string;
    targetType: 'JOB' | 'USER' | 'APPLICATION' | string;
    reason: string;
    details?: string;
    status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'REJECTED' | string;
    createdAt: Date;
    updatedAt?: Date;
}

export async function fetchAdminReports(): Promise<ReportData[]> {
    const reportsRef = collection(db, 'reports');
    const q = query(reportsRef, orderBy('createdAt', 'desc'));
    
    try {
        const snapshot = await getDocs(q);
        const reports: ReportData[] = [];
        const usersCache = new Map<string, string>();
        
        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const repId = data.reporterId || data.reporter_id;
            
            // Try to resolve reporter name if not cached
            let repName = data.reporterName || 'Người dùng ẩn danh';
            if (repId && !data.reporterName) {
                if (usersCache.has(repId)) {
                    repName = usersCache.get(repId)!;
                } else {
                    try {
                        const userSnap = await getDoc(doc(db, 'users', repId));
                        if(userSnap.exists()){
                            repName = userSnap.data().full_name || userSnap.data().fullName || 'Người dùng';
                            usersCache.set(repId, repName);
                        }
                    } catch(e) {}
                }
            }

            reports.push({
                id: docSnap.id,
                reporterId: repId || 'unknown',
                reporterName: repName,
                targetId: data.targetId || data.target_id || '',
                targetType: data.targetType || data.target_type || 'SYSTEM',
                reason: data.reason || 'Vi phạm chính sách',
                details: data.details || '',
                status: (data.status || 'PENDING').toUpperCase(),
                createdAt: data.createdAt?.toDate() || data.created_at?.toDate() || new Date(),
                updatedAt: data.updatedAt?.toDate() || data.updated_at?.toDate(),
            });
        }
        return reports;
    } catch(err) {
        console.error("Error fetchAdminReports:", err);
        // Return empty array if index doesn't exist
        return [];
    }
}

export async function updateReportStatus(reportId: string, status: string): Promise<void> {
    const docRef = doc(db, 'reports', reportId);
    await updateDoc(docRef, {
        status,
        updatedAt: serverTimestamp(),
        updated_at: serverTimestamp()
    });
}
