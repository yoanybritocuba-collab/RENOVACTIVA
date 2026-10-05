import { NextResponse } from 'next/server'

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const token = body.token

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token requerido' },
        { status: 400 }
      )
    }

    if (!TURNSTILE_SECRET) {
      console.error('[VERIFY-TURNSTILE] Falta TURNSTILE_SECRET_KEY')
      return NextResponse.json(
        { success: false, error: 'Servidor no configurado' },
        { status: 500 }
      )
    }

    const verify = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: TURNSTILE_SECRET,
          response: token,
        }),
      }
    )

    const data = await verify.json()

    if (!data.success) {
      console.warn('[VERIFY-TURNSTILE] Falló:', data)
      return NextResponse.json(
        { success: false, error: 'Verificación fallida' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('[VERIFY-TURNSTILE] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    )
  }
}