import { notFound } from 'next/navigation'
import ProfileShell from '@/components/profile/ProfileShell'

interface ProfileData {
  id: string
  username: string
  name: string | null
  bio: string | null
  avatar: string | null
  coverImage: string | null
  createdAt: string
  thisYearCount: number
  _count: { followers: number; following: number; diaryEntries: number; reviews: number }
}

async function getProfile(username: string): Promise<ProfileData | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${username}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const profile = await getProfile(username)
  if (!profile) notFound()

  return (
    <ProfileShell
      username={username}
      userId={profile.id}
      profile={{
        name: profile.name,
        bio: profile.bio,
        avatar: profile.avatar,
        coverImage: profile.coverImage,
        memberSince: profile.createdAt,
        stats: {
          totalFilms: profile._count.diaryEntries,
          thisYear: profile.thisYearCount,
          following: profile._count.following,
          followers: profile._count.followers,
        },
      }}
    >
      {children}
    </ProfileShell>
  )
}
