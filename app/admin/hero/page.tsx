'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { 
  LayoutDashboard, Menu, X, Eye, EyeOff, ExternalLink, LogOut,
  Home, FolderOpen, Wrench, Mail, Image, Settings
} from 'lucide-react'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'sb_publishable_acJOTZ5reUCVCpJ_vK36ZA_q2bEIhoo'
const ADMIN_EMAIL = 'info@renovactiva.com'
const ADMIN_PASSWORD = 'Barcelona2026'

export default function AdminDashboard() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalSections: 0, totalProjects: 0, totalServices: 0 })
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
      setStats({
        totalSections: data.length,
        totalProjects: projects?.content?.items?.length || 0,
        totalServices: services?.content?.items?.length || 0
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
    localStorage.removeItem('adminAuth')
    window.location.href = '/'
  }

  function cerrarSesion() {
    localStorage.removeItem('adminAuth')
    setUser(null)
  }

  if (loading) return <div className="min-h-screen bg-[#11110f] flex items-center justify-center text-white/50">Cargando...</div>

  if (!user) {
    return (
      <main className="min-h-screen bg-[#11110f] flex items-center justify-center px-4 py-8">
        <form onSubmit={signIn} className="w-full max-w-md border border-white/10 bg-[#0b0b0a] p-6 sm:p-8 rounded-xl">
          <h1 className="font-serif text-2xl text-[#d7bd77]">RENOVACTIVA</h1>
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
          <p className="mt-4 text-center text-white/30 text-xs">
            info@renovactiva.com / Barcelona2026
          </p>
        </form>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#11110f] text-[#f3f0e9]">
      {/* Botón hamburguesa - SIEMPRE VISIBLE EN MÓVIL */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)} 
        className="fixed top-4 left-4 z-[60] md:hidden bg-[#d7bd77] border border-[#d7bd77] rounded-lg p-2.5 text-[#11110f] shadow-lg"
        aria-label="Abrir menú"
      >
        {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/70 md:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-[#0b0b0a] p-6 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 overflow-y-auto`}>
        <Link href="/" className="font-serif text-lg text-[#d7bd77]">RENOVACTIVA</Link>
        <p className="text-[9px] uppercase tracking-[.2em] text-white/30 mt-1">Panel de administración</p>

        <nav className="mt-8 space-y-1 pb-40">
          <Link href="/admin" className="flex items-center gap-3 bg-[#d7bd77] px-4 py-3 text-[#15140f] rounded-lg">
            <LayoutDashboard className="size-4" /> Dashboard
          </Link>
          <Link href="/admin/hero" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 rounded-lg transition-colors">
            <Home className="size-4" /> Hero
          </Link>
          <Link href="/admin/projects" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 rounded-lg transition-colors">
            <FolderOpen className="size-4" /> Trabajos
          </Link>
          <Link href="/admin/services" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 rounded-lg transition-colors">
            <Wrench className="size-4" /> Servicios
          </Link>
          <Link href="/admin/contact" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 rounded-lg transition-colors">
            <Mail className="size-4" /> Contacto
          </Link>
          <Link href="/admin/footer" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 rounded-lg transition-colors">
            <Image className="size-4" /> Footer
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-white/60 hover:bg-white/5 rounded-lg transition-colors">
            <Settings className="size-4" /> Configuración
          </Link>
        </nav>

        <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3">
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

      {/* Contenido principal */}
      <section className="md:ml-64 min-h-screen">
        <header className="border-b border-white/10 px-4 sm:px-6 py-4 lg:px-10">
          <div className="flex items-center justify-between ml-14 md:ml-0">
            <div>
              <p className="text-[10px] uppercase tracking-[.2em] text-white/40 truncate">{user.email}</p>
              <h1 className="font-serif text-xl sm:text-2xl">Dashboard</h1>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          </div>

          <div className="mt-8 border border-white/10 bg-white/[.02] p-6 rounded-xl">
            <h2 className="font-serif text-lg text-[#d7bd77]">Bienvenido al panel</h2>
            <p className="text-white/40 text-sm mt-2">Desde aquí puedes editar el contenido de tu web. Usa el menú lateral para navegar entre las secciones.</p>
          </div>
        </div>
      </section>
    </main>
  )
}