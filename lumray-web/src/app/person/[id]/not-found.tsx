import Link from 'next/link'
import { User } from 'lucide-react'

export default function PersonNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#383a47]">
        <User size={36} className="text-[#7a7882]" />
      </div>

      <div className="space-y-2">
        <h1 className="font-outfit text-2xl font-bold text-[#ede9fc]">Person not found</h1>
        <p className="font-roboto text-sm text-[#7a7882]">
          This cast or crew member doesn&apos;t exist or couldn&apos;t be loaded right now.
        </p>
      </div>

      <Link
        href="/films"
        className="rounded-lg bg-[#714ee4] px-5 py-2.5 font-roboto text-sm font-medium text-white transition-colors hover:bg-[#534ab7]"
      >
        Browse films
      </Link>
    </div>
  )
}
