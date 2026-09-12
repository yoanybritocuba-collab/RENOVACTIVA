import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json()

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Texto e idioma objetivo son requeridos' },
        { status: 400 }
      )
    }

    // Usar la API gratuita de Google Translate (sin API key)
    // Nota: En producción, usa la API oficial de Google Cloud
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`

    const response = await fetch(url)
    const data = await response.json()
    
    let translation = ''
    if (data && data[0]) {
      for (let i = 0; i < data[0].length; i++) {
        if (data[0][i] && data[0][i][0]) {
          translation += data[0][i][0]
        }
      }
    }

    return NextResponse.json({ translation })
  } catch (error) {
    console.error('Error en API de traducción:', error)
    return NextResponse.json(
      { error: 'Error al traducir' },
      { status: 500 }
    )
  }
}