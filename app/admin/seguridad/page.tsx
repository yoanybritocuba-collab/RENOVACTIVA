'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Shield, Save, Eye, EyeOff, AlertTriangle, Clock } from 'lucide-react'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

const DEFAULT_EMAIL = 'info@renovactiva.com'
const DEFAULT_PASSWORD = 'Barcelona2026'
const DEFAULT_CODE = '2026*'
const DEFAULT_SECONDS = 900 // 15 minutos

export default function SeguridadPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  
  const [rowId, setRowId] = useState<string | null>(null)
  
  // Credenciales
  const [email, setEmail] = useState(DEFAULT_EMAIL)
  const [password, setPassword] = useState(DEFAULT_PASSWORD)
  const [code, setCode] = useState(DEFAULT_CODE)
  const [inactivitySeconds, setInactivitySeconds] = useState(DEFAULT_SECONDS)
  
  // Mostrar/ocultar
  const [showPassword, setShowPassword] = useState(false)
  const [showCode, setShowCode] = useState(false)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?section=eq.settings&select=*`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` },
        cache: 'no-store'
      })
      if (!res.ok) throw new Error('Error al cargar')
      const data = await res.json()
      if (data.length > 0) {
        const row = data[0]
        setRowId(row.id)
        const c = row.content || {}
        if (c.admin_email) setEmail(c.admin_email)
        if (c.admin_password) setPassword(c.admin_password)
        if (c.admin_code) setCode(c.admin_code)
        if (typeof c.inactivity_seconds === 'number') setInactivitySeconds(c.inactivity_seconds)
      }
    } catch (err) {
      setError('Error: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function saveData(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError(''); setNotice('')
    
    if (!email.trim() || !password.trim() || !code.trim()) {
      setError('Todos los campos son obligatorios')
      setSaving(false)
      return
    }
    
    if (inactivitySeconds < 10 || inactivitySeconds > 7200) {
      setError('El tiempo debe estar entre 10 segundos y 2 horas (7200 seg)')
      setSaving(false)
      return
    }
    
    try {
      const content = {
        admin_email: email.trim(),
        admin_password: password.trim(),
        admin_code: code.trim(),
        inactivity_seconds: inactivitySeconds,
      }
      
      if (rowId) {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?id=eq.${rowId}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ content, updated_at: new Date().toISOString() })
        })
        if (!res.ok) throw new Error('Error al guardar (' + res.status + ')')
      } else {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify({ section: 'settings', content })
        })
        if (!res.ok) throw new Error('Error al crear (' + res.status + ')')
        const created = await res.json()
        setRowId(created?.[0]?.id || null)
      }
      
      setNotice('✅ Guardado correctamente')
      setTimeout(() => setNotice(''), 4000)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen bg-[#11110f] flex items-center justify-center text-white/50">Cargando...</div>

  return (
    <main className="min-h-screen bg-[#11110f] text-[#f3f0e9] p-6 lg:p-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/admin" className="text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="size-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-9 rounded-lg bg-[#d7bd77]/10 border border-[#d7bd77]/30">
              <Shield className="size-5 text-[#d7bd77]" />
            </div>
            <div>
              <h1 className="font-serif text-2xl">Seguridad</h1>
              <p className="text-white/40 text-xs">Cambia las credenciales y el auto-cierre</p>
            </div>
          </div>
        </div>

        <div className="mt-8 border border-yellow-500/30 bg-yellow-500/5 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="size-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-200/80">
            <p className="font-semibold text-yellow-300 mb-1">Importante</p>
            <p>Estos son los datos que se piden al entrar a <code className="text-yellow-300">/admin</code>. Si los pierdes, tendrás que cambiar el código fuente.</p>
          </div>
        </div>

        <form onSubmit={saveData} className="mt-6 space-y-5 border border-white/10 bg-white/[.02] rounded-xl p-6">
          <div>
            <label className="block text-white/60 text-sm mb-2">Correo del admin</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-white/15 px-4 py-3 text-white rounded-lg focus:border-[#d7bd77] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Contraseña real (1er paso)</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border border-white/15 px-4 py-3 text-white rounded-lg focus:border-[#d7bd77] outline-none pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-sm mb-2">Código de seguridad (2º paso)</label>
            <div className="relative">
              <input
                type={showCode ? 'text' : 'password'}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-transparent border border-white/15 px-4 py-3 text-white rounded-lg focus:border-[#d7bd77] outline-none pr-12 font-mono text-lg tracking-widest"
                required
              />
              <button
                type="button"
                onClick={() => setShowCode(!showCode)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
              >
                {showCode ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
              </button>
            </div>
          </div>

          <div className="border-t border-white/10 pt-5">
            <label className="block text-white/60 text-sm mb-2 flex items-center gap-2">
              <Clock className="size-4 text-[#d7bd77]" />
              Tiempo de inactividad (segundos)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={10}
                max={7200}
                value={inactivitySeconds}
                onChange={(e) => setInactivitySeconds(parseInt(e.target.value) || 10)}
                className="w-40 bg-transparent border border-white/15 px-4 py-3 text-white rounded-lg focus:border-[#d7bd77] outline-none text-center text-lg font-mono"
                required
              />
              <span className="text-white/60 text-sm">segundos</span>
            </div>
            <p className="text-white/40 text-xs mt-2">
              Mínimo 10 segundos, máximo 7200 (2 horas). Por defecto: 900 (15 min).
            </p>
          </div>

          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/40 text-red-300 text-sm">{error}</div>}
          {notice && <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/40 text-green-300 text-sm">{notice}</div>}

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-[#d7bd77] py-3 text-[#11110f] font-medium rounded-lg hover:bg-white transition-colors disabled:opacity-50"
          >
            <Save className="size-4" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </form>
      </div>
    </main>
  )
}