// ============================================================
// CONFIGURACIÓN DE SUPABASE PARA EL MÓDULO DE PRESUPUESTOS
// ============================================================

export const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
export const SUPABASE_KEY = 'sb_publishable_acJOTZ5reUCVCpJ_vK36ZA_q2bEIhoo'

// Headers estándar para todas las peticiones
export const supabaseHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
}

// Función auxiliar para hacer peticiones GET
export async function sbGet(table: string, query: string = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: supabaseHeaders,
  })
  if (!res.ok) throw new Error(`Error GET ${table}: ${res.status}`)
  return res.json()
}

// Función auxiliar para hacer peticiones POST
export async function sbPost(table: string, data: any) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...supabaseHeaders, 'Prefer': 'return=representation' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Error POST ${table}: ${res.status}`)
  return res.json()
}

// Función auxiliar para hacer peticiones PATCH
export async function sbPatch(table: string, id: string, data: any) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...supabaseHeaders, 'Prefer': 'return=minimal' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`Error PATCH ${table}: ${res.status}`)
  return true
}

// Función auxiliar para hacer peticiones DELETE
export async function sbDelete(table: string, id: string) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: 'DELETE',
    headers: supabaseHeaders,
  })
  if (!res.ok) throw new Error(`Error DELETE ${table}: ${res.status}`)
  return true
}