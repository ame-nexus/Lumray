'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  Heart, MessageCircle, Star, ArrowLeft, Send,
  Trash2, Loader2, Pencil, Check, X,
} from 'lucide-react'
import api from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import ConfirmModal from '@/components/ui/ConfirmModal'

// ── Types ─────────────────────────────────────────────────────────────────────

type Review = {
  id: string
  content: string
  rating: number | null
  createdAt: string
  isLiked: boolean
  user: { id: string; username: string; avatar: string | null }
  movie: { id: string; tmdbId: number; title: string; posterPath: string | null; releaseDate: string | null }
  _count: { likes: number; comments: number }
}

type Comment = {
  id: string
  content: string
  createdAt: string
  user: { id: string; username: string; avatar: string | null }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  if (mins < 1)  return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

function Avatar({ src, username, size = 8 }: { src: string | null; username: string; size?: number }) {
  const px = size * 4
  return (
    <div className="relative shrink-0 overflow-hidden rounded-full bg-purple flex items-center justify-center" style={{ width: px, height: px }}>
      {src
        ? <Image src={src} alt={username} fill className="object-cover" sizes={`${px}px`} />
        : <span className="font-roboto text-xs font-bold text-white">{username[0]?.toUpperCase()}</span>
      }
    </div>
  )
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} size={14} className={i < rating ? 'fill-purple-light text-purple-light' : 'text-text-muted'} />
      ))}
    </div>
  )
}

// ── Comment item ──────────────────────────────────────────────────────────────

function CommentItem({ comment, currentUserId, reviewOwnerId, onEdit, onDelete }: {
  comment:       Comment
  currentUserId: string | null
  reviewOwnerId: string
  onEdit:        (id: string, content: string) => void
  onDelete:      (id: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft,   setDraft]   = useState(comment.content)

  const canEdit   = currentUserId === comment.user.id
  const canDelete = canEdit || currentUserId === reviewOwnerId

  const saveEdit = () => {
    const t = draft.trim()
    if (t && t !== comment.content) onEdit(comment.id, t)
    setEditing(false)
  }

  return (
    <div className="flex gap-2.5">
      <Avatar src={comment.user.avatar} username={comment.user.username} size={7} />
      <div className="flex-1 min-w-0">
        <div className="rounded-lg bg-surface-2 px-3 py-2">
          <div className="flex items-center gap-2 mb-0.5">
            <Link href={`/profile/${comment.user.username}`} className="font-roboto text-xs font-semibold text-text hover:text-purple-light transition-colors">
              {comment.user.username}
            </Link>
            <span className="font-roboto text-[10px] text-text-muted">{timeAgo(comment.createdAt)}</span>
          </div>
          {editing ? (
            <div className="flex items-center gap-1.5">
              <input
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); saveEdit() } else if (e.key === 'Escape') setEditing(false) }}
                autoFocus
                className="flex-1 rounded bg-surface px-2 py-1 font-roboto text-xs text-text focus:outline-none focus:ring-1 focus:ring-purple/50"
              />
              <button onClick={saveEdit} className="text-green-400 p-0.5"><Check size={14} /></button>
              <button onClick={() => { setEditing(false); setDraft(comment.content) }} className="text-text-muted hover:text-text p-0.5"><X size={14} /></button>
            </div>
          ) : (
            <p className="font-roboto text-xs text-text-dim leading-relaxed wrap-break-word">{comment.content}</p>
          )}
        </div>
        {!editing && currentUserId && (canEdit || canDelete) && (
          <div className="flex items-center gap-3 px-1 pt-1">
            {canEdit && (
              <button onClick={() => { setDraft(comment.content); setEditing(true) }} className="flex items-center gap-1 font-roboto text-[11px] text-text-muted hover:text-text transition-colors">
                <Pencil size={11} /> Edit
              </button>
            )}
            {canDelete && (
              <button onClick={() => onDelete(comment.id)} className="flex items-center gap-1 font-roboto text-[11px] text-text-muted hover:text-red-400 transition-colors">
                <Trash2 size={11} /> Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReviewDetailPage() {
  const { id }  = useParams<{ id: string }>()
  const router  = useRouter()
  const user    = useAuthStore(s => s.user)

  const [review,       setReview]       = useState<Review | null>(null)
  const [reviewLoading, setReviewLoading] = useState(true)
  const [liked,        setLiked]        = useState(false)
  const [likeCount,    setLikeCount]    = useState(0)

  const [comments,     setComments]     = useState<Comment[]>([])
  const [cmtLoading,   setCmtLoading]   = useState(true)
  const [commentCount, setCommentCount] = useState(0)
  const [newComment,        setNewComment]        = useState('')
  const [sending,           setSending]           = useState(false)
  const [confirmCommentId,  setConfirmCommentId]  = useState<string | null>(null)

  useEffect(() => {
    api.get(`/api/reviews/${id}`)
      .then(res => {
        const r: Review = res.data.data
        setReview(r)
        setLiked(r.isLiked)
        setLikeCount(r._count.likes)
        setCommentCount(r._count.comments)
      })
      .catch(() => router.replace('/community'))
      .finally(() => setReviewLoading(false))

    api.get(`/api/reviews/${id}/comments`)
      .then(res => setComments(res.data.data ?? []))
      .finally(() => setCmtLoading(false))
  }, [id, router])

  const toggleLike = async () => {
    if (!user) { router.push('/login'); return }
    const next = !liked
    setLiked(next)
    setLikeCount(c => c + (next ? 1 : -1))
    try {
      if (next) await api.post(`/api/reviews/${id}/like`)
      else       await api.delete(`/api/reviews/${id}/like`)
    } catch {
      setLiked(!next)
      setLikeCount(c => c + (next ? -1 : 1))
    }
  }

  const submitComment = async () => {
    if (!newComment.trim() || sending) return
    setSending(true)
    try {
      const res = await api.post(`/api/reviews/${id}/comments`, { content: newComment.trim() })
      setComments(c => [...c, res.data.data])
      setCommentCount(c => c + 1)
      setNewComment('')
    } finally {
      setSending(false)
    }
  }

  const editComment = (cid: string, content: string) => {
    setComments(cs => cs.map(c => c.id === cid ? { ...c, content } : c))
    api.put(`/api/reviews/comments/${cid}`, { content }).catch(() => {})
  }

  const deleteComment = (cid: string) => {
    setConfirmCommentId(cid)
  }

  const doDeleteComment = (cid: string) => {
    setComments(cs => cs.filter(c => c.id !== cid))
    setCommentCount(c => Math.max(0, c - 1))
    api.delete(`/api/reviews/${id}/comments/${cid}`).catch(() => {})
    setConfirmCommentId(null)
  }

  const year = review?.movie?.releaseDate?.slice(0, 4)

  const posterSrc = review?.movie?.posterPath
    ? review.movie.posterPath.startsWith('http')
      ? review.movie.posterPath
      : `https://image.tmdb.org/t/p/w500${review.movie.posterPath}`
    : null

  return (
    <>
    <main className="px-4 py-8 md:px-12 xl:px-60">
      <div className="mx-auto max-w-2xl flex flex-col gap-6">

        {/* Back */}
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 font-roboto text-sm text-text-muted hover:text-text transition-colors w-fit"
        >
          <ArrowLeft size={15} /> Back
        </button>

        {/* Review card */}
        {reviewLoading ? (
          <div className="rounded-xl border border-text/10 bg-surface p-6 animate-pulse flex gap-4">
            <div className="flex-1 space-y-3">
              <div className="h-3 w-full rounded bg-surface-2" />
              <div className="h-3 w-4/5 rounded bg-surface-2" />
              <div className="h-3 w-3/5 rounded bg-surface-2" />
            </div>
            <div className="w-24 h-36 rounded-lg bg-surface-2 shrink-0" />
          </div>
        ) : review ? (
          <article className="flex overflow-hidden rounded-xl border border-text/10 bg-surface">
            {/* Content */}
            <div className="flex flex-1 flex-col gap-4 p-5">
              {/* Movie link */}
              <Link href={`/films/${review.movie.tmdbId}`} className="flex items-center gap-2 w-fit">
                <span className="font-outfit text-base font-bold text-text hover:text-purple-light transition-colors">
                  {review.movie.title}
                </span>
                {year && <span className="font-roboto text-sm text-text-muted">({year})</span>}
              </Link>

              {/* Rating */}
              {review.rating != null && <StarRow rating={Math.round(review.rating)} />}

              {/* Review text */}
              <p className="font-roboto text-sm leading-relaxed text-text whitespace-pre-wrap flex-1">
                {review.content}
              </p>

              {/* Author row */}
              <div className="flex items-center justify-between gap-3 border-t border-text/10 pt-3">
                <div className="flex items-center gap-2.5">
                  <Avatar src={review.user.avatar} username={review.user.username} size={8} />
                  <div>
                    <Link href={`/profile/${review.user.username}`} className="font-roboto text-sm font-semibold text-white hover:text-purple-light transition-colors">
                      {review.user.username}
                    </Link>
                    <p className="font-roboto text-[11px] text-text-muted">{timeAgo(review.createdAt)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 font-roboto text-sm text-text-muted">
                  <button
                    onClick={toggleLike}
                    className={`flex items-center gap-1.5 transition-colors ${
                      liked ? 'text-purple-light' : 'hover:text-text'
                    }`}
                  >
                    <Heart size={15} className={liked ? 'fill-purple-light' : ''} />
                    {likeCount}
                  </button>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle size={15} />
                    {commentCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Poster */}
            {posterSrc && (
              <Link href={`/films/${review.movie.tmdbId}`} className="relative shrink-0 w-28 self-stretch sm:w-36 hover:opacity-90 transition-opacity">
                <Image src={posterSrc} alt={review.movie.title} fill sizes="144px" className="object-cover object-top" />
              </Link>
            )}
          </article>
        ) : null}

        {/* Comments */}
        <section className="flex flex-col gap-4">
          <h2 className="font-outfit text-base font-semibold text-text">
            Comments {commentCount > 0 && <span className="font-roboto text-sm font-normal text-text-muted">({commentCount})</span>}
          </h2>

          {cmtLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-2.5">
                  <div className="h-7 w-7 shrink-0 rounded-full bg-surface animate-pulse" />
                  <div className="flex-1 h-12 rounded-lg bg-surface animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {comments.map(c => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  currentUserId={user?.id ?? null}
                  reviewOwnerId={review?.user.id ?? ''}
                  onEdit={editComment}
                  onDelete={deleteComment}
                />
              ))}
              {comments.length === 0 && !cmtLoading && (
                <p className="py-4 text-center font-roboto text-sm text-text-muted">No comments yet. Be the first!</p>
              )}
            </div>
          )}

          {/* Write comment */}
          {user ? (
            <div className="flex gap-2">
              <Avatar src={user.avatar} username={user.username} size={7} />
              <div className="flex flex-1 gap-2">
                <input
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitComment()}
                  placeholder="Write a comment..."
                  className="flex-1 rounded-lg bg-surface px-3 py-2 font-roboto text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-purple/50"
                />
                <button
                  onClick={submitComment}
                  disabled={!newComment.trim() || sending}
                  className="rounded-lg bg-purple px-3 py-2 text-white hover:bg-purple-deep disabled:opacity-40 transition-colors"
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-text/10 bg-surface p-4 text-center">
              <p className="font-roboto text-sm text-text-muted mb-3">Sign in to leave a comment</p>
              <Link href="/login" className="inline-block bg-purple text-white font-medium text-sm px-5 py-2 rounded-full hover:bg-purple-deep transition-colors">
                Sign in
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>

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
