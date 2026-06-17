'use client'

import { useEffect } from 'react'
import { useLanguageStore } from '@/store/language.store'

export default function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useLanguageStore(s => s.lang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])

  return <>{children}</>
}
