import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/candidate/notifications')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/candidate/notifications"!</div>
}
