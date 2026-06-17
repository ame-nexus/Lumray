'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Send, Plus, X, MessageSquare, ArrowLeft, Loader2, Paperclip, Film, Search,
  Check, CheckCheck, AlertCircle, RotateCw, ChevronDown,
} from 'lucide-react'
import api from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket'

// ── Types ──────────────────────────────────────────────────────────────────

type OtherUser = { id: string; username: string; avatar: string | null }

type Conversation = {
  id: string
  other: OtherUser | null
  lastMessage: { content: string; createdAt: string; senderId: string; read: boolean; attachmentUrl?: string | null } | null
  unreadCount: number
  updatedAt: string
}

type SendStatus = 'sending' | 'sent' | 'failed'

type Message = {
  id: string
  conversationId: string
  senderId: string
  content: string
  read: boolean
  attachmentUrl:   string | null
  attachmentType:  string | null
  movieTmdbId:     number | null
  movieTitle:      string | null
  moviePosterPath: string | null
  createdAt: string
  sender: OtherUser
  status?: SendStatus
}

type PendingAttachment = { url: string; type: string; localPreview?: string }
type PendingMovie      = { tmdbId: number; title: string; posterPath: string | null }

const GROUP_WINDOW_MS = 5 * 60 * 1000

// ── Helpers ────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return `${Math.floor(days / 7)}w`
}

function clockTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function dayLabel(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()
  if (sameDay(d, today)) return 'Today'
  if (sameDay(d, yesterday)) return 'Yesterday'
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    ...(d.getFullYear() !== today.getFullYear() ? { year: 'numeric' } : {}),
  })
}

function Avatar({ src, username, size = 10, online }: { src: string | null; username: string; size?: number; online?: boolean }) {
  const px = size * 4
  return (
    <div className="relative shrink-0">
      <div
        className="relative overflow-hidden rounded-full bg-purple flex items-center justify-center"
        style={{ width: px, height: px }}
      >
        {src
          ? <Image src={src} alt={username} fill className="object-cover" sizes={`${px}px`} />
          : <span className="font-roboto font-bold text-white" style={{ fontSize: px * 0.35 }}>{username[0]?.toUpperCase()}</span>
        }
      </div>
      {online && (
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-bg-dark" />
      )}
    </div>
  )
}

// ── Movie Picker Modal ─────────────────────────────────────────────────────

function MoviePickerModal({ onClose, onSelect }: {
  onClose: () => void
  onSelect: (movie: PendingMovie) => void
}) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<PendingMovie[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  // Live, debounced search — shows the top matches as you type (no Enter / button needed)
  useEffect(() => {
    const q = query.trim()
    let cancelled = false
    const timer = setTimeout(async () => {
      if (q.length < 2) { setResults([]); setLoading(false); return }
      setLoading(true)
      try {
        const res = await api.get('/api/movies/search', { params: { q } })
        if (cancelled) return
        const raw = res.data.data ?? []
        setResults(raw.slice(0, 8).map((m: { tmdbId?: number; id?: number; title: string; posterPath: string | null }) => ({
          tmdbId:     m.tmdbId ?? m.id,
          title:      m.title,
          posterPath: m.posterPath,
        })))
      } catch {
        if (!cancelled) setResults([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }, 250)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [query])

  const showEmpty = query.trim().length >= 2 && !loading && results.length === 0

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-2xl bg-surface border border-text/10 p-5 flex flex-col gap-4 max-h-[80dvh] shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-outfit text-base font-semibold text-text">Reference a film</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors"><X size={16} /></button>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search films..."
            className="w-full rounded-lg bg-bg pl-9 pr-9 py-2 font-roboto text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-purple/50"
          />
          {loading && <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-text-muted" />}
        </div>

        {results.length > 0 && (
          <div className="overflow-y-auto flex flex-col gap-1 -mx-1 px-1">
            {results.map(m => (
              <button
                key={m.tmdbId}
                onClick={() => { onSelect(m); onClose() }}
                className="flex items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-bg transition-colors"
              >
                <div className="relative h-12 w-8 shrink-0 rounded overflow-hidden bg-surface-2">
                  {m.posterPath && (
                    <Image src={`https://image.tmdb.org/t/p/w92${m.posterPath}`} alt={m.title} fill className="object-cover" sizes="32px" />
                  )}
                </div>
                <span className="font-roboto text-sm text-text line-clamp-2">{m.title}</span>
              </button>
            ))}
          </div>
        )}

        {showEmpty && (
          <p className="font-roboto text-sm text-text-muted text-center py-4">No films found.</p>
        )}
      </div>
    </div>
  )
}

// ── New Conversation Modal ─────────────────────────────────────────────────

function NewConversationModal({ onClose, onStart }: {
  onClose: () => void
  onStart: (convId: string, other: OtherUser) => void
}) {
  const [query,    setQuery]    = useState('')
  const [result,   setResult]   = useState<OtherUser | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [starting, setStarting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await api.get(`/api/users/${query.trim().toLowerCase()}`)
      const u = res.data.data
      setResult({ id: u.id, username: u.username, avatar: u.avatar })
    } catch {
      setError('User not found')
    } finally {
      setLoading(false)
    }
  }

  const start = async () => {
    if (!result) return
    setStarting(true)
    try {
      const res = await api.post('/api/messages/conversations', { targetUserId: result.id })
      onStart(res.data.data.id, result)
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-2xl bg-surface border border-text/10 p-5 flex flex-col gap-4 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-outfit text-lg font-semibold text-text">New Message</h3>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors"><X size={18} /></button>
        </div>

        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Search by username..."
            className="flex-1 rounded-lg bg-bg px-3 py-2 font-roboto text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-purple/50"
          />
          <button
            onClick={search}
            disabled={!query.trim() || loading}
            className="rounded-lg bg-purple px-3 py-2 text-white disabled:opacity-40 hover:bg-purple-deep transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Find'}
          </button>
        </div>

        {error && <p className="font-roboto text-sm text-red-400">{error}</p>}

        {result && (
          <div className="flex items-center justify-between rounded-xl bg-bg px-4 py-3">
            <div className="flex items-center gap-3">
              <Avatar src={result.avatar} username={result.username} size={9} />
              <span className="font-roboto text-sm font-semibold text-text">{result.username}</span>
            </div>
            <button
              onClick={start}
              disabled={starting}
              className="flex items-center gap-1.5 rounded-lg bg-purple px-3 py-1.5 font-roboto text-sm font-semibold text-white hover:bg-purple-deep disabled:opacity-40 transition-colors"
            >
              {starting ? <Loader2 size={12} className="animate-spin" /> : <MessageSquare size={12} />}
              Message
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Conversation List Item ─────────────────────────────────────────────────

function ConversationItem({ convo, active, onClick, currentUserId, isOnline }: {
  convo: Conversation
  active: boolean
  onClick: () => void
  currentUserId: string
  isOnline: boolean
}) {
  const other = convo.other
  if (!other) return null
  const isOwn = convo.lastMessage?.senderId === currentUserId
  const lastText = convo.lastMessage?.attachmentUrl && !convo.lastMessage?.content
    ? '📎 Photo'
    : convo.lastMessage?.content
  const unread = convo.unreadCount > 0

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 ${active ? 'bg-purple/15 border-l-2 border-purple' : 'border-l-2 border-transparent'}`}
    >
      <Avatar src={other.avatar} username={other.username} size={11} online={isOnline} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className={`font-roboto text-sm truncate ${unread ? 'font-bold text-text' : 'font-semibold text-text'}`}>{other.username}</span>
          {convo.lastMessage && (
            <span className={`font-roboto text-[11px] shrink-0 ${unread ? 'text-purple-light font-semibold' : 'text-text-muted'}`}>
              {timeAgo(convo.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          {lastText ? (
            <p className={`font-roboto text-xs truncate ${unread ? 'text-text font-medium' : 'text-text-muted'}`}>
              {isOwn ? 'You: ' : ''}{lastText}
            </p>
          ) : (
            <p className="font-roboto text-xs text-text-muted italic">No messages yet</p>
          )}
          {unread && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-purple px-1.5 font-roboto text-[10px] font-bold text-white shrink-0">
              {convo.unreadCount > 99 ? '99+' : convo.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

// ── Read Receipt ───────────────────────────────────────────────────────────

function ReadReceipt({ status, read }: { status?: SendStatus; read: boolean }) {
  if (status === 'sending') return <Loader2 size={12} className="animate-spin text-white/60" />
  if (status === 'failed')  return <AlertCircle size={12} className="text-red-300" />
  if (read)                 return <CheckCheck size={13} className="text-sky-300" />
  return <Check size={13} className="text-white/60" />
}

// ── Message Bubble ─────────────────────────────────────────────────────────

function MessageBubble({ msg, isOwn, showAvatar, isFirstInGroup, isLastInGroup, other, onRetry }: {
  msg: Message
  isOwn: boolean
  showAvatar: boolean
  isFirstInGroup: boolean
  isLastInGroup: boolean
  other: OtherUser
  onRetry: (msg: Message) => void
}) {
  const hasContent    = msg.content?.trim()
  const hasAttachment = msg.attachmentUrl
  const hasMovie      = msg.movieTmdbId && msg.movieTitle
  const failed        = msg.status === 'failed'

  // Bubble corner rounding for stacked grouping
  const ownCorners = isFirstInGroup && isLastInGroup
    ? 'rounded-2xl rounded-br-md'
    : isFirstInGroup ? 'rounded-2xl rounded-br-md'
    : isLastInGroup  ? 'rounded-2xl rounded-tr-md rounded-br-md'
    : 'rounded-l-2xl rounded-r-md'
  const otherCorners = isFirstInGroup && isLastInGroup
    ? 'rounded-2xl rounded-bl-md'
    : isFirstInGroup ? 'rounded-2xl rounded-bl-md'
    : isLastInGroup  ? 'rounded-2xl rounded-tl-md rounded-bl-md'
    : 'rounded-r-2xl rounded-l-md'

  return (
    <div className={`group/msg flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${isLastInGroup ? 'mb-2' : 'mb-0.5'}`}>
      {!isOwn && (
        <div className="w-7 h-7 shrink-0">
          {showAvatar && <Avatar src={other.avatar} username={other.username} size={7} />}
        </div>
      )}

      <div className={`max-w-[75%] flex flex-col gap-1.5 ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Movie reference card */}
        {hasMovie && (
          <Link
            href={`/films/${msg.movieTmdbId}`}
            className={`flex items-center gap-2.5 rounded-xl border border-text/10 bg-surface-2 px-3 py-2 hover:border-purple/40 transition-colors ${isOwn ? 'flex-row-reverse' : ''}`}
          >
            <div className="relative h-14 w-9 shrink-0 rounded overflow-hidden bg-surface">
              {msg.moviePosterPath && (
                <Image src={`https://image.tmdb.org/t/p/w92${msg.moviePosterPath}`} alt={msg.movieTitle!} fill className="object-cover" sizes="36px" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-roboto text-[10px] uppercase tracking-wide text-purple-light">Film</span>
              <span className="font-roboto text-xs font-semibold text-text line-clamp-2">{msg.movieTitle}</span>
            </div>
          </Link>
        )}

        {/* Attachment */}
        {hasAttachment && msg.attachmentType === 'image' && (
          <a href={msg.attachmentUrl!} target="_blank" rel="noreferrer" className="block rounded-xl overflow-hidden max-w-60 border border-text/10">
            <Image src={msg.attachmentUrl!} alt="attachment" width={240} height={160} className="object-cover w-full" unoptimized />
          </a>
        )}

        {/* Text bubble + receipt */}
        {hasContent && (
          <div className={`flex items-end gap-1.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            <div
              className={`px-3.5 py-2 font-roboto text-sm leading-relaxed wrap-break-word ${
                isOwn
                  ? `${failed ? 'bg-red-500/80' : 'bg-purple'} text-white ${ownCorners}`
                  : `bg-surface-2 text-text ${otherCorners}`
              }`}
            >
              {msg.content}
            </div>
          </div>
        )}

        {/* Meta row: shown once per group on the last message */}
        {isLastInGroup && (
          <div className={`flex items-center gap-1 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="font-roboto text-[10px] text-text-muted">{clockTime(msg.createdAt)}</span>
            {isOwn && !failed && (
              <span className="flex items-center"><ReadReceipt status={msg.status} read={msg.read} /></span>
            )}
            {failed && (
              <button
                onClick={() => onRetry(msg)}
                className="flex items-center gap-1 font-roboto text-[10px] text-red-400 hover:text-red-300 transition-colors"
              >
                <RotateCw size={10} /> Retry
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Chat Window ────────────────────────────────────────────────────────────

function ChatWindow({ convoId, other, currentUserId, isOnline }: {
  convoId: string
  other: OtherUser
  currentUserId: string
  isOnline: boolean
}) {
  const [messages,          setMessages]          = useState<Message[]>([])
  const [loading,           setLoading]           = useState(true)
  const [content,           setContent]           = useState('')
  const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null)
  const [pendingMovie,      setPendingMovie]      = useState<PendingMovie | null>(null)
  const [uploading,         setUploading]         = useState(false)
  const [showMoviePicker,   setShowMoviePicker]   = useState(false)
  const [typingVisible,     setTypingVisible]     = useState(false)
  const [atBottom,          setAtBottom]          = useState(true)

  const bottomRef   = useRef<HTMLDivElement>(null)
  const scrollRef   = useRef<HTMLDivElement>(null)
  const fileRef     = useRef<HTMLInputElement>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const seenIds     = useRef<Set<string>>(new Set())

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    bottomRef.current?.scrollIntoView({ behavior })
  }

  const isNearBottom = () => {
    const el = scrollRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120
  }

  // Reconcile an authoritative message from the server (own echo) with the optimistic temp
  const reconcileOwn = useCallback((real: Message) => {
    if (seenIds.current.has(real.id)) return
    seenIds.current.add(real.id)
    setMessages(prev => {
      const idx = prev.findIndex(m => m.status === 'sending' || m.status === 'failed')
      if (idx !== -1) {
        const copy = [...prev]
        copy[idx] = { ...real, status: 'sent' }
        return copy
      }
      return [...prev, { ...real, status: 'sent' }]
    })
  }, [])

  // Load history once (component remounts per conversation via `key`)
  useEffect(() => {
    let cancelled = false
    api.get(`/api/messages/conversations/${convoId}`)
      .then(res => {
        if (cancelled) return
        const msgs: Message[] = res.data.data
        msgs.forEach(m => seenIds.current.add(m.id))
        setMessages(msgs)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
        requestAnimationFrame(() => scrollToBottom('auto'))
      })
    getSocket().emit('mark_read', { conversationId: convoId })
    return () => { cancelled = true }
  }, [convoId])

  // Subscribe to all real-time events for this conversation (setState lives in callbacks)
  useEffect(() => {
    const socket = getSocket()
    socket.emit('join_conversation', convoId)

    const onNew = (msg: Message) => {
      if (msg.conversationId !== convoId) return
      if (msg.senderId === currentUserId) { reconcileOwn(msg); return }
      if (seenIds.current.has(msg.id)) return
      seenIds.current.add(msg.id)
      const wasNear = isNearBottom()
      setMessages(prev => [...prev, msg])
      setTypingVisible(false)
      socket.emit('mark_read', { conversationId: convoId })
      if (wasNear) requestAnimationFrame(() => scrollToBottom('smooth'))
    }
    const onRead = ({ conversationId }: { conversationId: string; readerId: string }) => {
      if (conversationId !== convoId) return
      setMessages(prev => prev.map(m => (m.senderId === currentUserId && !m.read ? { ...m, read: true } : m)))
    }
    const onTypingStart = ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      if (conversationId === convoId && userId !== currentUserId) setTypingVisible(true)
    }
    const onTypingStop = ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      if (conversationId === convoId && userId !== currentUserId) setTypingVisible(false)
    }

    socket.on('new_message',   onNew)
    socket.on('messages_read', onRead)
    socket.on('typing_start',  onTypingStart)
    socket.on('typing_stop',   onTypingStop)
    return () => {
      socket.off('new_message',   onNew)
      socket.off('messages_read', onRead)
      socket.off('typing_start',  onTypingStart)
      socket.off('typing_stop',   onTypingStop)
    }
  }, [convoId, currentUserId, reconcileOwn])

  // Keep view pinned to the latest message while the user is at the bottom
  useEffect(() => {
    if (!loading && atBottom) scrollToBottom('smooth')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, typingVisible])

  const emitTyping = () => {
    const socket = getSocket()
    socket.emit('typing_start', { conversationId: convoId })
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      socket.emit('typing_stop', { conversationId: convoId })
    }, 2000)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const localPreview = URL.createObjectURL(file)
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await api.post('/api/messages/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setPendingAttachment({ url: res.data.data.url, type: res.data.data.type, localPreview })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const deliver = async (temp: Message, body: Record<string, unknown>) => {
    try {
      const res = await api.post(`/api/messages/conversations/${convoId}`, body)
      reconcileOwn(res.data.data)
    } catch {
      setMessages(prev => prev.map(m => (m.id === temp.id ? { ...m, status: 'failed' } : m)))
    }
  }

  const send = async () => {
    const text = content.trim()
    if ((!text && !pendingAttachment && !pendingMovie) || uploading) return

    if (typingTimer.current) {
      clearTimeout(typingTimer.current)
      getSocket().emit('typing_stop', { conversationId: convoId })
    }

    const tempId = `temp-${Date.now()}`
    const temp: Message = {
      id: tempId,
      conversationId: convoId,
      senderId: currentUserId,
      content: text,
      read: false,
      attachmentUrl:   pendingAttachment?.url ?? null,
      attachmentType:  pendingAttachment?.type ?? null,
      movieTmdbId:     pendingMovie?.tmdbId ?? null,
      movieTitle:      pendingMovie?.title ?? null,
      moviePosterPath: pendingMovie?.posterPath ?? null,
      createdAt: new Date().toISOString(),
      sender: { id: currentUserId, username: '', avatar: null },
      status: 'sending',
    }

    const body: Record<string, unknown> = { content: text }
    if (pendingAttachment) { body.attachmentUrl = pendingAttachment.url; body.attachmentType = pendingAttachment.type }
    if (pendingMovie)      { body.movieTmdbId = pendingMovie.tmdbId; body.movieTitle = pendingMovie.title; body.moviePosterPath = pendingMovie.posterPath }

    setMessages(prev => [...prev, temp])
    setContent('')
    setPendingAttachment(null)
    setPendingMovie(null)
    setAtBottom(true)
    requestAnimationFrame(() => scrollToBottom('smooth'))

    deliver(temp, body)
  }

  const retry = (failed: Message) => {
    setMessages(prev => prev.map(m => (m.id === failed.id ? { ...m, status: 'sending' } : m)))
    const body: Record<string, unknown> = { content: failed.content }
    if (failed.attachmentUrl) { body.attachmentUrl = failed.attachmentUrl; body.attachmentType = failed.attachmentType }
    if (failed.movieTmdbId)   { body.movieTmdbId = failed.movieTmdbId; body.movieTitle = failed.movieTitle; body.moviePosterPath = failed.moviePosterPath }
    deliver(failed, body)
  }

  const onScroll = () => setAtBottom(isNearBottom())

  const canSend = (content.trim() || pendingAttachment || pendingMovie) && !uploading

  return (
    <>
      {showMoviePicker && (
        <MoviePickerModal onClose={() => setShowMoviePicker(false)} onSelect={setPendingMovie} />
      )}

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-text/10 shrink-0 bg-bg-dark/40">
          <Link href={`/profile/${other.username}`} className="flex items-center gap-3 group">
            <Avatar src={other.avatar} username={other.username} size={9} online={isOnline} />
            <div>
              <span className="font-roboto font-semibold text-text group-hover:text-purple-light transition-colors">{other.username}</span>
              {isOnline
                ? <p className="font-roboto text-[11px] text-green-400">Active now</p>
                : <p className="font-roboto text-[11px] text-text-muted">Offline</p>
              }
            </div>
          </Link>
        </div>

        {/* Messages */}
        <div ref={scrollRef} onScroll={onScroll} className="relative flex-1 overflow-y-auto px-5 py-4 flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={24} className="animate-spin text-text-muted" />
            </div>
          ) : messages.length === 0 && !typingVisible ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center">
              <Avatar src={other.avatar} username={other.username} size={16} />
              <div>
                <p className="font-outfit text-base font-semibold text-text">{other.username}</p>
                <p className="font-roboto text-sm text-text-muted mt-0.5">Say hello and start the conversation 👋</p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const prev = messages[i - 1]
              const next = messages[i + 1]
              const isOwn = msg.senderId === currentUserId
              const newDay = !prev || new Date(prev.createdAt).toDateString() !== new Date(msg.createdAt).toDateString()
              const gapPrev = prev ? new Date(msg.createdAt).getTime() - new Date(prev.createdAt).getTime() : Infinity
              const gapNext = next ? new Date(next.createdAt).getTime() - new Date(msg.createdAt).getTime() : Infinity
              const isFirstInGroup = newDay || !prev || prev.senderId !== msg.senderId || gapPrev > GROUP_WINDOW_MS
              const sameNext = next && next.senderId === msg.senderId && gapNext <= GROUP_WINDOW_MS &&
                new Date(next.createdAt).toDateString() === new Date(msg.createdAt).toDateString()
              const isLastInGroup = !sameNext
              const showAvatar = !isOwn && isLastInGroup

              return (
                <div key={msg.id}>
                  {newDay && (
                    <div className="flex items-center justify-center my-3">
                      <span className="rounded-full bg-surface-2 px-3 py-1 font-roboto text-[11px] font-medium text-text-muted">
                        {dayLabel(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    msg={msg}
                    isOwn={isOwn}
                    showAvatar={!!showAvatar}
                    isFirstInGroup={isFirstInGroup}
                    isLastInGroup={isLastInGroup}
                    other={other}
                    onRetry={retry}
                  />
                </div>
              )
            })
          )}

          {/* Typing indicator */}
          {typingVisible && (
            <div className="flex items-end gap-2 mt-1">
              <div className="w-7 h-7 shrink-0"><Avatar src={other.avatar} username={other.username} size={7} /></div>
              <div className="rounded-2xl rounded-bl-md bg-surface-2 px-3.5 py-2.5 flex gap-1 items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Jump to bottom */}
        {!atBottom && !loading && (
          <div className="relative">
            <button
              onClick={() => { setAtBottom(true); scrollToBottom('smooth') }}
              className="absolute -top-14 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-surface border border-text/15 text-text shadow-lg hover:bg-surface-2 transition-colors"
              aria-label="Jump to latest"
            >
              <ChevronDown size={18} />
            </button>
          </div>
        )}

        {/* Pending previews */}
        {(pendingAttachment || pendingMovie) && (
          <div className="flex items-center gap-2 px-5 py-2 border-t border-text/10 flex-wrap">
            {pendingAttachment && (
              <div className="relative">
                {pendingAttachment.type === 'image' && pendingAttachment.localPreview && (
                  <Image src={pendingAttachment.localPreview} alt="attachment preview" width={64} height={64} className="h-16 w-16 object-cover rounded-lg" unoptimized />
                )}
                <button
                  onClick={() => setPendingAttachment(null)}
                  className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white"
                >
                  <X size={8} />
                </button>
              </div>
            )}

            {pendingMovie && (
              <div className="relative flex items-center gap-2 rounded-xl border border-purple/40 bg-surface-2 px-3 py-1.5">
                {pendingMovie.posterPath && (
                  <div className="relative h-8 w-6 shrink-0 rounded overflow-hidden">
                    <Image src={`https://image.tmdb.org/t/p/w92${pendingMovie.posterPath}`} alt={pendingMovie.title} fill className="object-cover" sizes="24px" />
                  </div>
                )}
                <span className="font-roboto text-xs text-text line-clamp-1 max-w-35">{pendingMovie.title}</span>
                <button onClick={() => setPendingMovie(null)} className="text-text-muted hover:text-text transition-colors ml-1"><X size={12} /></button>
              </div>
            )}
          </div>
        )}

        {/* Input */}
        <div className="shrink-0 flex items-end gap-2 px-4 py-3 border-t border-text/10">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            title="Send image"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-surface-2 hover:text-text disabled:opacity-40 transition-colors"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
          </button>
          <button
            onClick={() => setShowMoviePicker(true)}
            title="Reference a film"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-text-muted hover:bg-surface-2 hover:text-text transition-colors"
          >
            <Film size={16} />
          </button>

          <input
            value={content}
            onChange={e => { setContent(e.target.value); emitTyping() }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder={`Message ${other.username}...`}
            className="flex-1 rounded-full bg-surface-2 px-4 py-2.5 font-roboto text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-purple/50"
          />
          <button
            onClick={send}
            disabled={!canSend}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple text-white hover:bg-purple-deep disabled:opacity-40 disabled:scale-95 transition-all"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </>
  )
}

// ── Empty State ────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface">
        <MessageSquare size={36} className="text-purple-light" />
      </div>
      <div>
        <p className="font-outfit text-lg font-semibold text-text mb-1">Your messages</p>
        <p className="font-roboto text-sm text-text-muted">Send private messages to other film lovers.</p>
      </div>
      <button
        onClick={onNew}
        className="flex items-center gap-2 rounded-full bg-purple px-5 py-2.5 font-roboto text-sm font-semibold text-white hover:bg-purple-deep transition-colors"
      >
        <Plus size={15} /> New Message
      </button>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const user   = useAuthStore(s => s.user)
  const router = useRouter()

  const [conversations,   setConversations]   = useState<Conversation[]>([])
  const [following,       setFollowing]       = useState<OtherUser[]>([])
  const [loadingConvos,   setLoadingConvos]   = useState(true)
  const [activeConvo,     setActiveConvo]     = useState<Conversation | null>(null)
  const [showNewModal,    setShowNewModal]    = useState(false)
  const [mobileShowChat,  setMobileShowChat]  = useState(false)
  const [startingFor,     setStartingFor]     = useState<string | null>(null)
  const [onlineUserIds,   setOnlineUserIds]   = useState<Set<string>>(new Set())
  const [search,          setSearch]          = useState('')

  const activeConvoIdRef = useRef<string | null>(null)
  useEffect(() => { activeConvoIdRef.current = activeConvo?.id ?? null }, [activeConvo])

  // Socket lifecycle
  useEffect(() => {
    if (!user) return
    const socket = connectSocket()

    const onOnlineList = (ids: string[]) => setOnlineUserIds(new Set(ids))
    const onOnline  = ({ userId }: { userId: string }) => setOnlineUserIds(prev => new Set([...prev, userId]))
    const onOffline = ({ userId }: { userId: string }) => setOnlineUserIds(prev => { const s = new Set(prev); s.delete(userId); return s })
    // Keep the sidebar (last message preview, unread badge, ordering) in sync.
    // ChatWindow has its own new_message listener for the open thread.
    const onMessage = (msg: Message) => {
      const isActive = activeConvoIdRef.current === msg.conversationId
      setConversations(prev => {
        const next = prev.map(c => {
          if (c.id !== msg.conversationId) return c
          const incUnread = msg.senderId !== user.id && !isActive
          return {
            ...c,
            lastMessage: { content: msg.content, createdAt: msg.createdAt, senderId: msg.senderId, read: false, attachmentUrl: msg.attachmentUrl },
            unreadCount: incUnread ? c.unreadCount + 1 : c.unreadCount,
            updatedAt: msg.createdAt,
          }
        })
        return [...next].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      })
    }

    socket.on('online_users', onOnlineList)
    socket.on('user_online',  onOnline)
    socket.on('user_offline', onOffline)
    socket.on('new_message',  onMessage)

    return () => {
      socket.off('online_users', onOnlineList)
      socket.off('user_online',  onOnline)
      socket.off('user_offline', onOffline)
      socket.off('new_message',  onMessage)
      disconnectSocket()
    }
  }, [user])

  // Load data
  useEffect(() => {
    if (!user) { router.push('/login'); return }
    Promise.allSettled([
      api.get('/api/messages/conversations'),
      api.get('/api/users/me/following'),
    ]).then(([convosRes, followingRes]) => {
      if (convosRes.status === 'fulfilled')    setConversations(convosRes.value.data.data)
      if (followingRes.status === 'fulfilled') setFollowing(followingRes.value.data.data)
      setLoadingConvos(false)
    })
  }, [user, router])

  const openContact = async (contact: OtherUser) => {
    const existing = conversations.find(c => c.other?.id === contact.id)
    if (existing) { selectConvo(existing); return }
    setStartingFor(contact.id)
    try {
      const res = await api.post('/api/messages/conversations', { targetUserId: contact.id })
      handleStart(res.data.data.id, contact)
    } finally {
      setStartingFor(null)
    }
  }

  const handleStart = (convId: string, other: OtherUser) => {
    setShowNewModal(false)
    const existing = conversations.find(c => c.id === convId)
    if (existing) { setActiveConvo(existing); setMobileShowChat(true); return }
    const newConvo: Conversation = { id: convId, other, lastMessage: null, unreadCount: 0, updatedAt: new Date().toISOString() }
    setConversations(prev => [newConvo, ...prev])
    setActiveConvo(newConvo)
    setMobileShowChat(true)
  }

  const selectConvo = (convo: Conversation) => {
    setActiveConvo(convo)
    setMobileShowChat(true)
    setConversations(prev => prev.map(c => c.id === convo.id ? { ...c, unreadCount: 0 } : c))
  }

  if (!user) return null

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)
  const q = search.trim().toLowerCase()
  const filteredConvos = q
    ? conversations.filter(c => c.other?.username.toLowerCase().includes(q))
    : conversations
  const filteredFollowing = q
    ? following.filter(f => f.username.toLowerCase().includes(q))
    : following

  return (
    <main className="h-[calc(100dvh-104px)] md:h-[calc(100dvh-84px)] flex overflow-hidden">

      {/* Sidebar */}
      <aside className={`flex flex-col border-r border-text/10 bg-bg-dark ${mobileShowChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 shrink-0`}>
        <div className="flex items-center justify-between px-5 pt-4 pb-3">
          <h2 className="font-outfit text-xl font-bold text-text flex items-center gap-2">
            Messages
            {totalUnread > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-purple px-1.5 font-roboto text-[11px] font-bold text-white">
                {totalUnread > 99 ? '99+' : totalUnread}
              </span>
            )}
          </h2>
          <button
            onClick={() => setShowNewModal(true)}
            title="New message"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-text hover:bg-purple hover:text-white transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full rounded-full bg-surface-2 pl-9 pr-3 py-2 font-roboto text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-purple/50"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingConvos ? (
            <div className="flex flex-col gap-0.5 p-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-3 animate-pulse">
                  <div className="h-11 w-11 rounded-full bg-surface shrink-0" />
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="h-3 w-28 rounded bg-surface" />
                    <div className="h-2.5 w-40 rounded bg-surface" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredConvos.length > 0 && (
                <div>
                  <p className="px-5 pt-2 pb-1 font-roboto text-[10px] font-semibold uppercase tracking-wider text-text-muted">Conversations</p>
                  {filteredConvos.map(c => (
                    <ConversationItem
                      key={c.id}
                      convo={c}
                      active={activeConvo?.id === c.id}
                      onClick={() => selectConvo(c)}
                      currentUserId={user.id}
                      isOnline={onlineUserIds.has(c.other?.id ?? '')}
                    />
                  ))}
                </div>
              )}

              {filteredFollowing.some(f => !conversations.some(c => c.other?.id === f.id)) && (
                <div>
                  <p className="px-5 pt-4 pb-1 font-roboto text-[10px] font-semibold uppercase tracking-wider text-text-muted">Following</p>
                  {filteredFollowing.map(contact => {
                    if (conversations.some(c => c.other?.id === contact.id)) return null
                    const isStarting = startingFor === contact.id
                    return (
                      <button
                        key={contact.id}
                        onClick={() => openContact(contact)}
                        disabled={isStarting}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5 transition-colors border-l-2 border-transparent disabled:opacity-50"
                      >
                        <Avatar src={contact.avatar} username={contact.username} size={9} online={onlineUserIds.has(contact.id)} />
                        <span className="font-roboto text-sm font-semibold text-text truncate flex-1">{contact.username}</span>
                        {isStarting
                          ? <Loader2 size={13} className="animate-spin text-text-muted shrink-0" />
                          : <span className="font-roboto text-[10px] text-text-muted shrink-0">Message</span>
                        }
                      </button>
                    )
                  })}
                </div>
              )}

              {q && filteredConvos.length === 0 && filteredFollowing.length === 0 && (
                <p className="font-roboto text-sm text-text-muted text-center py-10">No results for “{search}”.</p>
              )}

              {!q && conversations.length === 0 && following.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
                  <p className="font-roboto text-sm text-text-muted">No conversations yet.</p>
                  <button onClick={() => setShowNewModal(true)} className="font-roboto text-sm text-purple-light hover:underline">Start one</button>
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      {/* Chat panel */}
      <section className={`flex-1 ${mobileShowChat ? 'flex' : 'hidden md:flex'} flex-col bg-bg`}>
        {mobileShowChat && (
          <button
            onClick={() => setMobileShowChat(false)}
            className="md:hidden flex items-center gap-2 px-4 py-3 text-text-muted hover:text-text border-b border-text/10"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}

        {activeConvo?.other ? (
          <ChatWindow
            key={activeConvo.id}
            convoId={activeConvo.id}
            other={activeConvo.other}
            currentUserId={user.id}
            isOnline={onlineUserIds.has(activeConvo.other.id)}
          />
        ) : (
          <EmptyState onNew={() => setShowNewModal(true)} />
        )}
      </section>

      {showNewModal && (
        <NewConversationModal onClose={() => setShowNewModal(false)} onStart={handleStart} />
      )}
    </main>
  )
}
