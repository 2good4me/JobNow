import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/candidate/profile')({
  component: CandidateProfileLayout,
});

function CandidateProfileLayout() {
  return <Outlet />;
}
