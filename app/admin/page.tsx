'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { 
  LayoutDashboard, Menu, X, Eye, EyeOff, ExternalLink, LogOut,
  Home, FolderOpen, Wrench, Mail, Image, Star, LayoutGrid, BarChart3,
  KeyRound, ListOrdered
} from 'lucide-react'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'
const ADMIN_EMAIL = 'info@renovactiva.com'
const ADMIN_PASSWORD = 'Barcelona2026'

const SECTIONS = [
  { href: '/admin/hero',         label: 'Hero',           icon: Home,         desc: 'Título, subtítulo, imágenes' },
  { href: '/admin/services',     label: 'Servicios',      icon: Wrench,       desc: 'Los 3 servicios y sus datos' },
  { href: '/admin/metodo',       label: 'Nuestro método', icon: ListOrdered,  desc: 'Los 4 pasos del método' },
  { href: '/admin/projects',     label: 'Proyectos',      icon: LayoutGrid,   desc: 'Proyectos destacados' },
  { href: '/admin/trabajos',     label: 'Trabajos',       icon: FolderOpen,   desc: 'Galería de trabajos reales' },
  { href: '/admin/stats',        label: 'Números',        icon: BarChart3,    desc: 'Contadores y estadísticas' },
  { href: '/admin/testimonials', label: 'Testimonios',    icon: Star,         desc: 'Opiniones de clientes' },
  { href: '/admin/reviews',      label: 'Reseñas',        icon: KeyRound,     desc: 'Códigos y gestión de reseñas' },
  { href: '/admin/contact',      label: 'Contacto',       icon: Mail,         desc: 'Datos del formulario' },
  { href: '/admin/footer',       label: 'Footer',         icon: Image,        desc: 'Datos del pie de página' },
]

export default function AdminDashboard() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ 
    totalSections: 0, 
    totalProjects: 0, 
    totalServices: 0, 
    totalTestimonials: 0,
    reviewCodesPending: 0,
    reviewCodesUsed: 0
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const savedAuth = localStorage.getItem('adminAuth')
    if (savedAuth === 'true') {
      setUser({ email: ADMIN_EMAIL })
      loadStats()
    }
    setLoading(false)
  }, [])

  async function loadStats() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?select=section,content`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      })
      if (!res.ok) throw new Error('Error al cargar')
      const data = await res.json()
      const projects = data.find((d: any) => d.section === 'projects')
      const services = data.find((d: any) => d.section === 'services')
      const testimonials = data.find((d: any) => d.section === 'testimonials')

      let reviewCodesPending = 0
      let reviewCodesUsed = 0
      try {
        const codesRes = await fetch(`${SUPABASE_URL}/rest/v1/review_codes?select=usado`, {
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
          cache: 'no-store'
        })
        if (codesRes.ok) {
          const codesData = await codesRes.json()
          reviewCodesUsed = codesData.filter((c: any) => c.usado === true).length
          reviewCodesPending = codesData.filter((c: any) => c.usado === false).length
        }
      } catch (e) {
        console.warn('No se pudieron cargar los códigos de reseña:', e)
      }

      setStats({
        totalSections: data.length,
        totalProjects: projects?.content?.items?.length || 0,
        totalServices: services?.content?.items?.length || 0,
        totalTestimonials: testimonials?.content?.items?.length || 0,
        reviewCodesPending,
        reviewCodesUsed
      })
    } catch (err) {
      console.error('Error:', err)
    }
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault()
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem('adminAuth', 'true')
      setUser({ email: ADMIN_EMAIL })
      loadStats()
    } else {
      setError('Credenciales incorrectas')
    }
  }

  function goToWeb() {
    window.location.href = '/'
  }

  function cerrarSesion() {
    localStorage.removeItem('adminAuth')
    setUser(null)
  }

  if (loading) return <div className="min-h-screen bg-[#11110f] flex items-center justify-center text-white/50">Cargando...</div>

  if (!user) {
    return (
      <main className="min-h-screen bg-[#11110f] flex items-center justify-center px-4">
        <form onSubmit={signIn} className="w-full max-w-md border border-white/10 bg-[#0b0b0a] p-8 rounded-xl">
          <h1 className="font-serif text-2xl" style={{ color: '#ad742a' }}>
            RENOVACTIVA<span style={{ color: '#042133' }}> SL</span>
          </h1>
          <p className="text-white/40 text-sm mt-1">Panel de administración</p>

          <button
            type="button"
            onClick={goToWeb}
            className="mt-2 flex items-center justify-center gap-2 w-full border border-white/15 px-4 py-2 text-white/60 hover:bg-white/5 transition-colors rounded-lg text-sm"
          >
            <ExternalLink className="size-4" />
            Ir a la web
          </button>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-white/50 text-sm mb-1">Correo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@renovactiva.com"
                className="w-full bg-transparent border border-white/15 px-4 py-3 text-white rounded-lg focus:border-[#d7bd77] outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent border border-white/15 px-4 py-3 text-white rounded-lg focus:border-[#d7bd77] outline-none pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button className="w-full bg-[#d7bd77] py-3 text-[#11110f] font-medium rounded-lg hover:bg-white transition-colors">
              Entrar
            </button>
          </div>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#11110f] text-[#f3f0e9]">
      <button onClick={() => setSidebarOpen(!sidebarOpen)} className="fixed top-4 left-4 z-50 md:hidden bg-[#0b0b0a] border border-white/10 rounded-lg p-2 text-white/70">
        {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-[#0b0b0a] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        
        <div className="p-6 pb-4 flex-shrink-0">
          <Link href="/" className="font-serif text-lg">
            <span style={{ color: '#ad742a' }}>RENOVACTIVA</span>
            <span style={{ color: '#042133' }}> SL</span>
          </Link>
          <p className="text-[9px] uppercase tracking-[.2em] text-white/30 mt-1">Panel de administración</p>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 bg-[#d7bd77] px-4 py-3 text-[#15140f] rounded-lg font-medium">
            <LayoutDashboard className="size-4" /> Dashboard
          </Link>

          <div className="pt-4 pb-2 px-4">
            <p className="text-[9px] uppercase tracking-[.2em] text-white/25">Secciones de la web</p>
          </div>

          {SECTIONS.map((s) => {
            const Icon = s.icon
            return (
              <Link
                key={s.href}
                href={s.href}
                className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
              >
                <Icon className="size-4" />
                <span>{s.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 pt-3 flex-shrink-0 border-t border-white/10 space-y-2">
          <button
            onClick={goToWeb}
            className="flex items-center justify-center gap-2 w-full bg-[#d7bd77]/20 border border-[#d7bd77]/40 px-4 py-2.5 text-[#d7bd77] rounded-lg hover:bg-[#d7bd77] hover:text-[#11110f] transition-colors text-sm font-medium"
          >
            <ExternalLink className="size-4" />
            Ir a la web
          </button>
          <button
            onClick={cerrarSesion}
            className="flex items-center justify-center gap-2 w-full bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors text-sm font-medium"
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <section className="md:ml-64 min-h-screen">
        <header className="border-b border-white/10 px-6 py-4 lg:px-10">
          <div className="flex items-center justify-between ml-12 md:ml-0">
            <div>
              <p className="text-[10px] uppercase tracking-[.2em] text-white/40">{user.email}</p>
              <h1 className="font-serif text-2xl">Dashboard</h1>
            </div>
          </div>
        </header>
        <div className="p-6 lg:p-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="border border-white/10 bg-white/[.02] p-6 rounded-xl">
              <p className="text-[10px] uppercase tracking-[.16em] text-white/40">Secciones</p>
              <strong className="block mt-2 font-serif text-4xl text-[#d7bd77]">{stats.totalSections}</strong>
            </div>
            <div className="border border-white/10 bg-white/[.02] p-6 rounded-xl">
              <p className="text-[10px] uppercase tracking-[.16em] text-white/40">Trabajos</p>
              <strong className="block mt-2 font-serif text-4xl text-[#d7bd77]">{stats.totalProjects}</strong>
            </div>
            <div className="border border-white/10 bg-white/[.02] p-6 rounded-xl">
              <p className="text-[10px] uppercase tracking-[.16em] text-white/40">Servicios</p>
              <strong className="block mt-2 font-serif text-4xl text-[#d7bd77]">{stats.totalServices}</strong>
            </div>
            <div className="border border-white/10 bg-white/[.02] p-6 rounded-xl">
              <p className="text-[10px] uppercase tracking-[.16em] text-white/40">Testimonios</p>
              <strong className="block mt-2 font-serif text-4xl text-[#d7bd77]">{stats.totalTestimonials}</strong>
            </div>

            <Link 
              href="/admin/reviews"
              className="group border border-[#10B77F]/30 bg-[#10B77F]/[.03] hover:border-[#10B77F] hover:bg-[#10B77F]/[.08] p-6 rounded-xl transition-all duration-300"
            >
              <p className="text-[10px] uppercase tracking-[.16em] text-[#10B77F] flex items-center gap-1.5">
                <KeyRound className="size-3" />
                Reseñas
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <strong className="font-serif text-4xl text-[#d7bd77] group-hover:text-[#10B77F] transition-colors">
                  {stats.reviewCodesPending}
                </strong>
                <span className="text-xs text-white/40">pendientes</span>
              </div>
              <p className="text-[10px] text-white/40 mt-1">
                {stats.reviewCodesUsed} usados
              </p>
            </Link>
          </div>

          {/* TARJETAS GRANDES DE TODAS LAS SECCIONES */}
          <div className="mt-10">
            <h2 className="font-serif text-2xl mb-6">Secciones editables</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SECTIONS.map((s) => {
                const Icon = s.icon
                return (
                  <Link
                    key={s.href}
                    href={s.href}
                    className="group border border-white/10 bg-white/[.02] hover:border-[#d7bd77]/60 hover:bg-white/[.04] p-6 rounded-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center justify-center size-11 rounded-lg bg-[#d7bd77]/10 border border-[#d7bd77]/30 group-hover:bg-[#d7bd77]/20 transition-colors">
                        <Icon className="size-5 text-[#d7bd77]" />
                      </div>
                      <ExternalLink className="size-4 text-white/20 group-hover:text-[#d7bd77] transition-colors" />
                    </div>
                    <h3 className="font-serif text-xl text-white group-hover:text-[#d7bd77] transition-colors mb-1">
                      {s.label}
                    </h3>
                    <p className="text-xs text-white/40 leading-relaxed">{s.desc}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}