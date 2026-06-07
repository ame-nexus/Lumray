import ProfileShell from '@/components/profile/ProfileShell'
import { DUMMY_PROFILE_HEADER } from '@/lib/profileDummy'

export default async function ProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ username: string }>
}) {
  const { username } = await params

  const profile = {
    name: DUMMY_PROFILE_HEADER.name,
    bio: DUMMY_PROFILE_HEADER.bio,
    avatar: DUMMY_PROFILE_HEADER.avatar,
    coverImage: DUMMY_PROFILE_HEADER.coverImage,
    memberSince: DUMMY_PROFILE_HEADER.memberSince,
    stats: DUMMY_PROFILE_HEADER.stats,
  }

  return (
    <ProfileShell username={username} profile={profile}>
      {children}
    </ProfileShell>
  )
}
