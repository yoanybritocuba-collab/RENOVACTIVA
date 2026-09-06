'use client'

import { useLanguage } from '@/components/language-provider'

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()
  return (
    <div className="flex items-center gap-1 border border-white/15 p-1 text-[10px] uppercase tracking-[0.16em]" aria-label="Selector d’idioma / Selector de idioma">
      <button type="button" onClick={() => setLanguage('es')} className={`px-2 py-1 transition-colors ${language === 'es' ? 'bg-[#d7bd77] text-[#141310]' : 'text-white/55 hover:text-white'}`}>ES</button>
      <button type="button" onClick={() => setLanguage('ca')} className={`px-2 py-1 transition-colors ${language === 'ca' ? 'bg-[#d7bd77] text-[#141310]' : 'text-white/55 hover:text-white'}`}>CA</button>
    </div>
  )
}
