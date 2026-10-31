'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Language, Translations } from './i18n/index'
import { en, ar } from './i18n/index'

interface LanguageContextValue {
  lang: Language
  t: Translations
  setLang: (l: Language) => void
  toggleLang: () => void
  isRTL: boolean
  dir: 'rtl' | 'ltr'
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  t: en,
  setLang: () => {},
  toggleLang: () => {},
  isRTL: false,
  dir: 'ltr',
})

const STORAGE_KEY = 'classio_lang'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en')

  // Initialize from localStorage if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null
      if (saved === 'en' || saved === 'ar') {
        setLangState(saved)
        document.documentElement.lang = saved
        document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr'
      } else {
        document.documentElement.lang = 'en'
        document.documentElement.dir = 'ltr'
      }
    } catch {
      // ignore
    }
  }, [])

  const setLang = useCallback((l: Language) => {
    setLangState(l)
    try {
      localStorage.setItem(STORAGE_KEY, l)
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = l
      document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr'
    }
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'ar' : 'en')
  }, [lang, setLang])

  const t = lang === 'en' ? en : ar
  const isRTL = lang === 'ar'
  const dir = isRTL ? 'rtl' : 'ltr'

  return (
    <LanguageContext.Provider value={{ lang, t, setLang, toggleLang, isRTL, dir }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
