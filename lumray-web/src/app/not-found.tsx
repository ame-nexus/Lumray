import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-outfit text-8xl font-bold text-[#714ee4]">404</p>

      <div className="space-y-2">
        <h1 className="font-outfit text-2xl font-bold text-[#ede9fc]">Page not found</h1>
        <p className="font-roboto text-sm text-[#7a7882]">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/home"
          className="rounded-lg bg-[#714ee4] px-5 py-2.5 font-roboto text-sm font-medium text-white transition-colors hover:bg-[#534ab7]"
        >
          Go home
        </Link>
        <Link
          href="/films"
          className="rounded-lg border border-white/15 px-5 py-2.5 font-roboto text-sm font-medium text-[#ede9fc] transition-colors hover:bg-white/5"
        >
          Browse films
        </Link>
      </div>
    </div>
  )
}
