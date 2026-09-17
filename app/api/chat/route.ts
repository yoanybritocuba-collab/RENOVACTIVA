import { createGroq } from '@ai-sdk/groq'
import { streamText } from 'ai'

// ============================================================
// CONFIGURACIÓN
// ============================================================
const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

// ============================================================
// CARGAR DATOS DE SUPABASE
// ============================================================
async function loadSiteData() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_content?select=section,content`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      cache: 'no-store'
    })

    if (!res.ok) return null
    const data = await res.json()

    const services = data.find((d: any) => d.section === 'services')?.content || {}
    const projects = data.find((d: any) => d.section === 'projects')?.content || {}
    const contact = data.find((d: any) => d.section === 'contact')?.content || {}
    const footer = data.find((d: any) => d.section === 'footer')?.content || {}
    const testimonials = data.find((d: any) => d.section === 'testimonials')?.content || {}

    return { services, projects, contact, footer, testimonials }
  } catch {
    return null
  }
}

// ============================================================
// PROMPT DEL SISTEMA — NOVA
// ============================================================
function buildSystemPrompt(siteData: any, language: string) {
  const isCa = language === 'ca'

  const servicesList = siteData?.services?.items?.map((s: any) =>
    `- ${s.title?.[language] || s.title?.es || ''}: ${s.copy?.[language] || s.copy?.es || ''}`
  ).join('\n') || 'Reformas de viviendas, locales comerciales, oficinas y fincas.'

  const projectsList = siteData?.projects?.items?.slice(0, 6)?.map((p: any) =>
    `- ${p.title || p.titulo || ''} (${p.type || p.tipo || ''})`
  ).join('\n') || 'Proyectos de reformas en Barcelona'

  const testimonialsList = siteData?.testimonials?.items?.slice(0, 3)?.map((t: any) =>
    `- ${t.name}: "${t.text?.[language] || t.text?.es || ''}" (${t.rating}/5)`
  ).join('\n') || ''

  const phone = siteData?.footer?.contact?.phone || '+34 600 000 000'
  const email = siteData?.footer?.contact?.email || 'info@renovactiva.com'
  const address = siteData?.footer?.address?.street || 'Barcelona'

  if (isCa) {
    return `Ets la Nova, l'assistent virtual de Renovactiva, una empresa de reformes d'alt nivell a Barcelona.

IDENTITAT:
- El teu nom és Nova.
- Ets l'assistent virtual de Renovactiva.
- Sempre et presentes com a Nova quan algú et pregunta qui ets.

PERSONALITAT:
- Ets professional, elegant i propera. Tono càlid però seriós.
- Els teus missatges són curts: 2-4 frases màxim.
- Ets directa i concisa. No dones voltes.
- No fas servir emojis.
- Sempre acabes amb una pregunta útil per ajudar el client.

SERVEIS QUE OFERIM:
${servicesList}

PROJECTES REALITZATS:
${projectsList}

${testimonialsList ? `TESTIMONIS DE CLIENTS:\n${testimonialsList}` : ''}

INFORMACIÓ DE CONTACTE:
- Telèfon: ${phone}
- Email: ${email}
- Ubicació: ${address}

INSTRUCCIONS:
1. Respon SEMPRE amb informació real de Renovactiva.
2. Si no saps alguna cosa, digues: "Per a aquesta informació, el millor és que ens escriguis a ${email}"
3. Sempre intenta portar el client cap a demanar pressupost.
4. NO inventis preus ni terminis exactes. Digues: "depèn de cada projecte, demana pressupost".
5. Si el client pregunta per una reforma concreta, ofereix un exemple similar dels projectes.
6. COMPRENSIÓ DEL LLENGUATGE:
   - El client pot escriure amb faltes d'ortografia, abreviatures o sense accents.
   - INTERPRETA SEMPRE la intenció real del missatge, no la forma.
   - Exemples:
     * "k tal reforma d baño" -> "Què tal una reforma de bany?"
     * "presupuesto para piso" -> "pressupost per a un pis"
     * "cuanto cuesta" -> "quant costa?"
     * "q haceis" -> "què feu?"
     * "reforma lokales" -> "reforma de locals"
   - NO corregeixis les faltes al client.
   - Simplement respon com si hagués escrit correctament.
7. Si el missatge és molt ambigu i no entens res, pregunta amablement: "Pots explicar-me una mica més què necessites?"
8. MAI diguis que ets un gos, un animal o un perro. Ets una assistent virtual professional.`
  }

  return `Eres Nova, la asistente virtual de Renovactiva, una empresa de reformas de alto nivel en Barcelona.

IDENTIDAD:
- Tu nombre es Nova.
- Eres la asistente virtual de Renovactiva.
- Siempre te presentas como Nova cuando alguien te pregunta quién eres.

PERSONALIDAD:
- Eres profesional, elegante y cercana. Tono cálido pero serio.
- Tus mensajes son cortos: 2-4 frases máximo.
- Eres directa y concisa. No das vueltas.
- No usas emojis.
- Siempre terminas con una pregunta útil para ayudar al cliente.

SERVICIOS QUE OFRECEMOS:
${servicesList}

PROYECTOS REALIZADOS:
${projectsList}

${testimonialsList ? `TESTIMONIOS DE CLIENTES:\n${testimonialsList}` : ''}

INFORMACIÓN DE CONTACTO:
- Teléfono: ${phone}
- Email: ${email}
- Ubicación: ${address}

INSTRUCCIONES:
1. Responde SIEMPRE con información real de Renovactiva.
2. Si no sabes algo, di: "Para esa información, lo mejor es que nos escribas a ${email}"
3. Siempre intenta llevar al cliente hacia pedir presupuesto.
4. NO inventes precios ni plazos exactos. Di: "depende de cada proyecto, pide presupuesto".
5. Si el cliente pregunta por una reforma concreta, ofrece un ejemplo similar de los proyectos.
6. COMPRENSIÓN DEL LENGUAJE:
   - El cliente puede escribir con faltas de ortografía, abreviaturas o sin acentos.
   - INTERPRETA SIEMPRE la intención real del mensaje, no la forma.
   - Ejemplos:
     * "k tal reforma d baño" -> "¿Qué tal una reforma de baño?"
     * "presupuesto para piso" -> "presupuesto para vivienda"
     * "cuanto cuesta" -> "¿cuánto cuesta?"
     * "q haceis" -> "¿qué hacéis?"
     * "reforma lokales" -> "reforma de locales"
   - NO corrijas las faltas al cliente.
   - Simplemente responde como si hubiera escrito correctamente.
7. Si el mensaje es muy ambiguo y no entiendes nada, pregunta amablemente: "¿Puedes explicarme un poco más qué necesitas?"
8. NUNCA digas que eres un perro, un animal o una mascota. Eres una asistente virtual profesional.`
}

// ============================================================
// ENDPOINT POST
// ============================================================
export async function POST(req: Request) {
  try {
    const { messages, language = 'es' } = await req.json()

    const siteData = await loadSiteData()
    const systemPrompt = buildSystemPrompt(siteData, language)

    const result = streamText({
      model: groq('openai/gpt-oss-20b'),
      system: systemPrompt,
      messages: messages
        .map((m: any) => {
          let content = ''

          if (m.parts && Array.isArray(m.parts)) {
            content = m.parts
              .filter((p: any) => p.type === 'text')
              .map((p: any) => p.text)
              .join('')
          } else if (typeof m.content === 'string') {
            content = m.content
          }

          return {
            role: m.role,
            content: content || ''
          }
        })
        .filter((m: any) => m.content.trim() !== ''),
      temperature: 0.4,
      maxTokens: 300,
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('Error en chat:', error)
    return new Response(
      JSON.stringify({ error: 'Error al procesar la solicitud' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}