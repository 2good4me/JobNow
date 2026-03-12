import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/employer/profile/settings/delete')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/employer/profile/settings/delete"!</div>
}
