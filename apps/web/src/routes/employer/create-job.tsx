import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/employer/create-job')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/employer/create-job"!</div>
}
