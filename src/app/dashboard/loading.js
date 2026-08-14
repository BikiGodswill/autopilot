export default function DashboardLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-7 w-48 rounded-md bg-ash-100" />
      <div className="mt-2 h-4 w-72 rounded-md bg-ash-100" />
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-2xl border border-ash-200 bg-ash-50" />
        ))}
      </div>
    </div>
  );
}
