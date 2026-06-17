'use client'

import { useEffect, useState } from 'react'
import api from '@/services/api'
import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'

export default function BiographySection({ tmdbId, biography }: { tmdbId: number; biography: string }) {
  const [expanded, setExpanded] = useState(false)
  const lang = useLanguageStore(s => s.lang)
  const t    = useT(lang)
  const [text, setText] = useState(biography)

  useEffect(() => {
    if (lang === 'en') {
      setText(biography)
      return
    }
    let cancelled = false
    api.get(`/api/persons/${tmdbId}/translation`, { params: { lang } })
      .then(res => {
        if (!cancelled) {
          const translated = res.data.data?.biography
          setText(translated && translated.trim() ? translated : biography)
        }
      })
      .catch(() => { if (!cancelled) setText(biography) })
    return () => { cancelled = true }
  }, [lang, tmdbId, biography])

  const isLong = text.length > 500

  return (
    <section>
      <h2 className="mb-3 font-outfit text-lg font-semibold text-text">{t.person.biography}</h2>
      <div className="relative max-w-3xl">
        <p className={`font-roboto text-sm leading-relaxed text-text-dim ${!expanded && isLong ? 'line-clamp-4' : ''}`}>
          {text}
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="mt-2 font-roboto text-sm text-purple-light hover:underline"
          >
            {expanded ? t.person.showLess : t.person.readMore}
          </button>
        )}
      </div>
    </section>
  )
}
