import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/employer/applicants')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/employer/applicants"!</div>
}
