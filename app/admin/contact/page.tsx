'use client'

import { useEffect, useState } from 'react'
import AdminSection from '@/components/admin/AdminSection'
import { useTranslation } from '@/lib/useTranslation'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

export default function ContactPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const { translate } = useTranslation()

  const [data, setData] = useState<any>({
    id: '',
    content: {
      title: 'Hagamos algo extraordinario.',
      subtitle: "Explica'ns la teva idea.",
      buttonText: 'Solicitar presupuesto',
      email: 'info@renovactiva.com',
      phone: '+34 600 000 000',
      address: 'Carrer Exemple 123, 08001 Barcelona',
      schedule: 'Lun - Vie: 9:00 - 18:00',
      translations: {
        title: '',
        subtitle: '',
        buttonText: ''
      }
    }
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?section=eq.contact&select=*`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      })
      if (!res.ok) throw new Error('Error al cargar')
      const result = await res.json()
      if (result.length > 0) {
        const contact = result[0]
        setData({
          ...contact,
          content: {
            ...data.content,
            ...contact.content,
            translations: contact.content.translations || {
              title: '', subtitle: '', buttonText: ''
            }
          }
        })
      }
    } catch (err) { setError('Error: ' + (err as Error).message) }
    finally { setLoading(false) }
  }

  async function saveData() {
    setSaving(true); setError(''); setNotice('Traduciendo y guardando...')
    try {
      const contentToSave = { ...data.content }

      const translations = {
        title: await translate(data.content.title || '', 'ca'),
        subtitle: await translate(data.content.subtitle || '', 'ca'),
        buttonText: await translate(data.content.buttonText || '', 'ca'),
      }
      contentToSave.translations = translations

      if (!data.id) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({
            section: 'contact',
            content: contentToSave,
            sort_order: 5,
            is_published: true
          })
        })
        if (!res.ok) throw new Error('Error al crear')
        const saved = await res.json()
        setData({ ...data, id: saved[0].id, content: contentToSave })
      } else {
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
      }

      try {
        await fetch('/api/revalidate', { method: 'POST' })
      } catch (e) {
        console.warn('Revalidate falló:', e)
      }

      setNotice('Contacto guardado y traducido correctamente')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError((err as Error).message)
    } finally { setSaving(false) }
  }

  function updateField(key: string, value: string) {
    setData({ ...data, content: { ...data.content, [key]: value } })
  }

  if (loading) return <div className="min-h-screen bg-[#11110f] flex items-center justify-center text-white/50">Cargando...</div>

  return (
    <AdminSection
      title="Contacto"
      description="Edita la sección de contacto"
      onSave={saveData}
      saving={saving}
      error={error}
      notice={notice}
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-white/60 text-sm font-semibold mb-4">Textos de la sección</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white/50 text-sm mb-1">Título</label>
              <input type="text" value={data.content.title || ''} onChange={(e) => updateField('title', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" placeholder="Hagamos algo extraordinario." />
              {data.content.translations?.title && <p className="text-white/40 text-xs mt-1">CA: {data.content.translations.title}</p>}
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">Subtítulo</label>
              <input type="text" value={data.content.subtitle || ''} onChange={(e) => updateField('subtitle', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" placeholder="Cuéntanos tu idea." />
              {data.content.translations?.subtitle && <p className="text-white/40 text-xs mt-1">CA: {data.content.translations.subtitle}</p>}
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">Texto del botón</label>
              <input type="text" value={data.content.buttonText || ''} onChange={(e) => updateField('buttonText', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" placeholder="Solicitar presupuesto" />
              {data.content.translations?.buttonText && <p className="text-white/40 text-xs mt-1">CA: {data.content.translations.buttonText}</p>}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h3 className="text-white/60 text-sm font-semibold mb-4">Información de contacto</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/50 text-sm mb-1">Email</label>
              <input type="email" value={data.content.email || ''} onChange={(e) => updateField('email', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" placeholder="info@renovactiva.com" />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">Teléfono</label>
              <input type="text" value={data.content.phone || ''} onChange={(e) => updateField('phone', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" placeholder="+34 600 000 000" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-white/50 text-sm mb-1">Dirección</label>
              <input type="text" value={data.content.address || ''} onChange={(e) => updateField('address', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" placeholder="Carrer Exemple 123, 08001 Barcelona" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-white/50 text-sm mb-1">Horario</label>
              <input type="text" value={data.content.schedule || ''} onChange={(e) => updateField('schedule', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" placeholder="Lun - Vie: 9:00 - 18:00" />
            </div>
          </div>
        </div>
      </div>
    </AdminSection>
  )
}