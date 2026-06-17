import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Lang = 'en' | 'fr' | 'ar'

interface LanguageStore {
  lang: Lang
  setLang: (lang: Lang) => void
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      lang: 'en',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'lumray-lang' }
  )
)
