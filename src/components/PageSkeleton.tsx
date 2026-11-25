/** Placeholder shown for a moment while a lesson, song or chord page reads its URL. */
export function PageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Đang tải" className="mx-auto max-w-2xl animate-pulse">
      <div className="bg-muted h-4 w-40 rounded" />
      <div className="bg-muted mt-4 h-9 w-3/4 rounded" />
      <div className="bg-muted mt-6 h-24 rounded-xl" />
      <div className="bg-muted mt-6 h-64 rounded-xl" />
    </div>
  );
}
