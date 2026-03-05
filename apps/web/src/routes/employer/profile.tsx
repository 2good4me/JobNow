import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/employer/profile')({
  component: EmployerProfileLayout,
})

function EmployerProfileLayout() {
  return <Outlet />
}
