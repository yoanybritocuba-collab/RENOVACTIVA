'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowUpRight, Globe2, Menu, Play, X } from 'lucide-react'
import { LanguageSwitcher } from '@/components/language-switcher'
import { useLanguage } from '@/components/language-provider'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [heroData, setHeroData] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeHero, setActiveHero] = useState(0)
  const { language } = useLanguage()
  const ca = language === 'ca'

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?section=eq.hero&select=*`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        })
        if (!res.ok) throw new Error('Error al cargar')
        const data = await res.json()
        if (data.length > 0) setHeroData(data[0].content)
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

  if (loading) {
    return <div className="min-h-screen bg-[#10100f] flex items-center justify-center text-white/50">Cargando...</div>
  }

  const heroImages = heroData?.images || ['', '', '']

  return (
    <main className="min-h-screen overflow-hidden bg-[#10100f] text-[#f3f0e9]">
      <header className="absolute inset-x-0 top-0 z-30 border-b border-white/10 bg-black/10 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between px-4 py-4 lg:px-10 lg:py-5">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="Renovactiva" className="h-8 w-auto lg:h-10" />
            <span className="font-serif text-base tracking-[0.28em] text-[#d7bd77] lg:text-xl whitespace-nowrap">
              Renovactiva<span className="text-white/40">-SL</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8 text-[11px] uppercase tracking-[0.24em] text-white/70">
            <a href="#proyectos" className="transition-colors hover:text-[#d7bd77]">{ca ? 'Projectes' : 'Proyectos'}</a>
            <a href="#servicios" className="transition-colors hover:text-[#d7bd77]">{ca ? 'Serveis' : 'Servicios'}</a>
            <a href="#metodo" className="transition-colors hover:text-[#d7bd77]">{ca ? 'El nostre mètode' : 'Nuestro método'}</a>
            <a href="#contacto" className="transition-colors hover:text-[#d7bd77]">{ca ? 'Contacte' : 'Contacto'}</a>
          </nav>

          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
            <LanguageSwitcher />
            <Link href="/admin" className="hidden sm:block border border-[#d7bd77]/60 px-3 py-1.5 lg:px-4 lg:py-2 text-[9px] lg:text-[10px] uppercase tracking-[0.2em] text-[#d7bd77] transition-colors hover:bg-[#d7bd77] hover:text-[#10100f]">
              Admin
            </Link>
            <button aria-label="Abrir menú" onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-white/70 hover:text-white">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#10100f]/95 px-6 py-6 lg:hidden">
            <nav className="flex flex-col gap-5 text-sm uppercase tracking-[0.18em] text-white/70">
              <a href="#proyectos" onClick={() => setMenuOpen(false)}>Proyectos</a>
              <a href="#servicios" onClick={() => setMenuOpen(false)}>Servicios</a>
              <a href="#metodo" onClick={() => setMenuOpen(false)}>Nuestro método</a>
              <a href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</a>
            </nav>
          </div>
        )}
      </header>

      <section className="relative flex min-h-[740px] items-end lg:min-h-screen">
        {heroImages.map((image: string, index: number) => (
          <div
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              index === activeHero ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10100f] via-transparent to-black/20" />
        <div className="relative z-10 mx-auto w-full max-w-[1380px] px-6 pb-20 pt-40 lg:px-10 lg:pb-28">
          <div className="max-w-3xl">
            <p className="mb-7 text-[11px] uppercase tracking-[0.42em] text-[#d7bd77]">
              {heroData?.eyebrow || 'Arquitectura · Interiorismo · Construcción'}
            </p>
            <h1 className="max-w-3xl font-serif text-5xl leading-[0.98] tracking-[-0.03em] sm:text-7xl lg:text-[104px]">
              {heroData?.title || 'Espacios que trascienden.'}
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-white/65">
              {heroData?.description || 'Reformas de alto nivel para viviendas, locales y oficinas.'}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <a
                href="#contacto"
                className="group inline-flex items-center gap-5 bg-[#d7bd77] px-6 py-4 text-[11px] font-medium uppercase tracking-[0.2em] text-[#141310] transition-colors hover:bg-white"
              >
                {heroData?.cta || 'Hablemos de tu proyecto'}
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
              <a href="#proyectos" className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-white/70 hover:text-[#d7bd77]">
                <Play className="size-4 fill-current" /> Ver proyectos
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="proyectos" className="mx-auto max-w-[1380px] px-6 py-24 lg:px-10 lg:py-36">
        <div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">{ca ? 'Una selecció' : 'Una selección'}</p>
            <h2 className="section-title">
              {ca ? <>El resultat<br /><i>parla per si sol.</i></> : <>El resultado<br /><i>habla por sí solo.</i></>}
            </h2>
          </div>
        </div>
        <div className="grid gap-5 lg:grid-cols-[1.4fr_0.8fr]">
          {[
            { title: 'Casa Paseo del Prado', type: 'Vivienda integral', image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1400&q=85' },
            { title: 'Estudio Cobalto', type: 'Oficina corporativa', image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=85' },
            { title: 'Atelier Chamberí', type: 'Local comercial', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=85' },
          ].map((project, index) => (
            <div key={index} className="group relative overflow-hidden rounded-lg">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${project.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="relative flex h-full min-h-[230px] flex-col justify-end p-7">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[#d7bd77]">{project.type}</p>
                <h3 className="mt-2 font-serif text-3xl">{project.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="servicios" className="border-y border-white/10 bg-[#171715] px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-[1380px]">
          <div className="mb-14 flex items-end justify-between">
            <div>
              <p className="eyebrow">{ca ? 'El que fem' : 'Lo que hacemos'}</p>
              <h2 className="section-title">
                {ca ? <>Una visió<br /><i>sense límits.</i></> : <>Una visión<br /><i>sin límites.</i></>}
              </h2>
            </div>
          </div>
          <div className="grid gap-px bg-white/10 md:grid-cols-3">
            {[
              { number: '01', title: { es: 'Reformas de viviendas', ca: 'Reformes d\'habitatges' }, href: '/reformas-viviendas', image: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=1400&q=85', copy: { es: 'Espacios que se adaptan a tu forma de vivir.', ca: 'Espais que s\'adapten a la teva manera de viure.' } },
              { number: '02', title: { es: 'Locales comerciales', ca: 'Locals comercials' }, href: '/reformas-locales-comerciales', image: 'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=1400&q=85', copy: { es: 'Tu marca, convertida en una experiencia.', ca: 'La teva marca, convertida en una experiència.' } },
              { number: '03', title: { es: 'Reformas de oficinas', ca: 'Reformes d\'oficines' }, href: '/reformas-oficinas', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85', copy: { es: 'Lugares donde las ideas cobran vida.', ca: 'Llocs on les idees cobren vida.' } },
            ].map((service) => (
              <Link key={service.number} href={service.href} className="group relative min-h-[470px] overflow-hidden bg-[#171715] p-7">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-45 transition-all duration-700 group-hover:scale-105 group-hover:opacity-65"
                  style={{ backgroundImage: `url(${service.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#10100f] via-[#10100f]/30 to-transparent" />
                <div className="relative flex h-full flex-col justify-between">
                  <span className="font-serif text-5xl text-[#d7bd77]/70">{service.number}</span>
                  <div>
                    <h3 className="whitespace-pre-line font-serif text-4xl leading-none">
                      {service.title[language] || ''}
                    </h3>
                    <p className="mt-5 max-w-[210px] text-sm leading-relaxed text-white/55">
                      {service.copy[language] || ''}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="metodo" className="mx-auto max-w-[1380px] px-6 py-24 lg:px-10 lg:py-36">
        <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="eyebrow">{ca ? 'El nostre mètode' : 'Nuestro método'}</p>
            <h2 className="section-title">
              {ca ? <>L'excel·lència<br /><i>és un procés.</i></> : <>La excelencia<br /><i>es un proceso.</i></>}
            </h2>
          </div>
          <div className="divide-y divide-white/10">
            {[
              { es: 'Escuchamos', ca: 'Escoltem', description: { es: 'Entendemos tu visión, tus necesidades y la forma en que quieres vivir.', ca: 'Entenem la teva visió, les teves necessitats.' } },
              { es: 'Diseñamos', ca: 'Dissenyem', description: { es: 'Convertimos las ideas en un proyecto claro, bello y posible.', ca: 'Convertim les idees en un projecte clar.' } },
              { es: 'Construimos', ca: 'Construïm', description: { es: 'Coordinamos cada gremio y cuidamos cada acabado.', ca: 'Coordinem cada ofici i cuidem cada acabat.' } },
              { es: 'Entregamos', ca: 'Lliurem', description: { es: 'Te entregamos un espacio listo para empezar una nueva etapa.', ca: 'Et lliurem un espai a punt.' } },
            ].map((step, index) => (
              <div key={index} className="group flex items-center justify-between py-7">
                <div className="flex items-center gap-8">
                  <span className="text-xs text-[#d7bd77]">0{index + 1}</span>
                  <h3 className="font-serif text-3xl transition-colors group-hover:text-[#d7bd77]">
                    {step[language] || ''}
                  </h3>
                </div>
                <p className="hidden max-w-[220px] text-right text-xs leading-relaxed text-white/40 md:block">
                  {step.description[language] || ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contacto" className="relative overflow-hidden bg-[#d7bd77] px-6 py-24 text-[#141310] lg:px-10 lg:py-32">
        <div className="relative mx-auto flex max-w-[1380px] flex-col justify-between gap-12 lg:flex-row lg:items-end">
          <div>
            <p className="eyebrow !text-[#141310]/60">El primer paso</p>
            <h2 className="max-w-3xl font-serif text-5xl leading-none tracking-tight sm:text-7xl">
              {ca ? <>Fem alguna cosa<br /><i>extraordinària.</i></> : <>Hagamos algo<br /><i>extraordinario.</i></>}
            </h2>
          </div>
          <div className="max-w-sm">
            <p className="text-sm leading-relaxed text-[#141310]/70">
              {ca ? "Explica'ns la teva idea." : 'Cuéntanos tu idea.'}
            </p>
            <a
              href="mailto:info@renovactiva-sl.com"
              className="mt-7 inline-flex items-center gap-4 border-b border-[#141310] pb-2 text-[11px] uppercase tracking-[0.2em]"
            >
              {ca ? 'Demanar pressupost' : 'Solicitar presupuesto'}
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-[#0b0b0a] px-6 py-14 lg:px-10">
        <div className="mx-auto max-w-[1380px]">
          <div className="flex flex-col justify-between gap-10 border-b border-white/10 pb-12 md:flex-row">
            <div>
              <Link href="/" className="flex items-center gap-3">
                <img src="/logo.png" alt="Renovactiva" className="h-12 w-auto" />
                <span className="font-serif text-xl tracking-[0.28em] text-[#d7bd77]">
                  Renovactiva<span className="text-white/40">-SL</span>
                </span>
              </Link>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/40">
                {ca ? 'Dissenyem i construïm espais amb intenció.' : 'Diseñamos y construimos espacios con intención.'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-14 gap-y-8 text-sm text-white/50">
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#d7bd77]">Contacto</p>
                <p>+34 600 000 000</p>
                <p>info@renovactiva-sl.com</p>
              </div>
              <div>
                <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#d7bd77]">Visítanos</p>
                <p>Carrer Exemple 123</p>
                <p>08001 Barcelona</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-5 pt-7 text-[10px] uppercase tracking-[0.18em] text-white/30 sm:flex-row">
            <p>© 2025 Renovactiva-SL. Todos los derechos reservados.</p>
            <div className="flex gap-5">
              <Globe2 className="size-4" />
              <ArrowUpRight className="size-4" />
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}