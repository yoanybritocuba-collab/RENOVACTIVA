'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowUpRight, Menu, Play, X, Shield, ChevronLeft, ChevronRight, Camera, Star, Plus, Minus, Briefcase, Award, Users, Home as HomeIcon, KeyRound, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useLanguage } from '@/components/language-provider'
import { MascotAssistant } from '@/components/MascotAssistant'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

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
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeHero, setActiveHero] = useState(0)
  
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  
  const [reviewCode, setReviewCode] = useState('')
  const [reviewMessage, setReviewMessage] = useState('')
  
  const { language } = useLanguage()
  const ca = language === 'ca'

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?select=section,content`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        })
        if (!res.ok) throw new Error('Error al cargar')
        const data = await res.json()

        const hero = data.find((d: any) => d.section === 'hero')
        const services = data.find((d: any) => d.section === 'services')
        const projects = data.find((d: any) => d.section === 'projects')
        const contact = data.find((d: any) => d.section === 'contact')
        const footer = data.find((d: any) => d.section === 'footer')
        const testimonials = data.find((d: any) => d.section === 'testimonials')

        if (hero) setHeroData(hero.content)
        if (services) {
          setServicesData(services.content?.items || [])
          setServicesSection(services.content)
        }
        if (projects) setProjectsSection(projects.content)
        if (contact) setContactData(contact.content)
        if (footer) setFooterData(footer.content)
        if (testimonials) setTestimonialsData(testimonials.content)

        try {
          const trabajosRes = await fetch(`${SUPABASE_URL}/rest/v1/trabajos?select=*&order=orden.asc`, {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${SUPABASE_KEY}`
            }
          })
          if (trabajosRes.ok) {
            const trabajosData = await trabajosRes.json()
            setProjectsData(trabajosData.map((t: any) => ({
              title: t.titulo,
              type: t.tipo,
              image: t.imagenes?.[0] || '',
              images: t.imagenes || [],
              description: t.descripcion,
              categoria: t.categoria
            })))
          }
        } catch (err) {
          console.error('Error al cargar trabajos:', err)
        }
      } catch (err) {
        console.error('Error al cargar datos:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
    const timer = setInterval(() => setActiveHero((v) => (v + 1) % 3), 6000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!selectedProject) return
      if (e.key === 'Escape') {
        setSelectedProject(null)
      } else if (e.key === 'ArrowLeft') {
        setCurrentPhotoIndex(prev => prev > 0 ? prev - 1 : (selectedProject.images?.length || 1) - 1)
      } else if (e.key === 'ArrowRight') {
        setCurrentPhotoIndex(prev => prev < (selectedProject.images?.length || 1) - 1 ? prev + 1 : 0)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedProject])

  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
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

  const titleText = ca
    ? (heroTrans.title || heroData?.title || 'Espais que trascendeixen.')
    : (heroData?.title || 'Espacios que trascienden.')
  
  const titleWords = titleText.split(' ')

  const nextPhoto = () => {
    if (!selectedProject) return
    const total = selectedProject.images?.length || 1
    setCurrentPhotoIndex(prev => prev < total - 1 ? prev + 1 : 0)
  }

  const prevPhoto = () => {
    if (!selectedProject) return
    const total = selectedProject.images?.length || 1
    setCurrentPhotoIndex(prev => prev > 0 ? prev - 1 : total - 1)
  }

  const statsData = [
    { icon: Briefcase, number: 150, suffix: '+', labelEs: 'Proyectos realizados', labelCa: 'Projectes realitzats' },
    { icon: Award, number: 15, suffix: '', labelEs: 'Años de experiencia', labelCa: 'Anys d\'experiència' },
    { icon: Users, number: 98, suffix: '%', labelEs: 'Clientes satisfechos', labelCa: 'Clients satisfets' },
    { icon: HomeIcon, number: 250, suffix: 'K', labelEs: 'm² reformados', labelCa: 'm² reformats' },
  ]

  const faqs = [
    {
      qEs: '¿Cuánto tarda una reforma integral?',
      qCa: 'Quant triga una reforma integral?',
      aEs: 'Depende del tamaño y la complejidad, pero una reforma integral de un piso medio suele tardar entre 2 y 4 meses. En la primera visita te damos un plazo estimado.',
      aCa: 'Depèn de la mida i la complexitat, però una reforma integral d\'un pis mitjà sol trigar entre 2 i 4 mesos. A la primera visita et donem un termini estimat.'
    },
    {
      qEs: '¿Hacéis presupuestos gratis?',
      qCa: 'Feu pressupostos gratuïts?',
      aEs: 'Sí, todos nuestros presupuestos son completamente gratis y sin ningún tipo de compromiso. Nos desplazamos a tu vivienda para valorar el proyecto.',
      aCa: 'Sí, tots els nostres pressupostos són completament gratuïts i sense cap mena de compromís. Ens desplacem al teu habitatge per valorar el projecte.'
    },
    {
      qEs: '¿Trabajáis en toda Cataluña?',
      qCa: 'Treballeu a tot Catalunya?',
      aEs: 'Trabajamos principalmente en Barcelona y su área metropolitana, aunque también realizamos proyectos en otras zonas de Cataluña. Consúltanos tu caso.',
      aCa: 'Treballem principalment a Barcelona i la seva àrea metropolitana, tot i que també realitzem projectes en altres zones de Catalunya. Consulta\'ns el teu cas.'
    },
    {
      qEs: '¿Qué garantía ofrecéis?',
      qCa: 'Quina garantia oferiu?',
      aEs: 'Ofrecemos 2 años de garantía en todos nuestros trabajos, tal como exige la ley. Además, disponemos de seguro de responsabilidad civil que cubre cualquier imprevisto.',
      aCa: 'Oferim 2 anys de garantia en tots els nostres treballs, tal com exigeix la llei. A més, disposem d\'assegurança de responsabilitat civil que cobreix qualsevol imprevist.'
    },
    {
      qEs: '¿Puedo pedir solo una parte de la reforma?',
      qCa: 'Puc demanar només una part de la reforma?',
      aEs: 'Por supuesto. Nos adaptamos a lo que necesites: desde una reforma completa hasta una actualización parcial (cocina, baño, pintura, etc.).',
      aCa: 'Per descomptat. Ens adaptem al que necessitis: des d\'una reforma completa fins a una actualització parcial (cuina, bany, pintura, etc.).'
    },
  ]

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewCode.trim()) return
    setReviewMessage(ca 
      ? 'Gràcies! El sistema de ressenyes estarà disponible molt aviat.' 
      : '¡Gracias! El sistema de reseñas estará disponible muy pronto.')
    setReviewCode('')
    setTimeout(() => setReviewMessage(''), 5000)
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#080808] text-[#f3f0e9]">
      <header className="absolute inset-x-0 top-0 z-30 border-b border-white/10 bg-black/10 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between px-4 py-4 lg:px-10 lg:py-5">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="Renovactiva" className="h-8 w-auto lg:h-10" />
            <span className="font-serif text-base tracking-[0.28em] text-[#d7bd77] lg:text-xl whitespace-nowrap">
              Renovactiva<span className="text-white/40">-SL</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-[11px] uppercase tracking-[0.24em] text-white/70">
            <a href="#servicios" className="transition-colors hover:text-[#d7bd77]">{ca ? 'Serveis' : 'Servicios'}</a>
            <a href="#metodo" className="transition-colors hover:text-[#d7bd77]">{ca ? 'El nostre mètode' : 'Nuestro método'}</a>
            <a href="#proyectos" className="transition-colors hover:text-[#d7bd77]">{ca ? 'Projectes' : 'Proyectos'}</a>
            <a href="#contacto" className="transition-colors hover:text-[#d7bd77]">{ca ? 'Contacte' : 'Contacto'}</a>
          </nav>

          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
            <LanguageSwitcher />
            <Link 
              href="/admin" 
              className="hidden sm:flex items-center gap-1.5 border border-[#d7bd77]/60 px-2.5 py-1.5 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 text-[8px] sm:text-[9px] lg:text-[10px] uppercase tracking-[0.2em] text-[#d7bd77] transition-colors hover:bg-[#d7bd77] hover:text-[#000000] rounded"
            >
              <Shield className="size-3" />
              Admin
            </Link>
            <button 
              aria-label="Abrir menú" 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="lg:hidden text-white/70 hover:text-white p-1"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#080808]/95 px-6 py-6 lg:hidden">
            <nav className="flex flex-col gap-5 text-sm uppercase tracking-[0.18em] text-white/70">
              <a href="#servicios" onClick={() => setMenuOpen(false)}>{ca ? 'Serveis' : 'Servicios'}</a>
              <a href="#metodo" onClick={() => setMenuOpen(false)}>{ca ? 'El nostre mètode' : 'Nuestro método'}</a>
              <a href="#proyectos" onClick={() => setMenuOpen(false)}>{ca ? 'Projectes' : 'Proyectos'}</a>
              <a href="#contacto" onClick={() => setMenuOpen(false)}>{ca ? 'Contacte' : 'Contacto'}</a>
              <Link 
                href="/admin" 
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 border-t border-white/10 pt-5 text-[#d7bd77] hover:text-white transition-colors"
              >
                <Shield className="size-4" />
                {ca ? 'Panell Admin' : 'Panel Admin'}
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* 1. HERO */}
      <section className="relative flex min-h-[600px] items-center lg:items-end lg:min-h-screen overflow-hidden pt-20 lg:pt-0">
        
        {heroImages.map((image: string, index: number) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              index === activeHero ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ 
              backgroundImage: `url(${image})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover'
            }}
          />
        ))}

        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent md:from-black/40 md:via-black/15 md:to-transparent z-[11]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        />
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-[#080808]/35 via-transparent to-transparent md:from-[#080808]/50 md:via-transparent md:to-black/5 z-[12]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
        />

        <div className="relative z-20 mx-auto w-full max-w-[1380px] px-6 pb-12 pt-24 lg:px-10 lg:pb-28 lg:pt-40">
          <div className="max-w-3xl">
            
            <motion.div
              className="mb-7 flex items-center gap-4"
              initial={{ opacity: 0, x: -600 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.span 
                className="block h-px bg-[#10B77F]"
                initial={{ width: 0 }}
                animate={{ width: 40 }}
                transition={{ duration: 1.2, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
              />
              <p className="text-[11px] uppercase tracking-[0.42em] text-[#d7bd77] text-hero-eyebrow">
                {ca
                  ? (heroTrans.eyebrow || heroData?.eyebrow || 'Arquitectura · Interiorisme · Construcció')
                  : (heroData?.eyebrow || 'Arquitectura · Interiorismo · Construcción')}
              </p>
            </motion.div>

            <h1 className="max-w-3xl font-serif text-4xl leading-[0.98] tracking-[-0.03em] sm:text-5xl md:text-6xl lg:text-[104px] text-hero-title">
              {titleWords.map((word: string, index: number) => (
                <span 
                  key={index}
                  className="inline-block overflow-hidden align-bottom"
                  style={{ marginRight: '0.25em' }}
                >
                  <motion.span
                    className="inline-block"
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 1 }}
                    transition={{
                      duration: 1.1,
                      delay: 1.4 + index * 0.12,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p 
              className="mt-8 max-w-md text-base leading-relaxed text-white/95 text-hero-description"
              initial={{ opacity: 0, x: 600 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.6, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
            >
              {ca
                ? (heroTrans.description || heroData?.description || "Reformes d'alt nivell per a habitatges, locals i oficines.")
                : (heroData?.description || 'Reformas de alto nivel para viviendas, locales y oficinas.')}
            </motion.p>

            <div className="mt-10 flex flex-wrap items-center gap-5">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 3.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.a
                  href="#contacto"
                  className="group relative inline-flex items-center gap-5 bg-[#d7bd77] px-6 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[#141310] overflow-hidden"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="absolute inset-0 bg-[#10B77F] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                  <span className="relative z-10">
                    {ca
                      ? (heroTrans.cta || heroData?.cta || 'Parlem del teu projecte')
                      : (heroData?.cta || 'Hablemos de tu proyecto')}
                  </span>
                  <ArrowUpRight className="relative z-10 size-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </motion.a>
              </motion.div>

              <motion.a 
                href="#proyectos" 
                className="group inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-white/95 hover:text-[#10B77F] transition-colors text-hero-eyebrow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 3.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Play className="size-4 fill-current transition-transform duration-300 group-hover:scale-110" /> 
                {ca ? 'Veure projectes' : 'Ver proyectos'}
              </motion.a>
            </div>

            <motion.div
              className="mt-16 hidden lg:flex flex-col items-start gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 4.0 }}
            >
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/70 text-hero-eyebrow">
                {ca ? 'Descobreix' : 'Descubre'}
              </span>
              <div className="relative h-12 w-px bg-white/20 overflow-hidden">
                <motion.div
                  className="absolute top-0 left-0 w-full h-1/2 bg-[#10B77F]"
                  animate={{ y: ['-100%', '200%'] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. SERVICIOS — LISTA EDITORIAL */}
      <section id="servicios" className="relative border-y border-white/10 bg-[#0D0D0D] px-6 py-24 lg:px-10 lg:py-32">
        <div className="relative mx-auto max-w-[1380px]">
          
          <div className="mb-16 lg:mb-20">
            <motion.p
              className="eyebrow"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {ca 
                ? (servicesTrans.eyebrow || servicesSection?.eyebrow || 'El que fem')
                : (servicesSection?.eyebrow || 'Lo que hacemos')}
            </motion.p>
            <motion.h2 
              className="mt-4 font-serif text-5xl leading-[0.95] tracking-[-0.03em] sm:text-6xl lg:text-7xl xl:text-8xl"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
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
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.08,
                    ease: [0.22, 1, 0.36, 1] 
                  }}
                >
                  <Link 
                    href={service.href || '#'} 
                    className="group relative block border-t border-white/10 py-8 lg:py-12 transition-all duration-500 hover:border-[#10B77F] hover:shadow-[0_0_40px_-5px_rgba(16,183,127,0.4)]"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-[120px_1fr_1.4fr_200px] gap-4 lg:gap-8 items-center">
                      
                      <div className="flex lg:justify-start">
                        <span className="font-serif text-6xl lg:text-8xl leading-none text-[#10B77F] transition-all duration-500 group-hover:text-[#d7bd77] group-hover:scale-105 origin-left">
                          {service.number}
                        </span>
                      </div>

                      <div className="lg:pr-4">
                        <h3 className="font-serif text-2xl lg:text-3xl leading-tight transition-colors duration-500 group-hover:text-[#d7bd77]">
                          {title}
                        </h3>
                      </div>

                      <div className="lg:pr-8">
                        <p className="text-sm leading-relaxed text-white/70 transition-colors duration-500 group-hover:text-white/95 max-w-md">
                          {copy}
                        </p>
                      </div>

                      <div className="hidden lg:block relative h-[180px] overflow-hidden rounded-lg">
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-0 scale-110 transition-all duration-700 group-hover:opacity-100 group-hover:scale-100"
                          style={{ backgroundImage: `url(${imageUrl})` }}
                        />
                        <div className="absolute inset-0 border border-transparent rounded-lg transition-all duration-500 group-hover:border-[#10B77F]/60" />
                      </div>

                      <div className="lg:hidden relative h-[200px] overflow-hidden rounded-lg mt-4">
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-90"
                          style={{ backgroundImage: `url(${imageUrl})` }}
                        />
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

          <motion.div 
            className="mt-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link 
              href="#contacto"
              className="inline-flex items-center gap-3 border-b-2 border-[#10B77F] pb-2 text-[11px] uppercase tracking-[0.24em] text-[#10B77F] transition-all duration-500 hover:border-[#d7bd77] hover:text-[#d7bd77]"
            >
              {ca ? 'Parlem del teu projecte' : 'Hablemos de tu proyecto'}
              <ArrowUpRight className="size-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 3. MÉTODO */}
      <section id="metodo" className="relative mx-auto max-w-[1380px] px-6 py-24 lg:px-10 lg:py-36 bg-[#080808]">
        <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <motion.p
              className="eyebrow"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {ca ? 'El nostre mètode' : 'Nuestro método'}
            </motion.p>
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              {ca ? <>L'excel·lència<br /><i>és un procés.</i></> : <>La excelencia<br /><i>es un proceso.</i></>}
            </motion.h2>
          </div>
          <div className="divide-y divide-white/10">
            {[
              { es: 'Escuchamos', ca: 'Escoltem', description: { es: 'Entendemos tu visión, tus necesidades y la forma en que quieres vivir.', ca: 'Entenem la teva visió, les teves necessitats.' } },
              { es: 'Diseñamos', ca: 'Dissenyem', description: { es: 'Convertimos las ideas en un proyecto claro, bello y posible.', ca: 'Convertim les idees en un projecte clar.' } },
              { es: 'Construimos', ca: 'Construïm', description: { es: 'Coordinamos cada gremio y cuidamos cada acabado.', ca: 'Coordinem cada ofici i cuidem cada acabat.' } },
              { es: 'Entregamos', ca: 'Lliurem', description: { es: 'Te entregamos un espacio listo para empezar una nueva etapa.', ca: 'Et lliurem un espai a punt.' } },
            ].map((step, index) => (
              <motion.div 
                key={index} 
                className="group flex items-center justify-between py-7 border border-transparent rounded-lg px-4 transition-all duration-500 hover:border-[#10B77F] hover:shadow-[0_0_40px_8px_rgba(16,183,127,0.5)]"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-8">
                  <span className="font-serif text-sm text-[#10B77F] font-medium transition-all duration-500 group-hover:scale-125 group-hover:text-[#d7bd77] origin-left">
                    0{index + 1}
                  </span>
                  <h3 className="font-serif text-3xl transition-colors duration-500 group-hover:text-[#d7bd77]">
                    {step[language] || ''}
                  </h3>
                </div>
                <p className="hidden max-w-[220px] text-right text-xs leading-relaxed text-white/55 transition-colors duration-500 group-hover:text-white/75 md:block">
                  {step.description[language] || ''}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PROYECTOS — GALERÍA + MODAL PICASA */}
      <section id="proyectos" className="relative mx-auto max-w-[1380px] px-6 py-24 lg:px-10 lg:py-36 bg-[#080808]">
        <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <motion.p
              className="eyebrow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {ca 
                ? (projectsSection?.translations?.sectionTitle?.eyebrow || projectsSection?.sectionTitle?.eyebrow || 'Una selecció')
                : (projectsSection?.sectionTitle?.eyebrow || 'Una selección')}
            </motion.p>
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
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
              <motion.div 
                key={index} 
                onClick={() => {
                  setSelectedProject(project)
                  setCurrentPhotoIndex(0)
                }}
                className={`group relative overflow-hidden rounded-lg min-h-[400px] border border-[#10B77F]/30 transition-all duration-500 hover:border-[#10B77F] hover:shadow-[0_0_60px_10px_rgba(16,183,127,0.55)] cursor-pointer ${
                  isWide ? 'lg:col-span-2' : 'lg:col-span-1'
                }`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1] 
                }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url(${project.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent md:from-black/70 md:via-black/20" />
                
                <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-[#10B77F]/50 rounded-full px-3 py-1.5 transition-all duration-500 group-hover:border-[#10B77F] group-hover:bg-[#10B77F]/20">
                  <Camera className="size-3 text-[#10B77F] transition-colors duration-500 group-hover:text-[#d7bd77]" />
                  <span className="text-[10px] font-medium text-[#10B77F] transition-colors duration-500 group-hover:text-[#d7bd77]">
                    {photoCount}
                  </span>
                </div>
                
                <div className="relative flex h-full min-h-[400px] flex-col justify-end p-7">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="block w-8 h-px bg-[#10B77F] transition-colors duration-500 group-hover:bg-[#d7bd77]" />
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#10B77F] font-medium transition-colors duration-500 group-hover:text-[#d7bd77]">
                      {project.type}
                    </p>
                  </div>
                  
                  <h3 className="font-serif text-3xl transition-all duration-500 group-hover:-translate-y-1 group-hover:text-[#d7bd77]">
                    {project.title}
                  </h3>

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
            {statsData.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <motion.div
                  key={index}
                  className="group text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  <IconComponent className="size-8 lg:size-10 mx-auto text-[#10B77F] mb-4 transition-all duration-500 group-hover:text-[#d7bd77] group-hover:scale-110" />
                  
                  <div className="font-serif text-5xl lg:text-7xl leading-none text-[#10B77F] transition-all duration-500 group-hover:text-[#d7bd77]">
                    {stat.number}
                    <span className="text-3xl lg:text-5xl">{stat.suffix}</span>
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
        <section className="relative mx-auto max-w-[1380px] px-6 py-24 lg:px-10 lg:py-36 bg-[#080808]">
          <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <motion.p
                className="eyebrow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                {ca
                  ? (testimonialsTrans.eyebrow?.ca || testimonialsData?.eyebrow?.ca || 'El que diuen els nostres clients')
                  : (testimonialsData?.eyebrow?.es || 'Lo que dicen nuestros clientes')}
              </motion.p>
              <motion.h2 
                className="section-title"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                {ca 
                  ? <>{testimonialsTrans.title?.ca || testimonialsData?.title?.ca || 'Opinions reals'}<br /><i>{testimonialsTrans.titleItalic?.ca || testimonialsData?.titleItalic?.ca || 'que parlen per nosaltres.'}</i></>
                  : <>{testimonialsData?.title?.es || 'Opiniones reales'}<br /><i>{testimonialsData?.titleItalic?.es || 'que hablan por nosotros.'}</i></>
                }
              </motion.h2>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonialsItems.map((item: any, index: number) => (
              <motion.div
                key={item.id || index}
                className="group relative flex flex-col p-7 rounded-xl border border-[#10B77F]/30 bg-[#0A0A0A] transition-all duration-500 hover:border-[#10B77F] hover:shadow-[0_0_60px_10px_rgba(16,183,127,0.55)]"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.1,
                  ease: [0.22, 1, 0.36, 1] 
                }}
              >
                <div className="flex gap-1 mb-5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`size-4 transition-colors duration-500 ${
                        star <= (item.rating || 5)
                          ? 'text-[#d7bd77] fill-[#d7bd77]'
                          : 'text-white/20'
                      }`}
                    />
                  ))}
                </div>

                <p className="flex-1 text-sm lg:text-base leading-relaxed text-white/80 transition-colors duration-500 group-hover:text-white/95 italic">
                  "{item.text?.[language] || item.text?.es || ''}"
                </p>

                <div className="mt-6 h-px w-12 bg-[#10B77F] transition-all duration-700 group-hover:w-20 group-hover:bg-[#d7bd77]" />

                <div className="mt-5">
                  <p className="font-serif text-lg text-[#10B77F] transition-colors duration-500 group-hover:text-[#d7bd77]">
                    {item.name}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 mt-1">
                    {item.role?.[language] || item.role?.es || ''}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 7. DEJA TU RESEÑA */}
      <section className="relative border-y border-white/10 bg-[#0D0D0D] px-6 py-24 lg:px-10 lg:py-32">
        <div className="relative mx-auto max-w-[700px]">
          
          <div className="mb-12 text-center">
            <motion.p
              className="eyebrow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {ca ? 'La teva opinió' : 'Tu opinión'}
            </motion.p>
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {ca 
                ? <>{'Deixa la teva'}<br /><i className="text-[#10B77F]">{'ressenya.'}</i></>
                : <>{'Deja tu'}<br /><i className="text-[#10B77F]">{'reseña.'}</i></>
              }
            </motion.h2>
            <motion.p
              className="mt-6 text-sm text-white/60 max-w-md mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {ca 
                ? 'Només per a clients que han treballat amb nosaltres.'
                : 'Solo para clientes que han trabajado con nosotros.'}
            </motion.p>
          </div>

          <motion.div
            className="relative p-8 lg:p-10 rounded-2xl border border-[#10B77F]/40 bg-[#0A0A0A] transition-all duration-500 hover:border-[#10B77F] hover:shadow-[0_0_60px_10px_rgba(16,183,127,0.35)]"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="flex items-center justify-center size-10 rounded-full bg-[#10B77F]/10 border border-[#10B77F]/40">
                  <KeyRound className="size-5 text-[#10B77F]" />
                </div>
                <span className="text-[11px] uppercase tracking-[0.24em] text-[#d7bd77] font-medium">
                  {ca ? 'Codi de client' : 'Código de cliente'}
                </span>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={reviewCode}
                  onChange={(e) => setReviewCode(e.target.value.toUpperCase())}
                  placeholder="RNV-XXXX-XXXX"
                  maxLength={20}
                  className="w-full bg-[#080808] border border-[#10B77F]/40 rounded-lg px-5 py-5 text-center text-xl lg:text-2xl font-mono tracking-[0.15em] text-white placeholder:text-white/20 focus:border-[#10B77F] focus:shadow-[0_0_30px_rgba(16,183,127,0.3)] outline-none transition-all duration-500"
                />
              </div>

              <button
                type="submit"
                disabled={!reviewCode.trim()}
                className="group relative w-full inline-flex items-center justify-center gap-3 bg-[#d7bd77] px-6 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[#141310] overflow-hidden rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
              >
                <span className="absolute inset-0 bg-[#10B77F] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
                <span className="relative z-10">
                  {ca ? 'Enviar codi' : 'Enviar código'}
                </span>
                <ArrowUpRight className="relative z-10 size-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </button>

              <AnimatePresence>
                {reviewMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 p-4 rounded-lg border border-[#10B77F]/50 bg-[#10B77F]/10"
                  >
                    <Check className="size-5 text-[#10B77F] flex-shrink-0" />
                    <p className="text-sm text-white/90">{reviewMessage}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-4 border-t border-white/10 text-center">
                <p className="text-xs text-white/50">
                  {ca 
                    ? 'No tens codi? Escriu-nos a '
                    : '¿No tienes código? Escríbenos a '}
                  <a 
                    href="mailto:info@renovactiva.com" 
                    className="text-[#10B77F] hover:text-[#d7bd77] transition-colors underline-offset-4 hover:underline"
                  >
                    info@renovactiva.com
                  </a>
                </p>
              </div>

            </form>
          </motion.div>

        </div>
      </section>

      {/* 8. FAQ */}
      <section className="relative border-y border-white/10 bg-[#0D0D0D] px-6 py-24 lg:px-10 lg:py-32">
        <div className="relative mx-auto max-w-[1000px]">
          
          <div className="mb-14 lg:mb-16 text-center">
            <motion.p
              className="eyebrow"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {ca ? 'Dubtes freqüents' : 'Dudas frecuentes'}
            </motion.p>
            <motion.h2 
              className="section-title"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
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
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="group w-full flex items-start justify-between gap-6 py-6 lg:py-7 text-left transition-colors duration-500"
                  >
                    <span className={`font-serif text-xl lg:text-2xl leading-tight transition-colors duration-500 ${
                      isOpen ? 'text-[#d7bd77]' : 'text-white group-hover:text-[#10B77F]'
                    }`}>
                      {ca ? faq.qCa : faq.qEs}
                    </span>
                    <span className={`flex-shrink-0 flex items-center justify-center size-8 rounded-full border transition-all duration-500 ${
                      isOpen 
                        ? 'bg-[#d7bd77] border-[#d7bd77] text-[#141310] rotate-180' 
                        : 'border-[#10B77F]/40 text-[#10B77F] group-hover:border-[#10B77F] group-hover:bg-[#10B77F]/10'
                    }`}>
                      {isOpen ? <Minus className="size-4" /> : <Plus className="size-4" />}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-7 pr-12 text-sm lg:text-base leading-relaxed text-white/70">
                          {ca ? faq.aCa : faq.aEs}
                        </p>
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
        <motion.div
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#10B77F]/10 blur-3xl"
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#10B77F]/10 blur-3xl"
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />

        <div className="relative mx-auto flex max-w-[1380px] flex-col justify-between gap-12 lg:flex-row lg:items-end">
          <div>
            <motion.p
              className="eyebrow !text-[#141310]/60"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {ca ? 'El primer pas' : 'El primer paso'}
            </motion.p>
            <motion.h2 
              className="max-w-3xl font-serif text-5xl leading-none tracking-tight sm:text-7xl"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              {ca ? <>Fem alguna cosa<br /><i>extraordinària.</i></> : <>Hagamos algo<br /><i>extraordinario.</i></>}
            </motion.h2>
          </div>
          <motion.div 
            className="max-w-sm"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-sm leading-relaxed text-[#141310]/70">
              {ca ? "Explica'ns la teva idea." : 'Cuéntanos tu idea.'}
            </p>
            <motion.a
              href="mailto:info@renovactiva.com?subject=Solicitud%20de%20presupuesto%20-%20Renovactiva&body=Hola%2C%20me%20gustar%C3%ADa%20solicitar%20un%20presupuesto%20para%20mi%20proyecto.%0A%0ANombre%3A%20%0ATel%C3%A9fono%3A%20%0ADescripci%C3%B3n%20del%20proyecto%3A%20"
              className="group mt-7 inline-flex items-center gap-3 bg-[#000000] hover:bg-[#10B77F] text-white px-6 py-3 rounded-lg transition-colors text-[11px] uppercase tracking-[0.2em] font-medium"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {ca ? 'Demanar pressupost' : 'Solicitar presupuesto'}
              <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="relative bg-[#080808] px-6 py-14 lg:px-10">
        <motion.div
          className="absolute top-0 left-0 h-px bg-gradient-to-r from-[#10B77F] via-[#10B77F]/40 to-transparent"
          initial={{ width: 0 }}
          whileInView={{ width: '100%' }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />

        <div className="mx-auto max-w-[1380px]">
          <div className="flex flex-col justify-between gap-10 border-b border-white/10 pb-12 md:flex-row">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href="/" className="flex items-center gap-3 group">
                <img src="/logo.png" alt="Renovactiva" className="h-12 w-auto transition-transform duration-500 group-hover:scale-105" />
                <span className="font-serif text-xl tracking-[0.28em] text-[#d7bd77] transition-colors duration-500 group-hover:text-[#10B77F]">
                  Renovactiva<span className="text-white/40">-SL</span>
                </span>
              </Link>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/55">
                {ca
                  ? (footerTrans.description || footerData?.description || 'Dissenyem i construïm espais amb intenció.')
                  : (footerData?.description || 'Diseñamos y construimos espacios con intención.')}
              </p>
            </motion.div>

            <motion.div 
              className="grid grid-cols-2 gap-x-14 gap-y-8 text-sm text-white/65"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#d7bd77]">
                  {ca ? 'Contacte' : 'Contacto'}
                </p>
                <a 
                  href={`tel:${(footerData?.contact?.phone || '+34600000000').replace(/\s/g, '')}`}
                  className="block link-underline hover:text-[#10B77F] transition-colors"
                >
                  {footerData?.contact?.phone || '+34 600 000 000'}
                </a>
                <a 
                  href={`mailto:${footerData?.contact?.email || 'info@renovactiva.com'}`}
                  className="block link-underline hover:text-[#10B77F] transition-colors"
                >
                  {footerData?.contact?.email || 'info@renovactiva.com'}
                </a>
              </div>
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#d7bd77]">
                  {ca ? "Visita'ns" : 'Visítanos'}
                </p>
                <p>
                  {ca
                    ? (footerTrans.address?.street || footerData?.address?.street || 'Carrer Exemple 123')
                    : (footerData?.address?.street || 'Carrer Exemple 123')}
                </p>
                <p>
                  {footerData?.address?.postal || '08001'}{' '}
                  {ca
                    ? (footerTrans.address?.city || footerData?.address?.city || 'Barcelona')
                    : (footerData?.address?.city || 'Barcelona')}
                </p>
                {footerData?.schedule && (
                  <p className="mt-3 flex items-start gap-2">
                    <span className="flex-shrink-0">🕒</span>
                    <span>
                      {ca
                        ? (footerTrans.schedule || footerData.schedule)
                        : footerData.schedule}
                    </span>
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div 
            className="flex flex-col justify-between gap-5 pt-7 text-[10px] uppercase tracking-[0.18em] text-white/45 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p>
              {ca
                ? (footerTrans.copyright || footerData?.copyright || '© 2025 Renovactiva-SL. Tots els drets reservats.')
                : (footerData?.copyright || '© 2025 Renovactiva-SL. Todos los derechos reservados.')}
            </p>
            <div className="flex gap-5">
              {footerData?.social?.instagram && (
                <a href={footerData.social.instagram} target="_blank" rel="noopener noreferrer" className="link-underline hover:text-[#10B77F] transition-colors">Instagram</a>
              )}
              {footerData?.social?.linkedin && (
                <a href={footerData.social.linkedin} target="_blank" rel="noopener noreferrer" className="link-underline hover:text-[#10B77F] transition-colors">LinkedIn</a>
              )}
              {footerData?.social?.youtube && (
                <a href={footerData.social.youtube} target="_blank" rel="noopener noreferrer" className="link-underline hover:text-[#10B77F] transition-colors">YouTube</a>
              )}
              {footerData?.social?.facebook && (
                <a href={footerData.social.facebook} target="_blank" rel="noopener noreferrer" className="link-underline hover:text-[#10B77F] transition-colors">Facebook</a>
              )}
            </div>
          </motion.div>
        </div>
      </footer>

      {/* MODAL GALERÍA — PICASA */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 lg:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              className="relative w-full h-full sm:max-w-6xl sm:max-h-[90vh] sm:rounded-2xl overflow-hidden bg-[#0A0A0A] border border-[#10B77F]/30 shadow-[0_0_80px_20px_rgba(16,183,127,0.3)] flex flex-col"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex items-center justify-between gap-4 border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4 bg-black/50 backdrop-blur-sm z-20">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-[#10B77F] font-medium truncate">
                    {selectedProject.type}
                  </p>
                  <h3 className="font-serif text-lg sm:text-2xl text-white truncate">
                    {selectedProject.title}
                  </h3>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                  <div className="hidden sm:flex items-center gap-2 text-[#d7bd77]">
                    <Camera className="size-4" />
                    <span className="text-sm font-medium">
                      {currentPhotoIndex + 1} / {selectedProject.images?.length || 1}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="flex items-center justify-center size-9 sm:size-10 rounded-full border border-white/20 hover:border-[#10B77F] hover:bg-[#10B77F]/20 text-white/80 hover:text-white transition-all duration-300"
                    aria-label="Cerrar galería"
                  >
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-black select-none">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentPhotoIndex}
                    src={selectedProject.images?.[currentPhotoIndex] || selectedProject.image || ''}
                    alt={`${selectedProject.title} - ${currentPhotoIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(e, { offset }) => {
                      const swipe = offset.x
                      if (swipe < -50) nextPhoto()
                      else if (swipe > 50) prevPhoto()
                    }}
                  />
                </AnimatePresence>

                {(selectedProject.images?.length || 1) > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); prevPhoto() }}
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex items-center justify-center size-11 sm:size-14 rounded-full bg-black/60 backdrop-blur-sm border border-[#10B77F]/50 hover:border-[#10B77F] hover:bg-[#10B77F]/30 text-white transition-all duration-300 group z-10"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="size-6 sm:size-7 transition-transform duration-300 group-hover:-translate-x-0.5" />
                  </button>
                )}

                {(selectedProject.images?.length || 1) > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); nextPhoto() }}
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 flex items-center justify-center size-11 sm:size-14 rounded-full bg-black/60 backdrop-blur-sm border border-[#10B77F]/50 hover:border-[#10B77F] hover:bg-[#10B77F]/30 text-white transition-all duration-300 group z-10"
                    aria-label="Foto siguiente"
                  >
                    <ChevronRight className="size-6 sm:size-7 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </button>
                )}
              </div>

              {(selectedProject.images?.length || 1) > 1 && (
                <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4 px-4 bg-black/50 backdrop-blur-sm overflow-x-auto">
                  {selectedProject.images?.map((_: string, i: number) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setCurrentPhotoIndex(i) }}
                      className={`flex-shrink-0 rounded-full transition-all duration-300 ${
                        i === currentPhotoIndex
                          ? 'w-6 sm:w-8 h-2 bg-[#10B77F]'
                          : 'w-2 h-2 bg-white/30 hover:bg-[#d7bd77]/70'
                      }`}
                      aria-label={`Ir a foto ${i + 1}`}
                    />
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

      {/* 🤖 ROBOT RENOV CON CHAT IA */}
      <MascotAssistant lang={ca ? 'ca' : 'es'} />
    </main>
  )
}