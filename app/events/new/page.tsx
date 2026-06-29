import { redirect } from 'next/navigation'

export default function NewEventPage() {
  redirect('/incidents?create=1')
}
