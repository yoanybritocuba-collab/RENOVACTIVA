import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
})

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json()

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Texto e idioma objetivo son requeridos' },
        { status: 400 }
      )
    }

    if (!text.trim()) {
      return NextResponse.json({ translation: '' })
    }

    const targetLangName = targetLanguage === 'ca' ? 'catalán' : 'inglés'

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Eres un traductor profesional español → ${targetLangName}. Traduce el texto del usuario al ${targetLangName}, manteniendo el tono, estilo y puntuación. Devuelve SOLO la traducción, sin explicaciones ni comillas adicionales. Si el texto ya está en ${targetLangName}, devuélvelo tal cual.`
        },
        {
          role: 'user',
          content: text
        }
      ],
      model: 'openai/gpt-oss-20b',
      temperature: 0.3,
      max_tokens: 2048,
    })

    const translation = completion.choices[0]?.message?.content?.trim() || text

    return NextResponse.json({ translation })
  } catch (error) {
    console.error('Error en API de traducción:', error)
    return NextResponse.json(
      { error: 'Error al traducir', details: (error as Error).message },
      { status: 500 }
    )
  }
}