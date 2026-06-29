export default function DemoBanner() {
  return (
    <div
      className="no-print bg-amber-500/15 border-b border-amber-500/30 text-amber-950 dark:text-amber-100"
      role="status"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 text-center text-sm">
        Demo environment — explore freely. All data resets nightly at midnight Eastern Time.
      </div>
    </div>
  )
}
