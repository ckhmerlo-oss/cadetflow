import { redirect } from 'next/navigation'

export default function WorkOrderTrackingRedirect() {
  redirect('/work-orders?tab=history')
}
