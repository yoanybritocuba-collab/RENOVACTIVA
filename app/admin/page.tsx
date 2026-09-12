'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Image as ImageIcon, Search, Edit, Trash2, Eye, EyeOff, Star } from 'lucide-react'
import { sbGet, sbDelete } from './lib/supabase'

type Trabajo = {
  id: number
  titulo: string
  descripcion: string
  categoria_id: number | null
  ubicacion: string
  fecha: string | null
  imagenes: string[]
  portada: string
  publicado: boolean
  destacado: boolean
  orden: number
}

type Categoria = {
  id: number
  nombre: string
  slug: string
  icono: string
}

export default function TrabajosPage() {
  const [loading, setLoading] = useState(true)
  const [trabajos, setTrabajos] = useState<Trabajo[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [t, c] = await Promise.all([
        sbGet('trabajos_realizados', 'select=*&order=orden.asc,created_at.desc').catch(() => []),
        sbGet('trabajos_categorias', 'select=*&order=orden.asc').catch(() => []),
      ])
      setTrabajos(Array.isArray(t) ? t : [])
      setCategorias(Array.isArray(c) ? c : [])
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  async function eliminar(id: number) {
    try {
      await sbDelete('trabajos_realizados', id)
      setTrabajos(trabajos.filter((t) => t.id !== id))
      setConfirmDelete(null)
    } catch (err) {
      alert('Error al eliminar')
    }
  }

  async function togglePublicado(t: Trabajo) {
    try {
      const { sbPatch } = await import('./lib/supabase')
      await sbPatch('trabajos_realizados', t.id, { publicado: !t.publicado })
      setTrabajos(trabajos.map((x) => (x.id === t.id ? { ...x, publicado: !x.publicado } : x)))
    } catch {}
  }

  async function toggleDestacado(t: Trabajo) {
    try {
      const { sbPatch } = await import('./lib/supabase')
      await sbPatch('trabajos_realizados', t.id, { destacado: !t.destacado })
      setTrabajos(trabajos.map((x) => (x.id === t.id ? { ...x, destacado: !x.destacado } : x)))
    } catch {}
  }

  const trabajosFiltrados = trabajos.filter((t) => {
    const coincideBusqueda =
      !busqueda ||
      t.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.ubicacion?.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = !filtroCategoria || t.categoria_id === filtroCategoria
    return coincideBusqueda && coincideCategoria
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white/50">
        Cargando...
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto">
      {/* Cabecera */}
      <header className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[10px] uppercase tracking-[.2em] text-[#10B981]">
            Álbum de trabajos
          </p>
          <h1 className="font-serif text-3xl mt-1">Trabajos realizados</h1>
          <p className="text-white/40 text-sm mt-1">
            {trabajos.length} trabajos · {trabajos.filter((t) => t.publicado).length} publicados
          </p>
        </div>
        <Link
          href="/admin/trabajos/nuevo"
          className="flex items-center gap-2 bg-[#10B981] text-white px-5 py-3 rounded-xl hover:bg-[#10B981]/80 transition-colors font-medium text-sm"
        >
          <Plus className="size-4" />
          Nuevo trabajo
        </Link>
      </header>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/30" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por título, descripción o ubicación..."
            className="w-full bg-white/[.02] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-[#10B981] transition-colors"
          />
        </div>
        <select
          value={filtroCategoria || ''}
          onChange={(e) => setFiltroCategoria(e.target.value ? Number(e.target.value) : null)}
          className="bg-white/[.02] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#10B981]"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icono} {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Listado */}
      {trabajosFiltrados.length === 0 ? (
        <div className="border border-dashed border-white/10 rounded-2xl p-16 text-center">
          <ImageIcon className="size-12 text-white/20 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-1">No hay trabajos todavía</h3>
          <p className="text-white/40 text-sm mb-6">
            Empieza creando tu primer trabajo realizado
          </p>
          <Link
            href="/admin/trabajos/nuevo"
            className="inline-flex items-center gap-2 bg-[#10B981] text-white px-5 py-3 rounded-xl hover:bg-[#10B981]/80 transition-colors font-medium text-sm"
          >
            <Plus className="size-4" />
            Crear primer trabajo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {trabajosFiltrados.map((t) => {
            const categoria = categorias.find((c) => c.id === t.categoria_id)
            return (
              <div
                key={t.id}
                className="group border border-white/10 bg-white/[.02] rounded-2xl overflow-hidden hover:border-white/20 transition-all"
              >
                {/* Portada */}
                <div className="relative aspect-[4/3] bg-white/5 overflow-hidden">
                  {t.portada || (t.imagenes && t.imagenes.length > 0) ? (
                    <img
                      src={t.portada || t.imagenes[0]}
                      alt={t.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="size-10 text-white/20" />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    {t.publicado ? (
                      <span className="bg-[#10B981] text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1">
                        <Eye className="size-3" /> Publicado
                      </span>
                    ) : (
                      <span className="bg-amber-500 text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1">
                        <EyeOff className="size-3" /> Borrador
                      </span>
                    )}
                    {t.destacado && (
                      <span className="bg-purple-500 text-white text-[10px] px-2 py-1 rounded-lg flex items-center gap-1">
                        <Star className="size-3" /> Destacado
                      </span>
                    )}
                  </div>

                  {/* Imágenes contador */}
                  {t.imagenes && t.imagenes.length > 0 && (
                    <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] px-2 py-1 rounded-lg">
                      {t.imagenes.length} foto{t.imagenes.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  {categoria && (
                    <p className="text-[10px] uppercase tracking-wider text-[#10B981] mb-1">
                      {categoria.icono} {categoria.nombre}
                    </p>
                  )}
                  <h3 className="text-white font-medium text-sm mb-1 truncate">{t.titulo}</h3>
                  {t.ubicacion && (
                    <p className="text-white/40 text-xs truncate">{t.ubicacion}</p>
                  )}

                  {/* Acciones */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => togglePublicado(t)}
                        className={`p-2 rounded-lg transition-colors ${
                          t.publicado
                            ? 'text-[#10B981] hover:bg-[#10B981]/10'
                            : 'text-white/30 hover:bg-white/5'
                        }`}
                        title={t.publicado ? 'Ocultar' : 'Publicar'}
                      >
                        {t.publicado ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      </button>
                      <button
                        onClick={() => toggleDestacado(t)}
                        className={`p-2 rounded-lg transition-colors ${
                          t.destacado
                            ? 'text-purple-400 hover:bg-purple-500/10'
                            : 'text-white/30 hover:bg-white/5'
                        }`}
                        title={t.destacado ? 'Quitar destacado' : 'Destacar'}
                      >
                        <Star className="size-4" fill={t.destacado ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/trabajos/${t.id}`}
                        className="p-2 rounded-lg text-white/40 hover:bg-white/5 hover:text-[#10B981] transition-colors"
                        title="Editar"
                      >
                        <Edit className="size-4" />
                      </Link>
                      <button
                        onClick={() => setConfirmDelete(t.id)}
                        className="p-2 rounded-lg text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal confirmar borrar */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#0f1115] border border-white/10 rounded-2xl p-6 max-w-md w-full">
            <h3 className="font-serif text-xl text-white mb-2">¿Eliminar trabajo?</h3>
            <p className="text-white/50 text-sm mb-6">
              Esta acción no se puede deshacer. Se eliminarán también las fotos asociadas.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminar(confirmDelete)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}