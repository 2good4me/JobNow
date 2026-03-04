import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/candidate/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/candidate/"!</div>
}
