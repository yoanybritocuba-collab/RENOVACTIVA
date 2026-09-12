'use client'

import { useEffect, useState } from 'react'
import AdminSection from '@/components/admin/AdminSection'
import { Trash2, Plus, Image as ImageIcon } from 'lucide-react'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'sb_publishable_acJOTZ5reUCVCpJ_vK36ZA_q2bEIhoo'

export default function HeroPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [data, setData] = useState({
    id: '',
    content: { eyebrow: '', title: '', description: '', cta: '', images: ['', '', ''] }
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
      else setError('No hay datos de Hero. Ejecuta el SQL en Supabase.')
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
      setNotice('✅ Hero guardado')
    } catch (err) { setError('❌ ' + (err as Error).message) }
    finally { setSaving(false) }
  }

  function updateField(key: string, value: string) {
    setData({ ...data, content: { ...data.content, [key]: value } })
  }

  function updateImage(i: number, value: string) {
    const newImages = [...data.content.images]
    newImages[i] = value
    setData({ ...data, content: { ...data.content, images: newImages } })
  }

  function addImage() {
    if (data.content.images.length < 10) {
      setData({ ...data, content: { ...data.content, images: [...data.content.images, ''] } })
    }
  }

  function removeImage(i: number) {
    if (data.content.images.length > 1) {
      setData({ ...data, content: { ...data.content, images: data.content.images.filter((_, idx) => idx !== i) } })
    }
  }

  if (loading) return <div className="min-h-screen bg-[#11110f] flex items-center justify-center text-white/50">Cargando...</div>

  return (
    <AdminSection title="🏠 Hero" description="Edita la portada principal" onSave={saveData} saving={saving} error={error} notice={notice}>
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white/60 text-sm font-semibold">🖼️ Imágenes ({data.content.images.length})</h3>
            {data.content.images.length < 10 && (
              <button onClick={addImage} className="flex items-center gap-1 text-[#d7bd77] hover:text-white text-sm">
                <Plus className="size-4" /> Añadir
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {data.content.images.map((img, i) => (
              <div key={i} className="relative group">
                <div className="aspect-video bg-white/5 rounded-lg overflow-hidden border border-white/10">
                  {img ? <img src={img} alt={`Slide ${i+1}`} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/20"><ImageIcon className="size-6" /></div>}
                </div>
                <button onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1 bg-red-500/80 rounded opacity-0 group-hover:opacity-100" disabled={data.content.images.length <= 1}>
                  <Trash2 className="size-3.5 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-white/10">
          <div>
            <label className="block text-white/50 text-sm mb-1">Eyebrow</label>
            <input type="text" value={data.content.eyebrow || ''} onChange={(e) => updateField('eyebrow', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" />
          </div>
          <div>
            <label className="block text-white/50 text-sm mb-1">Título</label>
            <input type="text" value={data.content.title || ''} onChange={(e) => updateField('title', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" />
          </div>
          <div>
            <label className="block text-white/50 text-sm mb-1">Descripción</label>
            <textarea value={data.content.description || ''} onChange={(e) => updateField('description', e.target.value)} rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm resize-y" />
          </div>
          <div>
            <label className="block text-white/50 text-sm mb-1">Texto del botón</label>
            <input type="text" value={data.content.cta || ''} onChange={(e) => updateField('cta', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" />
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-white/10">
          <h3 className="text-white/60 text-sm font-semibold">🔗 URLs de las imágenes</h3>
          {data.content.images.map((img, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-white/30 text-xs w-5 text-right">{i+1}.</span>
              <input type="text" value={img} onChange={(e) => updateImage(i, e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:border-[#d7bd77] outline-none text-sm"
                placeholder="https://images.unsplash.com/..." />
            </div>
          ))}
        </div>
      </div>
    </AdminSection>
  )
}