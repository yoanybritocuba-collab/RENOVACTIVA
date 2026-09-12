'use client'

import { useEffect, useState } from 'react'
import {
  FileText,
  Users,
  Inbox,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Plus,
  UserPlus,
  BookOpen,
  ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'
import { sbGet } from '@/lib/presupuestos/supabase'

// ============================================================
// TIPOS
// ============================================================
type Stats = {
  totalPresupuestos: number
  borradores: number
  enviados: number
  aceptados: number
  rechazados: number
  importeTotal: number
  importeAceptado: number
  clientesActivos: number
  solicitudesPendientes: number
}

type Actividad = {
  tipo: string
  descripcion: string
  fecha: string
}

// ============================================================
// DASHBOARD
// ============================================================
export default function PresupuestosDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Stats>({
    totalPresupuestos: 0,
    borradores: 0,
    enviados: 0,
    aceptados: 0,
    rechazados: 0,
    importeTotal: 0,
    importeAceptado: 0,
    clientesActivos: 0,
    solicitudesPendientes: 0,
  })
  const [actividad, setActividad] = useState<Actividad[]>([])

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      // Cargar presupuestos
      const presupuestos = await sbGet('presupuestos', 'select=id,estado,total,created_at').catch(() => [])
      const clientes = await sbGet('presupuestos_clientes', 'select=id').catch(() => [])
      const solicitudes = await sbGet('solicitudes_clientes', 'select=id,estado').catch(() => [])

      const total = presupuestos.length
      const borradores = presupuestos.filter((p: any) => p.estado === 'borrador').length
      const enviados = presupuestos.filter((p: any) => p.estado === 'enviado').length
      const aceptados = presupuestos.filter((p: any) => p.estado === 'aceptado').length
      const rechazados = presupuestos.filter((p: any) => p.estado === 'rechazado').length
      const importeTotal = presupuestos.reduce((sum: number, p: any) => sum + (p.total || 0), 0)
      const importeAceptado = presupuestos
        .filter((p: any) => p.estado === 'aceptado')
        .reduce((sum: number, p: any) => sum + (p.total || 0), 0)

      setStats({
        totalPresupuestos: total,
        borradores,
        enviados,
        aceptados,
        rechazados,
        importeTotal,
        importeAceptado,
        clientesActivos: clientes.length,
        solicitudesPendientes: solicitudes.filter((s: any) => s.estado === 'pendiente').length,
      })

      // Actividad reciente
      const act: Actividad[] = presupuestos.slice(0, 5).map((p: any) => ({
        tipo: 'presupuesto',
        descripcion: `Presupuesto #${p.id?.slice(0, 6)} · ${p.estado}`,
        fecha: p.created_at,
      }))
      setActividad(act)
    } catch (err) {
      console.error('Error al cargar datos:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white/50">
        Cargando dashboard...
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10">
      {/* Cabecera */}
      <header className="mb-10">
        <p className="text-[10px] uppercase tracking-[.2em] text-white/40">
          Módulo de presupuestos
        </p>
        <h1 className="font-serif text-3xl mt-1">Dashboard</h1>
        <p className="text-white/40 text-sm mt-2">
          Resumen de tu actividad comercial
        </p>
      </header>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={FileText}
          label="Presupuestos"
          value={stats.totalPresupuestos}
          color="emerald"
        />
        <StatCard
          icon={Users}
          label="Clientes"
          value={stats.clientesActivos}
          color="blue"
        />
        <StatCard
          icon={Inbox}
          label="Solicitudes"
          value={stats.solicitudesPendientes}
          color="amber"
        />
        <StatCard
          icon={DollarSign}
          label="Importe total"
          value={`${stats.importeTotal.toLocaleString('es-ES')} €`}
          color="emerald"
        />
      </div>

      {/* Estados de presupuestos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Estado de presupuestos */}
        <div className="border border-white/10 bg-white/[.02] rounded-xl p-6">
          <h2 className="text-white/40 text-xs uppercase tracking-wider mb-4">
            Estado de presupuestos
          </h2>
          <div className="space-y-4">
            <ProgressBar
              label="Borradores"
              value={stats.borradores}
              total={stats.totalPresupuestos || 1}
              color="#6b7280"
              icon={Clock}
            />
            <ProgressBar
              label="Enviados"
              value={stats.enviados}
              total={stats.totalPresupuestos || 1}
              color="#3b82f6"
              icon={TrendingUp}
            />
            <ProgressBar
              label="Aceptados"
              value={stats.aceptados}
              total={stats.totalPresupuestos || 1}
              color="#10B981"
              icon={CheckCircle}
            />
            <ProgressBar
              label="Rechazados"
              value={stats.rechazados}
              total={stats.totalPresupuestos || 1}
              color="#ef4444"
              icon={XCircle}
            />
          </div>
        </div>

        {/* Importes */}
        <div className="border border-white/10 bg-white/[.02] rounded-xl p-6">
          <h2 className="text-white/40 text-xs uppercase tracking-wider mb-4">
            Importes
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Total presupuestado</span>
                <span className="text-white font-medium">
                  {stats.importeTotal.toLocaleString('es-ES')} €
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-white/30" style={{ width: '100%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Importe aceptado</span>
                <span className="text-[#10B981] font-medium">
                  {stats.importeAceptado.toLocaleString('es-ES')} €
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#10B981] transition-all duration-500"
                  style={{
                    width: `${
                      stats.importeTotal > 0
                        ? (stats.importeAceptado / stats.importeTotal) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
              <p className="text-white/30 text-xs mt-1">
                {stats.importeTotal > 0
                  ? `${((stats.importeAceptado / stats.importeTotal) * 100).toFixed(1)}% del total`
                  : 'Sin datos'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="mb-8">
        <h2 className="text-white/40 text-xs uppercase tracking-wider mb-4">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            href="/admin/presupuestos/presupuestos/nuevo"
            icon={Plus}
            label="Nuevo presupuesto"
          />
          <QuickAction
            href="/admin/presupuestos/clientes/nuevo"
            icon={UserPlus}
            label="Nuevo cliente"
          />
          <QuickAction
            href="/admin/presupuestos/biblioteca"
            icon={BookOpen}
            label="Biblioteca"
          />
          <QuickAction
            href="/admin/presupuestos/solicitudes"
            icon={Inbox}
            label="Ver solicitudes"
          />
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="border border-white/10 bg-white/[.02] rounded-xl p-6">
        <h2 className="text-white/40 text-xs uppercase tracking-wider mb-4">
          Actividad reciente
        </h2>
        {actividad.length === 0 ? (
          <p className="text-white/30 text-sm">
            No hay actividad reciente. Crea tu primer presupuesto.
          </p>
        ) : (
          <div className="space-y-3">
            {actividad.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-sm text-white/60 border-b border-white/5 pb-3 last:border-0"
              >
                <div className="size-2 rounded-full bg-[#10B981]" />
                <span className="flex-1">{a.descripcion}</span>
                <span className="text-white/30 text-xs">
                  {new Date(a.fecha).toLocaleDateString('es-ES')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any
  label: string
  value: string | number
  color: 'emerald' | 'blue' | 'amber' | 'red'
}) {
  const colors = {
    emerald: 'text-[#10B981]',
    blue: 'text-blue-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
  }

  return (
    <div className="border border-white/10 bg-white/[.02] rounded-xl p-5 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[.16em] text-white/40">
            {label}
          </p>
          <strong className={`block mt-2 font-serif text-3xl ${colors[color]}`}>
            {value}
          </strong>
        </div>
        <Icon className={`size-5 ${colors[color]} opacity-60`} />
      </div>
    </div>
  )
}

function ProgressBar({
  label,
  value,
  total,
  color,
  icon: Icon,
}: {
  label: string
  value: number
  total: number
  color: string
  icon?: any
}) {
  const percent = total > 0 ? (value / total) * 100 : 0

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-3.5 text-white/40" />}
          <span className="text-white/60 text-sm">{label}</span>
        </div>
        <span className="text-white font-medium text-sm">{value}</span>
      </div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500 rounded-full"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: any
  label: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 border border-white/10 bg-white/[.02] rounded-xl p-4 hover:border-[#10B981] hover:bg-[#10B981]/5 transition-all"
    >
      <div className="size-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center group-hover:bg-[#10B981]/20 transition-colors">
        <Icon className="size-5 text-[#10B981]" />
      </div>
      <span className="text-white/70 group-hover:text-white text-sm font-medium transition-colors">
        {label}
      </span>
      <ArrowUpRight className="size-4 text-white/30 group-hover:text-[#10B981] ml-auto transition-colors" />
    </Link>
  )
}