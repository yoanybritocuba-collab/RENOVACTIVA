import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const EMAIL_TO = 'info@renovactiva.com'
const EMAIL_FROM = 'Renovactiva <info@renovactiva.com>'
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY

type ContactPayload = {
  nombre?: string
  telefono?: string
  email?: string
  mensaje?: string
  lang?: 'es' | 'ca'
  turnstileToken?: string
}

export async function POST(req: Request) {
  try {
    const body: ContactPayload = await req.json()

    const nombre = (body.nombre || '').trim()
    const telefono = (body.telefono || '').trim()
    const email = (body.email || '').trim()
    const mensaje = (body.mensaje || '').trim()
    const lang = body.lang === 'ca' ? 'ca' : 'es'
    const turnstileToken = body.turnstileToken

    if (!nombre || !telefono || !mensaje) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    if (!turnstileToken) {
      return NextResponse.json({ error: 'Falta el token de seguridad' }, { status: 400 })
    }

    if (!TURNSTILE_SECRET) {
      console.error('[CONTACT] Falta TURNSTILE_SECRET_KEY')
      return NextResponse.json({ error: 'Servidor no configurado (Turnstile)' }, { status: 500 })
    }

    // Verificar con Cloudflare
    const turnstileVerify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: TURNSTILE_SECRET,
        response: turnstileToken,
      }),
    })

    const turnstileData = await turnstileVerify.json()

    if (!turnstileData.success) {
      const errors = turnstileData['error-codes']?.join(', ') || 'error desconocido'
      console.warn('[CONTACT] Turnstile falló:', errors)
      // Esto es lo que veremos en el cartel rojo
      return NextResponse.json({ error: `Fallo de seguridad: ${errors}` }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Servidor no configurado (Resend)' }, { status: 500 })
    }

    const asunto = lang === 'ca' ? `Nova sol·licitud — ${nombre}` : `Nueva solicitud — ${nombre}`
    
    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      replyTo: email || undefined,
      subject: asunto,
      text: `Nombre: ${nombre}\nTeléfono: ${telefono}\nEmail: ${email}\nMensaje: ${mensaje}`,
    })

    if (result.error) {
      return NextResponse.json({ error: `Error Resend: ${result.error.message}` }, { status: 500 })
    }

    return NextResponse.json({ ok: true, id: result.data?.id })

  } catch (error) {
    console.error('[CONTACT] Error:', error)
    return NextResponse.json({ error: `Error servidor: ${(error as Error).message}` }, { status: 500 })
  }
}