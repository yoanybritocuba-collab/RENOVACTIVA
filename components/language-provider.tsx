'use client'

import { createContext, useContext, useState, useEffect } from 'react'

type Language = 'es' | 'ca'

const LanguageContext = createContext<{ 
  language: Language
  setLanguage: (language: Language) => void 
}>({ 
  language: 'es', 
  setLanguage: () => {} 
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es')

  // Cargar el idioma guardado al iniciar
  useEffect(() => {
    const saved = localStorage.getItem('language') as Language
    if (saved === 'es' || saved === 'ca') {
      setLanguageState(saved)
    }
  }, [])

  // Función que guarda el idioma en localStorage
  function setLanguage(lang: Language) {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() { 
  return useContext(LanguageContext) 
}