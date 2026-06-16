export default function SubmitComingSoonTab({
  title,
  description,
  plannedDay,
}: {
  title: string
  description: string
  plannedDay: string
}) {
  return (
    <div className="bg-card p-8 rounded-lg shadow-sm border border-border text-center">
      <h2 className="text-2xl font-semibold text-foreground mb-3">{title}</h2>
      <p className="text-muted-foreground mb-4 max-w-lg mx-auto">{description}</p>
      <p className="text-sm font-medium text-muted-foreground bg-muted/40 inline-block px-4 py-2 rounded-md border border-border">
        Coming in {plannedDay}
      </p>
    </div>
  )
}
