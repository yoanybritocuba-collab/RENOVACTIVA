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

    // Validación básica
    if (!nombre || !telefono || !mensaje) {
      return NextResponse.json(
        { error: lang === 'ca' ? 'Falten dades obligatòries' : 'Faltan datos obligatorios' },
        { status: 400 }
      )
    }

    // ✅ Verificar Turnstile
    if (!turnstileToken) {
      return NextResponse.json(
        { error: lang === 'ca' ? 'Verificació de seguretat requerida' : 'Verificación de seguridad requerida' },
        { status: 400 }
      )
    }

    if (!TURNSTILE_SECRET) {
      console.error('[CONTACT] Falta TURNSTILE_SECRET_KEY')
      return NextResponse.json(
        { error: 'Servidor no configurado' },
        { status: 500 }
      )
    }

    // Llamada a la API de Cloudflare para verificar el token
    const turnstileVerify = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: TURNSTILE_SECRET,
          response: turnstileToken,
        }),
      }
    )

    const turnstileData = await turnstileVerify.json()

    if (!turnstileData.success) {
      console.warn('[CONTACT] Turnstile falló:', turnstileData)
      return NextResponse.json(
        { error: lang === 'ca' ? 'Verificació de seguretat fallida' : 'Verificación de seguridad fallida' },
        { status: 400 }
      )
    }

    // Comprobar Resend
    if (!process.env.RESEND_API_KEY) {
      console.error('[CONTACT] Falta RESEND_API_KEY')
      return NextResponse.json(
        { error: 'Servidor no configurado' },
        { status: 500 }
      )
    }

    const asunto = lang === 'ca'
      ? `Nova sol·licitud — ${nombre}`
      : `Nueva solicitud — ${nombre}`

    const cuerpoTexto = lang === 'ca'
      ? `Nova sol·licitud des del formulari de la web:

· Nom: ${nombre}
· Telèfon: ${telefono}
${email ? `· Email: ${email}\n` : ''}
· Missatge:
${mensaje}

—
Enviat des de renovactiva.com`
      : `Nueva solicitud desde el formulario de la web:

· Nombre: ${nombre}
· Teléfono: ${telefono}
${email ? `· Email: ${email}\n` : ''}
· Mensaje:
${mensaje}

—
Enviado desde renovactiva.com`

    const cuerpoHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #141310;">
        <div style="background: linear-gradient(90deg, #d7bd77, #e5c989); height: 4px; border-radius: 4px;"></div>
        <div style="padding: 24px 0;">
          <h2 style="color: #0a1a3a; margin: 0 0 16px 0;">
            ${lang === 'ca' ? 'Nova sol·licitud des de la web' : 'Nueva solicitud desde la web'}
          </h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 120px;">${lang === 'ca' ? 'Nom' : 'Nombre'}:</td>
              <td style="padding: 8px 0;">${escapeHtml(nombre)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">${lang === 'ca' ? 'Telèfon' : 'Teléfono'}:</td>
              <td style="padding: 8px 0;">${escapeHtml(telefono)}</td>
            </tr>
            ${email ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;">${escapeHtml(email)}</td>
            </tr>` : ''}
          </table>
          <div style="margin-top: 16px;">
            <p style="font-weight: bold; margin: 0 0 8px 0;">${lang === 'ca' ? 'Missatge' : 'Mensaje'}:</p>
            <p style="background: #f7f5ef; padding: 16px; border-radius: 8px; white-space: pre-wrap; margin: 0;">
              ${escapeHtml(mensaje)}
            </p>
          </div>
          <p style="margin-top: 24px; font-size: 12px; color: #999;">
            ${lang === 'ca' ? 'Enviat des de renovactiva.com' : 'Enviado desde renovactiva.com'}
          </p>
        </div>
      </div>
    `

    const result = await resend.emails.send({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      replyTo: email || undefined,
      subject: asunto,
      text: cuerpoTexto,
      html: cuerpoHtml,
    })

    if (result.error) {
      console.error('[CONTACT] Error Resend:', result.error)
      return NextResponse.json(
        { error: lang === 'ca' ? 'No s\'ha pogut enviar' : 'No se ha podido enviar' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, id: result.data?.id })

  } catch (error) {
    console.error('[CONTACT] Error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}