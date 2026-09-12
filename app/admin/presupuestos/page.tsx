'use client'

import Link from 'next/link'
import {
  Calculator,
  Building2,
  FileSpreadsheet,
  Users,
  ChevronRight,
} from 'lucide-react'

const CONFIGS = [
  {
    href: '/admin/presupuestos/configuracion/tasador',
    icon: Calculator,
    title: 'Tasador (Pre-presupuesto)',
    description:
      'Precios base, calidades, zonas y extras que se usarán en el cálculo aproximado de la web pública.',
  },
  {
    href: '/admin/presupuestos/configuracion/empresa',
    icon: Building2,
    title: 'Empresa',
    description:
      'Datos fiscales, logo, contacto, IVA y condiciones que aparecerán en los presupuestos oficiales.',
  },
  {
    href: '/admin/presupuestos/configuracion/plantillas',
    icon: FileSpreadsheet,
    title: 'Plantillas PDF',
    description:
      'Estilos visuales, colores y opciones del PDF profesional generado desde el módulo.',
  },
  {
    href: '/admin/presupuestos/configuracion/usuarios',
    icon: Users,
    title: 'Usuarios y permisos',
    description:
      'Quién puede acceder al módulo y con qué permisos.',
  },
]

export default function ConfiguracionIndex() {
  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <header className="mb-10">
        <p className="text-[10px] uppercase tracking-[.2em] text-[#10B981]">
          Configuración
        </p>
        <h1 className="font-serif text-3xl mt-1">Ajustes del módulo</h1>
        <p className="text-white/40 text-sm mt-2 max-w-2xl">
          Desde aquí controlas todos los valores que alimentan el tasador y los presupuestos oficiales.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CONFIGS.map((c) => {
          const Icon = c.icon
          return (
            <Link
              key={c.href}
              href={c.href}
              className="group border border-white/10 bg-white/[.02] rounded-2xl p-6 hover:border-[#10B981]/40 hover:bg-[#10B981]/[.03] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="size-11 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
                  <Icon className="size-5 text-[#10B981]" />
                </div>
                <ChevronRight className="size-5 text-white/20 group-hover:text-[#10B981] transition-colors" />
              </div>
              <h3 className="text-white font-medium mb-1">{c.title}</h3>
              <p className="text-white/40 text-xs leading-relaxed">{c.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}