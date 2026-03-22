import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/employer/wallet')({
  component: () => <Outlet />,
});
