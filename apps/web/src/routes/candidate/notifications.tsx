import { createFileRoute } from '@tanstack/react-router';
import { NotificationCenter } from '@/features/notifications/components/NotificationCenter';

export const Route = createFileRoute('/candidate/notifications')({
  component: CandidateNotifications,
});

function CandidateNotifications() {
  return <NotificationCenter />;
}
