'use client'

import { useEffect, useState } from 'react'
import AdminSection from '@/components/admin/AdminSection'
import ImageUploader from '@/components/admin/ImageUploader'
import { useTranslation } from '@/lib/useTranslation'
import { Plus, Trash2, ArrowUp, ArrowDown, ImageIcon, Link as LinkIcon } from 'lucide-react'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

function makeSlug(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

const DEFAULT_STEPS = [
  {
    n: '01',
    es: 'Escuchamos',
    ca: 'Escoltem',
    desc_es: 'Entendemos tu visión, tus necesidades y la forma en que quieres vivir.',
    desc_ca: 'Entenem la teva visió, les teves necessitats i la forma en què vols viure.',
    img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80',
  },
  {
    n: '02',
    es: 'Diseñamos',
    ca: 'Dissenyem',
    desc_es: 'Convertimos las ideas en un proyecto claro, bello y posible.',
    desc_ca: 'Convertim les idees en un projecte clar, bonic i possible.',
    img: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80',
  },
  {
    n: '03',
    es: 'Construimos',
    ca: 'Construïm',
    desc_es: 'Coordinamos cada gremio y cuidamos cada acabado.',
    desc_ca: 'Coordinem cada gremi i cuidem cada acabat.',
    img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
  },
  {
    n: '04',
    es: 'Entregamos',
    ca: 'Lliurem',
    desc_es: 'Te entregamos un espacio listo para empezar una nueva etapa.',
    desc_ca: 'Et lliurem un espai a punt per començar una nova etapa.',
    img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
  },
].map((s) => ({
  id: `step-${s.n}`,
  slug: makeSlug(s.es),
  number: s.n,
  title: { es: s.es, ca: s.ca },
  subtitle: { es: '', ca: '' },
  shortDescription: { es: s.desc_es, ca: s.desc_ca },
  longDescription: { es: '', ca: '' },
  bullets: { es: [] as string[], ca: [] as string[] },
  image: s.img,
  href: '',
}))

const EMPTY_CONTENT = {
  eyebrow: { es: 'Nuestro método', ca: 'El nostre mètode' },
  title: { es: 'La excelencia', ca: "L'excel·lència" },
  titleItalic: { es: 'es un proceso.', ca: 'és un procés.' },
  intro: { es: '', ca: '' },
  steps: DEFAULT_STEPS as any[],
}

export default function MetodoAdminPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const { translate } = useTranslation()

  const [data, setData] = useState<any>({ id: '', content: EMPTY_CONTENT })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/site_content?section=eq.metodo&select=*`,
        {
          headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
          cache: 'no-store',
        }
      )
      if (!res.ok) throw new Error('Error al cargar')
      const result = await res.json()
      if (result.length > 0) {
        const metodo = result[0]
        const c = metodo.content || {}
        const steps = (c.steps && c.steps.length > 0 ? c.steps : DEFAULT_STEPS).map((s: any) => ({
          ...s,
          slug: s.slug || makeSlug(s.title?.es || ''),
          shortDescription: s.shortDescription || s.description || { es: '', ca: '' },
          longDescription: s.longDescription || { es: '', ca: '' },
          href: s.href || '',
        }))
        setData({
          id: metodo.id,
          content: {
            eyebrow: c.eyebrow || EMPTY_CONTENT.eyebrow,
            title: c.title || EMPTY_CONTENT.title,
            titleItalic: c.titleItalic || EMPTY_CONTENT.titleItalic,
            intro: c.intro || EMPTY_CONTENT.intro,
            steps,
          },
        })
      } else {
        setNotice('La sección "método" no existía. Se han cargado los 4 pasos por defecto. Pulsa Guardar para crearla.')
      }
    } catch (err) {
      setError('Error: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function saveData() {
    setSaving(true); setError(''); setNotice('Traduciendo y guardando...')
    try {
      const contentToSave = JSON.parse(JSON.stringify(data.content))

      for (const key of ['eyebrow', 'title', 'titleItalic', 'intro'] as const) {
        const field = contentToSave[key]
        if (field?.es && !field?.ca) {
          contentToSave[key] = { ...field, ca: await translate(field.es, 'ca') }
        }
      }

      const translatedSteps = await Promise.all(
        (contentToSave.steps || []).map(async (step: any) => {
          const newStep = { ...step }
          newStep.slug = step.slug || makeSlug(step.title?.es || '')
          if (step.title?.es && !step.title?.ca) {
            newStep.title = { ...step.title, ca: await translate(step.title.es, 'ca') }
          }
          if (step.subtitle?.es && !step.subtitle?.ca) {
            newStep.subtitle = { ...step.subtitle, ca: await translate(step.subtitle.es, 'ca') }
          }
          if (step.shortDescription?.es && !step.shortDescription?.ca) {
            newStep.shortDescription = { ...step.shortDescription, ca: await translate(step.shortDescription.es, 'ca') }
          }
          if (step.longDescription?.es && !step.longDescription?.ca) {
            newStep.longDescription = { ...step.longDescription, ca: await translate(step.longDescription.es, 'ca') }
          }
          if (step.bullets?.es?.length && (!step.bullets?.ca || step.bullets.ca.length === 0)) {
            const caBullets = await Promise.all(
              step.bullets.es.map((b: string) => translate(b, 'ca'))
            )
            newStep.bullets = { ...step.bullets, ca: caBullets }
          }
          return newStep
        })
      )
      contentToSave.steps = translatedSteps

      const headers = {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      }

      let newId = data.id
      if (data.id) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?id=eq.${data.id}`, {
          method: 'PATCH',
          headers: { ...headers, Prefer: 'return=minimal' },
          body: JSON.stringify({ content: contentToSave, updated_at: new Date().toISOString() }),
        })
        if (!res.ok) throw new Error('Error al guardar (' + res.status + ')')
      } else {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content`, {
          method: 'POST',
          headers: { ...headers, Prefer: 'return=representation' },
          body: JSON.stringify({
            section: 'metodo',
            content: contentToSave,
            updated_at: new Date().toISOString(),
          }),
        })
        if (!res.ok) throw new Error('Error al crear la sección (' + res.status + ')')
        const created = await res.json()
        newId = created?.[0]?.id || ''
      }

      setData({ id: newId, content: contentToSave })

      try { await fetch('/api/revalidate', { method: 'POST' }) } catch {}

      setNotice('Método guardado correctamente ✅')
      setTimeout(() => setNotice(''), 3500)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  function updateField(key: string, lang: string, value: string) {
    setData({ ...data, content: { ...data.content, [key]: { ...data.content[key], [lang]: value } } })
  }

  function updateStep(index: number, key: string, value: any) {
    const newSteps = [...(data.content.steps || [])]
    newSteps[index] = { ...newSteps[index], [key]: value }
    setData({ ...data, content: { ...data.content, steps: newSteps } })
  }

  function updateStepNested(index: number, parent: string, lang: string, value: string) {
    const newSteps = [...(data.content.steps || [])]
    newSteps[index] = { ...newSteps[index], [parent]: { ...newSteps[index][parent], [lang]: value } }
    setData({ ...data, content: { ...data.content, steps: newSteps } })
  }

  function updateStepTitleES(index: number, value: string) {
    const newSteps = [...(data.content.steps || [])]
    newSteps[index] = {
      ...newSteps[index],
      title: { ...newSteps[index].title, es: value },
      slug: makeSlug(value),
    }
    setData({ ...data, content: { ...data.content, steps: newSteps } })
  }

  function updateStepBullets(index: number, lang: string, bulletsText: string) {
    const bulletsArray = bulletsText.split('\n').filter((b) => b.trim() !== '')
    const newSteps = [...(data.content.steps || [])]
    newSteps[index] = { ...newSteps[index], bullets: { ...newSteps[index].bullets, [lang]: bulletsArray } }
    setData({ ...data, content: { ...data.content, steps: newSteps } })
  }

  function updateStepImage(index: number, images: string[]) {
    const newSteps = [...(data.content.steps || [])]
    newSteps[index] = { ...newSteps[index], image: images[0] || '' }
    setData({ ...data, content: { ...data.content, steps: newSteps } })
  }

  function addStep() {
    const newSteps = [...(data.content.steps || [])]
    newSteps.push({
      id: `step-${Date.now()}`,
      slug: '',
      number: String(newSteps.length + 1).padStart(2, '0'),
      title: { es: '', ca: '' },
      subtitle: { es: '', ca: '' },
      shortDescription: { es: '', ca: '' },
      longDescription: { es: '', ca: '' },
      bullets: { es: [], ca: [] },
      image: '',
      href: '',
    })
    setData({ ...data, content: { ...data.content, steps: newSteps } })
  }

  function removeStep(index: number) {
    if (!confirm('¿Eliminar este paso?')) return
    const newSteps = (data.content.steps || []).filter((_: any, i: number) => i !== index)
    setData({ ...data, content: { ...data.content, steps: newSteps } })
  }

  function moveStep(index: number, direction: 'up' | 'down') {
    const newSteps = [...(data.content.steps || [])]
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= newSteps.length) return
    ;[newSteps[index], newSteps[target]] = [newSteps[target], newSteps[index]]
    setData({ ...data, content: { ...data.content, steps: newSteps } })
  }

  if (loading)
    return (
      <div className="min-h-screen bg-[#11110f] flex items-center justify-center text-white/50">
        Cargando...
      </div>
    )

  return (
    <AdminSection
      title="Método"
      description="Gestiona los pasos del método Renovactiva"
      onSave={saveData}
      saving={saving}
      error={error}
      notice={notice}
    >
      <div className="space-y-8">
        <div className="border border-white/10 rounded-xl p-5 bg-white/[.02] space-y-4">
          <h3 className="text-white/60 text-sm font-semibold mb-2">Cabecera</h3>

          <div>
            <label className="block text-white/50 text-xs mb-1">Eyebrow (ES)</label>
            <input
              type="text"
              value={data.content.eyebrow.es || ''}
              onChange={(e) => updateField('eyebrow', 'es', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none"
            />
            {data.content.eyebrow.ca && <p className="text-white/40 text-xs mt-1">CA: {data.content.eyebrow.ca}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/50 text-xs mb-1">Título (ES)</label>
              <input
                type="text"
                value={data.content.title.es || ''}
                onChange={(e) => updateField('title', 'es', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none"
              />
              {data.content.title.ca && <p className="text-white/40 text-xs mt-1">CA: {data.content.title.ca}</p>}
            </div>
            <div>
              <label className="block text-white/50 text-xs mb-1">Título cursiva (ES)</label>
              <input
                type="text"
                value={data.content.titleItalic.es || ''}
                onChange={(e) => updateField('titleItalic', 'es', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none"
              />
              {data.content.titleItalic.ca && <p className="text-white/40 text-xs mt-1">CA: {data.content.titleItalic.ca}</p>}
            </div>
          </div>

          <div>
            <label className="block text-white/50 text-xs mb-1">Introducción (ES)</label>
            <textarea
              value={data.content.intro.es || ''}
              onChange={(e) => updateField('intro', 'es', e.target.value)}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none resize-y"
            />
            {data.content.intro.ca && <p className="text-white/40 text-xs mt-1">CA: {data.content.intro.ca}</p>}
          </div>
        </div>

        <button
          onClick={addStep}
          className="w-full flex items-center justify-center gap-2 bg-[#d7bd77] px-6 py-4 text-[#11110f] rounded-xl hover:bg-white transition-colors text-base font-medium"
        >
          <Plus className="size-5" /> Añadir paso
        </button>

        <h3 className="text-white/60 text-sm font-semibold">
          Pasos ({(data.content.steps || []).length})
        </h3>

        <div className="space-y-6">
          {(data.content.steps || []).map((step: any, index: number) => (
            <div
              key={step.id || index}
              className="border border-white/10 rounded-xl p-5 bg-white/[.02] space-y-4"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-[#d7bd77] font-serif text-lg">
                  Paso {index + 1} — {step.number || ''}
                </h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => moveStep(index, 'up')} disabled={index === 0} className="text-white/50 hover:text-white p-1 disabled:opacity-30">
                    <ArrowUp className="size-4" />
                  </button>
                  <button onClick={() => moveStep(index, 'down')} disabled={index === (data.content.steps || []).length - 1} className="text-white/50 hover:text-white p-1 disabled:opacity-30">
                    <ArrowDown className="size-4" />
                  </button>
                  <button onClick={() => removeStep(index)} className="text-red-400 hover:text-red-300 p-1 flex items-center gap-1 text-sm">
                    <Trash2 className="size-4" /> Eliminar
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/50 text-xs mb-1">Número</label>
                  <input
                    type="text"
                    value={step.number || ''}
                    onChange={(e) => updateStep(index, 'number', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none"
                    placeholder="01"
                  />
                </div>
                <div>
                  <label className="block text-white/50 text-xs mb-1 flex items-center gap-1.5">
                    <LinkIcon className="size-3.5" /> Slug (URL)
                  </label>
                  <input
                    type="text"
                    value={step.slug || ''}
                    onChange={(e) => updateStep(index, 'slug', makeSlug(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none"
                    placeholder="escuchamos"
                  />
                  <p className="text-white/30 text-[11px] mt-1">
                    URL: <span className="text-[#d7bd77]">/metodo/{step.slug || '...'}</span>
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-white/50 text-xs mb-2 flex items-center gap-1.5">
                  <ImageIcon className="size-3.5" /> Imagen
                </label>
                <ImageUploader
                  images={step.image ? [step.image] : []}
                  onChange={(imgs) => updateStepImage(index, imgs)}
                  folder={`metodo/step-${index + 1}`}
                  maxImages={1}
                  allowVideos={false}
                />
                <div className="mt-2">
                  <label className="block text-white/40 text-[11px] mb-1">O pega una URL:</label>
                  <input
                    type="text"
                    value={step.image || ''}
                    onChange={(e) => updateStepImage(index, [e.target.value])}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-[#d7bd77] outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="border-l-2 border-[#d7bd77]/30 pl-3 space-y-2">
                <p className="text-[#d7bd77] text-xs font-bold">🇪🇸 Español</p>
                <input
                  type="text"
                  value={step.title?.es || ''}
                  onChange={(e) => updateStepTitleES(index, e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none"
                  placeholder="Escuchamos"
                />
                <input
                  type="text"
                  value={step.subtitle?.es || ''}
                  onChange={(e) => updateStepNested(index, 'subtitle', 'es', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none"
                  placeholder="Subtítulo corto"
                />
                <label className="block text-white/40 text-xs">Descripción corta (lista /metodo)</label>
                <textarea
                  value={step.shortDescription?.es || ''}
                  onChange={(e) => updateStepNested(index, 'shortDescription', 'es', e.target.value)}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none resize-y"
                />
                <label className="block text-white/40 text-xs">Descripción larga (sub-página)</label>
                <textarea
                  value={step.longDescription?.es || ''}
                  onChange={(e) => updateStepNested(index, 'longDescription', 'es', e.target.value)}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none resize-y"
                />
                <label className="block text-white/40 text-xs">Bullets ES (uno por línea)</label>
                <textarea
                  value={(step.bullets?.es || []).join('\n')}
                  onChange={(e) => updateStepBullets(index, 'es', e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none resize-y"
                />
              </div>

              <div className="border-l-2 border-white/10 pl-3 space-y-2">
                <p className="text-white/40 text-xs font-bold">🇨🇦 Català</p>
                <input
                  type="text"
                  value={step.title?.ca || ''}
                  onChange={(e) => updateStepNested(index, 'title', 'ca', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none"
                />
                <input
                  type="text"
                  value={step.subtitle?.ca || ''}
                  onChange={(e) => updateStepNested(index, 'subtitle', 'ca', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none"
                />
                <textarea
                  value={step.shortDescription?.ca || ''}
                  onChange={(e) => updateStepNested(index, 'shortDescription', 'ca', e.target.value)}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none resize-y"
                />
                <textarea
                  value={step.longDescription?.ca || ''}
                  onChange={(e) => updateStepNested(index, 'longDescription', 'ca', e.target.value)}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none resize-y"
                />
                <textarea
                  value={(step.bullets?.ca || []).join('\n')}
                  onChange={(e) => updateStepBullets(index, 'ca', e.target.value)}
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#d7bd77] outline-none resize-y"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminSection>
  )
}