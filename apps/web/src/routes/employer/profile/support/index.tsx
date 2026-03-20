import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/employer/profile/support/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/employer/profile/support/"!</div>
}
