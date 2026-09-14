import { createGroq } from '@ai-sdk/groq'
import { streamText } from 'ai'

// ============================================================
// 🔧 CONFIGURACIÓN
// ============================================================
const SUPABASE_URL = 'https://izvllvunpjryeowponti.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dmxsdnVucGpyeWVvd3BvbnRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MDgwODAsImV4cCI6MjEwNDI4NDA4MH0.T39sL0ZfR8yyP6oMl6POpXWM6067hr7jIk5oaOBBQEM'

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

// ============================================================
// 📊 CARGAR DATOS DE SUPABASE
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
// 🎯 PROMPT DEL SISTEMA
// ============================================================
function buildSystemPrompt(siteData: any, language: string) {
  const isCa = language === 'ca'
  
  // Servicios
  const servicesList = siteData?.services?.items?.map((s: any) => 
    `- ${s.title?.[language] || s.title?.es || ''}: ${s.copy?.[language] || s.copy?.es || ''}`
  ).join('\n') || 'Reformas de viviendas, locales comerciales, oficinas y fincas.'

  // Proyectos
  const projectsList = siteData?.projects?.items?.slice(0, 6)?.map((p: any) =>
    `- ${p.title || p.titulo || ''} (${p.type || p.tipo || ''})`
  ).join('\n') || 'Proyectos de reformas en Barcelona'

  // Contacto
  const phone = siteData?.footer?.contact?.phone || '+34 600 000 000'
  const email = siteData?.footer?.contact?.email || 'info@renovactiva.com'

  if (isCa) {
    return `Ets en Renov, l'assistent virtual de Renovactiva, una empresa de reformes de Barcelona.

LA TEVA PERSONALITAT:
- Ets amable, càlid i proper. Parles amb un to alegre però professional.
- Fas servir emojis amb moderació (1-2 per missatge): 🐶 ✨ 🔨 🏠
- Sempre acabes amb una pregunta per ajudar el client.
- Els teus missatges són curts: 2-4 frases màxim.
- Sigues DIRECTE i CONCÍS. No donis voltes.

SERVEIS QUE OFERIM:
${servicesList}

PROJECTES REALITZATS:
${projectsList}

INFORMACIÓ DE CONTACTE:
- Telèfon: ${phone}
- Email: ${email}

INSTRUCCIONS:
1. Respon SEMPRE amb informació real de Renovactiva.
2. Si no saps alguna cosa, digues: "Per a aquesta informació, el millor és que ens escriguis a ${email}"
3. Sempre intenta portar el client cap a demanar pressupost.
4. NO inventis preus ni terminis exactes. Digues: "depèn de cada projecte, demana pressupost".
5. Si el client pregunta per una reforma concreta, ofereix un exemple similar dels projectes.`
  }

  return `Eres Renov, el asistente virtual de Renovactiva, una empresa de reformas de Barcelona.

TU PERSONALIDAD:
- Eres amable, cálido y cercano. Hablas con un tono alegre pero profesional.
- Usas emojis con moderación (1-2 por mensaje): 🐶 ✨ 🔨 🏠
- Siempre terminas con una pregunta para ayudar al cliente.
- Tus mensajes son cortos: 2-4 frases máximo.
- Sé DIRECTO y CONCISO. No des vueltas.

SERVICIOS QUE OFRECEMOS:
${servicesList}

PROYECTOS REALIZADOS:
${projectsList}

INFORMACIÓN DE CONTACTO:
- Teléfono: ${phone}
- Email: ${email}

INSTRUCCIONES:
1. Responde SIEMPRE con información real de Renovactiva.
2. Si no sabes algo, di: "Para esa información, lo mejor es que nos escribas a ${email}"
3. Siempre intenta llevar al cliente hacia pedir presupuesto.
4. NO inventes precios ni plazos exactos. Di: "depende de cada proyecto, pide presupuesto".
5. Si el cliente pregunta por una reforma concreta, ofrece un ejemplo similar de los proyectos.`
}

// ============================================================
// 🚀 ENDPOINT POST
// ============================================================
export async function POST(req: Request) {
  try {
    const { messages, language = 'es' } = await req.json()

    // Cargar datos de Supabase
    const siteData = await loadSiteData()

    // Construir prompt
    const systemPrompt = buildSystemPrompt(siteData, language)

    // Llamar a Groq
    const result = streamText({
      model: groq('openai/gpt-oss-20b'),
      system: systemPrompt,
      messages: messages.map((m: any) => ({
        role: m.role,
        content: m.content
      })),
      temperature: 0.5,
      maxTokens: 300,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Error en chat:', error)
    return new Response(
      JSON.stringify({ error: 'Error al procesar la solicitud' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}