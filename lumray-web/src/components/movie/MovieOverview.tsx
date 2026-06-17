'use client'

import { useEffect, useState } from 'react'
import api from '@/services/api'
import { useLanguageStore } from '@/store/language.store'

interface MovieOverviewProps {
  tmdbId: number
  overview: string
}

export default function MovieOverview({ tmdbId, overview }: MovieOverviewProps) {
  const lang = useLanguageStore(s => s.lang)
  const [text, setText] = useState(overview)

  useEffect(() => {
    if (lang === 'en') {
      setText(overview)
      return
    }
    let cancelled = false
    api.get(`/api/movies/${tmdbId}/translation`, { params: { lang } })
      .then(res => {
        if (!cancelled) {
          const translated = res.data.data?.overview
          setText(translated && translated.trim() ? translated : overview)
        }
      })
      .catch(() => { if (!cancelled) setText(overview) })
    return () => { cancelled = true }
  }, [lang, tmdbId, overview])

  if (!text) return null
  return (
    <p className="font-roboto text-base leading-relaxed text-text-dim max-w-3xl">
      {text}
    </p>
  )
}
