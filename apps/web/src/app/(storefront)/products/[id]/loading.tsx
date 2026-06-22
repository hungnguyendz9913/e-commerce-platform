export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <div className="mb-6 h-5 w-80 max-w-full animate-pulse rounded bg-slate-200" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-2xl bg-slate-200" />
        <div className="space-y-5">
          <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
          <div className="h-9 w-full animate-pulse rounded bg-slate-200" />
          <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />
          <div className="h-10 w-44 animate-pulse rounded bg-slate-200" />
          <div className="h-32 w-full animate-pulse rounded-xl bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
