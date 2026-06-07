function Bone({ className }: { className: string }) {
  return <div className={`rounded-lg bg-white/8 ${className}`} />
}

export default function Loading() {
  return (
    <div className="animate-pulse">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative flex min-h-[460px] flex-col justify-end overflow-hidden bg-[#1a1b21] md:min-h-[540px]">
        {/* Simulated backdrop shimmer */}
        <div className="absolute inset-0 bg-[#22232e]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2c2d38] from-5% via-[#2c2d38]/40 to-transparent" />

        <div className="relative z-10 px-6 pb-10 md:px-12 md:pb-12 xl:px-60">
          <div className="flex items-end gap-6 md:gap-10">

            {/* Poster */}
            <div className="hidden aspect-2/3 w-36 shrink-0 rounded-xl bg-white/8 sm:block md:w-44 xl:w-62" />

            {/* Text stack */}
            <div className="flex flex-col gap-3 pb-1">
              {/* Year pill */}
              <Bone className="h-5 w-12 rounded" />
              {/* Title */}
              <Bone className="h-9 w-64 md:h-11 md:w-80 xl:w-[28rem]" />
              {/* Director */}
              <Bone className="h-4 w-40" />
              {/* Tagline */}
              <Bone className="h-4 w-52 opacity-60" />
              {/* Genre tags */}
              <div className="flex gap-2">
                <Bone className="h-6 w-20 rounded-full" />
                <Bone className="h-6 w-16 rounded-full" />
                <Bone className="h-6 w-24 rounded-full" />
              </div>
              {/* Stars */}
              <Bone className="h-4 w-36" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────── */}
      <div className="px-6 pb-16 pt-8 md:px-12 xl:px-60">
        <div className="flex gap-6 lg:gap-8 xl:gap-10">

          {/* Left — main content */}
          <div className="min-w-0 flex-1 space-y-10">

            {/* Overview */}
            <div className="max-w-3xl space-y-2.5">
              <Bone className="h-4 w-full" />
              <Bone className="h-4 w-full" />
              <Bone className="h-4 w-5/6" />
              <Bone className="h-4 w-3/4" />
            </div>

            {/* Cast row */}
            <div>
              <Bone className="mb-4 h-5 w-24" />
              <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} className="flex shrink-0 flex-col items-center gap-2">
                    <div className="h-24 w-24 rounded-full bg-white/8 lg:h-28 lg:w-28" />
                    <Bone className="h-3 w-16" />
                    <Bone className="h-3 w-12 opacity-60" />
                  </div>
                ))}
              </div>
            </div>

            {/* Community section */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <Bone className="h-6 w-28" />
                <Bone className="h-4 w-20" />
              </div>
              {/* Tab bar */}
              <div className="mb-4 flex gap-6 border-b border-white/8 pb-0">
                <Bone className="h-4 w-16 mb-2" />
                <Bone className="h-4 w-14 mb-2 opacity-60" />
                <Bone className="h-4 w-12 mb-2 opacity-60" />
              </div>
              {/* Review cards */}
              <div className="space-y-4">
                <Bone className="h-24 w-full" />
                <Bone className="h-24 w-full" />
              </div>
            </div>
          </div>

          {/* Right — sidebar (desktop only) */}
          <div className="hidden w-60 shrink-0 flex-col gap-4 lg:flex xl:w-72 2xl:w-80">
            <Bone className="h-44" />
            <Bone className="h-28" />
            <Bone className="h-36" />
            <Bone className="h-40" />
          </div>
        </div>
      </div>
    </div>
  )
}
