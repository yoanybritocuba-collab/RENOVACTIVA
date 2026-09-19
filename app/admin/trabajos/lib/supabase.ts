// ============================================================
// CLIENTE DE SUPABASE PARA EL MÓDULO DE TRABAJOS
// ⚠️ Usa la MISMA clave que el resto del proyecto
// ============================================================

export const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
export const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

export const supabaseHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
}

// GET
export async function sbGet(table: string, query: string = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: supabaseHeaders,
    cache: 'no-store'
  })
  if (!res.ok) throw new Error(`Error GET ${table}: ${res.status}`)
  return res.json()
}

// POST
export async function sbPost(table: string, data: any) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...supabaseHeaders, 'Prefer': 'return=representation' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Error POST ${table}: ${res.status}`)
  return res.json()
}

// PATCH
export async function sbPatch(table: string, id: string | number, data: any) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...supabaseHeaders, 'Prefer': 'return=representation' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Error PATCH ${table}: ${res.status}`)
  return res.json()
}

// DELETE
export async function sbDelete(table: string, id: string | number) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'DELETE',
    headers: supabaseHeaders,
  })
  if (!res.ok) throw new Error(`Error DELETE ${table}: ${res.status}`)
  return true
}