import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/employer/profile/support/terms')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/employer/profile/support/terms"!</div>
}
