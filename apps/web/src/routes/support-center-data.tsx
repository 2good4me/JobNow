import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/support-center-data')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/support-center-data"!</div>
}
