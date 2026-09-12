// ============================================================
// CLIENTE DE SUPABASE PARA EL MÓDULO DE TRABAJOS
// ============================================================

export const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
export const SUPABASE_KEY = 'sb_publishable_acJOTZ5reUCVCpJ_vK36ZA_q2bEIhoo'

export const supabaseHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
}

// GET
export async function sbGet(table: string, query: string = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: supabaseHeaders,
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
    headers: { ...supabaseHeaders, 'Prefer': 'return=minimal' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Error PATCH ${table}: ${res.status}`)
  return true
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