'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  FileText,
  Users,
  Inbox,
  BookOpen,
  Image as ImageIcon,
  FileSpreadsheet,
  History,
  Settings,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react'

const MENU = [
  { href: '/admin/presupuestos', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/presupuestos/solicitudes', label: 'Solicitudes', icon: Inbox },
  { href: '/admin/presupuestos/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/presupuestos/presupuestos', label: 'Presupuestos', icon: FileText },
  { href: '/admin/presupuestos/biblioteca', label: 'Biblioteca', icon: BookOpen },
  { href: '/admin/presupuestos/fotografias', label: 'Fotografías', icon: ImageIcon },
  { href: '/admin/presupuestos/plantillas', label: 'Plantillas PDF', icon: FileSpreadsheet },
  { href: '/admin/presupuestos/historial', label: 'Historial', icon: History },
  { href: '/admin/presupuestos/configuracion', label: 'Configuración', icon: Settings },
]

export default function PresupuestosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    // Verificar autenticación
    const auth = localStorage.getItem('adminAuth')
    if (auth !== 'true') {
      router.push('/admin')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#0b0b0a] text-[#f3f0e9] flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-[#0b0b0a] p-6 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Logo */}
        <Link href="/admin" className="font-serif text-lg text-[#10B981]">
          RENOVACTIVA
        </Link>
        <p className="text-[9px] uppercase tracking-[.2em] text-white/30 mt-1">
          Presupuestos
        </p>

        {/* Botón volver */}
        <button
          onClick={() => router.push('/admin')}
          className="mt-6 flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4" />
          Volver al panel
        </button>

        {/* Menú */}
        <nav className="mt-8 space-y-1">
          {MENU.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm ${
                  active
                    ? 'bg-[#10B981] text-white'
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Botón hamburguesa móvil */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-[#0b0b0a] border border-white/10 rounded-lg p-2 text-white/70"
      >
        {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      {/* Contenido */}
      <main className="flex-1 md:ml-64 min-h-screen">{children}</main>
    </div>
  )
}