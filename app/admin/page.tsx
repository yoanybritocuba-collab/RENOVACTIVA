'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Check, Image as ImageIcon, LayoutDashboard, LogOut, Save, Settings, TextCursorInput } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type SiteContent = {
  id: string
  section: string
  content: Record<string, string>
  sort_order: number
  is_published: boolean
  updated_at: string
}

const emptyContent = { eyebrow: '', title: '', description: '', cta: '' }

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [rows, setRows] = useState<SiteContent[]>([])
  const [selected, setSelected] = useState<SiteContent | null>(null)
  const [form, setForm] = useState<Record<string, string>>(emptyContent)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadContent() {
    const { data, error: contentError } = await supabase.from('site_content').select('id, section, content, sort_order, is_published, updated_at').order('sort_order')
    if (contentError) setError('No se pudo cargar el contenido.')
    else setRows((data ?? []) as SiteContent[])
  }

  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return
      setUser(data.user ? { email: data.user.email } : null)
      if (data.user) await loadContent()
      setLoading(false)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email } : null)
    })
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [supabase])

  function selectRow(row: SiteContent) {
    setSelected(row)
    setForm({ ...emptyContent, ...row.content })
    setNotice('')
    setError('')
  }

  async function signIn(event: React.FormEvent) {
    event.preventDefault()
    setLoading(true); setError('')
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) setError('Correo o contraseña no válidos.')
    else await loadContent()
    setLoading(false)
  }

  async function saveContent(event: React.FormEvent) {
    event.preventDefault()
    if (!selected) return
    setSaving(true); setError(''); setNotice('')
    const { error: saveError } = await supabase.from('site_content').update({ content: form, updated_at: new Date().toISOString() }).eq('id', selected.id)
    if (saveError) setError('No se pudo guardar. Comprueba que tu usuario sea administrador.')
    else { setRows((current) => current.map((row) => row.id === selected.id ? { ...row, content: form, updated_at: new Date().toISOString() } : row)); setNotice('Cambios guardados correctamente.') }
    setSaving(false)
  }

  async function signOut() { await supabase.auth.signOut(); setUser(null); setRows([]); setSelected(null) }

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#11110f] text-[#d7bd77] text-xs uppercase tracking-[.2em]">Cargando panel</main>
  if (!user) return <main className="flex min-h-screen items-center justify-center bg-[#11110f] px-6 text-[#f3f0e9]"><form onSubmit={signIn} className="w-full max-w-md border border-white/10 bg-[#0b0b0a] p-8"><Link href="/" className="font-serif text-lg tracking-[.22em] text-[#d7bd77]">RENOVATIVA</Link><p className="mt-2 text-[9px] uppercase tracking-[.2em] text-white/40">Panel de administración</p><h1 className="mt-12 font-serif text-3xl">Acceso privado</h1><div className="mt-8 flex flex-col gap-4"><label className="text-xs uppercase tracking-[.14em] text-white/50">Correo<input className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#d7bd77]" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label className="text-xs uppercase tracking-[.14em] text-white/50">Contraseña<input className="mt-2 w-full border border-white/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-[#d7bd77]" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label></div>{error && <p className="mt-4 text-sm text-[#d7bd77]">{error}</p>}<button className="mt-8 w-full bg-[#d7bd77] px-4 py-3 text-[10px] uppercase tracking-[.18em] text-[#15140f]" disabled={loading}>Entrar al panel</button></form></main>

  return <main className="min-h-screen bg-[#11110f] text-[#f3f0e9]"><aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-[#0b0b0a] p-7 md:block"><Link href="/" className="font-serif text-lg tracking-[.22em] text-[#d7bd77]">RENOVATIVA</Link><p className="mt-1 text-[9px] uppercase tracking-[.2em] text-white/30">Panel de administración</p><nav className="mt-16 flex flex-col gap-2 text-sm text-white/45"><span className="flex items-center gap-3 bg-[#d7bd77] px-4 py-3 text-[#15140f]"><LayoutDashboard className="size-4" /> Resumen</span><span className="flex items-center gap-3 px-4 py-3"><ImageIcon className="size-4" /> Contenido visual</span><span className="flex items-center gap-3 px-4 py-3"><TextCursorInput className="size-4" /> Textos y SEO</span><span className="flex items-center gap-3 px-4 py-3"><Settings className="size-4" /> Configuración</span></nav><button onClick={signOut} className="absolute bottom-8 left-7 flex items-center gap-3 text-xs text-white/40"><LogOut className="size-4" /> Cerrar sesión</button></aside><section className="md:ml-64"><header className="flex items-center justify-between border-b border-white/10 px-6 py-6 lg:px-10"><div><p className="eyebrow">{user.email}</p><h1 className="font-serif text-3xl">Resumen del sitio</h1></div><Link href="/" className="border border-white/15 px-4 py-2 text-[10px] uppercase tracking-[.18em] text-white/60">Ver sitio</Link></header><div className="p-6 lg:p-10"><div className="grid gap-4 sm:grid-cols-3"><div className="admin-stat"><p>Bloques editables</p><strong>{rows.length}</strong><span>Conectados a Supabase</span></div><div className="admin-stat"><p>Publicados</p><strong>{rows.filter((row) => row.is_published).length}</strong><span>Visibles en el sitio</span></div><div className="admin-stat"><p>Estado</p><strong className="text-2xl">Activo</strong><span>Sesión protegida</span></div></div><div className="mt-12 grid gap-8 lg:grid-cols-[.8fr_1.2fr]"><div><p className="eyebrow">Gestión de contenido</p><h2 className="font-serif text-3xl">Bloques del sitio</h2><div className="mt-6 flex flex-col gap-3">{rows.map((row) => <button key={row.id} onClick={() => selectRow(row)} className={`flex items-center justify-between border p-4 text-left transition-colors ${selected?.id === row.id ? 'border-[#d7bd77] bg-[#d7bd77]/10' : 'border-white/10 bg-white/[.02] hover:border-white/30'}`}><span><span className="block text-sm capitalize">{row.section}</span><span className="mt-1 block text-xs text-white/40">{row.is_published ? 'Publicado' : 'Borrador'}</span></span><BarChart3 className="size-4 text-[#d7bd77]" /></button>)}</div></div><div className="border border-white/10 bg-white/[.02] p-6 lg:p-8">{selected ? <form onSubmit={saveContent}><div className="flex items-start justify-between"><div><p className="eyebrow">Editando {selected.section}</p><h2 className="font-serif text-2xl">Contenido</h2></div><span className="text-[#d7bd77]"><Check className="size-5" /></span></div><div className="mt-8 flex flex-col gap-5">{Object.keys(form).map((key) => <label key={key} className="text-xs uppercase tracking-[.14em] text-white/50">{key}<textarea className="mt-2 min-h-20 w-full resize-y border border-white/15 bg-transparent px-4 py-3 text-sm normal-case tracking-normal text-white outline-none focus:border-[#d7bd77]" value={form[key] ?? ''} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} /> </label>)}</div>{error && <p className="mt-4 text-sm text-[#d7bd77]">{error}</p>}{notice && <p className="mt-4 text-sm text-[#d7bd77]">{notice}</p>}<button disabled={saving} className="mt-8 flex items-center gap-2 bg-[#d7bd77] px-5 py-3 text-[10px] uppercase tracking-[.18em] text-[#15140f]"><Save className="size-4" />{saving ? 'Guardando' : 'Guardar cambios'}</button></form> : <div className="flex min-h-72 items-center justify-center text-center text-white/40"><p>Selecciona un bloque para editar el contenido conectado.</p></div>}</div></div></div></section></main>
}
