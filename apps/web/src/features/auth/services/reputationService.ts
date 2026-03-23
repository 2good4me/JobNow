import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '@/config/firebase';
import type { ReputationAppeal, ReputationHistoryEntry } from '@jobnow/types';
import { getReputationActionLabel } from '../helpers/reputationHelper';

export function subscribeMyReputationHistory(
  userId: string,
  onUpdate: (items: ReputationHistoryEntry[]) => void
): Unsubscribe {
  const historyQuery = query(
    collection(db, 'reputation_history'),
    where('user_id', '==', userId),
    orderBy('created_at', 'desc')
  );

  return onSnapshot(historyQuery, (snapshot) => {
    const items = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        user_id: String(data.user_id ?? userId),
        user_role: data.user_role,
        action_code: String(data.action_code ?? ''),
        action_label: String(data.action_label ?? ''),
        action_label_vi: String(data.action_label_vi ?? getReputationActionLabel(String(data.action_code ?? ''))),
        score_change: Number(data.score_change ?? 0),
        balance_after: Number(data.balance_after ?? 0),
        status: data.status ?? 'APPLIED',
        related_job_id: (data.related_job_id as string | null | undefined) ?? null,
        related_application_id: (data.related_application_id as string | null | undefined) ?? null,
        related_shift_id: (data.related_shift_id as string | null | undefined) ?? null,
        actor_id: (data.actor_id as string | null | undefined) ?? null,
        appeal_deadline_at: data.appeal_deadline_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
        metadata: {
          ...(data.metadata ?? {}),
          appeal_status: data.appeal_status ?? null,
        },
      } as ReputationHistoryEntry;
    });

    onUpdate(items);
  });
}

export async function submitReputationAppeal(historyId: string, reason: string): Promise<{ success: boolean }> {
  const callable = httpsCallable<{ historyId: string; reason: string }, { success: boolean }>(
    functions,
    'submitReputationAppeal'
  );
  const { data } = await callable({ historyId, reason });
  return data;
}

export type ReputationAppealView = ReputationAppeal;
