'use client'

import { useEffect, useState } from 'react'
import AdminSection from '@/components/admin/AdminSection'
import { useTranslation } from '@/lib/useTranslation'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

export default function FooterPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const { translate } = useTranslation()

  const [data, setData] = useState<any>({
    id: '',
    content: {
      description: '',
      copyright: '',
      contact: { phone: '', email: '' },
      address: { street: '', city: '', postal: '' },
      schedule: '',
      social: { instagram: '', linkedin: '', youtube: '', facebook: '' },
      translations: {
        description: '',
        copyright: '',
        contact: { phone: '', email: '' },
        address: { street: '', city: '', postal: '' },
        schedule: '',
        social: { instagram: '', linkedin: '', youtube: '', facebook: '' }
      }
    }
  })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?section=eq.footer&select=*`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      })
      if (!res.ok) throw new Error('Error al cargar')
      const result = await res.json()
      if (result.length > 0) {
        const footer = result[0]
        const c = footer.content || {}
        setData({
          ...footer,
          content: {
            description: c.description || '',
            copyright: c.copyright || '',
            contact: c.contact || { phone: '', email: '' },
            address: c.address || { street: '', city: '', postal: '' },
            schedule: c.schedule || '',
            social: c.social || { instagram: '', linkedin: '', youtube: '', facebook: '' },
            translations: c.translations || {
              description: '',
              copyright: '',
              contact: { phone: '', email: '' },
              address: { street: '', city: '', postal: '' },
              schedule: '',
              social: { instagram: '', linkedin: '', youtube: '', facebook: '' }
            }
          }
        })
      }
    } catch (err) { setError('Error: ' + (err as Error).message) }
    finally { setLoading(false) }
  }

  async function saveData() {
    setSaving(true)
    setError('')
    setNotice('Traduciendo y guardando...')

    try {
      let contentToSave = { ...data.content }

      const translations = {
        description: await translate(data.content.description || '', 'ca'),
        copyright: await translate(data.content.copyright || '', 'ca'),
        contact: {
          phone: data.content.contact?.phone || '',
          email: data.content.contact?.email || ''
        },
        address: {
          street: await translate(data.content.address?.street || '', 'ca'),
          city: await translate(data.content.address?.city || '', 'ca'),
          postal: data.content.address?.postal || ''
        },
        schedule: await translate(data.content.schedule || '', 'ca'),
        social: {
          instagram: data.content.social?.instagram || '',
          linkedin: data.content.social?.linkedin || '',
          youtube: data.content.social?.youtube || '',
          facebook: data.content.social?.facebook || '',
        }
      }

      contentToSave.translations = translations

      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?id=eq.${data.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          content: contentToSave,
          updated_at: new Date().toISOString()
        })
      })

      if (!res.ok) throw new Error('Error al guardar')

      setData({ ...data, content: contentToSave })

      try {
        await fetch('/api/revalidate', { method: 'POST' })
      } catch (e) {
        console.warn('Revalidate falló:', e)
      }

      setNotice('Footer guardado y traducido correctamente')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  function updateField(key: string, value: string) {
    setData({ ...data, content: { ...data.content, [key]: value } })
  }

  function updateNested(parent: string, key: string, value: string) {
    setData({
      ...data,
      content: {
        ...data.content,
        [parent]: { ...data.content[parent], [key]: value }
      }
    })
  }

  if (loading) return <div className="min-h-screen bg-[#11110f] flex items-center justify-center text-white/50">Cargando...</div>

  return (
    <AdminSection
      title="Footer"
      description="Edita toda la información del pie de página"
      onSave={saveData}
      saving={saving}
      error={error}
      notice={notice}
    >
      <div className="space-y-6">
        <div className="border-b border-white/10 pb-6">
          <h3 className="text-white/60 text-sm font-semibold mb-4">Descripción</h3>
          <div>
            <label className="block text-white/50 text-sm mb-1">Descripción (ES)</label>
            <textarea
              value={data.content.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm resize-y"
              placeholder="Diseñamos y construimos espacios con intención."
            />
            {data.content.translations?.description && (
              <p className="text-white/40 text-xs mt-1">CA: {data.content.translations.description}</p>
            )}
          </div>
        </div>

        <div className="border-b border-white/10 pb-6">
          <h3 className="text-white/60 text-sm font-semibold mb-4">Contacto</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/50 text-sm mb-1">Teléfono</label>
              <input
                type="text"
                value={data.content.contact?.phone || ''}
                onChange={(e) => updateNested('contact', 'phone', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm"
                placeholder="+34 600 000 000"
              />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">Email</label>
              <input
                type="email"
                value={data.content.contact?.email || ''}
                onChange={(e) => updateNested('contact', 'email', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm"
                placeholder="info@renovactiva.com"
              />
            </div>
          </div>
        </div>

        <div className="border-b border-white/10 pb-6">
          <h3 className="text-white/60 text-sm font-semibold mb-4">Dirección</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-white/50 text-sm mb-1">Calle</label>
              <input
                type="text"
                value={data.content.address?.street || ''}
                onChange={(e) => updateNested('address', 'street', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm"
                placeholder="Carrer Exemple 123"
              />
              {data.content.translations?.address?.street && (
                <p className="text-white/40 text-xs mt-1">CA: {data.content.translations.address.street}</p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/50 text-sm mb-1">Ciudad</label>
                <input
                  type="text"
                  value={data.content.address?.city || ''}
                  onChange={(e) => updateNested('address', 'city', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm"
                  placeholder="Barcelona"
                />
                {data.content.translations?.address?.city && (
                  <p className="text-white/40 text-xs mt-1">CA: {data.content.translations.address.city}</p>
                )}
              </div>
              <div>
                <label className="block text-white/50 text-sm mb-1">Código Postal</label>
                <input
                  type="text"
                  value={data.content.address?.postal || ''}
                  onChange={(e) => updateNested('address', 'postal', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm"
                  placeholder="08001"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="border-b border-white/10 pb-6">
          <h3 className="text-white/60 text-sm font-semibold mb-4">Horario</h3>
          <div>
            <label className="block text-white/50 text-sm mb-1">Horario de atención</label>
            <input
              type="text"
              value={data.content.schedule || ''}
              onChange={(e) => updateField('schedule', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm"
              placeholder="Lun - Vie: 9:00 - 18:00"
            />
            {data.content.translations?.schedule && (
              <p className="text-white/40 text-xs mt-1">CA: {data.content.translations.schedule}</p>
            )}
          </div>
        </div>

        <div className="border-b border-white/10 pb-6">
          <h3 className="text-white/60 text-sm font-semibold mb-4">Redes Sociales</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/50 text-sm mb-1">Instagram</label>
              <input
                type="text"
                value={data.content.social?.instagram || ''}
                onChange={(e) => updateNested('social', 'instagram', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">LinkedIn</label>
              <input
                type="text"
                value={data.content.social?.linkedin || ''}
                onChange={(e) => updateNested('social', 'linkedin', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm"
                placeholder="https://linkedin.com/..."
              />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">YouTube</label>
              <input
                type="text"
                value={data.content.social?.youtube || ''}
                onChange={(e) => updateNested('social', 'youtube', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm"
                placeholder="https://youtube.com/..."
              />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">Facebook</label>
              <input
                type="text"
                value={data.content.social?.facebook || ''}
                onChange={(e) => updateNested('social', 'facebook', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm"
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-white/60 text-sm font-semibold mb-4">Copyright</h3>
          <div>
            <label className="block text-white/50 text-sm mb-1">Texto del copyright (ES)</label>
            <input
              type="text"
              value={data.content.copyright || ''}
              onChange={(e) => updateField('copyright', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm"
              placeholder="© 2025 Renovactiva SL. Todos los derechos reservados."
            />
            {data.content.translations?.copyright && (
              <p className="text-white/40 text-xs mt-1">CA: {data.content.translations.copyright}</p>
            )}
          </div>
        </div>
      </div>
    </AdminSection>
  )
}