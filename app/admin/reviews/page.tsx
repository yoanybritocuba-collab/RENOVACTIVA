'use client'

import { useEffect, useState } from 'react'
import AdminSection from '@/components/admin/AdminSection'
import { Plus, Copy, Check, Trash2, Mail, X, Send, RefreshCw, AlertCircle } from 'lucide-react'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

type ReviewCode = {
  id: number
  code: string
  cliente_nombre: string
  cliente_email: string | null
  cliente_telefono: string | null
  proyecto: string | null
  usado: boolean
  usado_at: string | null
  created_at: string
}

export default function ReviewsPage() {
  const [loading, setLoading] = useState(true)
  const [codes, setCodes] = useState<ReviewCode[]>([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // Formulario de generación
  const [form, setForm] = useState({
    cliente_nombre: '',
    cliente_email: '',
    cliente_telefono: '',
    proyecto: '',
  })
  const [generating, setGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // ⭐ NUEVO: Estado para regenerar
  const [regenerating, setRegenerating] = useState<number | null>(null)

  useEffect(() => { loadCodes() }, [])

  async function loadCodes() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/review_codes?select=*&order=created_at.desc`,
        {
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
          cache: 'no-store'
        }
      )
      if (!res.ok) throw new Error('Error al cargar códigos')
      const data = await res.json()
      setCodes(data)
    } catch (err) {
      setError('Error: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function generateCode() {
    if (!form.cliente_nombre.trim()) {
      setError('El nombre del cliente es obligatorio')
      return
    }
    setGenerating(true)
    setError('')
    setNotice('')
    setGeneratedCode(null)

    try {
      const res = await fetch('/api/reviews/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al generar')

      setGeneratedCode(data.code)
      setNotice('Código generado correctamente')
      setForm({ cliente_nombre: '', cliente_email: '', cliente_telefono: '', proyecto: '' })
      await loadCodes()
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setGenerating(false)
    }
  }

  // ⭐ NUEVO: Reenviar / regenerar código
  async function resendCode(record: ReviewCode) {
    // Si no está usado → solo copiar y avisar
    if (!record.usado) {
      await copyToClipboard(record.code)
      setNotice(`Código de ${record.cliente_nombre} copiado al portapapeles`)
      setTimeout(() => setNotice(''), 3500)
      return
    }

    // Si está usado → generar uno nuevo para el mismo cliente
    if (!confirm(
      `El código ${record.code} ya fue usado por ${record.cliente_nombre}.\n\n` +
      `¿Generar un nuevo código para que pueda dejar otra reseña?`
    )) return

    setRegenerating(record.id)
    setError('')

    try {
      const res = await fetch('/api/reviews/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_nombre: record.cliente_nombre,
          cliente_email: record.cliente_email,
          cliente_telefono: record.cliente_telefono,
          proyecto: record.proyecto,
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al regenerar')

      setGeneratedCode(data.code)
      setNotice(`Nuevo código para ${record.cliente_nombre}: ${data.code}`)
      await loadCodes()
      setTimeout(() => setNotice(''), 8000)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setRegenerating(null)
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(text)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      setError('No se pudo copiar. Copia manualmente.')
    }
  }

  async function deleteCode(id: number, code: string) {
    if (!confirm(`¿Eliminar el código ${code}? Esta acción no se puede deshacer.`)) return
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/review_codes?id=eq.${id}`, {
        method: 'DELETE',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Prefer': 'return=minimal'
        }
      })
      if (!res.ok) throw new Error('Error al eliminar')
      setCodes(codes.filter(c => c.id !== id))
      setNotice('Código eliminado')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  function buildEmailLink(record: ReviewCode): string {
    const subject = encodeURIComponent('Tu opinión sobre Renovactiva')
    const body = encodeURIComponent(
      `Hola ${record.cliente_nombre},\n\n` +
      `Gracias por confiar en Renovactiva. Tu opinión es muy importante para nosotros.\n\n` +
      `Con este código personal puedes dejar tu reseña en nuestra web:\n\n` +
      `   ${record.code}\n\n` +
      `Entra aquí: https://www.renovactiva.com/#contacto\n\n` +
      `- Pega el código en la sección "Deja tu reseña"\n` +
      `- Cuéntanos tu experiencia\n` +
      `- El código solo se puede usar una vez\n\n` +
      `¡Gracias de nuevo!\nEquipo Renovactiva`
    )
    const to = record.cliente_email || ''
    return `mailto:${to}?subject=${subject}&body=${body}`
  }

  if (loading) return <div className="min-h-screen bg-[#11110f] flex items-center justify-center text-white/50">Cargando...</div>

  return (
    <AdminSection
      title="⭐ Códigos de reseña"
      description="Genera códigos únicos para que tus clientes puedan dejar una reseña"
      error={error}
      notice={notice}
    >
      <div className="space-y-8">

        {/* FORMULARIO GENERAR CÓDIGO */}
        <div className="border border-[#d7bd77]/30 rounded-xl p-5 bg-[#d7bd77]/[.03]">
          <h3 className="text-[#d7bd77] font-serif text-lg mb-4">Generar nuevo código</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-white/50 text-xs mb-1">
                Nombre del cliente <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.cliente_nombre}
                onChange={(e) => setForm({ ...form, cliente_nombre: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none"
                placeholder="María García"
              />
            </div>

            <div>
              <label className="block text-white/50 text-xs mb-1">Email (opcional)</label>
              <input
                type="email"
                value={form.cliente_email}
                onChange={(e) => setForm({ ...form, cliente_email: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none"
                placeholder="maria@email.com"
              />
            </div>

            <div>
              <label className="block text-white/50 text-xs mb-1">Teléfono (opcional)</label>
              <input
                type="tel"
                value={form.cliente_telefono}
                onChange={(e) => setForm({ ...form, cliente_telefono: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none"
                placeholder="+34 600 000 000"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-white/50 text-xs mb-1">Proyecto (opcional)</label>
              <input
                type="text"
                value={form.proyecto}
                onChange={(e) => setForm({ ...form, proyecto: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none"
                placeholder="Reforma integral piso Eixample"
              />
            </div>
          </div>

          <button
            onClick={generateCode}
            disabled={generating || !form.cliente_nombre.trim()}
            className="mt-5 w-full flex items-center justify-center gap-2 bg-[#d7bd77] px-6 py-3 text-[#11110f] rounded-lg hover:bg-white transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="size-5" />
            {generating ? 'Generando...' : 'Generar código'}
          </button>

          {/* CÓDIGO RECIÉN GENERADO */}
          {generatedCode && (
            <div className="mt-5 p-4 rounded-xl border-2 border-[#10B77F] bg-[#10B77F]/10">
              <p className="text-[#10B77F] text-xs uppercase tracking-widest font-bold mb-2">
                ✓ Código generado
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <code className="text-2xl sm:text-3xl font-mono tracking-[0.15em] text-white bg-black/40 px-4 py-2 rounded-lg border border-[#10B77F]/40">
                  {generatedCode}
                </code>
                <button
                  onClick={() => copyToClipboard(generatedCode)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#10B77F] hover:bg-[#10B77F]/80 text-white text-sm font-medium transition-colors"
                >
                  {copiedCode === generatedCode ? (
                    <>
                      <Check className="size-4" /> Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="size-4" /> Copiar
                    </>
                  )}
                </button>
              </div>
              <p className="text-white/50 text-xs mt-3">
                Entrega este código a <strong className="text-white/70">{codes[0]?.cliente_nombre || 'tu cliente'}</strong>. Solo podrá usarlo una vez.
              </p>
            </div>
          )}
        </div>

        {/* LISTA DE CÓDIGOS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/60 text-sm font-semibold">
              Códigos generados ({codes.length})
            </h3>
            <div className="text-xs text-white/40">
              {codes.filter(c => !c.usado).length} pendientes · {codes.filter(c => c.usado).length} usados
            </div>
          </div>

          {codes.length === 0 ? (
            <div className="text-center py-12 border border-white/10 rounded-xl bg-white/[.02]">
              <p className="text-white/40 mb-2">No hay códigos generados</p>
              <p className="text-white/30 text-sm">Genera el primero con el formulario de arriba</p>
            </div>
          ) : (
            <div className="space-y-2">
              {codes.map((record) => (
                <div
                  key={record.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl border transition-colors ${
                    record.usado
                      ? 'border-white/5 bg-white/[.01] opacity-70'
                      : 'border-[#10B77F]/30 bg-[#10B77F]/[.03]'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <code className="font-mono text-base tracking-wider text-white">
                        {record.code}
                      </code>
                      {record.usado ? (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                          Usado
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#10B77F]/20 text-[#10B77F]">
                          Pendiente
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/70 mt-1 truncate">
                      {record.cliente_nombre}
                      {record.proyecto && <span className="text-white/40"> · {record.proyecto}</span>}
                    </p>
                    {(record.cliente_email || record.cliente_telefono) && (
                      <p className="text-xs text-white/40 mt-0.5 truncate">
                        {record.cliente_email}
                        {record.cliente_email && record.cliente_telefono && ' · '}
                        {record.cliente_telefono}
                      </p>
                    )}
                    <p className="text-[10px] text-white/30 mt-1">
                      Creado: {new Date(record.created_at).toLocaleDateString('es-ES')}
                      {record.usado_at && ` · Usado: ${new Date(record.usado_at).toLocaleDateString('es-ES')}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    {/* ⭐ NUEVO: Botón Reenviar / Regenerar */}
                    <button
                      onClick={() => resendCode(record)}
                      disabled={regenerating === record.id}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        record.usado
                          ? 'border border-[#d7bd77]/40 bg-[#d7bd77]/10 text-[#d7bd77] hover:bg-[#d7bd77]/20'
                          : 'border border-[#10B77F]/40 bg-[#10B77F]/10 text-[#10B77F] hover:bg-[#10B77F]/20'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={record.usado
                        ? 'Generar nuevo código para este cliente'
                        : 'Copiar código (aún no usado)'}
                    >
                      <RefreshCw className={`size-3.5 ${regenerating === record.id ? 'animate-spin' : ''}`} />
                      {regenerating === record.id
                        ? 'Generando...'
                        : record.usado
                          ? 'Regenerar'
                          : 'Recuperar'}
                    </button>

                    {!record.usado && (
                      <>
                        <button
                          onClick={() => copyToClipboard(record.code)}
                          className="p-2 rounded-lg border border-white/10 hover:border-[#d7bd77]/50 hover:bg-[#d7bd77]/10 text-white/60 hover:text-[#d7bd77] transition-colors"
                          title="Copiar código"
                        >
                          {copiedCode === record.code ? <Check className="size-4" /> : <Copy className="size-4" />}
                        </button>
                        <a
                          href={buildEmailLink(record)}
                          className="p-2 rounded-lg border border-white/10 hover:border-[#10B77F]/50 hover:bg-[#10B77F]/10 text-white/60 hover:text-[#10B77F] transition-colors"
                          title="Enviar por email"
                        >
                          <Mail className="size-4" />
                        </a>
                      </>
                    )}
                    <button
                      onClick={() => deleteCode(record.id, record.code)}
                      className="p-2 rounded-lg border border-white/10 hover:border-red-500/50 hover:bg-red-500/10 text-white/60 hover:text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </AdminSection>
  )
}