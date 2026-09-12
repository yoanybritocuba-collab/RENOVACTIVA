'use client'

import { useEffect, useState } from 'react'
import {
  Save,
  Building2,
  Phone,
  Mail,
  Globe,
  MapPin,
  FileText,
  CreditCard,
  Percent,
  Image as ImageIcon,
  Share2,
  AlertCircle,
  CheckCircle2,
  Hash,
} from 'lucide-react'
import { sbGet, sbPatch, sbPost } from '@/lib/presupuestos/supabase'

type EmpresaConfig = {
  id?: string
  nombre_comercial: string
  razon_social: string
  cif: string
  logo_url: string
  telefono: string
  whatsapp: string
  email: string
  web: string
  direccion: string
  codigo_postal: string
  ciudad: string
  provincia: string
  pais: string
  iva: number
  prefijo_presupuesto: string
  numeracion_inicial: number
  validez_dias: number
  condiciones_pago: string
  garantia: string
  texto_legal: string
  firma_url: string
  instagram: string
  linkedin: string
  youtube: string
  facebook: string
  color_principal: string
}

const DEFAULT: EmpresaConfig = {
  nombre_comercial: 'Renovactiva',
  razon_social: 'Renovactiva SL',
  cif: '',
  logo_url: '',
  telefono: '',
  whatsapp: '',
  email: 'info@renovactiva.com',
  web: 'renovactiva.com',
  direccion: '',
  codigo_postal: '',
  ciudad: 'Barcelona',
  provincia: 'Barcelona',
  pais: 'España',
  iva: 21,
  prefijo_presupuesto: 'PRE',
  numeracion_inicial: 1000,
  validez_dias: 30,
  condiciones_pago: '50% al aceptar, 50% al finalizar',
  garantia: '2 años en instalaciones, 1 año en acabados',
  texto_legal: '',
  firma_url: '',
  instagram: '',
  linkedin: '',
  youtube: '',
  facebook: '',
  color_principal: '#10B981',
}

export default function ConfiguracionEmpresa() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [data, setData] = useState<EmpresaConfig>(DEFAULT)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const rows = await sbGet('empresa_config', 'select=*').catch(() => [])
      if (rows && rows.length > 0) {
        setData({ ...DEFAULT, ...rows[0] })
      }
    } catch (err) {
      console.error('Error al cargar:', err)
    } finally {
      setLoading(false)
    }
  }

  async function guardar() {
    setSaving(true); setError(''); setNotice('')
    try {
      if (data.id) {
        await sbPatch('empresa_config', data.id, data)
      } else {
        const creado = await sbPost('empresa_config', data)
        if (Array.isArray(creado) && creado.length > 0) {
          setData({ ...data, id: creado[0].id })
        }
      }
      setNotice('✅ Datos de empresa guardados correctamente')
    } catch (err) {
      setError('❌ Error al guardar: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  function update<K extends keyof EmpresaConfig>(key: K, value: EmpresaConfig[K]) {
    setData({ ...data, [key]: value })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white/50">
        Cargando configuración...
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto">
      <header className="mb-10">
        <p className="text-[10px] uppercase tracking-[.2em] text-[#10B981]">
          Configuración · Empresa
        </p>
        <h1 className="font-serif text-3xl mt-1">Datos de la Empresa</h1>
        <p className="text-white/40 text-sm mt-2 max-w-2xl">
          Estos datos aparecerán en todos los presupuestos oficiales y en el PDF profesional.
        </p>
      </header>

      {error && (
        <div className="bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
          <AlertCircle className="size-4" /> {error}
        </div>
      )}
      {notice && (
        <div className="bg-[#10B981]/10 border border-[#10B981]/40 text-[#10B981] px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
          <CheckCircle2 className="size-4" /> {notice}
        </div>
      )}

      {/* Datos fiscales */}
      <Section icon={Building2} title="Datos fiscales" description="Información legal de la empresa">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <TextField label="Nombre comercial" value={data.nombre_comercial} onChange={(v) => update('nombre_comercial', v)} />
          <TextField label="Razón social" value={data.razon_social} onChange={(v) => update('razon_social', v)} />
          <TextField label="CIF / NIF" value={data.cif} onChange={(v) => update('cif', v)} />
          <TextField label="Color principal" value={data.color_principal} onChange={(v) => update('color_principal', v)} icon={Percent} />
        </div>
      </Section>

      {/* Logo y firma */}
      <Section icon={ImageIcon} title="Logo y firma" description="Imágenes que aparecerán en el PDF">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <TextField label="URL del logo" value={data.logo_url} onChange={(v) => update('logo_url', v)} placeholder="https://..." />
          <TextField label="URL de la firma" value={data.firma_url} onChange={(v) => update('firma_url', v)} placeholder="https://..." />
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-center min-h-[100px]">
            {data.logo_url ? (
              <img src={data.logo_url} alt="Logo" className="max-h-20 object-contain" />
            ) : (
              <p className="text-white/30 text-xs">Sin logo</p>
            )}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-center min-h-[100px]">
            {data.firma_url ? (
              <img src={data.firma_url} alt="Firma" className="max-h-20 object-contain" />
            ) : (
              <p className="text-white/30 text-xs">Sin firma</p>
            )}
          </div>
        </div>
      </Section>

      {/* Contacto */}
      <Section icon={Phone} title="Contacto" description="Cómo pueden contactar contigo">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <TextField label="Teléfono" value={data.telefono} onChange={(v) => update('telefono', v)} icon={Phone} />
          <TextField label="WhatsApp" value={data.whatsapp} onChange={(v) => update('whatsapp', v)} icon={Phone} />
          <TextField label="Email" value={data.email} onChange={(v) => update('email', v)} icon={Mail} />
          <TextField label="Web" value={data.web} onChange={(v) => update('web', v)} icon={Globe} />
        </div>
      </Section>

      {/* Dirección */}
      <Section icon={MapPin} title="Dirección" description="Ubicación fiscal">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <TextField label="Dirección" value={data.direccion} onChange={(v) => update('direccion', v)} />
          <TextField label="Código postal" value={data.codigo_postal} onChange={(v) => update('codigo_postal', v)} />
          <TextField label="Ciudad" value={data.ciudad} onChange={(v) => update('ciudad', v)} />
          <TextField label="Provincia" value={data.provincia} onChange={(v) => update('provincia', v)} />
          <TextField label="País" value={data.pais} onChange={(v) => update('pais', v)} />
        </div>
      </Section>

      {/* Presupuestos */}
      <Section icon={FileText} title="Presupuestos" description="Configuración de numeración y validez">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <TextField label="Prefijo" value={data.prefijo_presupuesto} onChange={(v) => update('prefijo_presupuesto', v)} icon={Hash} />
          <NumberField label="Numeración inicial" value={data.numeracion_inicial} onChange={(v) => update('numeracion_inicial', v)} />
          <NumberField label="Validez (días)" value={data.validez_dias} onChange={(v) => update('validez_dias', v)} />
          <NumberField label="IVA por defecto" value={data.iva} onChange={(v) => update('iva', v)} suffix="%" />
        </div>
      </Section>

      {/* Condiciones */}
      <Section icon={CreditCard} title="Condiciones y garantía" description="Textos que aparecerán en el presupuesto">
        <div className="space-y-5">
          <TextArea label="Condiciones de pago" value={data.condiciones_pago} onChange={(v) => update('condiciones_pago', v)} />
          <TextArea label="Garantía" value={data.garantia} onChange={(v) => update('garantia', v)} />
          <TextArea label="Texto legal" value={data.texto_legal} onChange={(v) => update('texto_legal', v)} />
        </div>
      </Section>

      {/* Redes sociales */}
      <Section icon={Share2} title="Redes sociales" description="Enlaces que aparecerán en el PDF">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <TextField label="Instagram" value={data.instagram} onChange={(v) => update('instagram', v)} />
          <TextField label="LinkedIn" value={data.linkedin} onChange={(v) => update('linkedin', v)} />
          <TextField label="YouTube" value={data.youtube} onChange={(v) => update('youtube', v)} />
          <TextField label="Facebook" value={data.facebook} onChange={(v) => update('facebook', v)} />
        </div>
      </Section>

      {/* Guardar */}
      <div className="flex items-center justify-end gap-3 mt-10 pt-6 border-t border-white/10">
        <button
          onClick={guardar}
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
// COMPONENTES
// ============================================================

function Section({ icon: Icon, title, description, children }: any) {
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

function TextField({ label, value, onChange, placeholder, icon: Icon }: any) {
  return (
    <div>
      <label className="flex items-center gap-2 text-white/60 text-sm mb-2">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-[#10B981] outline-none transition-colors"
      />
    </div>
  )
}

function NumberField({ label, value, onChange, suffix }: any) {
  return (
    <div>
      <label className="block text-white/60 text-sm mb-2">{label}</label>
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus-within:border-[#10B981] transition-colors">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-transparent text-white text-sm outline-none"
        />
        {suffix && <span className="text-white/40 text-sm">{suffix}</span>}
      </div>
    </div>
  )
}

function TextArea({ label, value, onChange }: any) {
  return (
    <div>
      <label className="block text-white/60 text-sm mb-2">{label}</label>
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-[#10B981] outline-none resize-y transition-colors"
      />
    </div>
  )
}