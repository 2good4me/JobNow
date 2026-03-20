import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/employer/profile/support/feedback')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/employer/profile/support/feedback"!</div>
}
