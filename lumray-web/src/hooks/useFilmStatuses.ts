import { useEffect } from 'react'
import { useAuthStore } from '@/store/auth.store'
import { useFilmStatusStore } from '@/store/filmStatus.store'

/**
 * Batch-hydrates film statuses (watched / watchlisted / favourite / rating) for a
 * list of DB movie ids so poster grids can show the correct filled-icon state.
 * No-op for guests; only fetches ids not already cached in the store.
 */
export function useHydrateFilmStatuses(ids: (string | null | undefined)[]) {
  const user     = useAuthStore(s => s.user)
  const loadMany = useFilmStatusStore(s => s.loadMany)

  const key = ids.filter(Boolean).join(',')

  useEffect(() => {
    if (!user) return
    const clean = ids.filter((x): x is string => !!x)
    if (clean.length) loadMany(clean)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, user, loadMany])
}
