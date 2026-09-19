'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Image as ImageIcon, Trash2, Edit, Save, X, Pencil } from 'lucide-react'
import ImageUploader from '@/components/admin/ImageUploader'

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
  const [categoriasDB, setCategoriasDB] = useState<string[]>([])
  const [editing, setEditing] = useState<Trabajo | null>(null)
  const [form, setForm] = useState<Trabajo>(emptyTrabajo)
  const [filterCategoria, setFilterCategoria] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  
  const [newCatMode, setNewCatMode] = useState(false)
  const [newCatName, setNewCatName] = useState('')
  const [savingCat, setSavingCat] = useState(false)
  
  const [renameCatMode, setRenameCatMode] = useState(false)
  const [renameCatValue, setRenameCatValue] = useState('')

  useEffect(() => { 
    loadTrabajos()
    loadCategorias()
  }, [])

  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [modalOpen])

  function updateForm<K extends keyof Trabajo>(key: K, value: Trabajo[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function loadTrabajos() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/trabajos?select=*&order=orden.asc`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
        cache: 'no-store'
      })
      if (!res.ok) throw new Error('Error al cargar')
      const data = await res.json()
      
      const cleanData = Array.isArray(data) 
        ? data
            .filter((t: any) => t !== null && t !== undefined)
            .map((t: any) => ({
              id: t.id,
              titulo: t.titulo || '',
              tipo: t.tipo || '',
              descripcion: t.descripcion || '',
              categoria: t.categoria || '',
              imagenes: Array.isArray(t.imagenes) ? t.imagenes : [],
              cliente: t.cliente || '',
              fecha: t.fecha || '',
              destacado: t.destacado || false,
              orden: t.orden || 0,
            }))
        : []
      
      setTrabajos(cleanData)
    } catch (err) { 
      setError('Error: ' + (err as Error).message) 
    }
    finally { 
      setLoading(false) 
    }
  }

  async function loadCategorias() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?section=eq.categories&select=content`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
        cache: 'no-store'
      })
      if (res.ok) {
        const data = await res.json()
        if (data.length > 0 && data[0].content?.items) {
          const nombres = data[0].content.items
            .sort((a: any, b: any) => (a.orden || 0) - (b.orden || 0))
            .map((c: any) => c.nombre?.es)
            .filter(Boolean)
          setCategoriasDB(nombres)
        }
      }
    } catch (e) { 
      console.warn('Error cargando categorías:', e) 
    }
  }

  async function createNewCategory() {
    if (!newCatName.trim()) return
    setSavingCat(true)
    
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?section=eq.categories&select=*`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      })
      const data = await res.json()
      
      if (data.length === 0) throw new Error('No existe la sección categories')
      
      const current = data[0]
      const currentItems = current.content?.items || []
      const maxOrden = Math.max(0, ...currentItems.map((i: any) => i.orden || 0))
      
      let caName = newCatName.trim()
      try {
        const translateRes = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: newCatName.trim(), targetLanguage: 'ca' })
        })
        if (translateRes.ok) {
          const t = await translateRes.json()
          if (t.translation) caName = t.translation
        }
      } catch (e) {
        console.warn('Traducción falló:', e)
      }
      
      const newItem = {
        id: `cat-${Date.now()}`,
        nombre: { es: newCatName.trim(), ca: caName },
        orden: maxOrden + 1
      }
      
      const updatedItems = [...currentItems, newItem]
      
      const saveRes = await fetch(`${SUPABASE_URL}/rest/v1/site_content?id=eq.${current.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          content: { items: updatedItems },
          updated_at: new Date().toISOString()
        })
      })
      
      if (!saveRes.ok) throw new Error('Error guardando categoría')
      
      updateForm('categoria', newCatName.trim())
      await loadCategorias()
      
      try {
        await fetch('/api/revalidate', { method: 'POST' })
      } catch (e) { console.warn('Revalidate falló:', e) }
      
      setNewCatMode(false)
      setNewCatName('')
      setNotice(`✅ Categoría "${newCatName.trim()}" creada`)
      setTimeout(() => setNotice(''), 3000)
      
    } catch (err) {
      setError('❌ ' + (err as Error).message)
    } finally {
      setSavingCat(false)
    }
  }

  async function renameCategory() {
    const oldName = form.categoria
    const newName = renameCatValue.trim()
    
    if (!oldName || !newName || oldName === newName) {
      setRenameCatMode(false)
      return
    }
    
    setSavingCat(true)
    
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?section=eq.categories&select=*`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      })
      const data = await res.json()
      if (data.length === 0) throw new Error('No existe la sección categories')
      
      const current = data[0]
      const currentItems = current.content?.items || []
      
      let caName = newName
      try {
        const translateRes = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: newName, targetLanguage: 'ca' })
        })
        if (translateRes.ok) {
          const t = await translateRes.json()
          if (t.translation) caName = t.translation
        }
      } catch (e) { console.warn('Traducción falló:', e) }
      
      const updatedItems = currentItems.map((item: any) => {
        if (item.nombre?.es === oldName) {
          return { ...item, nombre: { es: newName, ca: caName } }
        }
        return item
      })
      
      const saveRes = await fetch(`${SUPABASE_URL}/rest/v1/site_content?id=eq.${current.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          content: { items: updatedItems },
          updated_at: new Date().toISOString()
        })
      })
      
      if (!saveRes.ok) throw new Error('Error guardando categoría')
      
      const trabajosAfectados = trabajos.filter(t => t.categoria === oldName)
      
      for (const trabajo of trabajosAfectados) {
        if (!trabajo.id) continue
        await fetch(`${SUPABASE_URL}/rest/v1/trabajos?id=eq.${trabajo.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ categoria: newName })
        })
      }
      
      updateForm('categoria', newName)
      
      await loadCategorias()
      await loadTrabajos()
      
      try {
        await fetch('/api/revalidate', { method: 'POST' })
      } catch (e) { console.warn('Revalidate falló:', e) }
      
      setRenameCatMode(false)
      setRenameCatValue('')
      setNotice(`✅ Categoría renombrada. ${trabajosAfectados.length} trabajos actualizados.`)
      setTimeout(() => setNotice(''), 4000)
      
    } catch (err) {
      setError('❌ ' + (err as Error).message)
    } finally {
      setSavingCat(false)
    }
  }

  async function deleteCategory() {
    const nameToDelete = form.categoria
    if (!nameToDelete) return
    
    const trabajosAfectados = trabajos.filter(t => t.categoria === nameToDelete)
    
    const confirmMsg = trabajosAfectados.length > 0
      ? `⚠️ "${nameToDelete}" se usa en ${trabajosAfectados.length} trabajo(s).\n\nSi la eliminas, esos trabajos quedarán "Sin categoría".\n\n¿Eliminar de todas formas?`
      : `¿Eliminar la categoría "${nameToDelete}"?`
    
    if (!confirm(confirmMsg)) return
    
    setSavingCat(true)
    
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?section=eq.categories&select=*`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      })
      const data = await res.json()
      if (data.length === 0) throw new Error('No existe la sección categories')
      
      const current = data[0]
      const currentItems = current.content?.items || []
      
      const updatedItems = currentItems.filter((item: any) => item.nombre?.es !== nameToDelete)
      
      const saveRes = await fetch(`${SUPABASE_URL}/rest/v1/site_content?id=eq.${current.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          content: { items: updatedItems },
          updated_at: new Date().toISOString()
        })
      })
      
      if (!saveRes.ok) throw new Error('Error guardando categoría')
      
      for (const trabajo of trabajosAfectados) {
        if (!trabajo.id) continue
        await fetch(`${SUPABASE_URL}/rest/v1/trabajos?id=eq.${trabajo.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ categoria: '' })
        })
      }
      
      updateForm('categoria', '')
      
      await loadCategorias()
      await loadTrabajos()
      
      try {
        await fetch('/api/revalidate', { method: 'POST' })
      } catch (e) { console.warn('Revalidate falló:', e) }
      
      setNotice(`✅ Categoría "${nameToDelete}" eliminada`)
      setTimeout(() => setNotice(''), 3000)
      
    } catch (err) {
      setError('❌ ' + (err as Error).message)
    } finally {
      setSavingCat(false)
    }
  }

  async function saveTrabajo() {
    setSaving(true)
    setError('')
    setNotice('Guardando...')
    
    try {
      if (!form.categoria.trim()) {
        throw new Error('La categoría es obligatoria')
      }
      
      const method = form.id ? 'PATCH' : 'POST'
      const url = form.id 
        ? `${SUPABASE_URL}/rest/v1/trabajos?id=eq.${form.id}`
        : `${SUPABASE_URL}/rest/v1/trabajos`
      
      const payload = {
        titulo: form.titulo.trim(),
        tipo: form.tipo.trim(),
        descripcion: form.descripcion.trim(),
        categoria: form.categoria.trim(),
        imagenes: form.imagenes || [],
        cliente: form.cliente.trim(),
        fecha: form.fecha,
        destacado: form.destacado,
        orden: form.orden,
        updated_at: new Date().toISOString()
      }
      
      console.log('📤 Enviando ' + method + ':', payload)
      
      const res = await fetch(url, {
        method,
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      })
      
      if (!res.ok) {
        const errText = await res.text()
        console.error('❌ Error Supabase:', res.status, errText)
        throw new Error(`Error ${res.status}: ${errText}`)
      }
      
      console.log('✅ Guardado OK - Status:', res.status)
      
      setModalOpen(false)
      setEditing(null)
      setForm(emptyTrabajo)
      setNewCatMode(false)
      setNewCatName('')
      setRenameCatMode(false)
      setRenameCatValue('')
      
      await loadTrabajos()
      
      try {
        await fetch('/api/revalidate', { method: 'POST' })
      } catch (e) {
        console.warn('Revalidate falló:', e)
      }

      setNotice('✅ Trabajo guardado correctamente')
      setTimeout(() => setNotice(''), 4000)
    } catch (err) { 
      setError('❌ ' + (err as Error).message) 
    }
    finally { 
      setSaving(false) 
    }
  }

  async function deleteTrabajo(id: number) {
    if (!confirm('¿Seguro que quieres eliminar este trabajo?')) return
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/trabajos?id=eq.${id}`, {
        method: 'DELETE',
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      })
      if (!res.ok) throw new Error('Error al eliminar')
      
      await loadTrabajos()
      
      try {
        await fetch('/api/revalidate', { method: 'POST' })
      } catch (e) {
        console.warn('Revalidate falló:', e)
      }

      setNotice('✅ Trabajo eliminado')
      setTimeout(() => setNotice(''), 3000)
    } catch (err) { 
      setError('❌ ' + (err as Error).message) 
    }
  }

  function openEdit(trabajo: Trabajo) {
    if (!trabajo) return
    setEditing(trabajo)
    setForm({
      id: trabajo.id,
      titulo: trabajo.titulo || '',
      tipo: trabajo.tipo || '',
      descripcion: trabajo.descripcion || '',
      categoria: trabajo.categoria || '',
      imagenes: trabajo.imagenes || [],
      cliente: trabajo.cliente || '',
      fecha: trabajo.fecha || '',
      destacado: trabajo.destacado || false,
      orden: trabajo.orden || 0,
    })
    setError('')
    setNewCatMode(false)
    setNewCatName('')
    setRenameCatMode(false)
    setRenameCatValue('')
    setModalOpen(true)
  }

  function openNew() {
    setEditing(null)
    setForm(emptyTrabajo)
    setError('')
    setNewCatMode(false)
    setNewCatName('')
    setRenameCatMode(false)
    setRenameCatValue('')
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
    setForm(emptyTrabajo)
    setError('')
    setNewCatMode(false)
    setNewCatName('')
    setRenameCatMode(false)
    setRenameCatValue('')
  }

  const trabajosLimpios = trabajos.filter((t): t is Trabajo => 
    t !== null && 
    t !== undefined && 
    typeof t === 'object'
  )

  const categorias = [...new Set([
    ...categoriasDB,
    ...trabajosLimpios
      .map(t => t.categoria)
      .filter((c): c is string => typeof c === 'string' && c.length > 0)
  ])]
  
  const trabajosFiltrados = filterCategoria 
    ? trabajosLimpios.filter(t => t.categoria === filterCategoria)
    : trabajosLimpios

  if (loading) return <div className="min-h-screen bg-[#11110f] flex items-center justify-center text-white/50">Cargando...</div>

  return (
    <div className="min-h-screen bg-[#11110f] text-[#f3f0e9]">
      <header className="sticky top-0 z-[100] bg-[#11110f]/95 backdrop-blur-md border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Link href="/admin" className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5 flex-shrink-0">
              <ArrowLeft className="size-5" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-lg sm:text-xl lg:text-2xl text-[#d7bd77] truncate">Trabajos</h1>
              <p className="text-white/40 text-xs sm:text-sm truncate">{trabajosLimpios.length} proyectos</p>
            </div>
          </div>
          <button
            onClick={openNew}
            className="flex-shrink-0 flex items-center gap-2 bg-[#d7bd77] px-3 py-2 sm:px-4 sm:py-2.5 text-[#11110f] rounded-lg hover:bg-white transition-colors text-xs sm:text-sm font-medium shadow-lg"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">Nuevo trabajo</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2.5 rounded-lg text-sm">{error}</div>
        </div>
      )}
      {notice && (
        <div className="max-w-7xl mx-auto px-4 pt-4">
          <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-2.5 rounded-lg text-sm">{notice}</div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        
        <div className="flex items-center justify-between mb-4 gap-3">
          <h2 className="font-serif text-lg sm:text-xl text-[#d7bd77]">Lista de trabajos</h2>
          <select
            value={filterCategoria}
            onChange={(e) => setFilterCategoria(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-[#d7bd77] outline-none max-w-[160px]"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {trabajosFiltrados.map((trabajo, index) => {
            if (!trabajo) return null
            
            return (
              <div
                key={trabajo.id ?? `trabajo-${index}`}
                className="group border border-white/10 bg-white/[.02] rounded-xl overflow-hidden hover:border-[#d7bd77]/50 transition-colors"
              >
                <div className="relative aspect-video bg-white/5 overflow-hidden">
                  {trabajo.imagenes?.[0] ? (
                    <img 
                      src={trabajo.imagenes[0]} 
                      alt={trabajo.titulo || ''} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <ImageIcon className="size-10" />
                    </div>
                  )}
                  
                  {trabajo.destacado && (
                    <div className="absolute top-2 right-2 bg-[#d7bd77] text-[#11110f] text-[9px] uppercase tracking-wider px-2 py-1 rounded">
                      Destacado
                    </div>
                  )}
                  
                  <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded flex items-center gap-1">
                    <ImageIcon className="size-3" />
                    {trabajo.imagenes?.length || 0}
                  </div>
                </div>

                <div className="p-3 sm:p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#d7bd77] truncate mb-1">
                    {trabajo.tipo || 'Sin tipo'}
                  </p>
                  <h3 className="font-serif text-base sm:text-lg text-white truncate mb-1">
                    {trabajo.titulo || 'Sin título'}
                  </h3>
                  <p className={`text-xs truncate mb-3 ${trabajo.categoria ? 'text-white/40' : 'text-yellow-400'}`}>
                    {trabajo.categoria || '⚠️ Sin categoría'}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(trabajo)}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-[#d7bd77]/20 border border-[#d7bd77]/40 text-[#d7bd77] px-3 py-2 rounded-lg hover:bg-[#d7bd77] hover:text-[#11110f] transition-colors text-xs font-medium"
                    >
                      <Edit className="size-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => deleteTrabajo(trabajo.id!)}
                      className="flex items-center justify-center gap-1.5 bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-colors text-xs"
                      aria-label="Eliminar trabajo"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {trabajosFiltrados.length === 0 && (
          <div className="text-center py-16 border border-white/10 rounded-xl bg-white/[.02]">
            <ImageIcon className="size-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 mb-2">No hay trabajos</p>
            <button
              onClick={openNew}
              className="inline-flex items-center gap-2 bg-[#d7bd77] text-[#11110f] px-4 py-2 rounded-lg hover:bg-white transition-colors text-sm font-medium mt-2"
            >
              <Plus className="size-4" /> Crear el primero
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <div 
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
          onClick={closeModal}
        >
          <div 
            className="bg-[#11110f] border border-white/10 rounded-none sm:rounded-xl w-full sm:max-w-2xl my-0 sm:my-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-[#11110f] border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 rounded-t-xl">
              <h2 className="font-serif text-lg sm:text-xl text-[#d7bd77] truncate">
                {form.id ? 'Editar trabajo' : 'Nuevo trabajo'}
              </h2>
              <button 
                onClick={closeModal} 
                className="text-white/40 hover:text-white p-1.5 rounded-lg hover:bg-white/5 flex-shrink-0"
                aria-label="Cerrar"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 max-h-[calc(100vh-180px)] overflow-y-auto">
              
              <div>
                <label className="block text-white/50 text-xs sm:text-sm mb-1">Título *</label>
                <input 
                  type="text" 
                  value={form.titulo} 
                  onChange={(e) => updateForm('titulo', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" 
                  placeholder="Casa Paseo del Prado" 
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/50 text-xs sm:text-sm mb-1">Tipo</label>
                  <input 
                    type="text" 
                    value={form.tipo} 
                    onChange={(e) => updateForm('tipo', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" 
                    placeholder="Vivienda integral" 
                  />
                </div>
                <div>
                  <label className={`block text-xs sm:text-sm mb-1 ${!form.categoria.trim() ? 'text-yellow-400' : 'text-white/50'}`}>
                    Categoría * {!form.categoria.trim() && '⚠️'}
                  </label>
                  
                  {!newCatMode && !renameCatMode && (
                    <div className="flex gap-2">
                      <select
                        value={form.categoria}
                        onChange={(e) => {
                          const val = e.target.value
                          if (val === '__NEW__') {
                            setNewCatMode(true)
                            setNewCatName('')
                          } else {
                            updateForm('categoria', val)
                          }
                        }}
                        className={`flex-1 bg-white/5 border rounded-lg px-3 sm:px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm ${
                          !form.categoria.trim() ? 'border-yellow-400/50' : 'border-white/10'
                        }`}
                      >
                        <option value="">— Selecciona categoría —</option>
                        {categorias.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="__NEW__">➕ Crear nueva categoría...</option>
                      </select>
                      
                      {form.categoria && (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setRenameCatMode(true)
                              setRenameCatValue(form.categoria)
                            }}
                            title="Renombrar categoría"
                            className="px-3 py-2 bg-[#d7bd77]/20 border border-[#d7bd77]/40 text-[#d7bd77] rounded-lg hover:bg-[#d7bd77] hover:text-[#11110f] transition-colors"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={deleteCategory}
                            title="Eliminar categoría"
                            className="px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                  
                  {newCatMode && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            createNewCategory()
                          }
                          if (e.key === 'Escape') {
                            setNewCatMode(false)
                            setNewCatName('')
                          }
                        }}
                        autoFocus
                        placeholder="Ej: Rehabilitaciones"
                        className="flex-1 bg-white/5 border border-[#d7bd77] rounded-lg px-3 py-2.5 text-white focus:outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={createNewCategory}
                        disabled={savingCat || !newCatName.trim()}
                        className="px-3 py-2 bg-[#d7bd77] text-[#11110f] rounded-lg hover:bg-white transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        {savingCat ? '...' : '✓'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setNewCatMode(false); setNewCatName('') }}
                        className="px-3 py-2 bg-white/5 border border-white/10 text-white/60 rounded-lg hover:bg-white/10 transition-colors text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  
                  {renameCatMode && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={renameCatValue}
                        onChange={(e) => setRenameCatValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            renameCategory()
                          }
                          if (e.key === 'Escape') {
                            setRenameCatMode(false)
                            setRenameCatValue('')
                          }
                        }}
                        autoFocus
                        className="flex-1 bg-white/5 border border-[#d7bd77] rounded-lg px-3 py-2.5 text-white focus:outline-none text-sm"
                      />
                      <button
                        type="button"
                        onClick={renameCategory}
                        disabled={savingCat || !renameCatValue.trim()}
                        className="px-3 py-2 bg-[#d7bd77] text-[#11110f] rounded-lg hover:bg-white transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        {savingCat ? '...' : '✓'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setRenameCatMode(false); setRenameCatValue('') }}
                        className="px-3 py-2 bg-white/5 border border-white/10 text-white/60 rounded-lg hover:bg-white/10 transition-colors text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-white/50 text-xs sm:text-sm mb-1">Cliente</label>
                  <input 
                    type="text" 
                    value={form.cliente} 
                    onChange={(e) => updateForm('cliente', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" 
                    placeholder="Nombre del cliente" 
                  />
                </div>
                <div>
                  <label className="block text-white/50 text-xs sm:text-sm mb-1">Fecha</label>
                  <input 
                    type="date" 
                    value={form.fecha} 
                    onChange={(e) => updateForm('fecha', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/50 text-xs sm:text-sm mb-1">Descripción</label>
                <textarea 
                  value={form.descripcion} 
                  onChange={(e) => updateForm('descripcion', e.target.value)} 
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2.5 text-white focus:border-[#d7bd77] outline-none text-sm resize-y" 
                  placeholder="Descripción del proyecto..." 
                />
              </div>

              <div>
                <h3 className="text-white/60 text-sm font-semibold mb-3">Imágenes del trabajo</h3>
                <ImageUploader
                  images={form.imagenes || []}
                  onChange={(imagenes) => updateForm('imagenes', imagenes)}
                  folder={`trabajos/${form.titulo || 'nuevo'}`}
                  maxImages={20}
                />
              </div>

              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  id="destacado" 
                  checked={form.destacado} 
                  onChange={(e) => updateForm('destacado', e.target.checked)}
                  className="size-4 rounded border-white/20 bg-white/5" 
                />
                <label htmlFor="destacado" className="text-white/70 text-sm">Destacado</label>
              </div>

              {!form.categoria.trim() && (
                <p className="text-yellow-400 text-xs text-center bg-yellow-400/10 border border-yellow-400/30 px-3 py-2 rounded-lg">
                  ⚠️ La categoría es obligatoria para guardar
                </p>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2.5 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-[#11110f] border-t border-white/10 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row gap-3 rounded-b-xl">
              <button 
                onClick={saveTrabajo} 
                disabled={saving || !form.titulo.trim() || !form.categoria.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-[#d7bd77] px-4 py-3 text-[#11110f] rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-lg"
              >
                <Save className="size-4" /> 
                {saving ? 'Guardando...' : form.id ? 'Guardar cambios' : 'Crear trabajo'}
              </button>
              <button 
                onClick={closeModal} 
                className="px-4 py-3 border border-white/15 text-white/60 rounded-lg hover:bg-white/5 text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}