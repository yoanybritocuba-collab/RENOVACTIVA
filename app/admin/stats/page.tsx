'use client'

import { useEffect, useState } from 'react'
import AdminSection from '@/components/admin/AdminSection'
import { useTranslation } from '@/lib/useTranslation'
import { Plus, Trash2, Briefcase, Award, Users, Home, TrendingUp, Star, Heart, Target, Zap } from 'lucide-react'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

const AVAILABLE_ICONS = [
  { key: 'briefcase', label: 'Proyectos', Icon: Briefcase },
  { key: 'award', label: 'Premio', Icon: Award },
  { key: 'users', label: 'Clientes', Icon: Users },
  { key: 'home', label: 'm²', Icon: Home },
  { key: 'trending', label: 'Crecimiento', Icon: TrendingUp },
  { key: 'star', label: 'Calidad', Icon: Star },
  { key: 'heart', label: 'Satisfacción', Icon: Heart },
  { key: 'target', label: 'Metas', Icon: Target },
  { key: 'zap', label: 'Rapidez', Icon: Zap },
]

export default function StatsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const { translate } = useTranslation()

  const [data, setData] = useState<any>({
    id: '',
    content: {
      eyebrow: { es: 'En números', ca: 'En números' },
      items: []
    }
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?section=eq.stats&select=*`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
        cache: 'no-store'
      })
      if (!res.ok) throw new Error('Error al cargar')
      const result = await res.json()
      if (result.length > 0) {
        const stats = result[0]
        const c = stats.content || {}
        setData({
          id: stats.id,
          content: {
            eyebrow: c.eyebrow || { es: 'En números', ca: 'En números' },
            items: c.items || []
          }
        })
      } else {
        setData({
          id: '',
          content: {
            eyebrow: { es: 'En números', ca: 'En números' },
            items: [
              { id: 'stat-1', number: 150, suffix: '+', label: { es: 'Proyectos realizados', ca: 'Projectes realitzats' }, icon: 'briefcase' },
              { id: 'stat-2', number: 15, suffix: '', label: { es: 'Años de experiencia', ca: "Anys d'experiència" }, icon: 'award' },
              { id: 'stat-3', number: 98, suffix: '%', label: { es: 'Clientes satisfechos', ca: 'Clients satisfets' }, icon: 'users' },
              { id: 'stat-4', number: 250, suffix: 'K', label: { es: 'm² reformados', ca: 'm² reformats' }, icon: 'home' },
            ]
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
      const contentToSave = JSON.parse(JSON.stringify(data.content))

      // 🔥 Traducir SIEMPRE desde ES
      contentToSave.eyebrow = { es: contentToSave.eyebrow?.es || '', ca: await translateField(contentToSave.eyebrow?.es) }

      const translatedItems = await Promise.all(
        (contentToSave.items || []).map(async (item: any) => ({
          ...item,
          label: { es: item.label?.es || '', ca: await translateField(item.label?.es) }
        }))
      )
      contentToSave.items = translatedItems

      if (!data.id) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content`, {
          method: 'POST',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
          body: JSON.stringify({ section: 'stats', content: contentToSave, sort_order: 5, is_published: true })
        })
        if (!res.ok) throw new Error('Error al crear')
        const saved = await res.json()
        setData({ id: saved[0].id, content: contentToSave })
      } else {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?id=eq.${data.id}`, {
          method: 'PATCH',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify({ content: contentToSave, updated_at: new Date().toISOString() })
        })
        if (!res.ok) throw new Error('Error al guardar')
        setData({ ...data, content: contentToSave })
      }

      try { await fetch('/api/revalidate', { method: 'POST' }) } catch {}
      setNotice('✅ Números guardados y traducidos')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) { setError('❌ ' + (err as Error).message) }
    finally { setSaving(false) }
  }

  function updateEyebrow(value: string) {
    setData({ ...data, content: { ...data.content, eyebrow: { ...data.content.eyebrow, es: value } } })
  }

  function updateItem(index: number, key: string, value: any) {
    const newItems = [...(data.content.items || [])]
    newItems[index] = { ...newItems[index], [key]: value }
    setData({ ...data, content: { ...data.content, items: newItems } })
  }

  function updateItemLabelES(index: number, value: string) {
    const newItems = [...(data.content.items || [])]
    newItems[index] = { ...newItems[index], label: { ...newItems[index].label, es: value } }
    setData({ ...data, content: { ...data.content, items: newItems } })
  }

  function addItem() {
    const newItems = [...(data.content.items || [])]
    newItems.push({ id: `stat-${Date.now()}`, number: 0, suffix: '', label: { es: '', ca: '' }, icon: 'star' })
    setData({ ...data, content: { ...data.content, items: newItems } })
  }

  function removeItem(index: number) {
    if (!confirm('¿Eliminar este número?')) return
    const newItems = (data.content.items || []).filter((_: any, i: number) => i !== index)
    setData({ ...data, content: { ...data.content, items: newItems } })
  }

  function getIconByKey(key: string) {
    return AVAILABLE_ICONS.find(i => i.key === key)?.Icon || Star
  }

  if (loading) return <div className="min-h-screen bg-[#11110f] flex items-center justify-center text-white/50">Cargando...</div>

  return (
    <AdminSection
      title="📊 Números"
      description="Edita las estadísticas. El catalán se genera automáticamente al guardar."
      onSave={saveData}
      saving={saving}
      error={error}
      notice={notice}
    >
      <div className="space-y-8">
        <div className="border border-white/10 rounded-xl p-5 bg-white/[.02]">
          <h3 className="text-white/60 text-sm font-semibold mb-4">✏️ Cabecera</h3>
          <div>
            <label className="block text-white/50 text-xs mb-1">Eyebrow (ES)</label>
            <input type="text" value={data.content.eyebrow.es || ''} onChange={(e) => updateEyebrow(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="En números" />
            <p className="text-white/30 text-xs mt-1 italic">CA (auto): {data.content.eyebrow.ca || '—'}</p>
          </div>
        </div>

        <button onClick={addItem} className="w-full flex items-center justify-center gap-2 bg-[#d7bd77] px-6 py-4 text-[#11110f] rounded-xl hover:bg-white transition-colors text-base font-medium">
          <Plus className="size-5" /> Añadir número
        </button>

        <div className="space-y-6">
          {(data.content.items || []).map((item: any, index: number) => {
            const IconComponent = getIconByKey(item.icon)
            return (
              <div key={item.id || index} className="border border-white/10 rounded-xl p-5 bg-white/[.02] space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#d7bd77]/10 border border-[#d7bd77]/30">
                      <IconComponent className="size-5 text-[#d7bd77]" />
                    </div>
                    <h3 className="text-[#d7bd77] font-serif text-lg">Número {index + 1}</h3>
                  </div>
                  <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-300 p-1 flex items-center gap-1 text-sm">
                    <Trash2 className="size-4" /> Eliminar
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-white/50 text-xs mb-1">Número</label>
                    <input type="number" value={item.number || 0} onChange={(e) => updateItem(index, 'number', parseFloat(e.target.value) || 0)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="150" />
                  </div>
                  <div>
                    <label className="block text-white/50 text-xs mb-1">Sufijo (+, %, K)</label>
                    <input type="text" value={item.suffix || ''} onChange={(e) => updateItem(index, 'suffix', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="+" maxLength={3} />
                  </div>
                </div>

                <div>
                  <label className="block text-white/50 text-xs mb-2">Icono</label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {AVAILABLE_ICONS.map(({ key, label, Icon }) => (
                      <button key={key} type="button" onClick={() => updateItem(index, 'icon', key)} title={label}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${item.icon === key ? 'border-[#d7bd77] bg-[#d7bd77]/20' : 'border-white/10 bg-white/[.02] hover:border-white/30'}`}>
                        <Icon className={`size-5 ${item.icon === key ? 'text-[#d7bd77]' : 'text-white/60'}`} />
                        <span className={`text-[8px] ${item.icon === key ? 'text-[#d7bd77]' : 'text-white/40'}`}>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-l-2 border-[#d7bd77]/30 pl-3 space-y-2">
                  <p className="text-[#d7bd77] text-xs font-bold">🇪🇸 Español</p>
                  <input type="text" value={item.label?.es || ''} onChange={(e) => updateItemLabelES(index, e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none" placeholder="Proyectos realizados" />
                </div>

                <div className="border-l-2 border-white/10 pl-3 space-y-2 bg-white/[.01] p-3 rounded-lg">
                  <p className="text-white/40 text-xs font-bold">🇨🇦 Català (auto — solo lectura)</p>
                  <input type="text" value={item.label?.ca || ''} readOnly tabIndex={-1}
                    className="w-full bg-white/[.02] border border-white/5 rounded-lg px-3 py-2 text-sm text-white/60 outline-none cursor-default" />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AdminSection>
  )
}