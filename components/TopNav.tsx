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

  // ✅ Mostrar/ocultar barra según cursor
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

  // ✅ Enlaces del menú (colores oscuros porque la barra es blanca)
  const navLinkClass = 'relative inline-flex items-center px-3 py-2 text-[#141310]/75 hover:text-[#ad742a] transition-colors'

  // ✅ Icono hamburguesa (oscuro)
  const menuBtnClass = 'text-[#141310]/80 hover:text-[#141310]'

  // ✅ Panel móvil
  const panelBg = 'bg-white border-black/10'

  const panelLinkClass = 'block w-full text-left px-6 py-4 text-[#141310]/80 hover:bg-[#d7bd77]/10 hover:text-[#ad742a] transition-colors text-sm uppercase tracking-[0.18em] border-b border-black/5'

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          navVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{
          background: '#FFFFFF',
        }}
      >
        <div className="mx-auto flex max-w-[1380px] items-center justify-between px-4 py-3 lg:px-10 lg:py-4">
          {/* ✅ LOGO + NOMBRE */}
          <Link href="/" className="ml-2 lg:-ml-28 flex items-center gap-3 flex-shrink-0">
            <img 
              src="/logo.png" 
              alt="Renovactiva" 
              className="h-10 w-auto lg:h-14" 
            />
            <span className="font-serif text-sm uppercase tracking-[0.18em] text-[#ad742a] sm:text-base lg:text-xl lg:tracking-[0.28em] whitespace-nowrap">
              RENOVACTIVA<span className="text-[#042133]"> SL</span>
            </span>
          </Link>

          {/* ✅ MENÚ ESCRITORIO */}
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
            <LanguageSwitcher variant="light" />
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
          <div
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
            onClick={() => setMenuOpen(false)}
          />

          <div
            className={`fixed top-0 right-0 z-[101] h-full w-[280px] ${panelBg} border-l shadow-2xl lg:hidden flex flex-col animate-in slide-in-from-right duration-300`}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/10">
              <span className="font-serif text-lg tracking-[0.2em] text-[#ad742a]">
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