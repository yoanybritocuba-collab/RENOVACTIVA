'use client'

import {
  FileEdit,
  Clock,
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HardHat,
  Archive,
  Circle,
} from 'lucide-react'

type Estado =
  | 'borrador'
  | 'pendiente'
  | 'enviado'
  | 'en_revision'
  | 'aceptado'
  | 'rechazado'
  | 'caducado'
  | 'en_obra'
  | 'archivado'
  | string

const ESTADOS: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  borrador: { label: 'Borrador', color: 'text-gray-400', bg: 'bg-gray-500/10', icon: FileEdit },
  pendiente: { label: 'Pendiente', color: 'text-amber-400', bg: 'bg-amber-500/10', icon: Clock },
  enviado: { label: 'Enviado', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Send },
  en_revision: { label: 'En revisión', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: Eye },
  aceptado: { label: 'Aceptado', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', icon: CheckCircle2 },
  rechazado: { label: 'Rechazado', color: 'text-red-400', bg: 'bg-red-500/10', icon: XCircle },
  caducado: { label: 'Caducado', color: 'text-orange-400', bg: 'bg-orange-500/10', icon: AlertTriangle },
  en_obra: { label: 'En obra', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', icon: HardHat },
  archivado: { label: 'Archivado', color: 'text-white/40', bg: 'bg-white/5', icon: Archive },
}

export default function StatusBadge({ estado }: { estado: Estado }) {
  const config = ESTADOS[estado] || {
    label: estado,
    color: 'text-white/60',
    bg: 'bg-white/5',
    icon: Circle,
  }
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.color}`}
    >
      <Icon className="size-3" />
      {config.label}
    </span>
  )
}