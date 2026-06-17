'use client'

import { useEffect, useState } from 'react'
import { UserPlus, UserCheck } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import api from '@/services/api'

interface FollowButtonProps {
  userId: string
  size?: 'sm' | 'xs'
}

export default function FollowButton({ userId, size = 'sm' }: FollowButtonProps) {
  const currentUser           = useAuthStore(s => s.user)
  const [following, setFollowing] = useState(false)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    if (!currentUser) { setLoading(false); return }
    api.get(`/api/users/${userId}/follow-status`)
      .then(res => setFollowing(res.data.data.isFollowing))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId, currentUser])

  const toggle = async () => {
    if (!currentUser || loading) return
    setLoading(true)
    try {
      if (following) {
        await api.delete(`/api/users/${userId}/follow`)
        setFollowing(false)
      } else {
        await api.post(`/api/users/${userId}/follow`)
        setFollowing(true)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!currentUser || currentUser.id === userId) return null

  const isXs = size === 'xs'

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`inline-flex items-center gap-1 font-roboto font-semibold transition-colors disabled:opacity-50 rounded-full ${
        isXs ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'
      } ${
        following
          ? 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
          : 'bg-purple text-white hover:bg-purple-deep'
      }`}
    >
      {following
        ? <><UserCheck size={isXs ? 10 : 12} /> Following</>
        : <><UserPlus  size={isXs ? 10 : 12} /> Follow</>
      }
    </button>
  )
}
