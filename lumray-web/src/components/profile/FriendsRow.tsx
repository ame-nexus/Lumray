import Image from 'next/image'
import Link from 'next/link'

interface Friend {
  id: string
  username: string
  avatar: string | null
}

export default function FriendsRow({ friends }: { friends: Friend[] }) {
  if (friends.length === 0) return null

  return (
    <section>
      <h2 className="mb-4 font-outfit text-lg font-semibold text-text">Friends</h2>
      <div className="flex flex-wrap gap-3">
        {friends.map((f) => (
          <Link
            key={f.id}
            href={`/profile/${f.username}`}
            className="group flex flex-col items-center gap-1.5"
          >
            <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-transparent transition-all group-hover:ring-purple-mid">
              {f.avatar ? (
                <Image
                  src={f.avatar}
                  alt={f.username}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-2 text-sm font-semibold text-text uppercase">
                  {f.username[0]}
                </div>
              )}
            </div>
            <span className="max-w-[56px] truncate font-roboto text-[10px] text-text-muted group-hover:text-text transition-colors">
              {f.username}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
