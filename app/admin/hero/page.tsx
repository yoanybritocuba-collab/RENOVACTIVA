'use client'

import { useEffect, useState } from 'react'
import AdminSection from '@/components/admin/AdminSection'
import ImageUploader from '@/components/admin/ImageUploader'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'sb_publishable_acJOTZ5reUCVCpJ_vK36ZA_q2bEIhIo'

export default function HeroPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [data, setData] = useState({
    id: '',
    content: { eyebrow: '', title: '', description: '', cta: '', images: [] as string[] }
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?section=eq.hero&select=*`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      })
      if (!res.ok) throw new Error('Error al cargar')
      const result = await res.json()
      if (result.length > 0) setData(result[0])
    } catch (err) { setError('Error: ' + (err as Error).message) }
    finally { setLoading(false) }
  }

  async function saveData() {
    setSaving(true); setError(''); setNotice('')
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?id=eq.${data.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ content: data.content, updated_at: new Date().toISOString() })
      })
      if (!res.ok) throw new Error('Error al guardar')
      setNotice('✅ Hero guardado correctamente')
    } catch (err) { setError('❌ ' + (err as Error).message) }
    finally { setSaving(false) }
  }

  function updateField(key: string, value: string) {
    setData({ ...data, content: { ...data.content, [key]: value } })
  }

  if (loading) return <div className="min-h-screen bg-[#11110f] flex items-center justify-center text-white/50">Cargando...</div>

  return (
    <AdminSection
      title="🏠 Hero"
      description="Edita la portada principal"
      onSave={saveData}
      saving={saving}
      error={error}
      notice={notice}
    >
      <div className="space-y-6">
        {/* Imágenes */}
        <div className="border-b border-white/10 pb-6">
          <h3 className="text-white/60 text-sm font-semibold mb-4">🖼️ Imágenes del Hero</h3>
          <ImageUploader
            images={data.content.images || []}
            onChange={(images) => setData({ ...data, content: { ...data.content, images } })}
            folder="hero"
            maxImages={20}
          />
        </div>

        {/* Textos */}
        <div className="space-y-4">
          <h3 className="text-white/60 text-sm font-semibold">✏️ Textos</h3>

          <div>
            <label className="block text-white/50 text-sm mb-1">Eyebrow</label>
            <input
              type="text"
              value={data.content.eyebrow || ''}
              onChange={(e) => updateField('eyebrow', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm"
              placeholder="Arquitectura · Interiorismo · Construcción"
            />
          </div>

          <div>
            <label className="block text-white/50 text-sm mb-1">Título</label>
            <input
              type="text"
              value={data.content.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm"
              placeholder="Espacios que trascienden."
            />
          </div>

          <div>
            <label className="block text-white/50 text-sm mb-1">Descripción</label>
            <textarea
              value={data.content.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm resize-y"
              placeholder="Reformas de alto nivel..."
            />
          </div>

          <div>
            <label className="block text-white/50 text-sm mb-1">Texto del botón</label>
            <input
              type="text"
              value={data.content.cta || ''}
              onChange={(e) => updateField('cta', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm"
              placeholder="Hablemos de tu proyecto"
            />
          </div>
        </div>
      </div>
    </AdminSection>
  )
}