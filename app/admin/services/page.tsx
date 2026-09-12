'use client'

import { useEffect, useState } from 'react'
import AdminSection from '@/components/admin/AdminSection'
import ImageUploader from '@/components/admin/ImageUploader'
import { useTranslation } from '@/lib/useTranslation'
import { Plus, Trash2 } from 'lucide-react'

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
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
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
    setSaving(true); setError(''); setNotice('🌐 Traduciendo y guardando...')
    try {
      const contentToSave = { ...data.content }

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
      setNotice('✅ Servicios guardados y traducidos correctamente')
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
  }

  function removeItem(index: number) {
    const newItems = (data.content.items || []).filter((_: any, i: number) => i !== index)
    setData({ ...data, content: { ...data.content, items: newItems } })
  }

  if (loading) return <div className="min-h-screen bg-[#11110f] flex items-center justify-center text-white/50">Cargando...</div>

  return (
    <AdminSection
      title="🛠 Servicios"
      description="Edita la sección 'Lo que hacemos'"
      onSave={saveData}
      saving={saving}
      error={error}
      notice={notice}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-white/60 text-sm font-semibold">🛠 Servicios ({(data.content.items || []).length})</h3>
          <button onClick={addItem} className="flex items-center gap-2 bg-[#d7bd77] px-4 py-2 text-[#11110f] rounded-lg hover:bg-white transition-colors text-sm font-medium">
            <Plus className="size-4" /> Añadir servicio
          </button>
        </div>

        <div className="space-y-8">
          {(data.content.items || []).map((item: any, index: number) => (
            <div key={index} className="border border-white/10 rounded-xl p-5 space-y-5 bg-white/[.02]">
              <div className="flex items-center justify-between">
                <span className="text-white/50 text-sm font-medium">Servicio {index + 1}</span>
                <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300 p-1">
                  <Trash2 className="size-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/50 text-xs mb-1">Número</label>
                  <input type="text" value={item.number || ''} onChange={(e) => updateItem(index, 'number', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="01" />
                </div>
                <div>
                  <label className="block text-white/50 text-xs mb-1">Enlace</label>
                  <input type="text" value={item.href || ''} onChange={(e) => updateItem(index, 'href', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="/reformas-viviendas" />
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
                <p className="text-[#d7bd77] text-xs font-bold">🇪🇸 Español</p>
                <input type="text" value={item.title?.es || ''} onChange={(e) => updateItemNested(index, 'title', 'es', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="Título del servicio" />
                <input type="text" value={item.copy?.es || ''} onChange={(e) => updateItemNested(index, 'copy', 'es', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="Descripción del servicio" />
              </div>

              <div className="border-l-2 border-white/10 pl-3 space-y-2">
                <p className="text-white/40 text-xs font-bold">🇨🇦 Català</p>
                <input type="text" value={item.title?.ca || ''} onChange={(e) => updateItemNested(index, 'title', 'ca', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="Títol del servei" />
                <input type="text" value={item.copy?.ca || ''} onChange={(e) => updateItemNested(index, 'copy', 'ca', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="Descripció del servei" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminSection>
  )
}