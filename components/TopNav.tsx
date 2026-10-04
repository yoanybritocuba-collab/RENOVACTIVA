'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useLanguage } from '@/components/language-provider'

type TopNavProps = {
  variant?: 'light' | 'dark'
  onOpenContactModal?: () => void
}

export function TopNav({ variant = 'dark', onOpenContactModal }: TopNavProps) {
  const { language } = useLanguage()
  const ca = language === 'ca'
  const router = useRouter()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string>('')

  const light = variant === 'light'
  const isHome = pathname === '/'

  const headerClass = light
    ? 'absolute inset-x-0 top-0 z-30 border-b border-black/10 bg-white shadow-sm'
    : 'absolute inset-x-0 top-0 z-30 border-b border-white/10 bg-black/40 backdrop-blur-md'

  const navLinkClass = light
    ? 'relative inline-flex items-center px-3 py-2 text-[#141310]/75 hover:text-[#d7bd77] transition-colors'
    : 'relative inline-flex items-center px-3 py-2 text-white/75 hover:text-[#d7bd77] transition-colors'

  const menuBtnClass = light
    ? 'text-[#141310]/80 hover:text-[#141310]'
    : 'text-white/80 hover:text-white'

  const mobileMenuBg = light
    ? 'border-t border-black/10 bg-white'
    : 'border-t border-white/10 bg-[#080808]/95 backdrop-blur-md'

  const mobileMenuLinkClass = light
    ? 'block w-full text-left px-4 py-3 text-[#141310]/80 hover:bg-[#d7bd77]/10 hover:text-[#d7bd77] transition-colors rounded-lg'
    : 'block w-full text-left px-4 py-3 text-white/80 hover:bg-[#d7bd77]/10 hover:text-[#d7bd77] transition-colors rounded-lg'

  // ✅ SALTO DIRECTO + EFECTO FADE IN
  function goToSection(id: string) {
    setMenuOpen(false)
    setActiveSection(id)

    if (isHome) {
      const el = document.getElementById(id)
      if (el) {
        // Salto instantáneo (sin scroll largo)
        const headerHeight = 80
        const top = el.getBoundingClientRect().top + window.scrollY - headerHeight
        window.scrollTo({ top, behavior: 'instant' as ScrollBehavior })

        // 🔥 EFECTO: fade in + slide up + escala
        el.style.opacity = '0'
        el.style.transform = 'translateY(30px) scale(0.98)'
        el.style.transition = 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)'

        // Forzar reflow para que el navegador reconozca el estado inicial
        void el.offsetHeight

        // Animar hacia el estado final
        requestAnimationFrame(() => {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0) scale(1)'
        })

        // Limpiar estilos después de la animación
        setTimeout(() => {
          el.style.opacity = ''
          el.style.transform = ''
          el.style.transition = ''
        }, 900)
      }
    } else {
      router.push(`/#${id}`)
    }
  }

  function goToContact() {
    setMenuOpen(false)
    setActiveSection('')
    router.push('/contacto')
  }

  function handleContactModal() {
    setMenuOpen(false)
    if (onOpenContactModal) {
      onOpenContactModal()
    } else {
      router.push('/contacto')
    }
  }

  return (
    <header className={headerClass}>
      <div className="mx-auto flex max-w-[1380px] items-center justify-between px-4 py-4 lg:px-10 lg:py-5">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/logo.png" alt="Renovactiva" className="h-10 w-auto lg:h-14" />
          <span className="font-serif text-sm uppercase tracking-[0.18em] text-[#d7bd77] sm:text-base lg:text-xl lg:tracking-[0.28em] whitespace-nowrap">
            RENOVACTIVA<span className="text-[#042133]"> SL</span>
          </span>
        </Link>

        {/* Menú escritorio */}
        <nav className="hidden lg:flex items-center gap-2 xl:gap-4 text-[11px] uppercase tracking-[0.2em]">
          <button type="button" onClick={() => goToSection('servicios')} className={navLinkClass}>
            {ca ? 'SERVEIS' : 'SERVICIOS'}
            {activeSection === 'servicios' && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#d7bd77] rounded-full animate-pulse" />
            )}
          </button>
          <button type="button" onClick={() => goToSection('metodo')} className={navLinkClass}>
            {ca ? 'EL NOSTRE MÈTODE' : 'NUESTRO MÉTODO'}
            {activeSection === 'metodo' && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#d7bd77] rounded-full animate-pulse" />
            )}
          </button>
          <button type="button" onClick={() => goToSection('proyectos')} className={navLinkClass}>
            {ca ? 'PROJECTES' : 'PROYECTOS'}
            {activeSection === 'proyectos' && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#d7bd77] rounded-full animate-pulse" />
            )}
          </button>
          <button type="button" onClick={goToContact} className={navLinkClass}>
            {ca ? 'CONTACTE' : 'CONTACTO'}
          </button>
          <button
            type="button"
            onClick={handleContactModal}
            className="ml-2 inline-flex items-center gap-2 rounded-lg bg-[#d7bd77] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:bg-[#042133] hover:scale-105 cursor-pointer"
          >
            {ca ? 'SOL·LICITAR PRESSUPOST' : 'SOLICITAR PRESUPUESTO'}
          </button>
        </nav>

        <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
          <LanguageSwitcher variant={light ? 'light' : 'dark'} />
          <button
            aria-label="Abrir menú"
            onClick={() => setMenuOpen(!menuOpen)}
            className={`lg:hidden p-2 ${menuBtnClass}`}
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {menuOpen && (
        <div className={`${mobileMenuBg} px-4 py-4 lg:hidden`}>
          <nav className="flex flex-col gap-1 text-sm uppercase tracking-[0.18em]">
            <button type="button" onClick={() => goToSection('servicios')} className={mobileMenuLinkClass}>
              {ca ? 'SERVEIS' : 'SERVICIOS'}
            </button>
            <button type="button" onClick={() => goToSection('metodo')} className={mobileMenuLinkClass}>
              {ca ? 'EL NOSTRE MÈTODE' : 'NUESTRO MÉTODO'}
            </button>
            <button type="button" onClick={() => goToSection('proyectos')} className={mobileMenuLinkClass}>
              {ca ? 'PROJECTES' : 'PROYECTOS'}
            </button>
            <button type="button" onClick={goToContact} className={mobileMenuLinkClass}>
              {ca ? 'CONTACTE' : 'CONTACTO'}
            </button>
            <button
              type="button"
              onClick={handleContactModal}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-[#d7bd77] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:bg-[#042133] cursor-pointer"
            >
              {ca ? 'SOL·LICITAR PRESSUPOST' : 'SOLICITAR PRESUPUESTO'}
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}