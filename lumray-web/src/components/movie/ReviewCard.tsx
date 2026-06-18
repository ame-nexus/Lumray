'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, MessageCircle, Trash2, Send, Star } from 'lucide-react'
import { useAuthStore } from '@/store/auth.store'
import { useRouter } from 'next/navigation'
import api from '@/services/api'
import FollowButton from '@/components/ui/FollowButton'
import ConfirmModal from '@/components/ui/ConfirmModal'

export interface ReviewCardProps {
  id: string
  user: { id: string; username: string; avatar?: string | null }
  rating?: number | null
  content: string
  likeCount: number
  commentCount: number
  createdAt?: string
  isLiked?: boolean
  onDeleted?: () => void
}

interface Comment {
  id: string
  content: string
  createdAt: string
  user: { id: string; username: string; avatar: string | null }
}

function usernameInitials(username: string): string {
  return username.slice(0, 2).toUpperCase()
}

function Avatar({ username, avatar, size = 8 }: { username: string; avatar?: string | null; size?: number }) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full bg-purple"
      style={{ width: size * 4, height: size * 4 }}
    >
      {avatar ? (
        <Image src={avatar} alt={username} fill className="object-cover" sizes={`${size * 4}px`} />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-white">
          {usernameInitials(username)}
        </span>
      )}
    </div>
  )
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={12}
          className={i < rating ? 'fill-purple-light text-purple-light' : 'text-text-muted'}
        />
      ))}
    </div>
  )
}

export default function ReviewCard({
  id,
  user,
  rating,
  content,
  likeCount,
  commentCount,
  createdAt,
  isLiked = false,
  onDeleted,
}: ReviewCardProps) {
  const router      = useRouter()
  const currentUser = useAuthStore(s => s.user)
  const isOwner     = currentUser?.id === user.id

  const [liked,         setLiked]         = useState(isLiked)
  const [likes,         setLikes]         = useState(likeCount)
  const [commentsOpen,  setCommentsOpen]  = useState(false)
  const [comments,      setComments]      = useState<Comment[]>([])
  const [commentsFetched, setCommentsFetched] = useState(false)
  const [loadingCmts,   setLoadingCmts]   = useState(false)
  const [newComment,    setNewComment]    = useState('')
  const [submitting,    setSubmitting]    = useState(false)
  const [deleting,          setDeleting]          = useState(false)
  const [totalComments,     setTotalComments]     = useState(commentCount)
  const [confirmDelete,     setConfirmDelete]     = useState(false)
  const [confirmCommentId,  setConfirmCommentId]  = useState<string | null>(null)

  function requireAuth(): boolean {
    if (currentUser) return false
    router.push('/login')
    return true
  }

  async function toggleLike() {
    if (requireAuth()) return
    const nextLiked = !liked
    setLiked(nextLiked)
    setLikes(n => n + (nextLiked ? 1 : -1))
    try {
      if (nextLiked) {
        await api.post(`/api/reviews/${id}/like`)
      } else {
        await api.delete(`/api/reviews/${id}/like`)
      }
    } catch {
      setLiked(!nextLiked)
      setLikes(n => n + (nextLiked ? -1 : 1))
    }
  }

  async function openComments() {
    setCommentsOpen(v => !v)
    if (commentsFetched) return
    setLoadingCmts(true)
    try {
      const res = await api.get(`/api/reviews/${id}/comments`)
      setComments(res.data.data ?? [])
      setCommentsFetched(true)
    } catch {
      // silent
    } finally {
      setLoadingCmts(false)
    }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim() || submitting) return
    if (requireAuth()) return
    setSubmitting(true)
    try {
      const res = await api.post(`/api/reviews/${id}/comments`, { content: newComment.trim() })
      setComments(c => [...c, res.data.data])
      setTotalComments(n => n + 1)
      setNewComment('')
    } catch {
      // silent
    } finally {
      setSubmitting(false)
    }
  }

  function deleteComment(commentId: string) {
    setConfirmCommentId(commentId)
  }

  async function doDeleteComment(commentId: string) {
    try {
      await api.delete(`/api/reviews/${id}/comments/${commentId}`)
      setComments(c => c.filter(cm => cm.id !== commentId))
      setTotalComments(n => n - 1)
    } catch {
      // silent
    } finally {
      setConfirmCommentId(null)
    }
  }

  function handleDelete() {
    setConfirmDelete(true)
  }

  async function doDelete() {
    setConfirmDelete(false)
    setDeleting(true)
    try {
      await api.delete(`/api/reviews/${id}`)
      onDeleted?.()
    } catch {
      setDeleting(false)
    }
  }

  return (
    <>
    <article className="rounded-xl border border-text/10 bg-surface">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Avatar username={user.username} avatar={user.avatar} size={8} />
            <div className="min-w-0">
              <p className="font-outfit text-sm font-medium text-text">{user.username}</p>
              {createdAt && (
                <p className="font-roboto text-xs text-text-muted">{createdAt}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isOwner && <FollowButton userId={user.id} size="xs" />}
            {rating != null && <StarRow rating={rating} />}
            {isOwner && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                aria-label="Delete review"
                className="rounded p-1 text-text-muted transition-colors hover:bg-red-500/15 hover:text-red-400 disabled:opacity-40"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <p className="mt-3 font-roboto text-sm leading-relaxed text-text">{content}</p>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={toggleLike}
            className={`inline-flex items-center gap-1.5 font-roboto text-xs transition-colors ${
              liked ? 'text-red-400' : 'text-text-muted hover:text-red-400'
            }`}
          >
            <Heart size={13} className={liked ? 'fill-red-400' : ''} />
            {likes}
          </button>

          <button
            type="button"
            onClick={openComments}
            className={`inline-flex items-center gap-1.5 font-roboto text-xs transition-colors ${
              commentsOpen ? 'text-purple-light' : 'text-text-muted hover:text-purple-light'
            }`}
          >
            <MessageCircle size={13} />
            {totalComments}
          </button>
        </div>
      </div>

      {/* Comments section */}
      {commentsOpen && (
        <div className="border-t border-text/10 px-4 pb-4 pt-3">
          {loadingCmts ? (
            <div className="space-y-2 py-2">
              {[1, 2].map(i => <div key={i} className="h-7 animate-pulse rounded bg-surface-2" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {comments.length === 0 && (
                <p className="py-1 font-roboto text-xs text-text-muted">No comments yet.</p>
              )}
              {comments.map(cm => {
                const canDeleteCm = currentUser?.id === cm.user.id || isOwner
                return (
                  <div key={cm.id} className="flex items-start gap-2">
                    <Avatar username={cm.user.username} avatar={cm.user.avatar} size={6} />
                    <div className="min-w-0 flex-1 rounded-lg bg-surface-2 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-outfit text-xs font-medium text-text">{cm.user.username}</span>
                        {canDeleteCm && (
                          <button
                            type="button"
                            onClick={() => deleteComment(cm.id)}
                            aria-label="Delete comment"
                            className="text-text-muted transition-colors hover:text-red-400"
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>
                      <p className="mt-0.5 font-roboto text-xs text-text-dim">{cm.content}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Comment input */}
          {currentUser ? (
            <form onSubmit={submitComment} className="mt-3 flex items-center gap-2">
              <Avatar username={currentUser.username} avatar={currentUser.avatar} size={6} />
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-text/10 bg-surface-2 px-3 py-1.5">
                <input
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Add a comment…"
                  maxLength={500}
                  className="min-w-0 flex-1 bg-transparent font-roboto text-xs text-text outline-none placeholder:text-text-muted"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="shrink-0 text-purple-light transition-opacity disabled:opacity-30"
                >
                  <Send size={13} />
                </button>
              </div>
            </form>
          ) : (
            <p className="mt-3 font-roboto text-xs text-text-muted">
              <button type="button" onClick={() => router.push('/login')} className="text-purple-light underline">
                Log in
              </button>{' '}
              to leave a comment.
            </p>
          )}
        </div>
      )}
    </article>

    {confirmDelete && (
      <ConfirmModal
        title="Delete review"
        message="Delete your review? This can't be undone."
        loading={deleting}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    )}
    {confirmCommentId && (
      <ConfirmModal
        title="Delete comment"
        message="Delete this comment? This can't be undone."
        onConfirm={() => doDeleteComment(confirmCommentId)}
        onCancel={() => setConfirmCommentId(null)}
      />
    )}
  </>
  )
}

export const DUMMY_REVIEW_CARD: ReviewCardProps = {
  id: 'dummy',
  user: { id: 'u1', username: 'rach_m', avatar: 'https://i.pravatar.cc/150?u=rach' },
  rating: 5,
  content: 'There is a haunting, rhythmic quality to this film that most modern cinema seems to have lost in the edit.',
  likeCount: 41,
  commentCount: 11,
  createdAt: '2 May 2023',
}
