import { createFileRoute } from '@tanstack/react-router';
import { ReputationDetailView } from '@/features/auth/components/ReputationDetailView';

export const Route = createFileRoute('/candidate/profile/reputation')({
  component: CandidateReputationPage,
});

function CandidateReputationPage() {
  return <ReputationDetailView role="CANDIDATE" backTo="/candidate/profile" />;
}
