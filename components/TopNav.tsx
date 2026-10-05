'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
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
  const [navVisible, setNavVisible] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  const light = variant === 'light'
  const isHome = pathname === '/'

  // ✅ Detectar móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 1023px)').matches)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // ✅ Bloquear scroll cuando el panel móvil está abierto
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  // ✅ Mostrar/ocultar barra según cursor (solo en páginas que no son Home)
  // Zona ampliada a 250px
  useEffect(() => {
    if (isHome || isMobile) {
      setNavVisible(true)
      return
    }

    setNavVisible(false)

    function handleMouseMove(e: MouseEvent) {
      if (e.clientY <= 250) {
        setNavVisible(true)
      } else {
        setNavVisible(false)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [pathname, isHome, isMobile])

  // ✅ Navegación a páginas
  function goToServicios() {
    setMenuOpen(false)
    router.push('/servicios')
  }

  function goToMetodo() {
    setMenuOpen(false)
    router.push('/metodo')
  }

  function goToProyectos() {
    setMenuOpen(false)
    router.push('/proyectos')
  }

  function goToContact() {
    setMenuOpen(false)
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

  // ✅ CAMBIO: barra negra pura #000000
  const headerClass = light
    ? 'fixed inset-x-0 top-0 z-50 border-b border-black/10 bg-white shadow-sm'
    : 'fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#000000] backdrop-blur-md'

  const navLinkClass = light
    ? 'relative inline-flex items-center px-3 py-2 text-[#141310]/75 hover:text-[#d7bd77] transition-colors'
    : 'relative inline-flex items-center px-3 py-2 text-white/75 hover:text-[#d7bd77] transition-colors'

  const menuBtnClass = light
    ? 'text-[#141310]/80 hover:text-[#141310]'
    : 'text-white/80 hover:text-white'

  // ✅ Panel lateral móvil en negro puro
  const panelBg = light
    ? 'bg-white border-black/10'
    : 'bg-[#000000] border-white/10'

  const panelLinkClass = light
    ? 'block w-full text-left px-6 py-4 text-[#141310]/80 hover:bg-[#d7bd77]/10 hover:text-[#d7bd77] transition-colors text-sm uppercase tracking-[0.18em] border-b border-black/5'
    : 'block w-full text-left px-6 py-4 text-white/80 hover:bg-[#d7bd77]/10 hover:text-[#d7bd77] transition-colors text-sm uppercase tracking-[0.18em] border-b border-white/5'

  return (
    <>
      <header
        className={`${headerClass} transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          navVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="mx-auto flex max-w-[1380px] items-center justify-between px-4 py-4 lg:px-10 lg:py-5">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="Renovactiva" className="h-10 w-auto lg:h-14" />
            <span className="font-serif text-sm uppercase tracking-[0.18em] text-[#d7bd77] sm:text-base lg:text-xl lg:tracking-[0.28em] whitespace-nowrap">
              RENOVACTIVA<span className="text-[#042133]"> SL</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-2 xl:gap-4 text-[11px] uppercase tracking-[0.2em]">
            <button type="button" onClick={goToServicios} className={navLinkClass}>
              {ca ? 'SERVEIS' : 'SERVICIOS'}
            </button>
            <button type="button" onClick={goToMetodo} className={navLinkClass}>
              {ca ? 'EL NOSTRE MÈTODE' : 'NUESTRO MÉTODO'}
            </button>
            <button type="button" onClick={goToProyectos} className={navLinkClass}>
              {ca ? 'PROJECTES' : 'PROYECTOS'}
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
              onClick={() => setMenuOpen(true)}
              className={`lg:hidden p-2 ${menuBtnClass}`}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* ✅ PANEL LATERAL MÓVIL */}
      {menuOpen && (
        <>
          {/* Overlay oscuro */}
          <div
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
            onClick={() => setMenuOpen(false)}
          />

          {/* Panel deslizante desde la derecha */}
          <div
            className={`fixed top-0 right-0 z-[101] h-full w-[280px] ${panelBg} border-l shadow-2xl lg:hidden flex flex-col animate-in slide-in-from-right duration-300`}
          >
            {/* Header del panel */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <span className="font-serif text-lg tracking-[0.2em] text-[#d7bd77]">
                MENÚ
              </span>
              <button
                aria-label="Cerrar menú"
                onClick={() => setMenuOpen(false)}
                className={`p-2 ${menuBtnClass}`}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Enlaces del panel */}
            <nav className="flex-1 overflow-y-auto">
              <button type="button" onClick={goToServicios} className={panelLinkClass}>
                {ca ? 'SERVEIS' : 'SERVICIOS'}
              </button>
              <button type="button" onClick={goToMetodo} className={panelLinkClass}>
                {ca ? 'EL NOSTRE MÈTODE' : 'NUESTRO MÉTODO'}
              </button>
              <button type="button" onClick={goToProyectos} className={panelLinkClass}>
                {ca ? 'PROJECTES' : 'PROYECTOS'}
              </button>
              <button type="button" onClick={goToContact} className={panelLinkClass}>
                {ca ? 'CONTACTE' : 'CONTACTO'}
              </button>

              {/* Botón destacado de solicitar presupuesto */}
              <div className="p-6">
                <button
                  type="button"
                  onClick={handleContactModal}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#d7bd77] px-4 py-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:bg-[#042133] cursor-pointer"
                >
                  {ca ? 'SOL·LICITAR PRESSUPOST' : 'SOLICITAR PRESUPUESTO'}
                </button>
              </div>
            </nav>
          </div>
        </>
      )}
    </>
  )
}