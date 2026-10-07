'use client'

import { useEffect, useState } from 'react'
import AdminSection from '@/components/admin/AdminSection'
import ImageUploader from '@/components/admin/ImageUploader'
import { useTranslation } from '@/lib/useTranslation'
import { Plus, Trash2, AlertTriangle, PlusCircle, XCircle } from 'lucide-react'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

const FIRST_AREA = 'area1'
const SECOND_AREA = 'area2'

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
        // Normalizar items: si tienen "subItems" (estructura vieja), convertir a "area2"
        const items = (servicesData.content.items || []).map((item: any) => {
          const normalized: any = { ...item, images: item.images || (item.image ? [item.image] : []) }
          if (Array.isArray(item.subItems) && item.subItems.length > 0) {
            // Migrar subItems antiguos a area2 (solo el primero)
            const sub = item.subItems[0]
            normalized.area2 = {
              image: sub.images?.[0] || '',
              title: sub.title || { es: '', ca: '' },
              copy: sub.copy || { es: '', ca: '' },
              href: sub.href || '',
            }
          }
          delete normalized.subItems
          return normalized
        })
        setData({ ...servicesData, content: { ...servicesData.content, items } })
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

      // Validar: cada item debe tener href o (si tiene area2) los hrefs de sus areas
      const invalidItem = (contentToSave.items || []).find((item: any) => {
        const hasArea2 = item.area2 && (item.area2.image || item.area2.title?.es)
        if (hasArea2) {
          return !item.area2.href?.trim()
        }
        return !item.href?.trim()
      })
      if (invalidItem) {
        throw new Error('Falta el enlace de algún servicio. Revisa que todos tengan enlace.')
      }

      contentToSave.translations = {
        eyebrow: await translateField(data.content.eyebrow),
        title: await translateField(data.content.title),
        titleItalic: await translateField(data.content.titleItalic),
      }

      const translatedItems = await Promise.all(
        (data.content.items || []).map(async (item: any) => {
          const newItem = { ...item }
          newItem.title = { es: item.title?.es || '', ca: await translateField(item.title?.es) }
          newItem.copy = { es: item.copy?.es || '', ca: await translateField(item.copy?.es) }

          if (item.area2 && (item.area2.image || item.area2.title?.es)) {
            newItem.area2 = {
              image: item.area2.image || '',
              href: item.area2.href || '',
              title: { es: item.area2.title?.es || '', ca: await translateField(item.area2.title?.es) },
              copy: { es: item.area2.copy?.es || '', ca: await translateField(item.area2.copy?.es) },
            }
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

      try { await fetch('/api/revalidate', { method: 'POST' }) } catch {}

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
    newItems[index] = { ...newItems[index], [parent]: { ...newItems[index][parent], [lang]: value } }
    setData({ ...data, content: { ...data.content, items: newItems } })
  }

  function addArea2(index: number) {
    const newItems = [...(data.content.items || [])]
    newItems[index].area2 = {
      image: '',
      href: '',
      title: { es: '', ca: '' },
      copy: { es: '', ca: '' },
    }
    setData({ ...data, content: { ...data.content, items: newItems } })
  }

  function removeArea2(index: number) {
    if (!confirm('¿Quitar la segunda área de este servicio?')) return
    const newItems = [...(data.content.items || [])]
    delete newItems[index].area2
    setData({ ...data, content: { ...data.content, items: newItems } })
  }

  function updateArea2(index: number, key: string, value: any) {
    const newItems = [...(data.content.items || [])]
    newItems[index].area2 = { ...newItems[index].area2, [key]: value }
    setData({ ...data, content: { ...data.content, items: newItems } })
  }

  function updateArea2Nested(index: number, parent: string, lang: string, value: string) {
    const newItems = [...(data.content.items || [])]
    newItems[index].area2 = {
      ...newItems[index].area2,
      [parent]: { ...newItems[index].area2[parent], [lang]: value }
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
      href: '',
    })
    setData({ ...data, content: { ...data.content, items: newItems } })
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
    newItems.forEach((item: any, i: number) => { item.number = String(i + 1).padStart(2, '0') })
    setData({ ...data, content: { ...data.content, items: newItems } })
  }

  function moveDown(index: number) {
    const newItems = [...(data.content.items || [])]
    if (index === newItems.length - 1) return
    const temp = newItems[index]
    newItems[index] = newItems[index + 1]
    newItems[index + 1] = temp
    newItems.forEach((item: any, i: number) => { item.number = String(i + 1).padStart(2, '0') })
    setData({ ...data, content: { ...data.content, items: newItems } })
  }

  if (loading) return <div className="min-h-screen bg-[#11110f] flex items-center justify-center text-white/50">Cargando...</div>

  return (
    <AdminSection
      title="Servicios"
      description="Edita los servicios. Los que tengan 2 áreas (como Locales y Oficinas) muestran 2 fotos en la web."
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

        <h3 className="text-white/60 text-sm font-semibold">Servicios ({(data.content.items || []).length})</h3>

        <div className="space-y-8">
          {(data.content.items || []).map((item: any, index: number) => {
            const hasArea2 = item.area2 && (item.area2.image || item.area2.title?.es)
            const hrefVacio = !hasArea2 && !item.href?.trim()
            return (
              <div key={index} className={`space-y-5 ${hrefVacio ? 'border-l-4 border-yellow-400/50 pl-4' : ''}`}>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[#d7bd77] font-serif text-lg">Servicio {index + 1}</span>
                    {hasArea2 && (
                      <span className="text-[#10B77F] text-xs">· 2 áreas</span>
                    )}
                    {hrefVacio && (
                      <span className="text-yellow-400 text-xs flex items-center gap-1">
                        <AlertTriangle className="size-3" /> Falta enlace
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => moveUp(index)} disabled={index === 0} className="text-white/40 hover:text-white p-1 disabled:opacity-30">▲</button>
                    <button onClick={() => moveDown(index)} disabled={index === (data.content.items || []).length - 1} className="text-white/40 hover:text-white p-1 disabled:opacity-30">▼</button>
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
                      Enlace (a dónde va al clicar)
                    </label>
                    <input type="text" value={item.href || ''} onChange={(e) => updateItem(index, 'href', e.target.value)}
                      className={`w-full bg-white/5 border rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none ${hrefVacio ? 'border-yellow-400/50' : 'border-white/10'}`}
                      placeholder="/reformas-viviendas" />
                  </div>
                </div>

                {/* ÁREA 1 */}
                <div className="bg-black/20 border border-white/10 rounded-xl p-4 space-y-3">
                  <p className="text-[#d7bd77] text-xs font-bold uppercase tracking-wider">Área principal</p>

                  <div>
                    <label className="block text-white/50 text-xs mb-2">🖼️ Foto</label>
                    <ImageUploader
                      images={item.images || []}
                      onChange={(imgs) => updateItem(index, 'images', imgs)}
                      folder={`services/${item.number || index}/area1`}
                      maxImages={1}
                      allowVideos={false}
                    />
                  </div>

                  <div className="border-l-2 border-[#d7bd77]/30 pl-3 space-y-2">
                    <p className="text-[#d7bd77] text-xs">🇪🇸 Español</p>
                    <input type="text" value={item.title?.es || ''} onChange={(e) => updateItemNested(index, 'title', 'es', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="Título" />
                    <input type="text" value={item.copy?.es || ''} onChange={(e) => updateItemNested(index, 'copy', 'es', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="Texto corto" />
                  </div>

                  <div className="border-l-2 border-white/10 pl-3 space-y-2">
                    <p className="text-white/40 text-xs">🇨🇦 Català (auto)</p>
                    <input type="text" value={item.title?.ca || ''} readOnly tabIndex={-1}
                      className="w-full bg-white/[.02] border border-white/5 rounded-lg px-3 py-2 text-sm text-white/60 outline-none cursor-default" />
                    <input type="text" value={item.copy?.ca || ''} readOnly tabIndex={-1}
                      className="w-full bg-white/[.02] border border-white/5 rounded-lg px-3 py-2 text-sm text-white/60 cursor-default" />
                  </div>
                </div>

                {/* ÁREA 2 (opcional) */}
                {hasArea2 ? (
                  <div className="bg-[#10B77F]/[.04] border border-[#10B77F]/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[#10B77F] text-xs font-bold uppercase tracking-wider">Segunda área</p>
                      <button onClick={() => removeArea2(index)} className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
                        <XCircle className="size-3.5" /> Quitar segunda área
                      </button>
                    </div>

                    <div>
                      <label className="block text-white/50 text-xs mb-2">🖼️ Foto</label>
                      <ImageUploader
                        images={item.area2.image ? [item.area2.image] : []}
                        onChange={(imgs) => updateArea2(index, 'image', imgs[0] || '')}
                        folder={`services/${item.number || index}/area2`}
                        maxImages={1}
                        allowVideos={false}
                      />
                    </div>

                    <div>
                      <label className="block text-white/50 text-xs mb-1">Enlace</label>
                      <input type="text" value={item.area2.href || ''} onChange={(e) => updateArea2(index, 'href', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="/reformas-oficinas" />
                    </div>

                    <div className="border-l-2 border-[#d7bd77]/30 pl-3 space-y-2">
                      <p className="text-[#d7bd77] text-xs">🇪🇸 Español</p>
                      <input type="text" value={item.area2.title?.es || ''} onChange={(e) => updateArea2Nested(index, 'title', 'es', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="Título (ej: Oficinas)" />
                      <input type="text" value={item.area2.copy?.es || ''} onChange={(e) => updateArea2Nested(index, 'copy', 'es', e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="Texto corto" />
                    </div>

                    <div className="border-l-2 border-white/10 pl-3 space-y-2">
                      <p className="text-white/40 text-xs">🇨🇦 Català (auto)</p>
                      <input type="text" value={item.area2.title?.ca || ''} readOnly tabIndex={-1}
                        className="w-full bg-white/[.02] border border-white/5 rounded-lg px-3 py-2 text-sm text-white/60 cursor-default" />
                      <input type="text" value={item.area2.copy?.ca || ''} readOnly tabIndex={-1}
                        className="w-full bg-white/[.02] border border-white/5 rounded-lg px-3 py-2 text-sm text-white/60 cursor-default" />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => addArea2(index)}
                    className="w-full flex items-center justify-center gap-2 border border-dashed border-[#10B77F]/40 text-[#10B77F] hover:bg-[#10B77F]/10 px-4 py-3 rounded-xl transition-colors text-sm"
                  >
                    <PlusCircle className="size-4" /> Añadir segunda área (opcional)
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </AdminSection>
  )
}