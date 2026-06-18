'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Heart, MessageCircle, Send, Trash2, ChevronDown, ChevronUp, Film,
  Paperclip, X, Loader2, Search, Pencil, Check, CornerDownRight,
} from 'lucide-react'
import api from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import FollowButton from '@/components/ui/FollowButton'

// ── Types ────────────────────────────────────────────────────────────────

type PickedMovie = { tmdbId: number; title: string; posterPath: string | null }

type FeedPost = {
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

// ── Helpers ───────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
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

// ── Write Post ────────────────────────────────────────────────────────────

function WritePost({ onPost }: { onPost: (p: FeedPost) => void }) {
  const user = useAuthStore(s => s.user)
  const [content, setContent]   = useState('')
  const [tags, setTags]         = useState('')
  const [loading, setLoading]   = useState(false)

  // Film reference
  const [movie, setMovie]               = useState<PickedMovie | null>(null)
  const [showFilm, setShowFilm]         = useState(false)
  const [filmQuery, setFilmQuery]       = useState('')
  const [filmResults, setFilmResults]   = useState<PickedMovie[]>([])

  // Attachment
  const [image, setImage]       = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // Debounced film search (setState lives in the timeout — lint-safe)
  useEffect(() => {
    if (!showFilm) return
    const q = filmQuery.trim()
    let cancelled = false
    const timer = setTimeout(async () => {
      if (q.length < 2) { setFilmResults([]); return }
      try {
        const res = await api.get('/api/search', { params: { q, type: 'movies', limit: 6 } })
        if (cancelled) return
        const raw = (res.data.data?.movies ?? []) as { tmdbId: number; title: string; posterPath: string | null }[]
        setFilmResults(raw.map(m => ({ tmdbId: m.tmdbId, title: m.title, posterPath: m.posterPath })))
      } catch { if (!cancelled) setFilmResults([]) }
    }, 250)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [filmQuery, showFilm])

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await api.post('/api/messages/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setImage(res.data.data.url)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const submit = async () => {
    if ((!content.trim() && !image && !movie) || loading || uploading) return
    setLoading(true)
    try {
      const tagArr = tags.split(' ').map(t => t.replace(/^#/, '').trim()).filter(Boolean)
      const res = await api.post('/api/posts', {
        content: content.trim(),
        tags: tagArr,
        imageUrl: image,
        movieTmdbId:     movie?.tmdbId,
        movieTitle:      movie?.title,
        moviePosterPath: movie?.posterPath,
      })
      onPost({ ...res.data.data, isLiked: false })
      setContent(''); setTags(''); setMovie(null); setImage(null); setShowFilm(false); setFilmQuery('')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <div className="rounded-xl border border-text/10 bg-surface p-4 flex gap-3">
      <Avatar src={user.avatar} username={user.username} size={9} />
      <div className="flex-1 flex flex-col gap-3">
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="What's on your mind? Review a film, share a recommendation..."
          rows={3}
          className="w-full resize-none rounded-lg bg-surface-2 px-3 py-2.5 font-roboto text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-purple/50"
        />

        {/* Selected film chip */}
        {movie && (
          <div className="flex items-center gap-2 rounded-lg bg-surface-2 px-2.5 py-2 w-fit max-w-full">
            {movie.posterPath && (
              <div className="relative h-10 w-7 shrink-0 overflow-hidden rounded">
                <Image src={`https://image.tmdb.org/t/p/w92${movie.posterPath}`} alt={movie.title} fill className="object-cover" sizes="28px" />
              </div>
            )}
            <span className="font-roboto text-xs text-text line-clamp-1">{movie.title}</span>
            <button onClick={() => setMovie(null)} className="text-text-muted hover:text-text"><X size={13} /></button>
          </div>
        )}

        {/* Image preview */}
        {image && (
          <div className="relative w-fit">
            <Image src={image} alt="attachment" width={120} height={120} className="h-28 w-auto rounded-lg object-cover" unoptimized />
            <button onClick={() => setImage(null)} className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white"><X size={11} /></button>
          </div>
        )}

        {/* Inline film search */}
        {showFilm && !movie && (
          <div className="rounded-lg border border-text/10 bg-surface-2 p-2 flex flex-col gap-1.5">
            <div className="flex items-center gap-2 px-1">
              <Search size={13} className="text-text-muted" />
              <input
                value={filmQuery}
                onChange={e => setFilmQuery(e.target.value)}
                autoFocus
                placeholder="Search a film to reference..."
                className="flex-1 bg-transparent font-roboto text-xs text-text placeholder:text-text-muted focus:outline-none"
              />
              <button onClick={() => { setShowFilm(false); setFilmQuery('') }} className="text-text-muted hover:text-text"><X size={13} /></button>
            </div>
            {filmResults.length > 0 && (
              <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                {filmResults.map(m => (
                  <button
                    key={m.tmdbId}
                    onClick={() => { setMovie(m); setShowFilm(false); setFilmQuery(''); setFilmResults([]) }}
                    className="flex items-center gap-2 rounded-md px-1.5 py-1.5 text-left hover:bg-surface transition-colors"
                  >
                    <div className="relative h-10 w-7 shrink-0 overflow-hidden rounded bg-surface">
                      {m.posterPath && <Image src={`https://image.tmdb.org/t/p/w92${m.posterPath}`} alt={m.title} fill className="object-cover" sizes="28px" />}
                    </div>
                    <span className="font-roboto text-xs text-text line-clamp-1">{m.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilm(v => !v)}
            title="Reference a film"
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${movie || showFilm ? 'bg-purple/20 text-purple-light' : 'text-text-muted hover:bg-surface-2 hover:text-text'}`}
          >
            <Film size={15} />
          </button>
          <label
            title="Add image"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
          >
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Paperclip size={15} />}
            <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} />
          </label>

          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="#tags #horror #review"
            className="flex-1 rounded-lg bg-surface-2 px-3 py-1.5 font-roboto text-xs text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-purple/50"
          />
          <button
            onClick={submit}
            disabled={(!content.trim() && !image && !movie) || loading || uploading}
            className="flex items-center gap-1.5 rounded-lg bg-purple px-4 py-1.5 font-outfit text-sm font-semibold text-white transition-colors hover:bg-purple-deep disabled:opacity-40"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            Post
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Comment Item ──────────────────────────────────────────────────────────

function CommentItem({ comment, replies, currentUserId, postOwnerId, isReply, onReply, onEdit, onDelete }: {
  comment: Comment
  replies?: Comment[]
  currentUserId: string | null
  postOwnerId: string
  isReply?: boolean
  onReply: (parentId: string, content: string) => Promise<void>
  onEdit: (id: string, content: string) => void
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
              <p className="font-roboto text-xs text-text-dim leading-relaxed wrap-break-word">{comment.content}</p>
            )}
          </div>

          {/* Action row — always visible (touch-friendly) */}
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

          {/* Reply input */}
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
              <button onClick={sendReply} disabled={!replyText.trim() || sending} className="rounded-lg bg-purple px-3 py-1.5 text-white transition-colors hover:bg-purple-deep disabled:opacity-40">
                {sending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Replies (one level) */}
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

// ── Post Card ─────────────────────────────────────────────────────────────

function PostCard({ post, currentUserId, onDelete }: {
  post: FeedPost
  currentUserId: string | null
  onDelete: (id: string) => void
}) {
  const [liked,        setLiked]        = useState(post.isLiked)
  const [likeCount,    setLikeCount]    = useState(post._count.likes)
  const [showComments, setShowComments] = useState(false)
  const [comments,     setComments]     = useState<Comment[]>([])
  const [commentCount, setCommentCount] = useState(post._count.comments)
  const [newComment,   setNewComment]   = useState('')
  const [sending,      setSending]      = useState(false)
  const [loadingCmts,  setLoadingCmts]  = useState(false)

  const year = post.movie?.releaseDate?.slice(0, 4)

  const toggleLike = async () => {
    if (!currentUserId) return
    const next = !liked
    setLiked(next)
    setLikeCount(c => c + (next ? 1 : -1))
    try {
      if (next) await api.post(`/api/posts/${post.id}/like`)
      else       await api.delete(`/api/posts/${post.id}/like`)
    } catch {
      setLiked(!next)
      setLikeCount(c => c + (next ? -1 : 1))
    }
  }

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingCmts(true)
      try {
        const res = await api.get(`/api/posts/${post.id}/comments`)
        setComments(res.data.data)
      } finally {
        setLoadingCmts(false)
      }
    }
    setShowComments(v => !v)
  }

  const submitComment = async () => {
    if (!newComment.trim() || sending) return
    setSending(true)
    try {
      const res = await api.post(`/api/posts/${post.id}/comments`, { content: newComment.trim() })
      setComments(c => [...c, res.data.data])
      setCommentCount(c => c + 1)
      setNewComment('')
    } finally {
      setSending(false)
    }
  }

  const addReply = async (parentId: string, content: string) => {
    const res = await api.post(`/api/posts/${post.id}/comments`, { content, parentId })
    setComments(c => [...c, res.data.data])
    setCommentCount(c => c + 1)
  }

  const editComment = (id: string, content: string) => {
    setComments(cs => cs.map(c => (c.id === id ? { ...c, content } : c)))
    api.put(`/api/posts/comments/${id}`, { content }).catch(() => {})
  }

  const deleteComment = (id: string) => {
    const removed = comments.filter(c => c.id === id || c.parentId === id).length
    setComments(cs => cs.filter(c => c.id !== id && c.parentId !== id))
    setCommentCount(c => Math.max(0, c - removed))
    api.delete(`/api/posts/comments/${id}`).catch(() => {})
  }

  const handleDelete = async () => {
    await api.delete(`/api/posts/${post.id}`)
    onDelete(post.id)
  }

  const topLevel = comments.filter(c => !c.parentId)
  const repliesOf = (id: string) => comments.filter(c => c.parentId === id)

  return (
    <article className="rounded-xl border border-text/10 bg-surface p-4 flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar src={post.user.avatar} username={post.user.username} size={9} />
          <div>
            <div className="flex items-center gap-2">
              <Link href={`/profile/${post.user.username}`} className="font-roboto text-sm font-semibold text-white hover:text-purple-light transition-colors">
                {post.user.username}
              </Link>
              <FollowButton userId={post.user.id} size="xs" />
            </div>
            <p className="font-roboto text-[11px] text-text-muted">{timeAgo(post.createdAt)}</p>
          </div>
        </div>
        {currentUserId === post.user.id && (
          <button onClick={handleDelete} className="text-text-muted hover:text-red-400 transition-colors p-1">
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Content */}
      {post.content && <p className="font-roboto text-sm leading-relaxed text-text whitespace-pre-wrap">{post.content}</p>}

      {/* Image attachment */}
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
              <Image
                src={`https://image.tmdb.org/t/p/w92${post.movie.posterPath}`}
                alt={post.movie.title || 'Movie poster'}
                fill className="object-cover" sizes="32px"
              />
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
        <button
          onClick={toggleComments}
          className="flex items-center gap-1.5 font-roboto text-sm text-text-muted hover:text-text transition-colors"
        >
          {showComments ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          <MessageCircle size={15} />
          {commentCount}
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="flex flex-col gap-3 pt-1">
          {loadingCmts ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex gap-2.5">
                  <div className="h-7 w-7 shrink-0 rounded-full bg-surface-2 animate-pulse" />
                  <div className="flex-1 h-12 rounded-lg bg-surface-2 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            topLevel.map(c => (
              <CommentItem
                key={c.id}
                comment={c}
                replies={repliesOf(c.id)}
                currentUserId={currentUserId}
                postOwnerId={post.user.id}
                onReply={addReply}
                onEdit={editComment}
                onDelete={deleteComment}
              />
            ))
          )}

          {currentUserId && (
            <div className="flex gap-2 mt-1">
              <div className="h-7 w-7 shrink-0" />
              <div className="flex flex-1 gap-2">
                <input
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitComment()}
                  placeholder="Write a comment..."
                  className="flex-1 rounded-lg bg-surface-2 px-3 py-1.5 font-roboto text-xs text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-purple/50"
                />
                <button
                  onClick={submitComment}
                  disabled={!newComment.trim() || sending}
                  className="rounded-lg bg-purple px-3 py-1.5 text-white transition-colors hover:bg-purple-deep disabled:opacity-40"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const user                    = useAuthStore(s => s.user)
  const [posts, setPosts]       = useState<FeedPost[]>([])
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(1)
  const [hasMore, setHasMore]   = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchPosts = async (p: number, append = false) => {
    if (p === 1) setLoading(true)
    else setLoadingMore(true)
    try {
      const res = await api.get('/api/posts', { params: { page: p, limit: 10 } })
      const { posts: newPosts, totalPages } = res.data.data
      setPosts(prev => append ? [...prev, ...newPosts] : newPosts)
      setHasMore(p < totalPages)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => { fetchPosts(1) }, [])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchPosts(next, true)
  }

  return (
    <main className="px-6 md:px-12 xl:px-60 py-10">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        <h1 className="font-outfit text-2xl font-bold text-text">Community</h1>

        {user && <WritePost onPost={p => setPosts(prev => [p, ...prev])} />}

        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-text/10 bg-surface p-4 flex flex-col gap-3 animate-pulse">
                <div className="flex gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-surface-2" />
                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="h-3 w-24 rounded bg-surface-2" />
                    <div className="h-2.5 w-14 rounded bg-surface-2" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-3 w-full rounded bg-surface-2" />
                  <div className="h-3 w-4/5 rounded bg-surface-2" />
                  <div className="h-3 w-3/5 rounded bg-surface-2" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="font-roboto text-text-muted">No posts yet. Be the first to share something!</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={user?.id ?? null}
                  onDelete={id => setPosts(prev => prev.filter(p => p.id !== id))}
                />
              ))}
            </div>

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="mx-auto flex items-center gap-2 rounded-full border border-text/15 px-6 py-2 font-roboto text-sm text-text-muted hover:text-text hover:border-text/30 transition-colors disabled:opacity-40"
              >
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            )}
          </>
        )}
      </div>
    </main>
  )
}
