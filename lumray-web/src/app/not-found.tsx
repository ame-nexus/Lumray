'use client'

import Link from 'next/link'
import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'

export default function NotFound() {
  const lang = useLanguageStore(s => s.lang)
  const t    = useT(lang)

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-outfit text-8xl font-bold text-purple">404</p>

      <div className="space-y-2">
        <h1 className="font-outfit text-2xl font-bold text-text">{t.notFound.pageTitle}</h1>
        <p className="font-roboto text-sm text-text-muted">{t.notFound.pageDesc}</p>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/home"
          className="rounded-lg bg-purple px-5 py-2.5 font-roboto text-sm font-medium text-white transition-colors hover:bg-purple-deep"
        >
          {t.notFound.goHome}
        </Link>
        <Link
          href="/films"
          className="rounded-lg border border-white/15 px-5 py-2.5 font-roboto text-sm font-medium text-text transition-colors hover:bg-white/5"
        >
          {t.notFound.browseFilms}
        </Link>
      </div>
    </div>
  )
}
