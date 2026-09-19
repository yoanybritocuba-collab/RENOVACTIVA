import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

// ⭐ Traducir usando el formato correcto del endpoint /api/translate
// Entrada: { text, targetLanguage }
// Salida: { translation }
async function translateToCa(text: string, origin: string): Promise<string> {
  if (!text || !text.trim()) return text

  try {
    const res = await fetch(`${origin}/api/translate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLanguage: 'ca' })
    })

    if (!res.ok) {
      console.warn('⚠️ Translate endpoint devolvió', res.status)
      return text
    }

    const data = await res.json()
    console.log('🌐 Traducción recibida:', data)

    const translated = data?.translation

    if (translated && typeof translated === 'string' && translated.trim()) {
      return translated
    }

    console.warn('⚠️ Respuesta sin translation:', data)
    return text
  } catch (err) {
    console.error('❌ Error al traducir:', err)
    return text
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { code, rating, text, role } = body

    if (!code || !text || !text.trim()) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    const cleanCode = code.trim().toUpperCase()
    const cleanRating = Math.min(5, Math.max(1, parseInt(rating) || 5))
    const origin = new URL(req.url).origin

    // 1. Verificar código
    const verifyRes = await fetch(
      `${SUPABASE_URL}/rest/v1/review_codes?code=eq.${encodeURIComponent(cleanCode)}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        cache: 'no-store'
      }
    )

    if (!verifyRes.ok) {
      return NextResponse.json({ error: 'Error al verificar el código' }, { status: 500 })
    }

    const rows = await verifyRes.json()
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Código no válido' }, { status: 400 })
    }

    const record = rows[0]
    if (record.usado) {
      return NextResponse.json({ error: 'Este código ya ha sido utilizado' }, { status: 400 })
    }

    // 2. Traducir ES → CA (con el formato correcto)
    console.log('🔄 Traduciendo texto:', text.trim())
    const textCa = await translateToCa(text.trim(), origin)
    const roleEs = (role || '').trim()
    const roleCa = roleEs ? await translateToCa(roleEs, origin) : ''

    console.log('✅ Texto ES:', text.trim())
    console.log('✅ Texto CA:', textCa)
    console.log('✅ Role ES:', roleEs)
    console.log('✅ Role CA:', roleCa)

    // 3. Cargar testimonials actuales
    const testRes = await fetch(
      `${SUPABASE_URL}/rest/v1/site_content?section=eq.testimonials&select=*`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        cache: 'no-store'
      }
    )

    if (!testRes.ok) {
      return NextResponse.json({ error: 'Error al cargar testimonios' }, { status: 500 })
    }

    const testRows = await testRes.json()
    if (testRows.length === 0) {
      return NextResponse.json({ error: 'Sección de testimonios no encontrada' }, { status: 500 })
    }

    const testimonials = testRows[0]
    const currentContent = testimonials.content || {}
    const currentItems = currentContent.items || []

    // 4. Crear nuevo item
    const newItem = {
      id: `test-${Date.now()}`,
      name: record.cliente_nombre,
      role: {
        es: roleEs || 'Cliente verificado',
        ca: roleCa || 'Client verificat'
      },
      text: {
        es: text.trim(),
        ca: textCa
      },
      rating: cleanRating,
      image: '',
      verified: true,
      created_at: new Date().toISOString()
    }

    // ⭐ Las nuevas salen PRIMERO
    const updatedItems = [newItem, ...currentItems]

    // 5. Guardar
    const saveRes = await fetch(
      `${SUPABASE_URL}/rest/v1/site_content?id=eq.${testimonials.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          content: { ...currentContent, items: updatedItems },
          updated_at: new Date().toISOString()
        })
      }
    )

    if (!saveRes.ok) {
      const errText = await saveRes.text()
      console.error('❌ Error al guardar:', errText)
      return NextResponse.json({ error: 'Error al guardar la reseña' }, { status: 500 })
    }

    // 6. Marcar código como usado
    const markRes = await fetch(
      `${SUPABASE_URL}/rest/v1/review_codes?id=eq.${record.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          usado: true,
          usado_at: new Date().toISOString()
        })
      }
    )

    if (!markRes.ok) {
      console.error('⚠️ Reseña creada pero código NO marcado. Code:', cleanCode)
    }

    // 7. Revalidar home
    try {
      revalidatePath('/', 'page')
    } catch (e) {
      console.warn('Revalidate falló:', e)
    }

    // ⭐ Devolvemos el item creado + todos los items para que la home los use
    return NextResponse.json({
      success: true,
      newItem,
      allItems: updatedItems
    })
  } catch (err) {
    console.error('❌ Create review error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}