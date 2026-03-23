import { createFileRoute } from '@tanstack/react-router';
import { ReputationDetailView } from '@/features/auth/components/ReputationDetailView';

export const Route = createFileRoute('/employer/profile/reputation')({
  component: EmployerReputationPage,
});

function EmployerReputationPage() {
  return <ReputationDetailView role="EMPLOYER" backTo="/employer/profile" />;
}
