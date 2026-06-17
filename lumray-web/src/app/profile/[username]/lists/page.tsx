'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import ProfileTwoColumn from '@/components/profile/ProfileTwoColumn'
import { tmdbPoster } from '@/lib/tmdbImage'
import api from '@/services/api'

interface ListItem {
  movie: { posterPath: string | null; title: string }
}

interface UserList {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  _count: { items: number }
  items: ListItem[]
  user: { id: string; username: string }
}

function ListCard({ list }: { list: UserList }) {
  const posters = list.items.slice(0, 4)

  return (
    <Link href={`/lists/${list.id}`}>
      <div className="group rounded-xl bg-surface border border-text/10 overflow-hidden hover:border-purple/40 transition-colors">
        <div className="grid grid-cols-4 h-28">
          {posters.map((item, i) => {
            const src = item.movie.posterPath ? tmdbPoster(item.movie.posterPath, 'w185') : null
            return (
              <div key={i} className="relative bg-surface-2">
                {src ? (
                  <Image src={src} alt={item.movie.title || 'Movie poster'} fill className="object-cover" sizes="25vw" />
                ) : (
                  <div className="flex h-full items-center justify-center p-1 text-center">
                    <span className="font-roboto text-[10px] text-text-muted">{item.movie.title}</span>
                  </div>
                )}
              </div>
            )
          })}
          {Array.from({ length: Math.max(0, 4 - posters.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-surface-2" />
          ))}
        </div>

        <div className="p-4">
          <h3 className="font-outfit text-sm font-semibold text-text group-hover:text-purple-light transition-colors line-clamp-1">
            {list.name}
          </h3>
          {list.description && (
            <p className="mt-1 font-roboto text-xs text-text-muted line-clamp-2">{list.description}</p>
          )}
          <p className="mt-2 font-roboto text-xs text-text-muted">{list._count.items} films</p>
        </div>
      </div>
    </Link>
  )
}

export default function ProfileListsPage() {
  const params   = useParams<{ username: string }>()
  const username = params.username

  const [lists, setLists]   = useState<UserList[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId]   = useState<string | null>(null)

  useEffect(() => {
    api.get(`/api/users/${username}`)
      .then(res => {
        const uid: string = res.data.data?.id
        setUserId(uid)
        if (uid) {
          return api.get('/api/lists', { params: { userId: uid } })
        }
      })
      .then(res => {
        if (res) setLists(res.data.data ?? [])
      })
      .catch(() => setLists([]))
      .finally(() => setLoading(false))
  }, [username])

  return (
    <ProfileTwoColumn
      main={
        <div>
          <h2 className="mb-6 font-outfit text-lg font-semibold text-text">Lists</h2>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-xl bg-surface">
                  <div className="h-28 bg-surface-2" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-32 bg-surface-2 rounded" />
                    <div className="h-3 w-20 bg-surface-2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : lists.length === 0 ? (
            <p className="py-12 text-center font-roboto text-sm text-text-muted">No lists yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {lists.map((list) => <ListCard key={list.id} list={list} />)}
            </div>
          )}
        </div>
      }
    />
  )
}
