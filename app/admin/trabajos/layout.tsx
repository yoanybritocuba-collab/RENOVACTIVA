'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Image as ImageIcon,
  Plus,
  Tags,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react'

const MENU = [
  { href: '/admin/trabajos', label: 'Todos los trabajos', icon: ImageIcon },
  { href: '/admin/trabajos/nuevo', label: 'Nuevo trabajo', icon: Plus },
  { href: '/admin/trabajos/categorias', label: 'Categorías', icon: Tags },
]

export default function TrabajosLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    if (auth !== 'true') {
      router.push('/admin')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f3f0e9] flex">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-[#0b0b0a] p-6 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex items-center gap-2">
          <div className="size-9 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
            <ImageIcon className="size-5 text-[#10B981]" />
          </div>
          <div>
            <p className="font-serif text-sm text-white">Trabajos</p>
            <p className="text-[9px] uppercase tracking-[.2em] text-white/30">
              RENOVACTIVA
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/admin')}
          className="mt-6 flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors w-full border border-white/10 rounded-lg px-3 py-2 hover:bg-white/5"
        >
          <ArrowLeft className="size-3.5" />
          Volver al panel
        </button>

        <nav className="mt-6 space-y-1">
          {MENU.map((item) => {
            const Icon = item.icon
            const active =
              item.href === '/admin/trabajos'
                ? pathname === '/admin/trabajos'
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-colors text-sm ${
                  active
                    ? 'bg-[#10B981] text-white font-medium'
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

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden bg-[#0b0b0a] border border-white/10 rounded-lg p-2 text-white/70"
      >
        {sidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <main className="flex-1 md:ml-64 min-h-screen">{children}</main>
    </div>
  )
}