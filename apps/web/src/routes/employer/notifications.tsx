import { createFileRoute } from '@tanstack/react-router';
import { NotificationCenter } from '@/features/notifications/components/NotificationCenter';

export const Route = createFileRoute('/employer/notifications')({
  component: EmployerNotifications,
});

function EmployerNotifications() {
  return <NotificationCenter />;
}
