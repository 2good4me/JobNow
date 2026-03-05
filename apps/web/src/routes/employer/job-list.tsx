import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/employer/job-list')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/employer/job-list"!</div>
}
