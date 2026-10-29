export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl px-7 py-10" aria-busy="true">
      <div className="mb-6 h-8 w-48 animate-pulse rounded-lg bg-surface-2" />
      <div className="mb-4 h-32 animate-pulse rounded-2xl bg-surface-2" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-40 animate-pulse rounded-2xl bg-surface-2" />
        <div className="h-40 animate-pulse rounded-2xl bg-surface-2" />
      </div>
    </div>
  );
}
