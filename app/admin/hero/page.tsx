'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon } from 'lucide-react'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'sb_publishable_acJOTZ5reUCVCpJ_vK36ZA_q2bEIhoo'

export default function HeroPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [data, setData] = useState({
    id: '',
    content: { 
      eyebrow: '', 
      title: '', 
      description: '', 
      cta: '', 
      images: ['', '', ''] 
    }
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?section=eq.hero&select=*`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      })
      if (!res.ok) throw new Error('Error al cargar')
      const result = await res.json()
      if (result.length > 0) {
        setData(result[0])
      } else {
        setError('No hay datos en la sección Hero. Ejecuta el SQL en Supabase.')
      }
    } catch (err) { 
      setError('No se pudo cargar el contenido: ' + (err as Error).message) 
    } finally { 
      setLoading(false) 
    }
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
        body: JSON.stringify({ 
          content: data.content, 
          updated_at: new Date().toISOString() 
        })
      })
      if (!res.ok) throw new Error('Error al guardar')
      setNotice('✅ Hero guardado correctamente')
    } catch (err) { 
      setError('❌ Error al guardar: ' + (err as Error).message) 
    } finally { 
      setSaving(false) 
    }
  }

  function updateField(key: string, value: string) {
    setData({ ...data, content: { ...data.content, [key]: value } })
  }

  function updateImage(index: number, value: string) {
    const newImages = [...data.content.images]
    newImages[index] = value
    setData({ ...data, content: { ...data.content, images: newImages } })
  }

  function addImage() {
    if (data.content.images.length < 10) {
      setData({ ...data, content: { ...data.content, images: [...data.content.images, ''] } })
    }
  }

  function removeImage(index: number) {
    if (data.content.images.length > 1) {
      setData({ ...data, content: { ...data.content, images: data.content.images.filter((_, i) => i !== index) } })
    }
  }

  if (loading) return <div className="min-h-screen bg-[#11110f] flex items-center justify-center text-white/50">Cargando...</div>

  return (
    <div className="min-h-screen bg-[#11110f] text-[#f3f0e9]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#11110f]/95 backdrop-blur-sm border-b border-white/10 px-4 py-3 lg:px-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5">
              <ArrowLeft className="size-5" />
            </Link>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl text-[#d7bd77]">🏠 Hero</h1>
              <p className="text-white/40 text-xs sm:text-sm">Edita la portada principal</p>
            </div>
          </div>
          <button
            onClick={saveData}
            disabled={saving}
            className="flex items-center gap-1.5 bg-[#d7bd77] px-4 py-2 text-[#11110f] rounded-lg hover:bg-white transition-colors disabled:opacity-50 text-sm font-medium"
          >
            <Save className="size-4" />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </header>

      {error && <div className="max-w-5xl mx-auto px-4 pt-4"><div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2.5 rounded-lg text-sm">{error}</div></div>}
      {notice && <div className="max-w-5xl mx-auto px-4 pt-4"><div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-2.5 rounded-lg text-sm">{notice}</div></div>}

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Imágenes */}
        <div className="border border-white/10 bg-white/[.02] rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/60 text-sm font-semibold">🖼️ Imágenes del Hero ({data.content.images.filter(i => i).length})</h3>
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
                  {img ? (
                    <img src={img} alt={`Slide ${i+1}`} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <ImageIcon className="size-6" />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => removeImage(i)} 
                  className="absolute top-1 right-1 p-1 bg-red-500/80 rounded hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={data.content.images.length <= 1}
                >
                  <Trash2 className="size-3.5 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Textos */}
        <div className="border border-white/10 bg-white/[.02] rounded-xl p-4 sm:p-6 space-y-4">
          <h3 className="text-white/60 text-sm font-semibold">✏️ Textos</h3>
          
          <div>
            <label className="block text-white/50 text-sm mb-1">Eyebrow</label>
            <input type="text" value={data.content.eyebrow || ''} onChange={(e) => updateField('eyebrow', e.target.value)} 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" 
              placeholder="Arquitectura · Interiorismo · Construcción" />
          </div>
          
          <div>
            <label className="block text-white/50 text-sm mb-1">Título</label>
            <input type="text" value={data.content.title || ''} onChange={(e) => updateField('title', e.target.value)} 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" 
              placeholder="Espacios que trascienden." />
          </div>
          
          <div>
            <label className="block text-white/50 text-sm mb-1">Descripción</label>
            <textarea value={data.content.description || ''} onChange={(e) => updateField('description', e.target.value)} rows={3} 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm resize-y" 
              placeholder="Reformas de alto nivel..." />
          </div>
          
          <div>
            <label className="block text-white/50 text-sm mb-1">Texto del botón</label>
            <input type="text" value={data.content.cta || ''} onChange={(e) => updateField('cta', e.target.value)} 
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" 
              placeholder="Hablemos de tu proyecto" />
          </div>
        </div>

        {/* URLs de imágenes */}
        <div className="border border-white/10 bg-white/[.02] rounded-xl p-4 sm:p-6 space-y-3">
          <h3 className="text-white/60 text-sm font-semibold">🔗 URLs de las imágenes</h3>
          {data.content.images.map((img, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-white/30 text-xs w-5 text-right">{i+1}.</span>
              <input type="text" value={img} onChange={(e) => updateImage(i, e.target.value)} 
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:border-[#d7bd77] outline-none text-sm" 
                placeholder="https://images.unsplash.com/..." />
            </div>
          ))}
          <p className="text-white/30 text-xs">Pega aquí las URLs de las imágenes (Unsplash, Imgur, o tu hosting)</p>
        </div>
      </div>
    </div>
  )
}