import { NextResponse } from 'next/server'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

// Alfabeto sin caracteres confusos (0/O, 1/I/L)
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function randomChunk(length: number): string {
  let result = ''
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  for (let i = 0; i < length; i++) {
    result += ALPHABET[bytes[i] % ALPHABET.length]
  }
  return result
}

function generateCode(): string {
  return `RNV-${randomChunk(4)}-${randomChunk(4)}`
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { cliente_nombre, cliente_email, cliente_telefono, proyecto } = body

    if (!cliente_nombre || !cliente_nombre.trim()) {
      return NextResponse.json({ error: 'El nombre del cliente es obligatorio' }, { status: 400 })
    }

    // Intentar generar un código único (max 5 intentos)
    let code = ''
    let inserted = false
    let attempts = 0

    while (!inserted && attempts < 5) {
      code = generateCode()
      attempts++

      const res = await fetch(`${SUPABASE_URL}/rest/v1/review_codes`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          code,
          cliente_nombre: cliente_nombre.trim(),
          cliente_email: cliente_email?.trim() || null,
          cliente_telefono: cliente_telefono?.trim() || null,
          proyecto: proyecto?.trim() || null,
          usado: false
        })
      })

      if (res.ok) {
        inserted = true
        const data = await res.json()
        return NextResponse.json({ success: true, code, record: data[0] })
      }

      // Si es error 409 (unique violation) → reintentar
      // Si es otro error → devolverlo
      const errorText = await res.text()
      if (!errorText.includes('duplicate') && !errorText.includes('unique')) {
        console.error('Error Supabase:', errorText)
        return NextResponse.json({ error: 'Error al guardar el código' }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'No se pudo generar un código único. Inténtalo de nuevo.' }, { status: 500 })
  } catch (err) {
    console.error('Generate code error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}