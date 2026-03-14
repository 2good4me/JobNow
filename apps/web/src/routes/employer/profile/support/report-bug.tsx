import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/employer/profile/support/report-bug')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/employer/profile/support/report-bug"!</div>
}
