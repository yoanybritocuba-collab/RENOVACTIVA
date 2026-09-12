'use client'

import { useEffect, useState } from 'react'
import AdminSection from '@/components/admin/AdminSection'
import { useTranslation } from '@/lib/useTranslation'
import { Languages } from 'lucide-react'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

export default function FooterPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [autoTranslate, setAutoTranslate] = useState(true)
  const { translate } = useTranslation()

  const [data, setData] = useState<any>({
    id: '',
    content: {
      copyright: '',
      social: { instagram: '', linkedin: '', youtube: '', facebook: '' },
      translations: {
        copyright: '',
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
        setData({
          ...footer,
          content: {
            ...footer.content,
            translations: footer.content.translations || {
              copyright: '',
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
    setNotice('')

    try {
      let contentToSave = { ...data.content }

      if (autoTranslate) {
        setNotice('🌐 Traduciendo al catalán...')

        const translations = {
          copyright: await translate(data.content.copyright || '', 'ca'),
          social: {
            instagram: data.content.social?.instagram || '',
            linkedin: data.content.social?.linkedin || '',
            youtube: data.content.social?.youtube || '',
            facebook: data.content.social?.facebook || '',
          }
        }

        contentToSave.translations = translations
      }

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
      setNotice('✅ Footer guardado y traducido correctamente')
    } catch (err) {
      setError('❌ ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  function updateField(key: string, value: string) {
    setData({
      ...data,
      content: { ...data.content, [key]: value }
    })
  }

  function updateSocial(key: string, value: string) {
    setData({
      ...data,
      content: {
        ...data.content,
        social: { ...data.content.social, [key]: value }
      }
    })
  }

  if (loading) return <div className="min-h-screen bg-[#11110f] flex items-center justify-center text-white/50">Cargando...</div>

  return (
    <AdminSection
      title="🦶 Footer"
      description="Edita el pie de página y las redes sociales"
      onSave={saveData}
      saving={saving}
      error={error}
      notice={notice}
    >
      <div className="space-y-6">
        {/* Toggle de traducción */}
        <div className="flex items-center justify-between bg-white/5 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <Languages className="size-5 text-[#d7bd77]" />
            <div>
              <p className="text-white/80 text-sm font-medium">Traducción automática al catalán</p>
              <p className="text-white/40 text-xs">Al guardar, se traducirá automáticamente con Google</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAutoTranslate(!autoTranslate)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              autoTranslate ? 'bg-[#d7bd77]' : 'bg-white/20'
            }`}
          >
            <span
              className={`absolute top-1 size-4 rounded-full bg-white transition-transform ${
                autoTranslate ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Copyright */}
        <div className="border-b border-white/10 pb-6">
          <h3 className="text-white/60 text-sm font-semibold mb-4">📄 Copyright</h3>
          <div>
            <label className="block text-white/50 text-sm mb-1">Texto del copyright (ES)</label>
            <input
              type="text"
              value={data.content.copyright || ''}
              onChange={(e) => updateField('copyright', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm"
              placeholder="© 2025 Renovactiva-SL. Todos los derechos reservados."
            />
            {data.content.translations?.copyright && (
              <p className="text-white/40 text-xs mt-1">🇨🇦 {data.content.translations.copyright}</p>
            )}
          </div>
        </div>

        {/* Redes sociales */}
        <div>
          <h3 className="text-white/60 text-sm font-semibold mb-4">🌐 Redes Sociales</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/50 text-sm mb-1">📷 Instagram</label>
              <input
                type="text"
                value={data.content.social?.instagram || ''}
                onChange={(e) => updateSocial('instagram', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">💼 LinkedIn</label>
              <input
                type="text"
                value={data.content.social?.linkedin || ''}
                onChange={(e) => updateSocial('linkedin', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm"
                placeholder="https://linkedin.com/..."
              />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">🎬 YouTube</label>
              <input
                type="text"
                value={data.content.social?.youtube || ''}
                onChange={(e) => updateSocial('youtube', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm"
                placeholder="https://youtube.com/..."
              />
            </div>
            <div>
              <label className="block text-white/50 text-sm mb-1">📘 Facebook</label>
              <input
                type="text"
                value={data.content.social?.facebook || ''}
                onChange={(e) => updateSocial('facebook', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm"
                placeholder="https://facebook.com/..."
              />
            </div>
          </div>
        </div>
      </div>
    </AdminSection>
  )
}