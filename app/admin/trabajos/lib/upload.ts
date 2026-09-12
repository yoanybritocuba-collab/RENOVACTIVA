import { SUPABASE_URL, SUPABASE_KEY } from './supabase'

// ============================================================
// SUBIR UNA FOTO AL BUCKET "trabajos"
// ============================================================
export async function subirFoto(file: File): Promise<string> {
  // Generar nombre único
  const timestamp = Date.now()
  const nombreLimpio = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, '-')
    .replace(/-+/g, '-')
  const ruta = `${timestamp}-${nombreLimpio}`

  // Subir al bucket
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/trabajos/${ruta}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': file.type,
      'x-upsert': 'true',
    },
    body: file,
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Error al subir: ${error}`)
  }

  // Devolver URL pública
  return `${SUPABASE_URL}/storage/v1/object/public/trabajos/${ruta}`
}

// ============================================================
// ELIMINAR UNA FOTO DEL BUCKET
// ============================================================
export async function eliminarFoto(url: string): Promise<void> {
  // Extraer ruta de la URL
  const match = url.match(/\/trabajos\/(.+)$/)
  if (!match) return

  const ruta = match[1]
  await fetch(`${SUPABASE_URL}/storage/v1/object/trabajos/${ruta}`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
    },
  })
}