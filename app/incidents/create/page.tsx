import { redirect } from 'next/navigation'

export default function CreateIncidentRedirect() {
  redirect('/submit?tab=incident')
}
