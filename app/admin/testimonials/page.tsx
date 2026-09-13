'use client'

import { useEffect, useState } from 'react'
import AdminSection from '@/components/admin/AdminSection'
import { useTranslation } from '@/lib/useTranslation'
import { Plus, Trash2, Star } from 'lucide-react'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

export default function TestimonialsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const { translate } = useTranslation()

  const [data, setData] = useState<any>({
    id: '',
    content: {
      eyebrow: { es: '', ca: '' },
      title: { es: '', ca: '' },
      titleItalic: { es: '', ca: '' },
      items: [] as any[]
    }
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?section=eq.testimonials&select=*`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      })
      if (!res.ok) throw new Error('Error al cargar')
      const result = await res.json()
      if (result.length > 0) {
        const testimonials = result[0]
        const c = testimonials.content || {}
        setData({
          id: testimonials.id,
          content: {
            eyebrow: c.eyebrow || { es: '', ca: '' },
            title: c.title || { es: '', ca: '' },
            titleItalic: c.titleItalic || { es: '', ca: '' },
            items: c.items || []
          }
        })
      }
    } catch (err) { setError('Error: ' + (err as Error).message) }
    finally { setLoading(false) }
  }

  async function saveData() {
    setSaving(true); setError(''); setNotice('🌐 Traduciendo y guardando...')
    try {
      const contentToSave = { ...data.content }

      if (!contentToSave.eyebrow.ca && contentToSave.eyebrow.es) {
        contentToSave.eyebrow.ca = await translate(contentToSave.eyebrow.es, 'ca')
      }
      if (!contentToSave.title.ca && contentToSave.title.es) {
        contentToSave.title.ca = await translate(contentToSave.title.es, 'ca')
      }
      if (!contentToSave.titleItalic.ca && contentToSave.titleItalic.es) {
        contentToSave.titleItalic.ca = await translate(contentToSave.titleItalic.es, 'ca')
      }

      const translatedItems = await Promise.all(
        (contentToSave.items || []).map(async (item: any) => {
          const newItem = { ...item }
          if (item.role?.es && !item.role?.ca) {
            newItem.role = { ...item.role, ca: await translate(item.role.es, 'ca') }
          }
          if (item.text?.es && !item.text?.ca) {
            newItem.text = { ...item.text, ca: await translate(item.text.es, 'ca') }
          }
          return newItem
        })
      )
      contentToSave.items = translatedItems

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
      setNotice('✅ Testimonios guardados y traducidos correctamente')
    } catch (err) {
      setError('❌ ' + (err as Error).message)
    } finally { setSaving(false) }
  }

  function updateField(key: string, lang: string, value: string) {
    setData({
      ...data,
      content: {
        ...data.content,
        [key]: { ...data.content[key], [lang]: value }
      }
    })
  }

  function updateItem(index: number, key: string, value: any) {
    const newItems = [...(data.content.items || [])]
    newItems[index] = { ...newItems[index], [key]: value }
    setData({ ...data, content: { ...data.content, items: newItems } })
  }

  function updateItemNested(index: number, parent: string, lang: string, value: string) {
    const newItems = [...(data.content.items || [])]
    newItems[index] = {
      ...newItems[index],
      [parent]: { ...newItems[index][parent], [lang]: value }
    }
    setData({ ...data, content: { ...data.content, items: newItems } })
  }

  function addItem() {
    const newItems = [...(data.content.items || [])]
    newItems.push({
      id: `test-${Date.now()}`,
      name: '',
      role: { es: '', ca: '' },
      text: { es: '', ca: '' },
      rating: 5,
      image: ''
    })
    setData({ ...data, content: { ...data.content, items: newItems } })

    setTimeout(() => {
      const newIndex = newItems.length - 1
      const element = document.getElementById(`testimonial-${newIndex}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  function removeItem(index: number) {
    if (!confirm('¿Seguro que quieres eliminar este testimonio?')) return
    const newItems = (data.content.items || []).filter((_: any, i: number) => i !== index)
    setData({ ...data, content: { ...data.content, items: newItems } })
  }

  if (loading) return <div className="min-h-screen bg-[#11110f] flex items-center justify-center text-white/50">Cargando...</div>

  return (
    <AdminSection
      title="⭐ Testimonios"
      description="Gestiona las reseñas de tus clientes"
      onSave={saveData}
      saving={saving}
      error={error}
      notice={notice}
    >
      <div className="space-y-8">
        
        <button
          onClick={addItem}
          className="w-full flex items-center justify-center gap-2 bg-[#d7bd77] px-6 py-4 text-[#11110f] rounded-xl hover:bg-white transition-colors text-base font-medium"
        >
          <Plus className="size-5" /> Añadir testimonio
        </button>

        <div className="border border-white/10 rounded-xl p-5 bg-white/[.02]">
          <h3 className="text-white/60 text-sm font-semibold mb-4">✏️ Cabecera de la sección</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white/50 text-xs mb-1">Eyebrow (ES)</label>
              <input
                type="text"
                value={data.content.eyebrow.es || ''}
                onChange={(e) => updateField('eyebrow', 'es', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none"
                placeholder="Lo que dicen nuestros clientes"
              />
              {data.content.eyebrow.ca && (
                <p className="text-white/40 text-xs mt-1">🇨🇦 {data.content.eyebrow.ca}</p>
              )}
            </div>

            <div>
              <label className="block text-white/50 text-xs mb-1">Título (ES)</label>
              <input
                type="text"
                value={data.content.title.es || ''}
                onChange={(e) => updateField('title', 'es', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none"
                placeholder="Opiniones reales"
              />
              {data.content.title.ca && (
                <p className="text-white/40 text-xs mt-1">🇨🇦 {data.content.title.ca}</p>
              )}
            </div>

            <div>
              <label className="block text-white/50 text-xs mb-1">Título en cursiva (ES)</label>
              <input
                type="text"
                value={data.content.titleItalic.es || ''}
                onChange={(e) => updateField('titleItalic', 'es', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none"
                placeholder="que hablan por nosotros."
              />
              {data.content.titleItalic.ca && (
                <p className="text-white/40 text-xs mt-1">🇨🇦 {data.content.titleItalic.ca}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h3 className="text-white/60 text-sm font-semibold">
            📝 Testimonios ({(data.content.items || []).length})
          </h3>
        </div>

        <div className="space-y-6">
          {(data.content.items || []).map((item: any, index: number) => (
            <div key={item.id || index} id={`testimonial-${index}`} className="border border-white/10 rounded-xl p-5 bg-white/[.02] space-y-4 scroll-mt-20">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-[#d7bd77] font-serif text-lg">Testimonio {index + 1}</h3>
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-400 hover:text-red-300 p-1 flex items-center gap-1 text-sm"
                >
                  <Trash2 className="size-4" /> Eliminar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
                <div>
                  <label className="block text-white/50 text-xs mb-1">Nombre del cliente</label>
                  <input
                    type="text"
                    value={item.name || ''}
                    onChange={(e) => updateItem(index, 'name', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none"
                    placeholder="María García"
                  />
                </div>

                <div>
                  <label className="block text-white/50 text-xs mb-1">Puntuación</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => updateItem(index, 'rating', star)}
                        className={`p-1 transition-colors ${
                          star <= (item.rating || 5)
                            ? 'text-[#d7bd77]'
                            : 'text-white/20 hover:text-[#d7bd77]/50'
                        }`}
                      >
                        <Star className="size-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-l-2 border-[#d7bd77]/30 pl-3 space-y-2">
                <p className="text-[#d7bd77] text-xs font-bold">🇪🇸 Español</p>
                <input
                  type="text"
                  value={item.role?.es || ''}
                  onChange={(e) => updateItemNested(index, 'role', 'es', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none"
                  placeholder="Reforma de vivienda · Barcelona"
                />
                <textarea
                  value={item.text?.es || ''}
                  onChange={(e) => updateItemNested(index, 'text', 'es', e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none resize-y"
                  placeholder="Trabajo impecable de principio a fin..."
                />
              </div>

              <div className="border-l-2 border-white/10 pl-3 space-y-2">
                <p className="text-white/40 text-xs font-bold">🇨🇦 Català</p>
                <input
                  type="text"
                  value={item.role?.ca || ''}
                  onChange={(e) => updateItemNested(index, 'role', 'ca', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none"
                  placeholder="Reforma d'habitatge · Barcelona"
                />
                <textarea
                  value={item.text?.ca || ''}
                  onChange={(e) => updateItemNested(index, 'text', 'ca', e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none resize-y"
                  placeholder="Treball impecable de principi a fi..."
                />
              </div>
            </div>
          ))}

          {(!data.content.items || data.content.items.length === 0) && (
            <div className="text-center py-12 border border-white/10 rounded-xl bg-white/[.02]">
              <p className="text-white/40 mb-2">No hay testimonios todavía</p>
              <p className="text-white/30 text-sm">Pulsa "Añadir testimonio" para crear el primero</p>
            </div>
          )}
        </div>

      </div>
    </AdminSection>
  )
}