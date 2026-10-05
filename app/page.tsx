'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, Play, X, Shield, ChevronLeft, ChevronRight, Camera, Star, Plus, Minus, Briefcase, Award, Users, Home as HomeIcon, KeyRound, TrendingUp, Heart, Target, Zap, Loader2, PartyPopper, Phone, Mail } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/components/language-provider'
import { TopNav } from '@/components/TopNav'
import { ContactModal } from '@/components/ContactModal'
import { WhatsAppModal } from '@/components/WhatsAppModal'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

const ICON_MAP: Record<string, any> = {
  briefcase: Briefcase,
  award: Award,
  users: Users,
  home: HomeIcon,
  trending: TrendingUp,
  star: Star,
  heart: Heart,
  target: Target,
  zap: Zap,
}

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [heroData, setHeroData] = useState<any>(null)
  const [servicesData, setServicesData] = useState<any[]>([])
  const [servicesSection, setServicesSection] = useState<any>(null)
  const [projectsData, setProjectsData] = useState<any[]>([])
  const [projectsSection, setProjectsSection] = useState<any>(null)
  const [contactData, setContactData] = useState<any>(null)
  const [footerData, setFooterData] = useState<any>(null)
  const [testimonialsData, setTestimonialsData] = useState<any>(null)
  const [statsData, setStatsData] = useState<any>(null)
  const [activeHero, setActiveHero] = useState(0)

  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false)

  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const [testimonialPage, setTestimonialPage] = useState(0)
  const [mobileTestimonialIndex, setMobileTestimonialIndex] = useState(0)

  const testimonialGridRef = useRef<HTMLDivElement>(null)
  const mobileCarouselRef = useRef<HTMLDivElement>(null)
  const wheelLockRef = useRef(false)
  const isHoveringRef = useRef(false)
  const touchStartRef = useRef<{ x: number; y: number; active: boolean } | null>(null)

  const [reviewCode, setReviewCode] = useState('')
  const [reviewMessage, setReviewMessage] = useState('')
  const [reviewError, setReviewError] = useState('')
  const [reviewVerified, setReviewVerified] = useState(false)
  const [reviewClientName, setReviewClientName] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [reviewRole, setReviewRole] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reviewSuccess, setReviewSuccess] = useState(false)

  const { language } = useLanguage()
  const ca = language === 'ca'

  // ✅ Salto directo + efecto fade in + slide up
  function scrollToSection(id: string) {
    if (typeof window === 'undefined') return
    const el = document.getElementById(id)
    if (el) {
      const headerHeight = 80
      const top = el.getBoundingClientRect().top + window.scrollY - headerHeight
      window.scrollTo({ top, behavior: 'instant' as ScrollBehavior })

      el.style.opacity = '0'
      el.style.transform = 'translateY(30px) scale(0.98)'
      el.style.transition = 'opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)'
      void el.offsetHeight
      requestAnimationFrame(() => {
        el.style.opacity = '1'
        el.style.transform = 'translateY(0) scale(1)'
      })
      setTimeout(() => {
        el.style.opacity = ''
        el.style.transform = ''
        el.style.transition = ''
      }, 900)
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?select=section,content`, {
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
          cache: 'no-store'
        })
        if (!res.ok) throw new Error('Error al cargar')
        const data = await res.json()

        const hero = data.find((d: any) => d.section === 'hero')
        const services = data.find((d: any) => d.section === 'services')
        const projects = data.find((d: any) => d.section === 'projects')
        const contact = data.find((d: any) => d.section === 'contact')
        const footer = data.find((d: any) => d.section === 'footer')
        const testimonials = data.find((d: any) => d.section === 'testimonials')
        const stats = data.find((d: any) => d.section === 'stats')

        if (hero) setHeroData(hero.content)
        if (services) { setServicesData(services.content?.items || []); setServicesSection(services.content) }
        if (projects) setProjectsSection(projects.content)
        if (contact) setContactData(contact.content)
        if (footer) setFooterData(footer.content)
        if (testimonials) setTestimonialsData(testimonials.content)
        if (stats) setStatsData(stats.content)

        try {
          const trabajosRes = await fetch(`${SUPABASE_URL}/rest/v1/trabajos?select=*&order=orden.asc`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
            cache: 'no-store'
          })
          if (trabajosRes.ok) {
            const trabajosData = await trabajosRes.json()
            setProjectsData(trabajosData.map((t: any) => ({
              title: t.titulo, type: t.tipo, image: t.imagenes?.[0] || '',
              images: t.imagenes || [], description: t.descripcion, categoria: t.categoria
            })))
          }
        } catch (err) { console.error('Error al cargar trabajos:', err) }
      } catch (err) { console.error('Error al cargar datos:', err) }
      finally { setLoading(false) }
    }
    loadData()
    const timer = setInterval(() => setActiveHero((v) => (v + 1) % 3), 6000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const totalItems = testimonialsData?.items?.length || 0
    if (totalItems === 0) return

    const onMouseMove = (e: MouseEvent) => {
      const grid = testimonialGridRef.current
      if (!grid) { isHoveringRef.current = false; return }
      const rect = grid.getBoundingClientRect()
      isHoveringRef.current = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
    }

    const onWheel = (e: WheelEvent) => {
      if (!isHoveringRef.current) return
      const totalPages = Math.max(1, Math.ceil(totalItems / 3))
      if (totalPages <= 1) return
      e.preventDefault(); e.stopPropagation()
      if (wheelLockRef.current) return
      if (Math.abs(e.deltaY) < 10) return
      wheelLockRef.current = true
      setTestimonialPage((prev) => { if (e.deltaY > 0) return (prev + 1) % totalPages; return (prev - 1 + totalPages) % totalPages })
      setTimeout(() => { wheelLockRef.current = false }, 450)
    }

    const onTouchStart = (e: TouchEvent) => {
      const carousel = mobileCarouselRef.current
      if (!carousel) return
      const rect = carousel.getBoundingClientRect()
      const touch = e.touches[0]
      const isInside = touch.clientX >= rect.left && touch.clientX <= rect.right && touch.clientY >= rect.top && touch.clientY <= rect.bottom
      if (isInside) { touchStartRef.current = { x: touch.clientX, y: touch.clientY, active: true } }
      else { touchStartRef.current = null }
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || !touchStartRef.current.active) { touchStartRef.current = null; return }
      const touch = e.changedTouches[0]
      const dx = touch.clientX - touchStartRef.current.x
      const dy = touch.clientY - touchStartRef.current.y
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx > 0) { setMobileTestimonialIndex((prev) => (prev - 1 + totalItems) % totalItems) }
        else { setMobileTestimonialIndex((prev) => (prev + 1) % totalItems) }
      }
      touchStartRef.current = null
    }

    document.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('wheel', onWheel, { passive: false })
    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('wheel', onWheel)
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [testimonialsData])

  // ============================================================
  // ⭐ EFECTO EN MÓVIL — MÉTODO
  // ============================================================
  useEffect(() => {
    if (typeof window === 'undefined') return

    const isMobile = window.matchMedia('(max-width: 1023px)').matches
    if (!isMobile) return

    const timeoutId = setTimeout(() => {
      const rows = document.querySelectorAll('.method-row')
      if (rows.length === 0) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-active')
            } else {
              entry.target.classList.remove('is-active')
            }
          })
        },
        {
          rootMargin: '-35% 0px -35% 0px',
          threshold: 0,
        }
      )

      rows.forEach((row) => observer.observe(row))
      ;(window as any).__methodObserver = observer
    }, 300)

    return () => {
      clearTimeout(timeoutId)
      const observer = (window as any).__methodObserver
      if (observer) {
        observer.disconnect()
        ;(window as any).__methodObserver = null
      }
    }
  }, [loading])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!selectedProject) return
      if (e.key === 'Escape') { setSelectedProject(null) }
      else if (e.key === 'ArrowLeft') { setCurrentPhotoIndex(prev => prev > 0 ? prev - 1 : (selectedProject.images?.length || 1) - 1) }
      else if (e.key === 'ArrowRight') { setCurrentPhotoIndex(prev => prev < (selectedProject.images?.length || 1) - 1 ? prev + 1 : 0) }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedProject])

  useEffect(() => {
    if (selectedProject) { document.body.style.overflow = 'hidden' }
    else { document.body.style.overflow = '' }
    return () => { document.body.style.overflow = '' }
  }, [selectedProject])

  if (loading) {
    return <div className="min-h-screen bg-[#080808] flex items-center justify-center text-white/50">Cargando...</div>
  }

  const heroImages = heroData?.images || ['', '', '']
  const heroTrans = heroData?.translations || {}
  const footerTrans = footerData?.translations || {}
  const servicesTrans = servicesSection?.translations || {}
  const testimonialsTrans = testimonialsData?.translations || {}
  const testimonialsItems = testimonialsData?.items || []

  const totalTestimonialPages = Math.max(1, Math.ceil(testimonialsItems.length / 3))
  const visibleTestimonials = testimonialsItems.slice(testimonialPage * 3, testimonialPage * 3 + 3)
  const currentMobileTestimonial = testimonialsItems[mobileTestimonialIndex] || null

  const titleText = ca ? (heroTrans.title || heroData?.title || 'Espais que trascendeixen.') : (heroData?.title || 'Espacios que trascienden.')
  const titleWords = titleText.split(' ')

  const nextPhoto = () => { if (!selectedProject) return; const total = selectedProject.images?.length || 1; setCurrentPhotoIndex(prev => prev < total - 1 ? prev + 1 : 0) }
  const prevPhoto = () => { if (!selectedProject) return; const total = selectedProject.images?.length || 1; setCurrentPhotoIndex(prev => prev > 0 ? prev - 1 : total - 1) }

  const statsItems = statsData?.items || []
  const dynamicStatsData = statsItems.length > 0
    ? statsItems.map((item: any) => ({
        icon: ICON_MAP[item.icon] || Star, number: item.number, suffix: item.suffix || '',
        labelEs: item.label?.es || '', labelCa: item.label?.ca || item.label?.es || '',
      }))
    : [
        { icon: Briefcase, number: 150, suffix: '+', labelEs: 'Proyectos realizados', labelCa: 'Projectes realitzats' },
        { icon: Award, number: 15, suffix: '', labelEs: 'Años de experiencia', labelCa: 'Anys d\'experiència' },
        { icon: Users, number: 98, suffix: '%', labelEs: 'Clientes satisfechos', labelCa: 'Clients satisfets' },
        { icon: HomeIcon, number: 250, suffix: 'K', labelEs: 'm² reformados', labelCa: 'm² reformats' },
      ]

  const faqs = [
    { qEs: '¿Cuánto tarda una reforma integral?', qCa: 'Quant triga una reforma integral?', aEs: 'Depende del tamaño y la complejidad, pero una reforma integral de un piso medio suele tardar entre 2 y 4 meses. En la primera visita te damos un plazo estimado.', aCa: 'Depèn de la mida i la complexitat, però una reforma integral d\'un pis mitjà sol trigar entre 2 i 4 mesos. A la primera visita et donem un termini estimat.' },
    { qEs: '¿Hacéis presupuestos gratis?', qCa: 'Feu pressupostos gratuïts?', aEs: 'Sí, todos nuestros presupuestos son completamente gratis y sin ningún tipo de compromiso. Nos desplazamos a tu vivienda para valorar el proyecto.', aCa: 'Sí, tots els nostres pressupostos són completament gratuïts i sense cap mena de compromís. Ens desplacem al teu habitatge per valorar el projecte.' },
    { qEs: '¿Trabajáis en toda Cataluña?', qCa: 'Treballeu a tot Catalunya?', aEs: 'Trabajamos principalmente en Barcelona y su área metropolitana, aunque también realizamos proyectos en otras zonas de Cataluña. Consúltanos tu caso.', aCa: 'Treballem principalment a Barcelona i la seva àrea metropolitana, tot i que també realitzem projectes en altres zones de Catalunya. Consulta\'ns el teu cas.' },
    { qEs: '¿Qué garantía ofrecéis?', qCa: 'Quina garantia oferiu?', aEs: 'Ofrecemos 2 años de garantía en todos nuestros trabajos, tal como exige la ley. Además, disponemos de seguro de responsabilidad civil que cubre cualquier imprevisto.', aCa: 'Oferim 2 anys de garantia en tots els nostres treballs, tal com exigeix la llei. A més, disposem d\'assegurança de responsabilitat civil que cobreix qualsevol imprevist.' },
    { qEs: '¿Puedo pedir solo una parte de la reforma?', qCa: 'Puc demanar només una part de la reforma?', aEs: 'Por supuesto. Nos adaptamos a lo que necesites: desde una reforma completa hasta una actualización parcial (cocina, baño, pintura, etc.).', aCa: 'Per descomptat. Ens adaptem al que necessitis: des d\'una reforma completa fins a una actualització parcial (cuina, bany, pintura, etc.).' },
  ]

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewCode.trim()) return
    setVerifying(true); setReviewError(''); setReviewMessage('')
    try {
      const res = await fetch('/api/reviews/verify-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: reviewCode })
      })
      const data = await res.json()
      if (!res.ok || !data.valid) { setReviewError(data.error || (ca ? 'Codi no vàlid' : 'Código no válido')); return }
      setReviewVerified(true)
      setReviewClientName(data.cliente_nombre || '')
      if (data.proyecto) setReviewRole(data.proyecto)
    } catch (err) { setReviewError(ca ? 'Error de connexió' : 'Error de conexión') }
    finally { setVerifying(false) }
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewText.trim()) { setReviewError(ca ? 'Escriu la teva ressenya' : 'Escribe tu reseña'); return }
    setSubmitting(true); setReviewError('')
    try {
      const res = await fetch('/api/reviews/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: reviewCode, rating: reviewRating, text: reviewText, role: reviewRole })
      })
      const data = await res.json()
      if (!res.ok) { setReviewError(data.error || (ca ? 'Error al enviar' : 'Error al enviar')); return }
      if (data.allItems && Array.isArray(data.allItems)) {
        setTestimonialsData((prev: any) => ({ ...(prev || {}), items: data.allItems }))
      }
      setReviewSuccess(true); setReviewVerified(false)
      try {
        const testRes = await fetch(`${SUPABASE_URL}/rest/v1/site_content?section=eq.testimonials&select=content`, {
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }, cache: 'no-store'
        })
        if (testRes.ok) {
          const testData = await testRes.json()
          if (testData[0]?.content) { setTestimonialsData(testData[0].content) }
        }
      } catch (e) { console.warn('Refresco secundario falló:', e) }
      setTimeout(() => {
        setReviewCode(''); setReviewText(''); setReviewRole(''); setReviewRating(5); setReviewClientName(''); setReviewSuccess(false)
      }, 6000)
    } catch (err) { setReviewError(ca ? 'Error de connexió' : 'Error de conexión') }
    finally { setSubmitting(false) }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#080808] text-[#f3f0e9]">
      {/* ✅ CAMBIO: variant="light" → variant="dark" para que la barra sea negra */}
      <TopNav variant="dark" onOpenContactModal={() => setContactModalOpen(true)} />

      {/* 1. HERO */}
      <section className="relative flex min-h-[600px] items-center lg:items-end lg:min-h-screen overflow-hidden pt-20 lg:pt-0">
        {heroImages.map((image: string, index: number) => (
          <div key={index} className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === activeHero ? 'opacity-100' : 'opacity-0'}`} style={{ backgroundImage: `url(${image})`, backgroundPosition: 'center', backgroundSize: 'cover' }} />
        ))}

        <motion.div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent md:from-black/40 md:via-black/15 md:to-transparent z-[11]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.3 }} />
        <motion.div className="absolute inset-0 bg-gradient-to-t from-[#080808]/35 via-transparent to-transparent md:from-[#080808]/50 md:via-transparent md:to-black/5 z-[12]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.3 }} />

        <div className="relative z-20 mx-auto w-full max-w-[1380px] px-6 pb-12 pt-24 lg:px-10 lg:pb-28 lg:pt-40">
          <div className="max-w-3xl">
            <motion.div className="mb-7 flex items-center gap-4" initial={{ opacity: 0, x: -600 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              <motion.span className="block h-px bg-[#10B77F]" initial={{ width: 0 }} animate={{ width: 40 }} transition={{ duration: 1.2, delay: 1.6, ease: [0.22, 1, 0.36, 1] }} />
              <p className="text-[11px] uppercase tracking-[0.42em] text-[#d7bd77] text-hero-eyebrow" style={{ textTransform: 'uppercase' }}>
                {ca ? (heroTrans.eyebrow || heroData?.eyebrow || 'Arquitectura · Interiorisme · Construcció') : (heroData?.eyebrow || 'Arquitectura · Interiorismo · Construcción')}
              </p>
            </motion.div>

            <h1 className="max-w-3xl font-serif text-3xl leading-[1.15] tracking-[-0.03em] sm:text-4xl md:text-5xl lg:text-[72px] text-hero-title pb-4" style={{ textTransform: 'uppercase' }}>
              {titleWords.map((word: string, index: number) => (
                <span key={index} className="inline-block align-bottom" style={{ marginRight: '0.25em' }}>
                  <motion.span className="inline-block" initial={{ y: '30%', opacity: 0 }} animate={{ y: '0%', opacity: 1 }} transition={{ duration: 1.1, delay: 1.4 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}>
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p className="mt-8 max-w-md text-base leading-relaxed text-[#d7bd77] text-hero-description" initial={{ opacity: 0, x: 600 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.6, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}>
              {ca ? (heroTrans.description || heroData?.description || "Reformes d'alt nivell per a habitatges, locals i oficines.") : (heroData?.description || 'Reformas de alto nivel para viviendas, locales y oficinas.')}
            </motion.p>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 3.2, ease: [0.22, 1, 0.36, 1] }}>
                <motion.button type="button" onClick={() => scrollToSection('contacto')} className="group relative inline-flex items-center gap-5 bg-[#d7bd77] px-6 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[#141310] overflow-hidden cursor-pointer" whileHover={{ scale: 1.03 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                  <span className="absolute inset-0 bg-[#10B77F] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                  <span className="relative z-10">
                    {ca ? (heroTrans.cta || heroData?.cta || 'Parlem del teu projecte') : (heroData?.cta || 'Hablemos de tu proyecto')}
                  </span>
                  <ArrowUpRight className="relative z-10 size-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </motion.button>
              </motion.div>

              <motion.button type="button" onClick={() => scrollToSection('proyectos')} className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-white/95 hover:text-[#10B77F] transition-colors text-hero-eyebrow cursor-pointer" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 3.5, ease: [0.22, 1, 0.36, 1] }}>
                <Play className="size-4 fill-current transition-transform duration-300 group-hover:scale-110" /> 
                {ca ? 'Veure projectes' : 'Ver proyectos'}
              </motion.button>
            </div>

            <motion.div className="mt-16 hidden lg:flex flex-col items-start gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 4.0 }}>
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/70 text-hero-eyebrow">
                {ca ? 'Descobreix' : 'Descubre'}
              </span>
              <div className="relative h-12 w-px bg-white/20 overflow-hidden">
                <motion.div className="absolute top-0 left-0 w-full h-1/2 bg-[#10B77F]" animate={{ y: ['-100%', '200%'] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. SERVICIOS */}
      <section id="servicios" className="relative border-y border-white/10 bg-[#0D0D0D] px-6 py-24 lg:px-10 lg:py-32">
        <div className="relative mx-auto max-w-[1380px]">
          <div className="mb-16 lg:mb-20">
            <motion.p className="eyebrow" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
              {ca ? (servicesTrans.eyebrow || servicesSection?.eyebrow || 'El que fem') : (servicesSection?.eyebrow || 'Lo que hacemos')}
            </motion.p>
            <motion.h2 className="mt-4 font-serif text-5xl leading-[0.95] tracking-[-0.03em] sm:text-6xl lg:text-7xl xl:text-8xl" initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
              {ca 
                ? <>{servicesTrans.title || servicesSection?.title || 'Una visió'}<br /><i className="text-[#10B77F]">{servicesTrans.titleItalic || servicesSection?.titleItalic || 'sense límits.'}</i></>
                : <>{servicesSection?.title || 'Una visión'}<br /><i className="text-[#10B77F]">{servicesSection?.titleItalic || 'sin límites.'}</i></>
              }
            </motion.h2>
          </div>

          <div className="space-y-0">
            {servicesData.slice(0, 4).map((service: any, index: number) => {
              const imageUrl = service.images?.[0] || service.image || ''
              const title = service.title?.[language] || ''
              const copy = service.copy?.[language] || ''
              return (
                <motion.div key={index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}>
                  <Link href={service.href || '#'} className="service-row group relative block border-t border-white/10 py-8 lg:py-12 transition-all duration-500 hover:border-[#10B77F] hover:shadow-[0_0_40px_-5px_rgba(16,183,127,0.4)]">
                    <div className="grid grid-cols-1 lg:grid-cols-[120px_1fr_1.4fr_200px] gap-4 lg:gap-8 items-center">
                      <div className="flex lg:justify-start">
                        <span className="service-number font-serif text-6xl lg:text-8xl leading-none text-[#10B77F] transition-all duration-500 group-hover:text-[#d7bd77] group-hover:scale-105 origin-left">{service.number}</span>
                      </div>
                      <div className="lg:pr-4">
                        <h3 className="service-title font-serif text-2xl lg:text-3xl leading-tight transition-colors duration-500 group-hover:text-[#d7bd77]">{title}</h3>
                      </div>
                      <div className="lg:pr-8">
                        <p className="text-sm leading-relaxed text-white/70 transition-colors duration-500 group-hover:text-white/95 max-w-md">{copy}</p>
                      </div>
                      <div className="hidden lg:block relative h-[180px] overflow-hidden rounded-lg">
                        <div className="absolute inset-0 bg-cover bg-center opacity-0 scale-110 transition-all duration-700 group-hover:opacity-100 group-hover:scale-100" style={{ backgroundImage: `url(${imageUrl})` }} />
                        <div className="absolute inset-0 border border-transparent rounded-lg transition-all duration-500 group-hover:border-[#10B77F]/60" />
                      </div>
                      <div className="lg:hidden relative h-[200px] overflow-hidden rounded-lg mt-4">
                        <div className="absolute inset-0 bg-cover bg-center opacity-90" style={{ backgroundImage: `url(${imageUrl})` }} />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D]/50 to-transparent" />
                        <div className="absolute inset-0 border border-[#10B77F]/40 rounded-lg" />
                      </div>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 hidden lg:flex items-center gap-2 text-[#10B77F] group-hover:text-[#d7bd77]">
                        <ArrowUpRight className="size-6 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 h-px w-0 bg-[#10B77F] transition-all duration-700 group-hover:w-full group-hover:bg-[#d7bd77]" />
                  </Link>
                </motion.div>
              )
            })}
          </div>

          <motion.div className="mt-12 text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <button type="button" onClick={() => scrollToSection('contacto')} className="inline-flex items-center gap-3 border-b-2 border-[#10B77F] pb-2 text-[11px] uppercase tracking-[0.24em] text-[#10B77F] transition-all duration-500 hover:border-[#d7bd77] hover:text-[#d7bd77] cursor-pointer">
              {ca ? 'Parlem del teu projecte' : 'Hablemos de tu proyecto'}
              <ArrowUpRight className="size-4" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* 3. MÉTODO */}
      <section id="metodo" className="relative mx-auto max-w-[1380px] px-6 py-24 lg:px-10 lg:py-36 bg-[#080808]">
        <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <motion.p className="eyebrow" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              {ca ? 'El nostre mètode' : 'Nuestro método'}
            </motion.p>
            <motion.h2 className="section-title" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
              {ca ? <>L'excel·lència<br /><i>és un procés.</i></> : <>La excelencia<br /><i>es un proceso.</i></>}
            </motion.h2>
          </div>

          <div className="method-list">
            {[
              { es: 'Escuchamos', ca: 'Escoltem', description: { es: 'Entendemos tu visión, tus necesidades y la forma en que quieres vivir.', ca: 'Entenem la teva visió, les teves necessitats.' } },
              { es: 'Diseñamos', ca: 'Dissenyem', description: { es: 'Convertimos las ideas en un proyecto claro, bello y posible.', ca: 'Convertim les idees en un projecte clar.' } },
              { es: 'Construimos', ca: 'Construïm', description: { es: 'Coordinamos cada gremio y cuidamos cada acabado.', ca: 'Coordinem cada ofici i cuidem cada acabat.' } },
              { es: 'Entregamos', ca: 'Lliurem', description: { es: 'Te entregamos un espacio listo para empezar una nueva etapa.', ca: 'Et lliurem un espai a punt.' } },
            ].map((step, index) => (
              <motion.div 
                key={index} 
                className="method-row group relative py-10 px-2 cursor-default"
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                viewport={{ once: true, amount: 0.4 }} 
                transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="method-divider" aria-hidden="true" />
                <span className="method-bg-number" aria-hidden="true">0{index + 1}</span>
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4 lg:gap-10 items-center">
                  <h3 className="method-title font-serif text-3xl lg:text-4xl text-white transition-colors duration-500 group-hover:text-[#d7bd77]">
                    {step[language] || ''}
                  </h3>
                  <div className="method-desc-wrap relative">
                    <span className="method-desc-bar" aria-hidden="true" />
                    <p className="method-desc text-sm lg:text-base leading-relaxed text-white/65">
                      {step.description[language] || ''}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PROYECTOS */}
      <section id="proyectos" className="relative mx-auto max-w-[1380px] px-6 py-24 lg:px-10 lg:py-36 bg-[#080808]">
        <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <motion.p className="eyebrow" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              {ca 
                ? (projectsSection?.translations?.sectionTitle?.eyebrow || projectsSection?.sectionTitle?.eyebrow || 'Una selecció')
                : (projectsSection?.sectionTitle?.eyebrow || 'Una selección')}
            </motion.p>
            <motion.h2 className="section-title" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
              {ca 
                ? <>{projectsSection?.translations?.sectionTitle?.title || projectsSection?.sectionTitle?.title || 'El resultat'}<br /><i>{projectsSection?.translations?.sectionTitle?.titleItalic || projectsSection?.sectionTitle?.titleItalic || 'parla per si sol.'}</i></>
                : <>{projectsSection?.sectionTitle?.title || 'El resultado'}<br /><i>{projectsSection?.sectionTitle?.titleItalic || 'habla por sí solo.'}</i></>
              }
            </motion.h2>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {(projectsData.length > 0 ? projectsData.slice(0, 4) : [
            { title: 'Casa Paseo del Prado', type: 'Vivienda integral', image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85', images: ['https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85'] },
            { title: 'Estudio Cobalto', type: 'Oficina corporativa', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=85', images: ['https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=85'] },
            { title: 'Atelier Chamberí', type: 'Local comercial', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=85', images: ['https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=85'] },
            { title: 'Finca Histórica Barcelona', type: 'Reforma de finca', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85', images: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85'] },
          ]).map((project: any, index: number) => {
            const isWide = index === 0 || index === 3
            const photoCount = project.images?.length || 1
            return (
              <motion.div key={index} onClick={() => { setSelectedProject(project); setCurrentPhotoIndex(0) }} className={`project-card group relative overflow-hidden rounded-lg min-h-[400px] border border-[#10B77F]/30 transition-all duration-500 hover:border-[#10B77F] hover:shadow-[0_0_60px_10px_rgba(16,183,127,0.55)] cursor-pointer ${isWide ? 'lg:col-span-2' : 'lg:col-span-1'}`} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}>
                <div className="project-image absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${project.image})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent md:from-black/70 md:via-black/20" />
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-[#10B77F]/50 rounded-full px-3 py-1.5 transition-all duration-500 group-hover:border-[#10B77F] group-hover:bg-[#10B77F]/20">
                  <Camera className="size-3 text-[#10B77F] transition-colors duration-500 group-hover:text-[#d7bd77]" />
                  <span className="text-[10px] font-medium text-[#10B77F] transition-colors duration-500 group-hover:text-[#d7bd77]">{photoCount}</span>
                </div>
                <div className="relative flex h-full min-h-[400px] flex-col justify-end p-7">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="block w-8 h-px bg-[#10B77F] transition-colors duration-500 group-hover:bg-[#d7bd77]" />
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#10B77F] font-medium transition-colors duration-500 group-hover:text-[#d7bd77]">{project.type}</p>
                  </div>
                  <h3 className="project-title font-serif text-3xl">{project.title}</h3>
                  <div className="mt-4 h-px w-0 bg-[#D7BD77] transition-all duration-700 group-hover:w-24" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* 5. NÚMEROS */}
      <section className="relative border-y border-white/10 bg-[#0D0D0D] px-6 py-20 lg:px-10 lg:py-28">
        <div className="relative mx-auto max-w-[1380px]">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {dynamicStatsData.map((stat: any, index: number) => {
              const IconComponent = stat.icon
              return (
                <motion.div key={index} className="stat-block group text-center cursor-default" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}>
                  <IconComponent className="stat-icon size-8 lg:size-10 mx-auto text-[#10B77F] mb-4" />
                  <div className="stat-number font-serif text-5xl lg:text-7xl leading-none text-[#10B77F]">
                    {stat.number}<span className="text-3xl lg:text-5xl">{stat.suffix}</span>
                  </div>
                  <p className="mt-3 text-[11px] lg:text-xs uppercase tracking-[0.2em] text-white/60 transition-colors duration-500 group-hover:text-white/90">
                    {ca ? stat.labelCa : stat.labelEs}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. TESTIMONIOS */}
      {testimonialsItems.length > 0 && (
        <section className="relative mx-auto max-w-[1380px] px-4 sm:px-6 py-16 sm:py-24 lg:px-10 lg:py-36 bg-[#080808]">
          <div className="mb-10 sm:mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <motion.p className="eyebrow" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
                {ca
                  ? (testimonialsTrans.eyebrow?.ca || testimonialsData?.eyebrow?.ca || 'El que diuen els nostres clients')
                  : (testimonialsData?.eyebrow?.es || 'Lo que dicen nuestros clientes')}
              </motion.p>
              <motion.h2 className="mt-3 sm:mt-4 font-serif text-3xl sm:text-5xl leading-[0.95] tracking-[-0.03em] lg:text-6xl" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
                {ca 
                  ? <>{testimonialsTrans.title?.ca || testimonialsData?.title?.ca || 'Opinions reals'}<br /><i>{testimonialsTrans.titleItalic?.ca || testimonialsData?.titleItalic?.ca || 'que parlen per nosaltres.'}</i></>
                  : <>{testimonialsData?.title?.es || 'Opiniones reales'}<br /><i>{testimonialsData?.titleItalic?.es || 'que hablan por nosotros.'}</i></>
                }
              </motion.h2>
            </div>
          </div>

          <div ref={testimonialGridRef} className="hidden lg:block">
            <AnimatePresence mode="wait">
              <motion.div key={testimonialPage} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="grid gap-6 lg:grid-cols-3">
                {visibleTestimonials.map((item: any, index: number) => (
                  <motion.div key={item.id || `${testimonialPage}-${index}`} className="testimonial-card group relative flex flex-col p-7 rounded-xl border border-[#10B77F]/30 bg-[#0A0A0A] transition-all duration-500 hover:border-[#10B77F] hover:shadow-[0_0_60px_10px_rgba(16,183,127,0.55)]" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}>
                    <div className="flex gap-1 mb-5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`size-4 transition-colors duration-500 ${star <= (item.rating || 5) ? 'text-[#d7bd77] fill-[#d7bd77]' : 'text-white/20'}`} />
                      ))}
                    </div>
                    <p className="testimonial-quote flex-1 text-sm lg:text-base leading-relaxed text-white/80 italic">"{item.text?.[language] || item.text?.es || ''}"</p>
                    <div className="mt-6 h-px w-12 bg-[#10B77F] transition-all duration-700 group-hover:w-20 group-hover:bg-[#d7bd77]" />
                    <div className="mt-5">
                      <p className="font-serif text-lg text-[#10B77F] transition-colors duration-500 group-hover:text-[#d7bd77]">{item.name}</p>
                      <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mt-1">{item.role?.[language] || item.role?.es || ''}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {totalTestimonialPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {Array.from({ length: totalTestimonialPages }).map((_, i) => (
                  <button key={i} onClick={() => setTestimonialPage(i)} aria-label={`Ir al grupo ${i + 1}`} className={`rounded-full transition-all duration-500 ${i === testimonialPage ? 'w-8 h-2 bg-[#10B77F]' : 'w-2 h-2 bg-white/30 hover:bg-[#d7bd77]/70'}`} />
                ))}
              </div>
            )}

            {totalTestimonialPages > 1 && (
              <p className="text-center mt-6 text-[10px] uppercase tracking-[0.2em] text-white/30">
                {ca ? 'Posa el cursor sobre les targetes i usa la roda del ratolí' : 'Pon el cursor sobre las tarjetas y usa la rueda del ratón'}
              </p>
            )}
          </div>

          <div ref={mobileCarouselRef} className="lg:hidden">
            <AnimatePresence mode="wait">
              {currentMobileTestimonial && (
                <motion.div key={`mobile-${mobileTestimonialIndex}`} initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -60 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="testimonial-card group relative flex flex-col p-5 rounded-xl border border-[#10B77F]/30 bg-[#0A0A0A] w-full">
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`size-3.5 transition-colors duration-500 ${star <= (currentMobileTestimonial.rating || 5) ? 'text-[#d7bd77] fill-[#d7bd77]' : 'text-white/20'}`} />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-white/80 italic">"{currentMobileTestimonial.text?.[language] || currentMobileTestimonial.text?.es || ''}"</p>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-serif text-base text-[#10B77F]">{currentMobileTestimonial.name}</p>
                      <p className="text-[9px] uppercase tracking-[0.2em] text-white/50 mt-1">{currentMobileTestimonial.role?.[language] || currentMobileTestimonial.role?.es || ''}</p>
                    </div>
                    <div className="h-px w-10 bg-[#10B77F] flex-shrink-0" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {testimonialsItems.length > 1 && (
              <p className="text-center mt-5 text-[9px] uppercase tracking-[0.2em] text-white/30">
                {ca ? 'Llisca amb el dit cap als costats' : 'Desliza con el dedo hacia los lados'}
              </p>
            )}
          </div>
        </section>
      )}

      {/* 7. DEJA TU RESEÑA */}
      <section className="relative border-y border-white/10 bg-[#0D0D0D] px-6 py-24 lg:px-10 lg:py-32">
        <div className="relative mx-auto max-w-[700px]">
          <div className="mb-12 text-center">
            <motion.p className="eyebrow" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              {ca ? 'La teva opinió' : 'Tu opinión'}
            </motion.p>
            <motion.h2 className="section-title" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
              {ca 
                ? <>{'Deixa la teva'}<br /><i className="text-[#10B77F]">{'ressenya.'}</i></>
                : <>{'Deja tu'}<br /><i className="text-[#10B77F]">{'reseña.'}</i></>
              }
            </motion.h2>
            <motion.p className="mt-6 text-sm text-white/60 max-w-md mx-auto" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8, delay: 0.2 }}>
              {ca ? 'Només per a clients que han treballat amb nosaltres.' : 'Solo para clientes que han trabajado con nosotros.'}
            </motion.p>
          </div>

          <motion.div className="relative p-8 lg:p-10 rounded-2xl border border-[#10B77F]/40 bg-[#0A0A0A] transition-all duration-500 hover:border-[#10B77F] hover:shadow-[0_0_60px_10px_rgba(16,183,127,0.35)]" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
            {reviewSuccess ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                <div className="flex justify-center mb-6">
                  <div className="flex items-center justify-center size-20 rounded-full bg-[#10B77F]/20 border-2 border-[#10B77F]">
                    <PartyPopper className="size-10 text-[#10B77F]" />
                  </div>
                </div>
                <h3 className="font-serif text-3xl text-[#d7bd77] mb-3">{ca ? 'Gràcies!' : '¡Gracias!'}</h3>
                <p className="text-white/80 text-base leading-relaxed max-w-md mx-auto">
                  {ca ? 'La teva ressenya s\'ha publicat correctament.' : 'Tu reseña se ha publicado correctamente.'}
                </p>
              </motion.div>
            ) : reviewVerified ? (
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div className="text-center pb-2">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#10B77F] font-bold mb-2">✓ {ca ? 'Codi verificat' : 'Código verificado'}</p>
                  <h3 className="font-serif text-2xl text-[#d7bd77]">{reviewClientName}</h3>
                </div>
                <div className="text-center">
                  <label className="block text-white/60 text-xs uppercase tracking-[0.2em] mb-3">{ca ? 'La teva valoració' : 'Tu valoración'}</label>
                  <div className="flex items-center justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setReviewRating(star)} className="transition-transform duration-200 hover:scale-125" aria-label={`${star}`}>
                        <Star className={`size-9 transition-colors duration-300 ${star <= reviewRating ? 'text-[#d7bd77] fill-[#d7bd77]' : 'text-white/20'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-white/60 text-xs uppercase tracking-[0.2em] mb-2">{ca ? 'La teva opinió' : 'Tu opinión'}</label>
                  <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={5} required maxLength={500} placeholder={ca ? 'Explica\'ns la teva experiència...' : 'Cuéntanos tu experiencia...'} className="w-full bg-[#080808] border border-[#10B77F]/40 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:border-[#10B77F] outline-none transition-all duration-500 resize-y" />
                  <p className="text-right text-[10px] text-white/30 mt-1">{reviewText.length} / 500</p>
                </div>
                <div>
                  <label className="block text-white/60 text-xs uppercase tracking-[0.2em] mb-2">{ca ? 'Tipus de projecte (opcional)' : 'Tipo de proyecto (opcional)'}</label>
                  <input type="text" value={reviewRole} onChange={(e) => setReviewRole(e.target.value)} maxLength={80} placeholder={ca ? 'Ex: Reforma integral pis Eixample' : 'Ej: Reforma integral piso Eixample'} className="w-full bg-[#080808] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:border-[#10B77F] outline-none transition-all duration-300" />
                </div>
                {reviewError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/50 bg-red-500/10">
                    <X className="size-4 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-300">{reviewError}</p>
                  </div>
                )}
                <button type="submit" disabled={submitting || !reviewText.trim()} className="group relative w-full inline-flex items-center justify-center gap-3 bg-[#d7bd77] px-6 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[#141310] overflow-hidden rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-opacity">
                  <span className="absolute inset-0 bg-[#10B77F] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                  <span className="relative z-10 flex items-center gap-2">
                    {submitting ? (<><Loader2 className="size-4 animate-spin" />{ca ? 'Enviant...' : 'Enviando...'}</>) : (<>{ca ? 'Publicar ressenya' : 'Publicar reseña'}<ArrowUpRight className="size-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" /></>)}
                  </span>
                </button>
                <button type="button" onClick={() => { setReviewVerified(false); setReviewCode(''); setReviewText(''); setReviewRole(''); setReviewRating(5); setReviewError('') }} className="w-full text-center text-xs text-white/40 hover:text-white/70 transition-colors">
                  {ca ? 'Cancel·lar' : 'Cancelar'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="flex items-center justify-center size-10 rounded-full bg-[#10B77F]/10 border border-[#10B77F]/40">
                    <KeyRound className="size-5 text-[#10B77F]" />
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.24em] text-[#d7bd77] font-medium">{ca ? 'Codi de client' : 'Código de cliente'}</span>
                </div>
                <div className="relative">
                  <input type="text" value={reviewCode} onChange={(e) => { setReviewCode(e.target.value.toUpperCase()); setReviewError('') }} placeholder="RNV-XXXX-XXXX" maxLength={20} disabled={verifying} className="w-full bg-[#080808] border border-[#10B77F]/40 rounded-lg px-5 py-5 text-center text-xl lg:text-2xl font-mono tracking-[0.15em] text-white placeholder:text-white/20 focus:border-[#10B77F] outline-none transition-all duration-500 disabled:opacity-50" />
                </div>
                {reviewError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/50 bg-red-500/10">
                    <X className="size-4 text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-300">{reviewError}</p>
                  </div>
                )}
                <button type="submit" disabled={!reviewCode.trim() || verifying} className="group relative w-full inline-flex items-center justify-center gap-3 bg-[#d7bd77] px-6 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[#141310] overflow-hidden rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-opacity">
                  <span className="absolute inset-0 bg-[#10B77F] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                  <span className="relative z-10 flex items-center gap-2">
                    {verifying ? (<><Loader2 className="size-4 animate-spin" />{ca ? 'Verificant...' : 'Verificando...'}</>) : (<>{ca ? 'Verificar codi' : 'Verificar código'}<ArrowUpRight className="size-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" /></>)}
                  </span>
                </button>
                <div className="pt-4 border-t border-white/10 text-center">
                  <p className="text-xs text-white/50">{ca ? 'No tens codi? Contacta amb nosaltres per WhatsApp o telèfon.' : '¿No tienes código? Contacta con nosotros por WhatsApp o teléfono.'}</p>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="relative border-y border-white/10 bg-[#0D0D0D] px-6 py-24 lg:px-10 lg:py-32">
        <div className="relative mx-auto max-w-[1000px]">
          <div className="mb-14 lg:mb-16 text-center">
            <motion.p className="eyebrow" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              {ca ? 'Dubtes freqüents' : 'Dudas frecuentes'}
            </motion.p>
            <motion.h2 className="section-title" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}>
              {ca 
                ? <>{'Preguntes'}<br /><i className="text-[#10B77F]">{'freqüents.'}</i></>
                : <>{'Preguntas'}<br /><i className="text-[#10B77F]">{'frecuentes.'}</i></>
              }
            </motion.h2>
          </div>

          <div className="space-y-0 divide-y divide-white/10">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <motion.div key={index} className="faq-item" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}>
                  <button onClick={() => setOpenFaq(isOpen ? null : index)} className="group w-full flex items-start justify-between gap-6 py-6 lg:py-7 text-left transition-colors duration-500">
                    <span className={`font-serif text-xl lg:text-2xl leading-tight transition-colors duration-500 ${isOpen ? 'text-[#d7bd77]' : 'text-white group-hover:text-[#10B77F]'}`}>
                      {ca ? faq.qCa : faq.qEs}
                    </span>
                    <span className={`flex-shrink-0 flex items-center justify-center size-8 rounded-full border transition-all duration-500 ${isOpen ? 'bg-[#d7bd77] border-[#d7bd77] text-[#141310] rotate-180' : 'border-[#10B77F]/40 text-[#10B77F] group-hover:border-[#10B77F] group-hover:bg-[#10B77F]/10'}`}>
                      {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                        <p className="pb-7 pr-12 text-sm lg:text-base leading-relaxed text-white/70">{ca ? faq.aCa : faq.aEs}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 9. CONTACTO */}
      <section id="contacto" className="relative overflow-hidden bg-[#d7bd77] px-6 py-24 text-[#141310] lg:px-10 lg:py-32">
        <motion.div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#10B77F]/10 blur-3xl" initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }} />
        <motion.div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#10B77F]/10 blur-3xl" initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} />

        <div className="relative mx-auto flex max-w-[1380px] flex-col justify-between gap-12 lg:flex-row lg:items-end">
          <div>
            <motion.p className="eyebrow !text-[#141310]/60" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
              {ca ? 'El primer pas' : 'El primer paso'}
            </motion.p>
            <motion.h2 className="max-w-3xl font-serif text-5xl leading-none tracking-tight sm:text-7xl" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
              {ca ? <>Fem alguna cosa<br /><i>extraordinària.</i></> : <>Hagamos algo<br /><i>extraordinario.</i></>}
            </motion.h2>
          </div>
          <motion.div className="max-w-sm" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <p className="text-sm leading-relaxed text-[#141310]/70">
              {ca ? "Explica'ns la teva idea." : 'Cuéntanos tu idea.'}
            </p>
            <motion.button type="button" onClick={() => setContactModalOpen(true)} className="contact-button group mt-7 inline-flex items-center gap-3 bg-[#000000] text-white px-6 py-3 rounded-lg text-[11px] uppercase tracking-[0.2em] font-medium cursor-pointer" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
              <span className="flex items-center gap-3">
                {ca ? 'Demanar pressupost' : 'Solicitar presupuesto'}
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="relative bg-[#080808] px-6 py-14 lg:px-10">
        <motion.div className="absolute top-0 left-0 h-px bg-gradient-to-r from-[#10B77F] via-[#10B77F]/40 to-transparent" initial={{ width: 0 }} whileInView={{ width: '100%' }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }} />

        <div className="mx-auto max-w-[1380px]">
          <div className="flex flex-col justify-between gap-10 border-b border-white/10 pb-12 md:flex-row">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
              <Link href="/" className="flex items-center gap-3 group">
                <img src="/logo.png" alt="Renovactiva" className="h-12 w-auto transition-transform duration-500 group-hover:scale-105" />
                <span className="font-serif text-xl uppercase tracking-[0.28em] text-[#d7bd77] transition-colors duration-500 group-hover:text-[#10B77F]" style={{ textTransform: 'uppercase' }}>
                  RENOVACTIVA<span className="text-[#042133]"> SL</span>
                </span>
              </Link>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">
                {ca ? (footerTrans.description || footerData?.description || 'Dissenyem i construïm espais amb intenció.') : (footerData?.description || 'Diseñamos y construimos espacios con intención.')}
              </p>
            </motion.div>

            <motion.div className="grid grid-cols-2 gap-x-8 gap-y-8 text-sm" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}>
              {/* COLUMNA CONTACTO */}
              <div className="min-w-0">
                <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-[#d7bd77] font-semibold">{ca ? 'Contacte' : 'Contacto'}</p>

                {/* TELÉFONO */}
                <a
                  href={`tel:${(footerData?.contact?.phone || '+34600000000').replace(/\s/g, '')}`}
                  className="group flex items-center gap-2 mb-3 text-[#10B77F] hover:text-[#d7bd77] transition-colors break-words"
                >
                  <Phone className="size-4 flex-shrink-0 text-[#d7bd77] group-hover:text-[#10B77F] transition-colors" />
                  <span className="text-sm break-all">{footerData?.contact?.phone || '+34 600 000 000'}</span>
                </a>

                {/* CORREO — abre ContactModal */}
                <button
                  type="button"
                  onClick={() => setContactModalOpen(true)}
                  className="group flex items-center gap-2 mb-3 text-[#10B77F] hover:text-[#d7bd77] transition-colors w-full text-left cursor-pointer break-words"
                >
                  <Mail className="size-4 flex-shrink-0 text-[#d7bd77] group-hover:text-[#10B77F] transition-colors" />
                  <span className="text-sm break-all">{footerData?.contact?.email || 'info@renovactiva.com'}</span>
                </button>

                {/* WHATSAPP — abre WhatsAppModal */}
                <button
                  type="button"
                  onClick={() => setWhatsAppModalOpen(true)}
                  className="group flex items-center gap-2 text-[#10B77F] hover:text-[#d7bd77] transition-colors w-full text-left cursor-pointer break-words"
                >
                  <svg viewBox="0 0 24 24" className="size-4 flex-shrink-0 fill-[#d7bd77] group-hover:fill-[#10B77F] transition-colors">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  <span className="text-sm break-all">{footerData?.contact?.phone || '+34 722 454 020'}</span>
                </button>
              </div>

              {/* COLUMNA VISÍTANOS */}
              <div className="min-w-0">
                <p className="mb-4 text-[10px] uppercase tracking-[0.2em] text-[#d7bd77] font-semibold">{ca ? "Visita'ns" : 'Visítanos'}</p>
                <p className="text-white/75 text-sm">{ca ? (footerTrans.address?.street || footerData?.address?.street || 'Carrer Exemple 123') : (footerData?.address?.street || 'Carrer Exemple 123')}</p>
                <p className="text-white/75 text-sm">{footerData?.address?.postal || '08001'}{' '}{ca ? (footerTrans.address?.city || footerData?.address?.city || 'Barcelona') : (footerData?.address?.city || 'Barcelona')}</p>
                {footerData?.schedule && (
                  <p className="mt-3 flex items-start gap-2 text-white/75 text-sm">
                    <span className="flex-shrink-0">🕒</span>
                    <span>{ca ? (footerTrans.schedule || footerData.schedule) : footerData.schedule}</span>
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div className="hidden sm:flex flex-row justify-between gap-5 pt-7 text-[10px] uppercase tracking-[0.18em] text-white/45" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <p>
              {ca ? (footerTrans.copyright || footerData?.copyright || '© 2025 Renovactiva SL. Tots els drets reservats.') : (footerData?.copyright || '© 2025 Renovactiva SL. Todos los derechos reservados.')}
            </p>
            <div className="flex gap-5">
              {footerData?.social?.instagram && (<a href={footerData.social.instagram} target="_blank" rel="noopener noreferrer" className="footer-link">Instagram</a>)}
              {footerData?.social?.linkedin && (<a href={footerData.social.linkedin} target="_blank" rel="noopener noreferrer" className="footer-link">LinkedIn</a>)}
              {footerData?.social?.youtube && (<a href={footerData.social.youtube} target="_blank" rel="noopener noreferrer" className="footer-link">YouTube</a>)}
              {footerData?.social?.facebook && (<a href={footerData.social.facebook} target="_blank" rel="noopener noreferrer" className="footer-link">Facebook</a>)}
            </div>
          </motion.div>

          <div className="flex justify-center pt-6">
            <Link
              href="/admin"
              aria-label="Admin"
              className="inline-flex size-6 items-center justify-center rounded text-white/15 transition-colors duration-300 hover:text-[#d7bd77]"
            >
              <Shield className="size-3" />
            </Link>
          </div>
        </div>
      </footer>

      {/* MODAL GALERÍA */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 lg:p-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} onClick={() => setSelectedProject(null)}>
            <motion.div className="relative w-full h-full sm:max-w-6xl sm:max-h-[90vh] sm:rounded-2xl overflow-hidden bg-[#0A0A0A] border border-[#10B77F]/30 shadow-[0_0_80px_20px_rgba(16,183,127,0.3)] flex flex-col" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} onClick={(e) => e.stopPropagation()}>
              <div className="relative flex items-center justify-between gap-4 border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4 bg-black/50 backdrop-blur-sm z-20">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#10B77F] font-medium truncate">{selectedProject.type}</p>
                  <h3 className="font-serif text-lg sm:text-2xl text-white truncate">{selectedProject.title}</h3>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                  <div className="hidden sm:flex items-center gap-2 text-[#d7bd77]">
                    <Camera className="size-4" />
                    <span className="text-sm font-medium">{currentPhotoIndex + 1} / {selectedProject.images?.length || 1}</span>
                  </div>
                  <button onClick={() => setSelectedProject(null)} className="flex items-center justify-center size-9 sm:size-10 rounded-full border border-white/20 hover:border-[#10B77F] hover:bg-[#10B77F]/20 text-white/80 hover:text-white transition-all duration-300" aria-label="Cerrar galería">
                    <X className="size-5" />
                  </button>
                </div>
              </div>
              <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black select-none">
                <AnimatePresence mode="wait">
                  <motion.img key={currentPhotoIndex} src={selectedProject.images?.[currentPhotoIndex] || selectedProject.image || ''} alt={`${selectedProject.title} - ${currentPhotoIndex + 1}`} className="max-w-full max-h-full object-contain" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={(e, { offset }) => { const swipe = offset.x; if (swipe < -50) nextPhoto(); else if (swipe > 50) prevPhoto() }} />
                </AnimatePresence>
                {(selectedProject.images?.length || 1) > 1 && (
                  <button onClick={(e) => { e.stopPropagation(); prevPhoto() }} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex items-center justify-center size-11 sm:size-14 rounded-full bg-black/60 backdrop-blur-sm border border-[#10B77F]/50 hover:border-[#10B77F] hover:bg-[#10B77F]/30 text-white transition-all duration-300 group z-10" aria-label="Foto anterior">
                    <ChevronLeft className="size-6 sm:size-7 transition-transform duration-300 group-hover:-translate-x-0.5" />
                  </button>
                )}
                {(selectedProject.images?.length || 1) > 1 && (
                  <button onClick={(e) => { e.stopPropagation(); nextPhoto() }} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center justify-center size-11 sm:size-14 rounded-full bg-black/60 backdrop-blur-sm border border-[#10B77F]/50 hover:border-[#10B77F] hover:bg-[#10B77F]/30 text-white transition-all duration-300 group z-10" aria-label="Foto siguiente">
                    <ChevronRight className="size-6 sm:size-7 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </button>
                )}
              </div>
              {(selectedProject.images?.length || 1) > 1 && (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4 px-4 bg-black/50 backdrop-blur-sm overflow-x-auto">
                  {selectedProject.images?.map((_: string, i: number) => (
                    <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(i) }} className={`flex-shrink-0 rounded-full transition-all duration-300 ${i === currentPhotoIndex ? 'w-6 sm:w-8 h-2 bg-[#10B77F]' : 'w-2 h-2 bg-white/30 hover:bg-[#d7bd77]/70'}`} aria-label={`Ir a foto ${i + 1}`} />
                  ))}
                </div>
              )}
              <div className="sm:hidden flex items-center justify-center gap-2 py-2 text-[#d7bd77] text-xs border-t border-white/10 bg-black/50">
                <Camera className="size-3" />
                <span>{currentPhotoIndex + 1} / {selectedProject.images?.length || 1}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📩 MODAL DE CORREO */}
      <ContactModal
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        lang={ca ? 'ca' : 'es'}
      />

      {/* 💬 MODAL DE WHATSAPP */}
      <WhatsAppModal
        open={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        lang={ca ? 'ca' : 'es'}
      />
    </main>
  )
}