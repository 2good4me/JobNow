import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/employer/chat')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/employer/chat"!</div>
}
