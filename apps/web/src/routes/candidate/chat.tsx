import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/candidate/chat')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/candidate/chat"!</div>
}
