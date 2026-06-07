function Bone({ className }: { className: string }) {
  return <div className={`rounded-lg bg-white/8 ${className}`} />
}

export default function Loading() {
  return (
    <div className="animate-pulse">

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="relative bg-bg-dark py-12 px-6 md:px-12 xl:px-60 overflow-hidden">
        {/* Faint blurred bg shimmer */}
        <div className="absolute inset-0 bg-white/2" />

        <div className="relative flex gap-8 md:gap-10">

          {/* Profile photo */}
          <div className="h-48 w-32 shrink-0 rounded-xl bg-white/8 md:h-64 md:w-44 xl:h-72 xl:w-48" />

          {/* Info */}
          <div className="flex flex-col justify-end gap-3">
            {/* Role pills */}
            <div className="flex gap-2">
              <Bone className="h-5 w-16 rounded-full" />
              <Bone className="h-5 w-20 rounded-full" />
            </div>

            {/* Name */}
            <Bone className="h-9 w-56 md:h-11 md:w-72 xl:w-96" />

            {/* Born / meta */}
            <Bone className="h-4 w-52 opacity-70" />

            {/* Place of birth */}
            <Bone className="h-4 w-36 opacity-50" />

            {/* Known for */}
            <div className="mt-1">
              <Bone className="mb-2.5 h-3 w-16 opacity-60" />
              <div className="flex gap-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <div key={i} className="h-16 w-11 rounded-md bg-white/8" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────── */}
      <div className="space-y-10 px-6 py-10 md:px-12 xl:px-60">

        {/* Biography */}
        <div className="max-w-3xl space-y-2.5">
          <Bone className="mb-4 h-5 w-28" />
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-5/6" />
          <Bone className="h-4 w-full" />
          <Bone className="h-4 w-4/5" />
          <Bone className="h-4 w-3/4 opacity-60" />
        </div>

        {/* Filmography tabs */}
        <div>
          {/* Tab bar */}
          <div className="mb-5 flex gap-4 border-b border-white/8 pb-0">
            <Bone className="mb-2 h-4 w-14" />
            <Bone className="mb-2 h-4 w-20 opacity-50" />
            <Bone className="mb-2 h-4 w-18 opacity-50" />
          </div>

          {/* Poster grid */}
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="aspect-2/3 rounded-lg bg-white/8"
                style={{ opacity: 1 - i * 0.03 }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
