'use client'

import { useEffect, useState } from 'react'
import AdminSection from '@/components/admin/AdminSection'
import { useTranslation } from '@/lib/useTranslation'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const { translate } = useTranslation()

  const [data, setData] = useState<any>({
    id: '',
    content: {
      sectionTitle: { eyebrow: '', title: '', titleItalic: '' },
      translations: { sectionTitle: { eyebrow: '', title: '', titleItalic: '' } }
    }
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?section=eq.projects&select=*`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      })
      if (!res.ok) throw new Error('Error al cargar')
      const result = await res.json()
      if (result.length > 0) {
        const projects = result[0]
        const c = projects.content || {}
        setData({
          id: projects.id,
          content: {
            sectionTitle: c.sectionTitle || { eyebrow: '', title: '', titleItalic: '' },
            translations: c.translations || { sectionTitle: { eyebrow: '', title: '', titleItalic: '' } }
          }
        })
      }
    } catch (err) { setError('Error: ' + (err as Error).message) }
    finally { setLoading(false) }
  }

  async function translateField(esValue: string | undefined): Promise<string> {
    if (!esValue || !esValue.trim()) return ''
    try { return await translate(esValue, 'ca') } catch { return '' }
  }

  async function saveData() {
    setSaving(true); setError(''); setNotice('🌐 Traduciendo y guardando...')
    try {
      const contentToSave = { ...data.content }

      // 🔥 Traducir SIEMPRE desde ES
      contentToSave.translations = {
        ...contentToSave.translations,
        sectionTitle: {
          eyebrow: await translateField(data.content.sectionTitle.eyebrow),
          title: await translateField(data.content.sectionTitle.title),
          titleItalic: await translateField(data.content.sectionTitle.titleItalic),
        }
      }

      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?id=eq.${data.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ content: contentToSave, updated_at: new Date().toISOString() })
      })

      if (!res.ok) throw new Error('Error al guardar')
      setData({ ...data, content: contentToSave })

      try { await fetch('/api/revalidate', { method: 'POST' }) } catch {}

      setNotice('✅ Proyectos guardados y traducidos')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError('❌ ' + (err as Error).message)
    } finally { setSaving(false) }
  }

  function updateField(key: string, value: string) {
    setData({ ...data, content: { ...data.content, sectionTitle: { ...data.content.sectionTitle, [key]: value } } })
  }

  if (loading) return <div className="min-h-screen bg-[#11110f] flex items-center justify-center text-white/50">Cargando...</div>

  return (
    <AdminSection
      title="Proyectos"
      description="Edita los textos de la sección. El catalán se genera automáticamente al guardar."
      onSave={saveData}
      saving={saving}
      error={error}
      notice={notice}
    >
      <div className="space-y-6">
        <div className="border border-white/10 rounded-xl p-5 bg-white/[.02]">
          <h3 className="text-white/60 text-sm font-semibold mb-4">Textos de la sección (Español)</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-white/50 text-xs mb-1">Eyebrow (ES)</label>
              <input type="text" value={data.content.sectionTitle.eyebrow || ''} onChange={(e) => updateField('eyebrow', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="Una selección" />
              <p className="text-white/30 text-xs mt-1 italic">CA (auto): {data.content.translations?.sectionTitle?.eyebrow || '—'}</p>
            </div>

            <div>
              <label className="block text-white/50 text-xs mb-1">Título (ES)</label>
              <input type="text" value={data.content.sectionTitle.title || ''} onChange={(e) => updateField('title', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="El resultado" />
              <p className="text-white/30 text-xs mt-1 italic">CA (auto): {data.content.translations?.sectionTitle?.title || '—'}</p>
            </div>

            <div>
              <label className="block text-white/50 text-xs mb-1">Título en cursiva (ES)</label>
              <input type="text" value={data.content.sectionTitle.titleItalic || ''} onChange={(e) => updateField('titleItalic', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="habla por sí solo." />
              <p className="text-white/30 text-xs mt-1 italic">CA (auto): {data.content.translations?.sectionTitle?.titleItalic || '—'}</p>
            </div>
          </div>
        </div>

        <div className="border border-[#d7bd77]/30 rounded-xl p-5 bg-[#d7bd77]/5">
          <p className="text-[#d7bd77] text-xs mb-2 font-semibold">IMPORTANTE</p>
          <p className="text-white/60 text-xs leading-relaxed">
            Los <strong className="text-white/90">trabajos individuales</strong> se editan en <strong className="text-white/90">/admin/trabajos</strong>.
            Aquí solo se editan los <strong className="text-white/90">textos de la cabecera</strong>.
          </p>
        </div>
      </div>
    </AdminSection>
  )
}