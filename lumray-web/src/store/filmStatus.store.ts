import { create } from 'zustand'
import api from '@/services/api'

export interface FilmStatus {
  watched:     boolean
  favourite:   boolean
  watchlisted: boolean
  rating:      number
}

interface FilmStatusStore {
  statuses:  Record<string, FilmStatus>
  loading:   Record<string, boolean>

  /** Read current status for a movie (undefined if never fetched) */
  get: (movieId: string) => FilmStatus | undefined

  /** Fetch from API and cache; no-op if already loaded */
  load: (movieId: string) => Promise<void>

  /** Batch-fetch statuses for many movies at once; skips already-loaded ids */
  loadMany: (movieIds: string[]) => Promise<void>

  /** Merge a partial update (optimistic or from API response) */
  set: (movieId: string, patch: Partial<FilmStatus>) => void
}

const DEFAULT: FilmStatus = { watched: false, favourite: false, watchlisted: false, rating: 0 }

export const useFilmStatusStore = create<FilmStatusStore>((setState, getState) => ({
  statuses: {},
  loading:  {},

  get: (movieId) => getState().statuses[movieId],

  load: async (movieId) => {
    const state = getState()
    if (state.statuses[movieId] || state.loading[movieId]) return
    setState(s => ({ loading: { ...s.loading, [movieId]: true } }))
    try {
      const res  = await api.get(`/api/film-status/${movieId}`)
      const data = res.data.data as FilmStatus
      setState(s => ({
        statuses: { ...s.statuses, [movieId]: { ...DEFAULT, ...data } },
        loading:  { ...s.loading,  [movieId]: false },
      }))
    } catch {
      setState(s => ({ loading: { ...s.loading, [movieId]: false } }))
    }
  },

  loadMany: async (movieIds) => {
    const state = getState()
    const missing = [...new Set(movieIds)].filter(id => id && !state.statuses[id] && !state.loading[id])
    if (missing.length === 0) return

    setState(s => {
      const loading = { ...s.loading }
      for (const id of missing) loading[id] = true
      return { loading }
    })

    try {
      const res  = await api.post('/api/film-status/batch', { movieIds: missing })
      const data = (res.data.data ?? {}) as Record<string, Partial<FilmStatus>>
      setState(s => {
        const statuses = { ...s.statuses }
        const loading  = { ...s.loading }
        for (const id of missing) {
          statuses[id] = { ...DEFAULT, ...(data[id] ?? {}), rating: data[id]?.rating ?? 0 }
          loading[id]  = false
        }
        return { statuses, loading }
      })
    } catch {
      setState(s => {
        const loading = { ...s.loading }
        for (const id of missing) loading[id] = false
        return { loading }
      })
    }
  },

  set: (movieId, patch) => {
    setState(s => ({
      statuses: {
        ...s.statuses,
        [movieId]: { ...(s.statuses[movieId] ?? DEFAULT), ...patch },
      },
    }))
  },
}))
