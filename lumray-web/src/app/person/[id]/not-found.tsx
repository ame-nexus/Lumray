'use client'

import Link from 'next/link'
import { User } from 'lucide-react'
import { useLanguageStore } from '@/store/language.store'
import { useT } from '@/lib/i18n'

export default function PersonNotFound() {
  const lang = useLanguageStore(s => s.lang)
  const t    = useT(lang)

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface">
        <User size={36} className="text-text-muted" />
      </div>

      <div className="space-y-2">
        <h1 className="font-outfit text-2xl font-bold text-text">{t.notFound.personTitle}</h1>
        <p className="font-roboto text-sm text-text-muted">{t.notFound.personDesc}</p>
      </div>

      <Link
        href="/films"
        className="rounded-lg bg-purple px-5 py-2.5 font-roboto text-sm font-medium text-white transition-colors hover:bg-purple-deep"
      >
        {t.notFound.browseFilms}
      </Link>
    </div>
  )
}
