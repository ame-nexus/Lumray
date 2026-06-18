'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  Heart, MessageCircle, ArrowLeft, Film, Send, Trash2,
  Loader2, Pencil, Check, X, CornerDownRight,
} from 'lucide-react'
import api from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import ConfirmModal from '@/components/ui/ConfirmModal'

// ── Types ─────────────────────────────────────────────────────────────────────

type Post = {
  id: string
  content: string
  tags: string[]
  imageUrl: string | null
  createdAt: string
  isLiked: boolean
  user: { id: string; username: string; avatar: string | null }
  movie: { tmdbId: number; title: string; posterPath: string | null; releaseDate: string | null } | null
  _count: { likes: number; comments: number }
}

type Comment = {
  id: string
  content: string
  createdAt: string
  parentId: string | null
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

// ── Comment item ──────────────────────────────────────────────────────────────

function CommentItem({ comment, replies, currentUserId, postOwnerId, isReply, onReply, onEdit, onDelete }: {
  comment: Comment
  replies?: Comment[]
  currentUserId: string | null
  postOwnerId: string
  isReply?: boolean
  onReply:  (parentId: string, content: string) => Promise<void>
  onEdit:   (id: string, content: string) => void
  onDelete: (id: string) => void
}) {
  const [editing,   setEditing]   = useState(false)
  const [draft,     setDraft]     = useState(comment.content)
  const [replying,  setReplying]  = useState(false)
  const [replyText, setReplyText] = useState('')
  const [sending,   setSending]   = useState(false)

  const canEdit   = currentUserId === comment.user.id
  const canDelete = canEdit || currentUserId === postOwnerId

  const saveEdit = () => {
    const t = draft.trim()
    if (t && t !== comment.content) onEdit(comment.id, t)
    setEditing(false)
  }

  const sendReply = async () => {
    const t = replyText.trim()
    if (!t || sending) return
    setSending(true)
    try { await onReply(comment.id, t); setReplyText(''); setReplying(false) }
    finally { setSending(false) }
  }

  return (
    <div className="flex flex-col gap-2">
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
              <p className="font-roboto text-xs text-text-dim leading-relaxed break-words">{comment.content}</p>
            )}
          </div>
          {!editing && currentUserId && (
            <div className="flex items-center gap-3 px-1 pt-1">
              {!isReply && (
                <button onClick={() => setReplying(v => !v)} className="flex items-center gap-1 font-roboto text-[11px] text-text-muted hover:text-text transition-colors">
                  <CornerDownRight size={11} /> Reply
                </button>
              )}
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
          {replying && (
            <div className="flex gap-2 pt-2">
              <input
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendReply()}
                autoFocus
                placeholder={`Reply to ${comment.user.username}...`}
                className="flex-1 rounded-lg bg-surface-2 px-3 py-1.5 font-roboto text-xs text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-purple/50"
              />
              <button onClick={sendReply} disabled={!replyText.trim() || sending} className="rounded-lg bg-purple px-3 py-1.5 text-white hover:bg-purple-deep disabled:opacity-40">
                {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              </button>
            </div>
          )}
        </div>
      </div>
      {replies && replies.length > 0 && (
        <div className="ml-9 flex flex-col gap-2">
          {replies.map(r => (
            <CommentItem
              key={r.id}
              comment={r}
              currentUserId={currentUserId}
              postOwnerId={postOwnerId}
              isReply
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PostDetailPage() {
  const { id }    = useParams<{ id: string }>()
  const router    = useRouter()
  const user      = useAuthStore(s => s.user)

  const [post,         setPost]         = useState<Post | null>(null)
  const [postLoading,  setPostLoading]  = useState(true)
  const [liked,        setLiked]        = useState(false)
  const [likeCount,    setLikeCount]    = useState(0)

  const [comments,          setComments]          = useState<Comment[]>([])
  const [cmtLoading,        setCmtLoading]        = useState(true)
  const [commentCount,      setCommentCount]      = useState(0)
  const [newComment,        setNewComment]        = useState('')
  const [sending,           setSending]           = useState(false)
  const [confirmPost,       setConfirmPost]       = useState(false)
  const [confirmCommentId,  setConfirmCommentId]  = useState<string | null>(null)

  useEffect(() => {
    api.get(`/api/posts/${id}`)
      .then(res => {
        const p: Post = res.data.data
        setPost(p)
        setLiked(p.isLiked)
        setLikeCount(p._count.likes)
        setCommentCount(p._count.comments)
      })
      .catch(() => router.replace('/community'))
      .finally(() => setPostLoading(false))

    api.get(`/api/posts/${id}/comments`)
      .then(res => setComments(res.data.data ?? []))
      .finally(() => setCmtLoading(false))
  }, [id, router])

  const toggleLike = async () => {
    if (!user) { router.push('/login'); return }
    const next = !liked
    setLiked(next)
    setLikeCount(c => c + (next ? 1 : -1))
    try {
      if (next) await api.post(`/api/posts/${id}/like`)
      else       await api.delete(`/api/posts/${id}/like`)
    } catch {
      setLiked(!next)
      setLikeCount(c => c + (next ? -1 : 1))
    }
  }

  const submitComment = async () => {
    if (!newComment.trim() || sending) return
    setSending(true)
    try {
      const res = await api.post(`/api/posts/${id}/comments`, { content: newComment.trim() })
      setComments(c => [...c, res.data.data])
      setCommentCount(c => c + 1)
      setNewComment('')
    } finally {
      setSending(false)
    }
  }

  const addReply = async (parentId: string, content: string) => {
    const res = await api.post(`/api/posts/${id}/comments`, { content, parentId })
    setComments(c => [...c, res.data.data])
    setCommentCount(c => c + 1)
  }

  const editComment = (cid: string, content: string) => {
    setComments(cs => cs.map(c => c.id === cid ? { ...c, content } : c))
    api.put(`/api/posts/comments/${cid}`, { content }).catch(() => {})
  }

  const deleteComment = (cid: string) => {
    setConfirmCommentId(cid)
  }

  const doDeleteComment = (cid: string) => {
    const removed = comments.filter(c => c.id === cid || c.parentId === cid).length
    setComments(cs => cs.filter(c => c.id !== cid && c.parentId !== cid))
    setCommentCount(c => Math.max(0, c - removed))
    api.delete(`/api/posts/comments/${cid}`).catch(() => {})
    setConfirmCommentId(null)
  }

  const handleDeletePost = () => setConfirmPost(true)

  const doDeletePost = async () => {
    await api.delete(`/api/posts/${id}`)
    router.push('/community')
  }

  const topLevel = comments.filter(c => !c.parentId)
  const repliesOf = (cid: string) => comments.filter(c => c.parentId === cid)
  const year = post?.movie?.releaseDate?.slice(0, 4)

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

        {/* Post */}
        {postLoading ? (
          <div className="rounded-xl border border-text/10 bg-surface p-4 animate-pulse flex flex-col gap-4">
            <div className="flex gap-2.5">
              <div className="h-9 w-9 rounded-full bg-surface-2" />
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="h-3 w-24 rounded bg-surface-2" />
                <div className="h-2.5 w-14 rounded bg-surface-2" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-full rounded bg-surface-2" />
              <div className="h-3 w-4/5 rounded bg-surface-2" />
              <div className="h-3 w-3/5 rounded bg-surface-2" />
            </div>
          </div>
        ) : post ? (
          <article className="rounded-xl border border-text/10 bg-surface p-4 flex flex-col gap-3">

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Avatar src={post.user.avatar} username={post.user.username} size={9} />
                <div>
                  <Link href={`/profile/${post.user.username}`} className="font-roboto text-sm font-semibold text-white hover:text-purple-light transition-colors">
                    {post.user.username}
                  </Link>
                  <p className="font-roboto text-[11px] text-text-muted">{timeAgo(post.createdAt)}</p>
                </div>
              </div>
              {user?.id === post.user.id && (
                <button onClick={handleDeletePost} className="text-text-muted hover:text-red-400 transition-colors p-1">
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* Content */}
            {post.content && (
              <p className="font-roboto text-sm leading-relaxed text-text whitespace-pre-wrap">{post.content}</p>
            )}

            {/* Image */}
            {post.imageUrl && (
              <a href={post.imageUrl} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-text/10">
                <Image src={post.imageUrl} alt="" width={600} height={400} className="max-h-96 w-full object-cover" unoptimized />
              </a>
            )}

            {/* Film reference */}
            {post.movie && (
              <Link href={`/films/${post.movie.tmdbId}`} className="flex items-center gap-3 rounded-lg bg-surface-2 p-2.5 hover:bg-surface-2/80 transition-colors">
                <Film size={14} className="shrink-0 text-purple-light" />
                {post.movie.posterPath && (
                  <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded">
                    <Image src={`https://image.tmdb.org/t/p/w92${post.movie.posterPath}`} alt={post.movie.title} fill className="object-cover" sizes="32px" />
                  </div>
                )}
                <span className="font-roboto text-sm font-semibold text-purple-light">
                  {post.movie.title}
                  {year && <span className="font-normal text-text-muted ml-1">({year})</span>}
                </span>
              </Link>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map(tag => (
                  <span key={tag} className="font-roboto text-[11px] text-purple-light bg-purple/10 px-2 py-0.5 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-4 border-t border-text/10 pt-2.5">
              <button
                onClick={toggleLike}
                className={`flex items-center gap-1.5 font-roboto text-sm transition-colors ${
                  liked ? 'text-purple-light' : 'text-text-muted hover:text-text'
                }`}
              >
                <Heart size={15} className={liked ? 'fill-purple-light' : ''} />
                {likeCount}
              </button>
              <span className="flex items-center gap-1.5 font-roboto text-sm text-text-muted">
                <MessageCircle size={15} />
                {commentCount}
              </span>
            </div>
          </article>
        ) : null}

        {/* Comments */}
        <section className="flex flex-col gap-4">
          <h2 className="font-outfit text-base font-semibold text-text">
            Comments {commentCount > 0 && <span className="font-roboto text-sm font-normal text-text-muted">({commentCount})</span>}
          </h2>

          {cmtLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-2.5">
                  <div className="h-7 w-7 shrink-0 rounded-full bg-surface animate-pulse" />
                  <div className="flex-1 h-14 rounded-lg bg-surface animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {topLevel.map(c => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  replies={repliesOf(c.id)}
                  currentUserId={user?.id ?? null}
                  postOwnerId={post?.user.id ?? ''}
                  onReply={addReply}
                  onEdit={editComment}
                  onDelete={deleteComment}
                />
              ))}
              {topLevel.length === 0 && !cmtLoading && (
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

    {confirmPost && (
      <ConfirmModal
        title="Delete post"
        message="Delete this post? This can't be undone."
        onConfirm={doDeletePost}
        onCancel={() => setConfirmPost(false)}
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
