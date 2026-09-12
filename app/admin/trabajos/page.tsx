'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Image as ImageIcon, Trash2, Edit, Save, X } from 'lucide-react'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

interface Trabajo {
  id?: number
  titulo: string
  tipo: string
  descripcion: string
  categoria: string
  imagenes: string[]
  cliente: string
  fecha: string
  destacado: boolean
  orden: number
}

const emptyTrabajo: Trabajo = {
  titulo: '',
  tipo: '',
  descripcion: '',
  categoria: '',
  imagenes: [],
  cliente: '',
  fecha: '',
  destacado: false,
  orden: 0
}

export default function AdminTrabajos() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [trabajos, setTrabajos] = useState<Trabajo[]>([])
  const [editing, setEditing] = useState<Trabajo | null>(null)
  const [form, setForm] = useState<Trabajo>(emptyTrabajo)
  const [imageInput, setImageInput] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('')

  useEffect(() => { loadTrabajos() }, [])

  async function loadTrabajos() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/trabajos?select=*&order=orden.asc`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      })
      if (!res.ok) throw new Error('Error al cargar')
      const data = await res.json()
      setTrabajos(data)
    } catch (err) { setError('Error: ' + (err as Error).message) }
    finally { setLoading(false) }
  }

  async function saveTrabajo() {
    setSaving(true); setError(''); setNotice('')
    try {
      const method = form.id ? 'PATCH' : 'POST'
      const url = form.id 
        ? `${SUPABASE_URL}/rest/v1/trabajos?id=eq.${form.id}`
        : `${SUPABASE_URL}/rest/v1/trabajos`
      
      const res = await fetch(url, {
        method,
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          ...form,
          updated_at: new Date().toISOString()
        })
      })
      if (!res.ok) throw new Error('Error al guardar')
      
      const saved = await res.json()
      if (form.id) {
        setTrabajos(trabajos.map(t => t.id === form.id ? saved[0] : t))
      } else {
        setTrabajos([...trabajos, saved[0]])
      }
      setEditing(null)
      setForm(emptyTrabajo)
      setNotice('✅ Trabajo guardado correctamente')
    } catch (err) { setError('❌ ' + (err as Error).message) }
    finally { setSaving(false) }
  }

  async function deleteTrabajo(id: number) {
    if (!confirm('¿Seguro que quieres eliminar este trabajo?')) return
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/trabajos?id=eq.${id}`, {
        method: 'DELETE',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      })
      if (!res.ok) throw new Error('Error al eliminar')
      setTrabajos(trabajos.filter(t => t.id !== id))
      setNotice('✅ Trabajo eliminado')
    } catch (err) { setError('❌ ' + (err as Error).message) }
  }

  function startEdit(trabajo: Trabajo) {
    setEditing(trabajo)
    setForm(trabajo)
  }

  function cancelEdit() {
    setEditing(null)
    setForm(emptyTrabajo)
    setImageInput('')
  }

  function addImage() {
    if (!imageInput.trim()) return
    setForm({ ...form, imagenes: [...form.imagenes, imageInput.trim()] })
    setImageInput('')
  }

  function removeImage(index: number) {
    setForm({ ...form, imagenes: form.imagenes.filter((_, i) => i !== index) })
  }

  const categorias = [...new Set(trabajos.map(t => t.categoria).filter(Boolean))]
  const trabajosFiltrados = filterCategoria 
    ? trabajos.filter(t => t.categoria === filterCategoria)
    : trabajos

  if (loading) return <div className="min-h-screen bg-[#11110f] flex items-center justify-center text-white/50">Cargando...</div>

  return (
    <div className="min-h-screen bg-[#11110f] text-[#f3f0e9]">
      <header className="sticky top-0 z-50 bg-[#11110f]/95 backdrop-blur-sm border-b border-white/10 px-4 py-3 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5">
              <ArrowLeft className="size-5" />
            </Link>
            <div>
              <h1 className="font-serif text-xl sm:text-2xl text-[#d7bd77]">📁 Trabajos</h1>
              <p className="text-white/40 text-xs sm:text-sm">Álbum de proyectos ({trabajos.length})</p>
            </div>
          </div>
          <button
            onClick={() => { setEditing(emptyTrabajo); setForm(emptyTrabajo); }}
            className="flex items-center gap-2 bg-[#d7bd77] px-4 py-2 text-[#11110f] rounded-lg hover:bg-white transition-colors text-sm font-medium"
          >
            <Plus className="size-4" /> Nuevo trabajo
          </button>
        </div>
      </header>

      {error && <div className="max-w-7xl mx-auto px-4 pt-4"><div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2.5 rounded-lg text-sm">{error}</div></div>}
      {notice && <div className="max-w-7xl mx-auto px-4 pt-4"><div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-2.5 rounded-lg text-sm">{notice}</div></div>}

      <div className="max-w-7xl mx-auto px-4 py-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Lista de trabajos */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-[#d7bd77]">Lista de trabajos</h2>
            <select
              value={filterCategoria}
              onChange={(e) => setFilterCategoria(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#d7bd77] outline-none"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="space-y-3">
            {trabajosFiltrados.map((trabajo) => (
              <div
                key={trabajo.id}
                className={`border rounded-xl p-4 cursor-pointer transition-colors ${
                  editing?.id === trabajo.id ? 'border-[#d7bd77] bg-[#d7bd77]/10' : 'border-white/10 bg-white/[.02] hover:border-white/30'
                }`}
                onClick={() => startEdit(trabajo)}
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                    {trabajo.imagenes?.[0] ? (
                      <img src={trabajo.imagenes[0]} alt={trabajo.titulo} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20"><ImageIcon className="size-6" /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#d7bd77]">{trabajo.tipo}</p>
                    <h3 className="font-serif text-lg text-white truncate">{trabajo.titulo}</h3>
                    <p className="text-white/40 text-xs truncate">{trabajo.categoria} · {trabajo.imagenes?.length || 0} fotos</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteTrabajo(trabajo.id!) }}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
            {trabajosFiltrados.length === 0 && (
              <p className="text-white/40 text-center py-8">No hay trabajos en esta categoría</p>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="border border-white/10 bg-white/[.02] rounded-xl p-5">
          {editing !== null || form.titulo ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl text-[#d7bd77]">{form.id ? 'Editar trabajo' : 'Nuevo trabajo'}</h2>
                <button onClick={cancelEdit} className="text-white/40 hover:text-white"><X className="size-5" /></button>
              </div>

              <div>
                <label className="block text-white/50 text-sm mb-1">Título</label>
                <input type="text" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" placeholder="Casa Paseo del Prado" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/50 text-sm mb-1">Tipo</label>
                  <input type="text" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" placeholder="Vivienda integral" />
                </div>
                <div>
                  <label className="block text-white/50 text-sm mb-1">Categoría</label>
                  <input type="text" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" placeholder="Viviendas" list="categorias-list" />
                  <datalist id="categorias-list">
                    {categorias.map(cat => <option key={cat} value={cat} />)}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/50 text-sm mb-1">Cliente</label>
                  <input type="text" value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" placeholder="Nombre del cliente" />
                </div>
                <div>
                  <label className="block text-white/50 text-sm mb-1">Fecha</label>
                  <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-white/50 text-sm mb-1">Descripción</label>
                <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm resize-y" placeholder="Descripción del proyecto..." />
              </div>

              <div>
                <label className="block text-white/50 text-sm mb-1">Imágenes</label>
                <div className="flex gap-2 mb-3">
                  <input type="text" value={imageInput} onChange={(e) => setImageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addImage()}
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" placeholder="https://images.unsplash.com/..." />
                  <button onClick={addImage} className="bg-[#d7bd77] text-[#11110f] px-4 py-2.5 rounded-lg font-medium hover:bg-white transition-colors text-sm">Añadir</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {form.imagenes.map((img, i) => (
                    <div key={i} className="relative group aspect-video">
                      <img src={img} alt={`Imagen ${i+1}`} className="w-full h-full object-cover rounded-lg" />
                      <button onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1 bg-red-500/80 rounded opacity-0 group-hover:opacity-100">
                        <Trash2 className="size-3 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="destacado" checked={form.destacado} onChange={(e) => setForm({ ...form, destacado: e.target.checked })}
                  className="size-4 rounded border-white/20 bg-white/5" />
                <label htmlFor="destacado" className="text-white/70 text-sm">Destacado</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={saveTrabajo} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#d7bd77] px-4 py-3 text-[#11110f] rounded-lg hover:bg-white transition-colors disabled:opacity-50 text-sm font-medium">
                  <Save className="size-4" /> {saving ? 'Guardando...' : 'Guardar trabajo'}
                </button>
                <button onClick={cancelEdit} className="px-4 py-3 border border-white/15 text-white/60 rounded-lg hover:bg-white/5 text-sm">Cancelar</button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Edit className="size-12 text-white/20 mb-4" />
              <p className="text-white/60 mb-2">Selecciona un trabajo para editar</p>
              <p className="text-white/30 text-sm">O crea uno nuevo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}