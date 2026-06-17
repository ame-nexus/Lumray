'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Plus, Check, Lock, Globe } from 'lucide-react'
import api from '@/services/api'
import { useAuthStore } from '@/store/auth.store'
import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'

interface List {
  id: string
  name: string
  isPublic: boolean
  _count: { items: number }
}

interface AddToListsModalProps {
  movieId: string
  onClose: () => void
}

export default function AddToListsModal({ movieId, onClose }: AddToListsModalProps) {
  const user = useAuthStore(s => s.user)
  const lang = useLanguageStore(s => s.lang)
  const t    = useT(lang)
  const [lists,     setLists]     = useState<List[]>([])
  const [added,     setAdded]     = useState<Set<string>>(new Set())
  const [loading,   setLoading]   = useState(true)
  const [newName,   setNewName]   = useState('')
  const [isPublic,  setIsPublic]  = useState(true)
  const [creating,  setCreating]  = useState(false)
  const [mounted,   setMounted]   = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!user) return
    api.get(`/api/lists?userId=${user.id}&includePrivate=true`)
      .then(res => setLists(res.data.data ?? []))
      .finally(() => setLoading(false))
  }, [user])

  function dispatchListSaved() {
    window.dispatchEvent(new CustomEvent('lumray:list-saved', { detail: { movieId } }))
  }

  async function toggleList(listId: string) {
    if (added.has(listId)) {
      await api.delete(`/api/lists/${listId}/items/${movieId}`)
      setAdded(prev => { const s = new Set(prev); s.delete(listId); return s })
      dispatchListSaved()
    } else {
      await api.post(`/api/lists/${listId}/items`, { movieId })
      setAdded(prev => new Set(prev).add(listId))
      dispatchListSaved()
    }
  }

  async function createAndAdd() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const res = await api.post('/api/lists', { name: newName.trim(), isPublic })
      const list: List = { ...res.data.data, _count: { items: 0 } }
      setLists(prev => [list, ...prev])
      await api.post(`/api/lists/${list.id}/items`, { movieId })
      setAdded(prev => new Set(prev).add(list.id))
      dispatchListSaved()
      setNewName('')
    } finally {
      setCreating(false)
    }
  }

  if (!mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-surface-2 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="font-outfit text-base font-bold text-white">{t.list.title}</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-text-muted hover:bg-white/10 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-2 max-h-72 overflow-y-auto">
          {loading ? (
            <p className="py-4 text-center font-roboto text-sm text-text-muted">{t.list.loading}</p>
          ) : lists.length === 0 ? (
            <p className="py-4 text-center font-roboto text-sm text-text-muted">{t.list.noLists}</p>
          ) : (
            lists.map(list => (
              <button
                key={list.id}
                type="button"
                onClick={() => toggleList(list.id)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-surface"
              >
                <div className="flex items-center gap-2 text-left">
                  {list.isPublic
                    ? <Globe size={13} className="shrink-0 text-text-muted" />
                    : <Lock  size={13} className="shrink-0 text-text-muted" />
                  }
                  <div>
                    <p className="font-roboto text-sm font-medium text-text">{list.name}</p>
                    <p className="font-roboto text-xs text-text-muted">{list._count.items} {t.list.films}</p>
                  </div>
                </div>
                {added.has(list.id) && <Check size={16} className="text-purple-light" />}
              </button>
            ))
          )}
        </div>

        <div className="border-t border-white/10 px-5 py-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createAndAdd()}
              placeholder={t.list.placeholder}
              className="flex-1 rounded-lg border border-white/10 bg-surface px-3 py-2 font-roboto text-sm text-text placeholder-text-muted outline-none focus:border-purple-light"
            />
            <button
              type="button"
              onClick={createAndAdd}
              disabled={creating || !newName.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple text-white hover:bg-purple-deep disabled:opacity-40"
            >
              <Plus size={16} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsPublic(v => !v)}
            className="flex items-center gap-2 font-roboto text-xs text-text-muted hover:text-text"
          >
            {isPublic
              ? <><Globe size={13} /> {t.list.public}</>
              : <><Lock  size={13} /> {t.list.private}</>
            }
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
