'use client'

import ProfileHeader, { type ProfileHeaderProps } from '@/components/profile/ProfileHeader'
import ProfileTabs from '@/components/profile/ProfileTabs'
import { useAuthStore } from '@/store/auth.store'

interface ProfileShellProps {
  username: string
  profile: Omit<ProfileHeaderProps, 'isOwnProfile' | 'username'>
  children: React.ReactNode
}

export default function ProfileShell({ username, profile, children }: ProfileShellProps) {
  const authUser = useAuthStore((s) => s.user)
  const isOwnProfile = authUser?.username === username

  return (
    <>
      <ProfileHeader
        username={username}
        isOwnProfile={isOwnProfile}
        name={profile.name}
        bio={profile.bio}
        avatar={profile.avatar}
        coverImage={profile.coverImage}
        memberSince={profile.memberSince}
        stats={profile.stats}
      />
      <ProfileTabs username={username} />
      {children}
    </>
  )
}
