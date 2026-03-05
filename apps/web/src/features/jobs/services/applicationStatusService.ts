import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { Application, ApplicationStatus } from '@jobnow/types';
import { mapApplicationDocToApplication } from './adapters';

export interface ApplicationStatusUi {
    label: string;
    color: 'blue' | 'amber' | 'emerald' | 'rose' | 'slate' | 'violet' | 'sky';
}

const STATUS_UI_MAP: Record<ApplicationStatus, ApplicationStatusUi> = {
    NEW: { label: 'Chờ duyệt', color: 'blue' },
    PENDING: { label: 'Đang xử lý', color: 'amber' },
    REVIEWED: { label: 'Đã xem', color: 'blue' },
    APPROVED: { label: 'Đã nhận', color: 'emerald' },
    REJECTED: { label: 'Từ chối', color: 'rose' },
    CHECKED_IN: { label: 'Đang làm', color: 'violet' },
    COMPLETED: { label: 'Hoàn thành', color: 'sky' },
    CANCELLED: { label: 'Đã hủy', color: 'slate' },
};

export function mapApplicationStatusForUi(status: ApplicationStatus): ApplicationStatusUi {
    return STATUS_UI_MAP[status] ?? STATUS_UI_MAP.NEW;
}

export function subscribeApplicationStatus(
    applicationId: string,
    onUpdate: (application: Application | null) => void
): Unsubscribe {
    const ref = doc(db, 'applications', applicationId);

    return onSnapshot(ref, (snapshot) => {
        if (!snapshot.exists()) {
            onUpdate(null);
            return;
        }

        onUpdate(mapApplicationDocToApplication(snapshot.id, snapshot.data() as Record<string, unknown>));
    });
}
