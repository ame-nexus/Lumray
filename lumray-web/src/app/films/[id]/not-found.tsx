import Link from 'next/link'
import { Film } from 'lucide-react'

export default function FilmNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#383a47]">
        <Film size={36} className="text-[#7a7882]" />
      </div>

      <div className="space-y-2">
        <h1 className="font-outfit text-2xl font-bold text-[#ede9fc]">Film not found</h1>
        <p className="font-roboto text-sm text-[#7a7882]">
          This film doesn&apos;t exist on TMDb or couldn&apos;t be loaded right now.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/films"
          className="rounded-lg bg-[#714ee4] px-5 py-2.5 font-roboto text-sm font-medium text-white transition-colors hover:bg-[#534ab7]"
        >
          Browse films
        </Link>
        <Link
          href="/home"
          className="rounded-lg border border-white/15 px-5 py-2.5 font-roboto text-sm font-medium text-[#ede9fc] transition-colors hover:bg-white/5"
        >
          Go home
        </Link>
      </div>
    </div>
  )
}
