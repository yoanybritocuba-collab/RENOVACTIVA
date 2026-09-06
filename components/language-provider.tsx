'use client'

import { createContext, useContext, useState } from 'react'

type Language = 'es' | 'ca'
const LanguageContext = createContext<{ language: Language; setLanguage: (language: Language) => void }>({ language: 'es', setLanguage: () => {} })

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('es')
  return <LanguageContext.Provider value={{ language, setLanguage }}>{children}</LanguageContext.Provider>
}

export function useLanguage() { return useContext(LanguageContext) }
