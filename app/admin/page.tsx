'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { 
  LayoutDashboard, Menu, X, Eye, EyeOff, ExternalLink, LogOut,
  Home, FolderOpen, Wrench, Mail, Image, Star, LayoutGrid, BarChart3,
  KeyRound, ListOrdered, Shield, ShieldAlert, CheckCircle2
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

const DEFAULT_EMAIL = 'info@renovactiva.com'
const DEFAULT_PASSWORD = 'Barcelona2026'
const DEFAULT_CODE = '2026*'

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
    totalSections: 0, totalProjects: 0, totalServices: 0, totalTestimonials: 0, reviewCodesPending: 0, reviewCodesUsed: 0
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  
  // Login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState('')
  const [showCode, setShowCode] = useState(false)
  const [error, setError] = useState('')
  
  const [realEmail, setRealEmail] = useState(DEFAULT_EMAIL)
  const [realPassword, setRealPassword] = useState(DEFAULT_PASSWORD)
  const [realCode, setRealCode] = useState(DEFAULT_CODE)

  // INACTIVIDAD
  const [countdown, setCountdown] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const lastActivityRef = useRef(Date.now())

  useEffect(() => {
    loadCredentials()
    const savedAuth = localStorage.getItem('adminAuth')
    if (savedAuth === 'true') {
      setUser({ email: DEFAULT_EMAIL })
      loadStats()
    }
    setLoading(false)
  }, [])

  // EFECTO DE INACTIVIDAD (Corre si hay usuario logueado)
  useEffect(() => {
    if (!user) {
      setCountdown(null)
      setTimeLeft(0)
      return
    }

    let totalSecs = 900
    let interval: NodeJS.Timeout

    async function startTimer() {
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?section=eq.settings&select=content`, {
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
          cache: 'no-store'
        })
        if (res.ok) {
          const data = await res.json()
          const secs = data[0]?.content?.inactivity_seconds
          if (typeof secs === 'number' && secs > 0) totalSecs = secs
        }
      } catch (e) {}

      lastActivityRef.current = Date.now()

      const onActivity = () => {
        lastActivityRef.current = Date.now()
        setCountdown(null)
      }
      window.addEventListener('mousemove', onActivity)
      window.addEventListener('keydown', onActivity)
      window.addEventListener('click', onActivity)
      window.addEventListener('scroll', onActivity)

      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - lastActivityRef.current) / 1000)
        const remaining = totalSecs - elapsed
        setTimeLeft(remaining)

        if (remaining <= 0) {
          // 🔥 AQUI ESTÁ LA CORRECCIÓN: Volver al paso 1 y limpiar datos al cerrar
          localStorage.removeItem('adminAuth')
          setUser(null)
          setStep(1)
          setEmail('')
          setPassword('')
          setCode('')
          setCountdown(null)
          clearInterval(interval)
        } else if (remaining <= 10) {
          setCountdown(remaining)
        } else {
          setCountdown(null)
        }
      }, 1000)

      return () => {
        window.removeEventListener('mousemove', onActivity)
        window.removeEventListener('keydown', onActivity)
        window.removeEventListener('click', onActivity)
        window.removeEventListener('scroll', onActivity)
      }
    }

    startTimer()

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [user])

  async function loadCredentials() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?section=eq.settings&select=content`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
        cache: 'no-store'
      })
      if (res.ok) {
        const data = await res.json()
        if (data[0]?.content) {
          const c = data[0].content
          if (c.admin_email) setRealEmail(c.admin_email)
          if (c.admin_password) setRealPassword(c.admin_password)
          if (c.admin_code) setRealCode(c.admin_code)
        }
      }
    } catch {}
  }

  async function loadStats() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?select=section,content`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      })
      if (!res.ok) throw new Error('Error')
      const data = await res.json()
      setStats({
        totalSections: data.length,
        totalProjects: data.find((d: any) => d.section === 'projects')?.content?.items?.length || 0,
        totalServices: data.find((d: any) => d.section === 'services')?.content?.items?.length || 0,
        totalTestimonials: data.find((d: any) => d.section === 'testimonials')?.content?.items?.length || 0,
        reviewCodesPending: 0,
        reviewCodesUsed: 0
      })
    } catch {}
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (email === realEmail && password === realPassword) setStep(2)
    else setError('Credenciales incorrectas')
  }

  function handleStep2(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (code === realCode) {
      localStorage.setItem('adminAuth', 'true')
      setUser({ email: realEmail })
      loadStats()
    } else setError('Código incorrecto')
  }

  function goToWeb() {
    window.location.href = '/'
  }

  function cerrarSesion() {
    localStorage.removeItem('adminAuth')
    setUser(null)
    setStep(1)
    setEmail('')
    setPassword('')
    setCode('')
  }

  if (loading) return <div className="min-h-screen bg-[#11110f] flex items-center justify-center text-white/50">Cargando...</div>

  // ============================================================
  // LOGIN
  // ============================================================
  if (!user) {
    return (
      <main className="min-h-screen bg-[#11110f] flex items-center justify-center px-4">
        {step === 1 ? (
          // PASO 1
          <form onSubmit={handleStep1} className="w-full max-w-md border border-white/10 bg-[#0b0b0a] p-8 rounded-xl">
            <h1 className="font-serif text-2xl text-[#ad742a]">RENOVACTIVA <span className="text-[#042133]">SL</span></h1>
            <button type="button" onClick={goToWeb} className="mt-2 flex items-center justify-center gap-2 w-full border border-white/15 px-4 py-2 text-white/60 hover:bg-white/5 transition-colors rounded-lg text-sm">
              <ExternalLink className="size-4" /> Ir a la web
            </button>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-white/50 text-sm mb-1">Correo</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent border border-white/15 px-4 py-3 text-white rounded-lg outline-none" required />
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-1">Contraseña</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent border border-white/15 px-4 py-3 text-white rounded-lg outline-none pr-12" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button className="w-full bg-[#d7bd77] py-3 text-[#11110f] font-medium rounded-lg">Siguiente</button>
            </div>
          </form>
        ) : (
          // PASO 2
          <form onSubmit={handleStep2} className="w-full max-w-md border border-white/10 bg-[#0b0b0a] p-8 rounded-xl">
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center size-14 rounded-full bg-[#d7bd77]/10 border border-[#d7bd77]/40">
                <Shield className="size-7 text-[#d7bd77]" />
              </div>
            </div>
            <h1 className="font-serif text-2xl text-center text-[#ad742a]">Verificación</h1>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-white/50 text-sm mb-1">Código de seguridad</label>
                <div className="relative">
                  <input type={showCode ? 'text' : 'password'} value={code} onChange={(e) => setCode(e.target.value)} className="w-full bg-transparent border border-white/15 px-4 py-3 text-white rounded-lg outline-none pr-12 text-center text-lg tracking-widest font-mono" placeholder="•••••" required autoFocus />
                  <button type="button" onClick={() => setShowCode(!showCode)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white">
                    {showCode ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-red-400 text-sm text-center">{error}</p>}
              <button className="w-full bg-[#d7bd77] py-3 text-[#11110f] font-medium rounded-lg">Verificar</button>
              <button type="button" onClick={() => { setStep(1); setError(''); setCode('') }} className="w-full text-xs text-white/40 hover:text-white/70">Volver</button>
            </div>
          </form>
        )}
      </main>
    )
  }

  // ============================================================
  // PANEL PRINCIPAL
  // ============================================================
  return (
    <main className="min-h-screen bg-[#11110f] text-[#f3f0e9]">
      {/* RELOJ ARRIBA A LA DERECHA */}
      {timeLeft > 0 && (
        <div className="fixed top-4 right-4 z-[90] flex items-center gap-2 bg-[#0A0A0A]/90 backdrop-blur-md border border-[#d7bd77]/40 px-4 py-2 rounded-xl shadow-lg">
          <span className={`font-mono text-lg font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-[#d7bd77]'}`}>
            {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
      )}

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
              <Link key={s.href} href={s.href} className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
                <Icon className="size-4" />
                <span>{s.label}</span>
              </Link>
            )
          })}
          <div className="pt-4 pb-2 px-4">
            <p className="text-[9px] uppercase tracking-[.2em] text-white/25">Sistema</p>
          </div>
          <Link href="/admin/seguridad" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 hover:text-white rounded-lg transition-colors">
            <Shield className="size-4" />
            <span>Seguridad</span>
          </Link>
        </nav>

        <div className="p-4 pt-3 flex-shrink-0 border-t border-white/10 space-y-2">
          <button onClick={goToWeb} className="flex items-center justify-center gap-2 w-full bg-[#d7bd77]/20 border border-[#d7bd77]/40 px-4 py-2.5 text-[#d7bd77] rounded-lg hover:bg-[#d7bd77] hover:text-[#11110f] transition-colors text-sm font-medium">
            <ExternalLink className="size-4" /> Ir a la web
          </button>
          <button onClick={cerrarSesion} className="flex items-center justify-center gap-2 w-full bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors text-sm font-medium">
            <LogOut className="size-4" /> Cerrar sesión
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
            <Link href="/admin/reviews" className="group border border-[#10B77F]/30 bg-[#10B77F]/[.03] hover:border-[#10B77F] hover:bg-[#10B77F]/[.08] p-6 rounded-xl transition-all duration-300">
              <p className="text-[10px] uppercase tracking-[.16em] text-[#10B77F] flex items-center gap-1.5">
                <KeyRound className="size-3" /> Reseñas
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <strong className="font-serif text-4xl text-[#d7bd77] group-hover:text-[#10B77F]">{stats.reviewCodesPending}</strong>
                <span className="text-xs text-white/40">pendientes</span>
              </div>
            </Link>
          </div>

          <div className="mt-10">
            <h2 className="font-serif text-2xl mb-6">Secciones editables</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SECTIONS.map((s) => {
                const Icon = s.icon
                return (
                  <Link key={s.href} href={s.href} className="group border border-white/10 bg-white/[.02] hover:border-[#d7bd77]/60 hover:bg-white/[.04] p-6 rounded-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center justify-center size-11 rounded-lg bg-[#d7bd77]/10 border border-[#d7bd77]/30 group-hover:bg-[#d7bd77]/20">
                        <Icon className="size-5 text-[#d7bd77]" />
                      </div>
                      <ExternalLink className="size-4 text-white/20 group-hover:text-[#d7bd77]" />
                    </div>
                    <h3 className="font-serif text-xl text-white group-hover:text-[#d7bd77] mb-1">{s.label}</h3>
                    <p className="text-xs text-white/40">{s.desc}</p>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CUENTA ATRÁS GIGANTE (cuando quedan 10 segundos) */}
      <AnimatePresence>
        {countdown !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] bg-black/95 flex flex-col items-center justify-center">
            <motion.div key={countdown} initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 1.5 }} className="text-red-500 font-black text-[150px] md:text-[250px] leading-none mb-8">
              {countdown}
            </motion.div>
            <div className="bg-[#111] border border-red-500/50 rounded-2xl p-8 max-w-md w-[90%] text-center">
              <ShieldAlert className="size-12 text-red-500 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-bold text-white mb-2">Sesión por cerrarse</h2>
              <p className="text-white/60 mb-8">Cerraremos el panel si no realizas ninguna acción.</p>
              <button onClick={() => { lastActivityRef.current = Date.now(); setCountdown(null) }} className="w-full flex items-center justify-center gap-2 bg-[#10B77F] text-black px-6 py-4 rounded-xl font-bold text-lg">
                <CheckCircle2 className="size-6" /> Permanecer aquí
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}