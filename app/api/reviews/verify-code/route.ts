import { NextResponse } from 'next/server'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const rawCode = body.code || ''
    const code = rawCode.trim().toUpperCase()

    if (!code) {
      return NextResponse.json({ valid: false, error: 'Introduce un código' }, { status: 400 })
    }

    const formatRegex = /^RNV-[A-Z0-9]{4}-[A-Z0-9]{4}$/
    if (!formatRegex.test(code)) {
      return NextResponse.json({ valid: false, error: 'Formato de código no válido' }, { status: 400 })
    }

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/review_codes?code=eq.${encodeURIComponent(code)}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        cache: 'no-store'
      }
    )

    if (!res.ok) {
      return NextResponse.json({ valid: false, error: 'Error al verificar el código' }, { status: 500 })
    }

    const rows = await res.json()

    if (rows.length === 0) {
      return NextResponse.json({ valid: false, error: 'Código no válido' })
    }

    const record = rows[0]

    if (record.usado) {
      return NextResponse.json({ valid: false, error: 'Este código ya ha sido utilizado' })
    }

    return NextResponse.json({
      valid: true,
      cliente_nombre: record.cliente_nombre,
      proyecto: record.proyecto || ''
    })
  } catch (err) {
    console.error('Verify code error:', err)
    return NextResponse.json({ valid: false, error: 'Error interno' }, { status: 500 })
  }
}