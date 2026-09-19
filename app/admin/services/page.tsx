'use client'

import { useEffect, useState } from 'react'
import AdminSection from '@/components/admin/AdminSection'
import ImageUploader from '@/components/admin/ImageUploader'
import { useTranslation } from '@/lib/useTranslation'
import { Plus, Trash2, AlertTriangle } from 'lucide-react'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

export default function ServicesPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const { translate } = useTranslation()

  const [data, setData] = useState<any>({
    id: '',
    content: {
      eyebrow: '',
      title: '',
      titleItalic: '',
      items: [],
      translations: { eyebrow: '', title: '', titleItalic: '' }
    }
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?section=eq.services&select=*`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
        cache: 'no-store'
      })
      if (!res.ok) throw new Error('Error al cargar')
      const result = await res.json()
      if (result.length > 0) {
        const servicesData = result[0]
        const items = (servicesData.content.items || []).map((item: any) => ({
          ...item,
          images: item.images || (item.image ? [item.image] : [])
        }))
        setData({
          ...servicesData,
          content: { ...servicesData.content, items }
        })
      }
    } catch (err) { setError('Error: ' + (err as Error).message) }
    finally { setLoading(false) }
  }

  async function saveData() {
    setSaving(true); setError(''); setNotice('Traduciendo y guardando...')
    try {
      const contentToSave = { ...data.content }

      // Validar: ningún servicio puede tener href vacío
      const hrefVacio = (contentToSave.items || []).some((item: any) => !item.href?.trim())
      if (hrefVacio) {
        throw new Error('Todos los servicios deben tener un enlace. Revisa los que tengan el campo "Enlace" vacío.')
      }

      const translations = {
        eyebrow: await translate(data.content.eyebrow || '', 'ca'),
        title: await translate(data.content.title || '', 'ca'),
        titleItalic: await translate(data.content.titleItalic || '', 'ca'),
      }
      contentToSave.translations = translations

      const translatedItems = await Promise.all(
        (data.content.items || []).map(async (item: any) => {
          const newItem = { ...item }
          if (item.title?.es && !item.title?.ca) {
            newItem.title = { ...item.title, ca: await translate(item.title.es, 'ca') }
          }
          if (item.copy?.es && !item.copy?.ca) {
            newItem.copy = { ...item.copy, ca: await translate(item.copy.es, 'ca') }
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

      try {
        await fetch('/api/revalidate', { method: 'POST' })
      } catch (e) {
        console.warn('Revalidate falló:', e)
      }

      setNotice('✅ Servicios guardados y traducidos correctamente')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError('❌ ' + (err as Error).message)
    } finally { setSaving(false) }
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
      number: String(newItems.length + 1).padStart(2, '0'),
      title: { es: '', ca: '' },
      copy: { es: '', ca: '' },
      images: [],
      href: ''
    })
    setData({ ...data, content: { ...data.content, items: newItems } })

    setTimeout(() => {
      const newIndex = newItems.length - 1
      const element = document.getElementById(`service-${newIndex}`)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  function removeItem(index: number) {
    if (!confirm('¿Seguro que quieres eliminar este servicio?')) return
    const newItems = (data.content.items || []).filter((_: any, i: number) => i !== index)
    setData({ ...data, content: { ...data.content, items: newItems } })
  }

  function moveUp(index: number) {
    if (index === 0) return
    const newItems = [...(data.content.items || [])]
    const temp = newItems[index]
    newItems[index] = newItems[index - 1]
    newItems[index - 1] = temp
    newItems.forEach((item: any, i: number) => {
      item.number = String(i + 1).padStart(2, '0')
    })
    setData({ ...data, content: { ...data.content, items: newItems } })
  }

  function moveDown(index: number) {
    const newItems = [...(data.content.items || [])]
    if (index === newItems.length - 1) return
    const temp = newItems[index]
    newItems[index] = newItems[index + 1]
    newItems[index + 1] = temp
    newItems.forEach((item: any, i: number) => {
      item.number = String(i + 1).padStart(2, '0')
    })
    setData({ ...data, content: { ...data.content, items: newItems } })
  }

  if (loading) return <div className="min-h-screen bg-[#11110f] flex items-center justify-center text-white/50">Cargando...</div>

  return (
    <AdminSection
      title="Servicios"
      description="Edita la sección 'Lo que hacemos'"
      onSave={saveData}
      saving={saving}
      error={error}
      notice={notice}
    >
      <div className="space-y-6">
        <button
          onClick={addItem}
          className="w-full flex items-center justify-center gap-2 bg-[#d7bd77] px-6 py-4 text-[#11110f] rounded-xl hover:bg-white transition-colors text-base font-medium"
        >
          <Plus className="size-5" /> Añadir servicio
        </button>

        <div className="flex items-center justify-between">
          <h3 className="text-white/60 text-sm font-semibold">Servicios ({(data.content.items || []).length})</h3>
        </div>

        <div className="space-y-8">
          {(data.content.items || []).map((item: any, index: number) => {
            const hrefVacio = !item.href?.trim()

            return (
              <div key={index} id={`service-${index}`} className={`space-y-5 scroll-mt-20 ${hrefVacio ? 'border-l-4 border-yellow-400/50 pl-4' : ''}`}>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[#d7bd77] font-serif text-lg">Servicio {index + 1}</span>
                    {hrefVacio && (
                      <span className="text-yellow-400 text-xs flex items-center gap-1">
                        <AlertTriangle className="size-3" /> Falta enlace
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="text-white/40 hover:text-white p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Subir"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveDown(index)}
                      disabled={index === (data.content.items || []).length - 1}
                      className="text-white/40 hover:text-white p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                      title="Bajar"
                    >
                      ▼
                    </button>
                    <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300 p-1 ml-2">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/50 text-xs mb-1">Número</label>
                    <input type="text" value={item.number || ''} onChange={(e) => updateItem(index, 'number', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="01" />
                  </div>
                  <div>
                    <label className={`block text-xs mb-1 ${hrefVacio ? 'text-yellow-400' : 'text-white/50'}`}>
                      Enlace * {hrefVacio && '⚠️'}
                    </label>
                    <input
                      type="text"
                      value={item.href || ''}
                      onChange={(e) => updateItem(index, 'href', e.target.value)}
                      className={`w-full bg-white/5 border rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none ${hrefVacio ? 'border-yellow-400/50' : 'border-white/10'}`}
                      placeholder="/reformas-viviendas"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white/50 text-xs mb-2">🖼️ Imágenes del servicio ({item.images?.length || 0})</label>
                  <ImageUploader
                    images={item.images || []}
                    onChange={(imgs) => updateItem(index, 'images', imgs)}
                    folder={`services/${item.number || index}`}
                    maxImages={20}
                    allowVideos={false}
                  />
                </div>

                <div className="border-l-2 border-[#d7bd77]/30 pl-3 space-y-2">
                  <p className="text-[#d7bd77] text-xs font-bold">ES Español</p>
                  <input type="text" value={item.title?.es || ''} onChange={(e) => updateItemNested(index, 'title', 'es', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="Título del servicio" />
                  <input type="text" value={item.copy?.es || ''} onChange={(e) => updateItemNested(index, 'copy', 'es', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="Descripción del servicio" />
                </div>

                <div className="border-l-2 border-white/10 pl-3 space-y-2">
                  <p className="text-white/40 text-xs font-bold">CA Català</p>
                  <input type="text" value={item.title?.ca || ''} onChange={(e) => updateItemNested(index, 'title', 'ca', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="Títol del servei" />
                  <input type="text" value={item.copy?.ca || ''} onChange={(e) => updateItemNested(index, 'copy', 'ca', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="Descripció del servei" />
                </div>
              </div>
            )
          })}
        </div>

        {(data.content.items || []).some((item: any) => !item.href?.trim()) && (
          <div className="bg-yellow-400/10 border border-yellow-400/30 px-4 py-3 rounded-lg">
            <p className="text-yellow-400 text-sm flex items-center gap-2">
              <AlertTriangle className="size-4" />
              Hay servicios sin enlace. Rellena el campo "Enlace" para poder guardar.
            </p>
          </div>
        )}
      </div>
    </AdminSection>
  )
}