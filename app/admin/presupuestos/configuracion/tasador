'use client'

import { useEffect, useState } from 'react'
import {
  Save,
  Calculator,
  Ruler,
  Home,
  Sparkles,
  MapPin,
  Plus,
  Trash2,
  DollarSign,
  Percent,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Building2,
  Package,
} from 'lucide-react'
import { sbGet, sbPatch, sbPost } from '@/lib/presupuestos/supabase'

// ============================================================
// TIPOS
// ============================================================
type ConfigTasador = {
  id?: string
  precio_base_m2: number
  precio_por_estancia: number
  multiplicador_calidad_basica: number
  multiplicador_calidad_media: number
  multiplicador_calidad_alta: number
  zona_centro: number
  zona_periferia: number
  zona_intermedia: number
  rango_variacion: number
  precio_minimo: number
  iva: number
  activo: boolean
}

type Extra = {
  id?: string
  nombre: string
  precio: number
  activo: boolean
}

// ============================================================
// VALORES POR DEFECTO
// ============================================================
const DEFAULT_CONFIG: ConfigTasador = {
  precio_base_m2: 450,
  precio_por_estancia: 3500,
  multiplicador_calidad_basica: 0.8,
  multiplicador_calidad_media: 1.0,
  multiplicador_calidad_alta: 1.4,
  zona_centro: 1.2,
  zona_periferia: 0.9,
  zona_intermedia: 1.0,
  rango_variacion: 15,
  precio_minimo: 3000,
  iva: 21,
  activo: true,
}

const DEFAULT_EXTRAS: Extra[] = [
  { nombre: 'Fontanería', precio: 2500, activo: true },
  { nombre: 'Electricidad', precio: 1800, activo: true },
  { nombre: 'Climatización', precio: 3200, activo: true },
  { nombre: 'Carpintería a medida', precio: 2800, activo: true },
  { nombre: 'Cambio de ventanas', precio: 3500, activo: false },
  { nombre: 'Pintura completa', precio: 1500, activo: true },
]

// ============================================================
// PÁGINA
// ============================================================
export default function ConfiguracionTasador() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [config, setConfig] = useState<ConfigTasador>(DEFAULT_CONFIG)
  const [extras, setExtras] = useState<Extra[]>([])
  const [nuevoExtra, setNuevoExtra] = useState({ nombre: '', precio: 0 })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const rows = await sbGet('tasador_config', 'select=*').catch(() => [])
      if (rows && rows.length > 0) {
        setConfig({ ...DEFAULT_CONFIG, ...rows[0] })
      }
      const ex = await sbGet('tasador_extras', 'select=*&order=id.asc').catch(() => [])
      if (ex && ex.length > 0) {
        setExtras(ex)
      } else {
        setExtras(DEFAULT_EXTRAS)
      }
    } catch (err) {
      console.error('Error al cargar:', err)
    } finally {
      setLoading(false)
    }
  }

  async function guardarConfig() {
    setSaving(true)
    setError('')
    setNotice('')
    try {
      if (config.id) {
        await sbPatch('tasador_config', config.id, config)
      } else {
        const creado = await sbPost('tasador_config', config)
        if (Array.isArray(creado) && creado.length > 0) {
          setConfig({ ...config, id: creado[0].id })
        }
      }

      // Guardar extras (solo los nuevos que no tengan id)
      for (const ex of extras) {
        if (!ex.id) {
          await sbPost('tasador_extras', ex)
        }
      }

      setNotice('✅ Configuración guardada correctamente')
    } catch (err) {
      setError('❌ Error al guardar: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function guardarExtra(index: number) {
    const ex = extras[index]
    if (!ex.id) return
    try {
      await sbPatch('tasador_extras', ex.id, ex)
    } catch (err) {
      setError('Error al guardar extra')
    }
  }

  async function eliminarExtra(index: number) {
    const ex = extras[index]
    if (ex.id) {
      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://izvllvunpjryeowponti.supabase.co'}/rest/v1/tasador_extras?id=eq.${ex.id}`,
          {
            method: 'DELETE',
            headers: {
              'apikey': 'sb_publishable_acJOTZ5reUCVCpJ_vK36ZA_q2bEIhoo',
              'Authorization': `Bearer sb_publishable_acJOTZ5reUCVCpJ_vK36ZA_q2bEIhoo`,
            },
          }
        )
      } catch {}
    }
    setExtras(extras.filter((_, i) => i !== index))
  }

  function añadirExtra() {
    if (!nuevoExtra.nombre.trim()) return
    setExtras([...extras, { ...nuevoExtra, activo: true }])
    setNuevoExtra({ nombre: '', precio: 0 })
  }

  function updateConfig<K extends keyof ConfigTasador>(key: K, value: ConfigTasador[K]) {
    setConfig({ ...config, [key]: value })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white/50">
        Cargando configuración...
      </div>
    )
  }

  // Ejemplo de cálculo con los valores actuales
  const ejemploM2 = 100
  const ejemploEstancias = 4
  const ejemploBase = config.precio_base_m2 * ejemploM2 + config.precio_por_estancia * ejemploEstancias
  const ejemploMedio = ejemploBase * config.multiplicador_calidad_media
  const ejemploAlto = ejemploBase * config.multiplicador_calidad_alta
  const ejemploBajo = ejemploBase * config.multiplicador_calidad_basica

  return (
    <div className="p-6 lg:p-10 max-w-6xl mx-auto">
      {/* Cabecera */}
      <header className="mb-10">
        <p className="text-[10px] uppercase tracking-[.2em] text-[#10B981]">
          Configuración · Tasador
        </p>
        <h1 className="font-serif text-3xl mt-1">Configuración del Tasador</h1>
        <p className="text-white/40 text-sm mt-2 max-w-2xl">
          Define aquí los precios base que el pre-presupuesto utilizará para dar una estimación
          aproximada a los clientes desde la web pública.
        </p>
      </header>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
          <AlertCircle className="size-4" />
          {error}
        </div>
      )}
      {notice && (
        <div className="bg-[#10B981]/10 border border-[#10B981]/40 text-[#10B981] px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
          <CheckCircle2 className="size-4" />
          {notice}
        </div>
      )}

      {/* Vista previa del cálculo */}
      <div className="bg-gradient-to-br from-[#10B981]/10 to-transparent border border-[#10B981]/20 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Calculator className="size-5 text-[#10B981]" />
          <h2 className="text-white font-medium">Vista previa del cálculo</h2>
        </div>
        <p className="text-white/50 text-xs mb-4">
          Ejemplo: 100 m² · 4 estancias · Calidad media
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PreviewCard
            label="Calidad baja"
            value={ejemploBajo}
            variacion={config.rango_variacion}
            color="#6b7280"
          />
          <PreviewCard
            label="Calidad media"
            value={ejemploMedio}
            variacion={config.rango_variacion}
            color="#3b82f6"
            destacado
          />
          <PreviewCard
            label="Calidad alta"
            value={ejemploAlto}
            variacion={config.rango_variacion}
            color="#10B981"
          />
        </div>
      </div>

      {/* Sección 1: Precios base */}
      <Section
        icon={Ruler}
        title="Precios base"
        description="Cuánto vale cada unidad de trabajo"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <NumberField
            label="Precio base por m²"
            value={config.precio_base_m2}
            onChange={(v) => updateConfig('precio_base_m2', v)}
            suffix="€ / m²"
            icon={Ruler}
          />
          <NumberField
            label="Precio por estancia"
            value={config.precio_por_estancia}
            onChange={(v) => updateConfig('precio_por_estancia', v)}
            suffix="€ / estancia"
            icon={Home}
          />
        </div>
      </Section>

      {/* Sección 2: Calidad */}
      <Section
        icon={Sparkles}
        title="Multiplicadores por calidad"
        description="El precio base se multiplica según la calidad elegida"
      >
        <div className="space-y-5">
          <SliderField
            label="Calidad básica"
            value={config.multiplicador_calidad_basica}
            min={0.5}
            max={1.5}
            step={0.05}
            onChange={(v) => updateConfig('multiplicador_calidad_basica', v)}
            color="#6b7280"
          />
          <SliderField
            label="Calidad media"
            value={config.multiplicador_calidad_media}
            min={0.5}
            max={1.5}
            step={0.05}
            onChange={(v) => updateConfig('multiplicador_calidad_media', v)}
            color="#3b82f6"
          />
          <SliderField
            label="Calidad alta"
            value={config.multiplicador_calidad_alta}
            min={0.5}
            max={2}
            step={0.05}
            onChange={(v) => updateConfig('multiplicador_calidad_alta', v)}
            color="#10B981"
          />
        </div>
      </Section>

      {/* Sección 3: Zonas */}
      <Section
        icon={MapPin}
        title="Recargos por zona"
        description="Ajusta el precio según la ubicación de la obra"
      >
        <div className="space-y-5">
          <SliderField
            label="Centro"
            value={config.zona_centro}
            min={0.5}
            max={1.5}
            step={0.05}
            onChange={(v) => updateConfig('zona_centro', v)}
            color="#10B981"
          />
          <SliderField
            label="Zona intermedia"
            value={config.zona_intermedia}
            min={0.5}
            max={1.5}
            step={0.05}
            onChange={(v) => updateConfig('zona_intermedia', v)}
            color="#3b82f6"
          />
          <SliderField
            label="Periferia"
            value={config.zona_periferia}
            min={0.5}
            max={1.5}
            step={0.05}
            onChange={(v) => updateConfig('zona_periferia', v)}
            color="#6b7280"
          />
        </div>
      </Section>

      {/* Sección 4: Extras */}
      <Section
        icon={Package}
        title="Extras disponibles"
        description="Servicios adicionales que el cliente puede seleccionar"
      >
        <div className="space-y-3 mb-5">
          {extras.map((ex, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white/[.02] border border-white/10 rounded-lg p-3"
            >
              <input
                type="checkbox"
                checked={ex.activo}
                onChange={(e) => {
                  const nuevos = [...extras]
                  nuevos[i].activo = e.target.checked
                  setExtras(nuevos)
                }}
                className="size-4 accent-[#10B981]"
              />
              <input
                type="text"
                value={ex.nombre}
                onChange={(e) => {
                  const nuevos = [...extras]
                  nuevos[i].nombre = e.target.value
                  setExtras(nuevos)
                }}
                onBlur={() => guardarExtra(i)}
                className="flex-1 bg-transparent text-white text-sm outline-none border-b border-transparent focus:border-[#10B981] pb-1 transition-colors"
                placeholder="Nombre del extra"
              />
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={ex.precio}
                  onChange={(e) => {
                    const nuevos = [...extras]
                    nuevos[i].precio = Number(e.target.value)
                    setExtras(nuevos)
                  }}
                  onBlur={() => guardarExtra(i)}
                  className="w-24 bg-transparent text-white text-sm text-right outline-none border-b border-transparent focus:border-[#10B981] pb-1 transition-colors"
                />
                <span className="text-white/40 text-sm">€</span>
              </div>
              <button
                onClick={() => eliminarExtra(i)}
                className="p-2 text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Añadir extra */}
        <div className="flex items-center gap-3 bg-white/[.02] border border-dashed border-white/20 rounded-lg p-3">
          <input
            type="text"
            value={nuevoExtra.nombre}
            onChange={(e) => setNuevoExtra({ ...nuevoExtra, nombre: e.target.value })}
            placeholder="Nombre del nuevo extra"
            className="flex-1 bg-transparent text-white text-sm outline-none"
          />
          <input
            type="number"
            value={nuevoExtra.precio}
            onChange={(e) => setNuevoExtra({ ...nuevoExtra, precio: Number(e.target.value) })}
            placeholder="0"
            className="w-24 bg-transparent text-white text-sm text-right outline-none"
          />
          <span className="text-white/40 text-sm">€</span>
          <button
            onClick={añadirExtra}
            className="flex items-center gap-1 bg-[#10B981] text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-[#10B981]/80 transition-colors"
          >
            <Plus className="size-3.5" />
            Añadir
          </button>
        </div>
      </Section>

      {/* Sección 5: Reglas del rango */}
      <Section
        icon={Percent}
        title="Rango y límites"
        description="Cómo se muestra el rango al cliente"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <NumberField
            label="Rango de variación"
            value={config.rango_variacion}
            onChange={(v) => updateConfig('rango_variacion', v)}
            suffix="%"
            icon={Percent}
          />
          <NumberField
            label="Precio mínimo"
            value={config.precio_minimo}
            onChange={(v) => updateConfig('precio_minimo', v)}
            suffix="€"
            icon={DollarSign}
          />
          <NumberField
            label="IVA aplicable"
            value={config.iva}
            onChange={(v) => updateConfig('iva', v)}
            suffix="%"
            icon={TrendingUp}
          />
        </div>
        <p className="text-white/30 text-xs mt-4">
          El rango mostrará al cliente: precio estimado ± {config.rango_variacion}%.
          Si el resultado es inferior a {config.precio_minimo} €, se mostrará el precio mínimo.
        </p>
      </Section>

      {/* Botón guardar */}
      <div className="flex items-center justify-end gap-3 mt-10 pt-6 border-t border-white/10">
        <button
          onClick={guardarConfig}
          disabled={saving}
          className="flex items-center gap-2 bg-[#10B981] text-white px-6 py-3 rounded-xl hover:bg-[#10B981]/80 transition-colors font-medium text-sm disabled:opacity-50"
        >
          <Save className="size-4" />
          {saving ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </div>
    </div>
  )
}

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: any
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="border border-white/10 bg-white/[.02] rounded-2xl p-6 mb-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="size-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
          <Icon className="size-5 text-[#10B981]" />
        </div>
        <div>
          <h3 className="text-white font-medium">{title}</h3>
          {description && <p className="text-white/40 text-xs mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
  icon: Icon,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  suffix?: string
  icon?: any
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </label>
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus-within:border-[#10B981] transition-colors">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-transparent text-white text-sm outline-none"
        />
        {suffix && <span className="text-white/40 text-sm whitespace-nowrap">{suffix}</span>}
      </div>
    </div>
  )
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  color,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  color: string
}) {
  const percent = ((value - min) / (max - min)) * 100
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/60 text-sm">{label}</span>
        <span className="text-white font-medium text-sm">
          × {value.toFixed(2)}
        </span>
      </div>
      <div className="relative">
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percent}%`, backgroundColor: color }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  )
}

function PreviewCard({
  label,
  value,
  variacion,
  color,
  destacado,
}: {
  label: string
  value: number
  variacion: number
  color: string
  destacado?: boolean
}) {
  const min = value * (1 - variacion / 100)
  const max = value * (1 + variacion / 100)

  return (
    <div
      className={`rounded-xl p-4 border ${
        destacado ? 'border-[#10B981]/40 bg-[#10B981]/5' : 'border-white/10 bg-white/[.02]'
      }`}
    >
      <p className="text-white/50 text-xs uppercase tracking-wider mb-2">{label}</p>
      <p className="text-2xl font-serif" style={{ color }}>
        {Math.round(value).toLocaleString('es-ES')} €
      </p>
      <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full" style={{ width: '100%', backgroundColor: color, opacity: 0.6 }} />
      </div>
      <p className="text-white/30 text-[10px] mt-2">
        Rango: {Math.round(min).toLocaleString('es-ES')} € – {Math.round(max).toLocaleString('es-ES')} €
      </p>
    </div>
  )
}