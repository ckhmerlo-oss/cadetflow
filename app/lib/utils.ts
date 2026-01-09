export function formatDateTime(dateString: string | null) {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/New_York', // LOCK TO EST/EDT
  }).format(date)
}