import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

/**
 * Hook to count approved applications for a specific job or shift
 */
export function useApprovedCount(jobId?: string, shiftId?: string) {
    return useQuery({
        queryKey: ['approvedCount', jobId, shiftId],
        queryFn: async () => {
            if (!jobId) return 0;
            
            const appsRef = collection(db, 'applications');
            let q = query(
                appsRef, 
                where('job_id', '==', jobId), 
                where('status', '==', 'APPROVED')
            );
            
            if (shiftId) {
                q = query(q, where('shift_id', '==', shiftId));
            }
            
            const snapshot = await getDocs(q);
            return snapshot.size;
        },
        enabled: !!jobId,
        staleTime: 30_000,
    });
}
