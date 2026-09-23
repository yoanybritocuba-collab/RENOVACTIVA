'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Send, X, RotateCcw, Phone, MessageCircle, Mail } from 'lucide-react'

type MascotLang = 'es' | 'ca'

// ============================================================
// CONFIGURACIÓN
// ============================================================
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '34722454020'
const EMAIL = 'info@renovactiva.com'

// ============================================================
// PLANTILLAS
// ============================================================
const WA_TEMPLATE_ES = `Hola, vengo de la web de Renovactiva.

Soy {{nombre}}.
Quiero reformar: {{proyecto}}.
Zona: {{zona}}.

Me gustaría que me contacten para organizar una visita y presupuesto.

Gracias.`

const WA_TEMPLATE_CA = `Hola, vinc de la web de Renovactiva.

Sóc {{nombre}}.
Vull reformar: {{proyecto}}.
Zona: {{zona}}.

M'agradaria que em contactessin per organitzar una visita i pressupost.

Gràcies.`

const EMAIL_SUBJECT_ES = 'Solicitud de presupuesto — Renovactiva'
const EMAIL_BODY_TEMPLATE_ES = `Hola equipo Renovactiva,

Vengo de la web y me gustaría solicitar una visita para
presupuestar mi proyecto.

· Nombre: {{nombre}}
· Teléfono: {{telefono}}
· Qué quiero reformar: {{proyecto}}
· Zona: {{zona}}

Me gustaría que me contactaran por teléfono o email para
organizar una cita.

Gracias.`

const EMAIL_SUBJECT_CA = 'Sol·licitud de pressupost — Renovactiva'
const EMAIL_BODY_TEMPLATE_CA = `Hola equip Renovactiva,

Vinc de la web i m'agradaria sol·licitar una visita per
pressupostar el meu projecte.

· Nom: {{nombre}}
· Telèfon: {{telefono}}
· Què vull reformar: {{proyecto}}
· Zona: {{zona}}

M'agradaria que em contactessin per telèfon o correu per
organitzar una cita.

Gràcies.`

// ============================================================
// LISTAS DE PROYECTOS Y ZONAS
// ============================================================
const PROJECT_KEYWORDS: { kw: string; label: string }[] = [
  { kw: 'baño', label: 'Baño' },
  { kw: 'bany', label: 'Baño' },
  { kw: 'baños', label: 'Baño' },
  { kw: 'aseo', label: 'Aseo' },
  { kw: 'cocina', label: 'Cocina' },
  { kw: 'cuina', label: 'Cocina' },
  { kw: 'terraza', label: 'Terraza' },
  { kw: 'terrassa', label: 'Terraza' },
  { kw: 'salon', label: 'Salón' },
  { kw: 'salón', label: 'Salón' },
  { kw: 'sala', label: 'Salón' },
  { kw: 'dormitorio', label: 'Dormitorio' },
  { kw: 'habitacion', label: 'Habitación' },
  { kw: 'habitación', label: 'Habitación' },
  { kw: 'habitació', label: 'Habitación' },
  { kw: 'pasillo', label: 'Pasillo' },
  { kw: 'piso', label: 'Piso' },
  { kw: 'pis', label: 'Piso' },
  { kw: 'casa', label: 'Casa' },
  { kw: 'atico', label: 'Ático' },
  { kw: 'ático', label: 'Ático' },
  { kw: 'local', label: 'Local comercial' },
  { kw: 'oficina', label: 'Oficina' },
  { kw: 'finca', label: 'Finca' },
  { kw: 'vivienda', label: 'Vivienda' },
  { kw: 'comunidad', label: 'Comunidad de propietarios' },
  { kw: 'reforma integral', label: 'Reforma integral' },
  { kw: 'reforma completa', label: 'Reforma integral' },
]

const ZONE_KEYWORDS = [
  'Barcelona', 'Eixample', 'Gràcia', 'Gracia', 'Sants', 'Sarrià', 'Sarria',
  'Poblenou', 'Born', 'Gòtic', 'Gotic', 'Raval', 'Horta', 'Sant Andreu',
  'Les Corts', 'Nou Barris', 'Ciutat Vella', 'Sant Martí', 'Sant Marti',
  'Guinardó', 'Guinardo', 'Sagrada Familia', 'Sagrada Família',
  'Vallcarca', 'Barceloneta', 'Poble Sec', 'Badalona', 'Hospitalet',
  'L\'Hospitalet', 'Cornellà', 'Cornella', 'Sant Cugat', 'Terrassa',
  'Sabadell', 'Mataró', 'Mataro', 'Granollers', 'Viladecans',
  'Castelldefels', 'Gavà', 'Gava', 'Esplugues', 'Molins', 'Rubí', 'Rubi',
  'Vilanova', 'Sitges', 'Manresa', 'Vic', 'Igualada',
]

// ============================================================
// EXTRAER DATOS DE LA CONVERSACIÓN
// Solo lee los últimos 20 mensajes para no arrastrar historial viejo
// ============================================================
type ExtractedData = {
  nombre: string
  telefono: string
  zona: string
  proyecto: string
}

function extractFromConversation(messages: any[], lang: MascotLang): ExtractedData {
  // Solo los últimos 20 mensajes
  const recentMessages = messages.slice(-20)

  const userText = recentMessages
    .filter((m: any) => m.role === 'user')
    .map((m: any) =>
      m.parts?.map((p: any) => (p.type === 'text' ? p.text : '')).join('') || ''
    )
    .join(' · ')

  const lowerText = userText.toLowerCase()

  // === NOMBRE ===
  let nombre = ''
  const nombrePatterns = [
    /(?:me llamo|mi nombre es|soy)\s+([A-Za-zÀ-ÿ]{2,20})/i,
    /(?:em dic|el meu nom és|sóc)\s+([A-Za-zÀ-ÿ]{2,20})/i,
  ]
  for (const p of nombrePatterns) {
    const m = userText.match(p)
    if (m && m[1] && m[1].length >= 2) {
      const exclude = ['mi', 'el', 'la', 'un', 'una', 'de', 'y', 'o', 'es', 'tu', 'un', 'nou', 'nova']
      if (!exclude.includes(m[1].toLowerCase())) {
        nombre = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase()
        break
      }
    }
  }
  // Patrón "yoany telefono X"
  if (!nombre) {
    const m = userText.match(/([A-Za-zÀ-ÿ]{2,20})\s+(?:telefono|teléfono|tlf|tel|móvil|movil|cel)/i)
    if (m && m[1]) {
      const exclude = ['mi', 'el', 'la', 'un', 'una', 'de', 'y', 'o', 'es', 'tu']
      if (!exclude.includes(m[1].toLowerCase())) {
        nombre = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase()
      }
    }
  }

  // === TELÉFONO ===
  let telefono = ''
  const telRegex = /(?:\+?34[\s.\-]?)?([6789]\d[\s.\-]?\d[\s.\-]?\d[\s.\-]?\d[\s.\-]?\d[\s.\-]?\d[\s.\-]?\d[\s.\-]?\d)/g
  const telMatches = userText.match(telRegex)
  if (telMatches) {
    for (const t of telMatches) {
      const digits = t.replace(/\D/g, '')
      if (digits.length >= 9 && digits.length <= 11) {
        telefono = t.trim()
        break
      }
    }
  }

  // === PROYECTO ===
  const foundProjects: { label: string; index: number }[] = []
  for (const { kw, label } of PROJECT_KEYWORDS) {
    const idx = lowerText.indexOf(kw.toLowerCase())
    if (idx !== -1) {
      if (!foundProjects.some(p => p.label === label)) {
        foundProjects.push({ label, index: idx })
      }
    }
  }
  foundProjects.sort((a, b) => a.index - b.index)
  const proyectosUnicos = foundProjects.map(p => p.label)

  let proyecto = proyectosUnicos.join(', ')
  if (!proyecto) {
    proyecto = lang === 'ca' ? 'Reforma (a concretar)' : 'Reforma (a concretar)'
  }

  // === ZONA ===
  let zona = ''
  // Patrón "zona X" / "barrio X"
  const zonaPattern = /(?:zona|barrio|barri)\s+([A-Za-zÀ-ÿ\s]{3,30})/i
  const zonaMatch = userText.match(zonaPattern)
  if (zonaMatch && zonaMatch[1]) {
    const candidate = zonaMatch[1].trim()
    if (!/^(mi|el|la|un|una)\s/i.test(candidate)) {
      zona = candidate
    }
  }
  // Barrios conocidos
  if (!zona) {
    for (const zone of ZONE_KEYWORDS) {
      if (lowerText.includes(zone.toLowerCase())) {
        zona = zone
        break
      }
    }
  }

  return { nombre, telefono, zona, proyecto }
}

// ============================================================
// RELLENAR PLANTILLA
// ============================================================
function fillTemplate(template: string, data: ExtractedData, isCa: boolean): string {
  const sinDatos = isCa ? '(a completar)' : '(a completar)'
  return template
    .replace(/{{nombre}}/g, data.nombre || sinDatos)
    .replace(/{{telefono}}/g, data.telefono || sinDatos)
    .replace(/{{proyecto}}/g, data.proyecto || sinDatos)
    .replace(/{{zona}}/g, data.zona || sinDatos)
}

// ============================================================
// HELPERS DE ENLACES
// ============================================================
function getMailHref(email: string, subject: string, body: string): string {
  const subjectEnc = encodeURIComponent(subject)
  const bodyEnc = encodeURIComponent(body)

  if (typeof window !== 'undefined') {
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
    if (isMobile) {
      return `mailto:${email}?subject=${subjectEnc}&body=${bodyEnc}`
    }
  }
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subjectEnc}&body=${bodyEnc}`
}

// ============================================================
// RENDERIZAR MENSAJES CON ENLACES CLICABLES
// ============================================================
function renderMessageWithLinks(text: string, lang: MascotLang) {
  const telHref = `tel:+${WHATSAPP_NUMBER}`
  const genericWaHref = `https://wa.me/${WHATSAPP_NUMBER}`
  const genericMailHref = `mailto:${EMAIL}`

  const parts: React.ReactNode[] = []
  const regex = /(📞\s*Tel[eéè]fono?:\s*[+\d\s]+|💬\s*WhatsApp:\s*[+\d\s]+|📧\s*Correo?u?:\s*[\w.@-]+)/gi

  let lastIndex = 0
  let match
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`t-${key++}`}>{text.slice(lastIndex, match.index)}</span>)
    }

    const matched = match[0]

    if (matched.includes('📞')) {
      parts.push(
        <a key={`tel-${key++}`} href={telHref} className="mascot-link mascot-link-phone">
          {matched}
        </a>
      )
    } else if (matched.includes('💬')) {
      parts.push(
        <a key={`wa-${key++}`} href={genericWaHref} target="_blank" rel="noopener noreferrer" className="mascot-link mascot-link-wa">
          {matched}
        </a>
      )
    } else if (matched.includes('📧')) {
      parts.push(
        <a key={`mail-${key++}`} href={genericMailHref} className="mascot-link mascot-link-mail">
          {matched}
        </a>
      )
    }

    lastIndex = match.index + matched.length
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`t-end-${key++}`}>{text.slice(lastIndex)}</span>)
  }

  if (parts.length === 0) return text
  return <>{parts}</>
}

// ============================================================
// COMPONENTE
// ============================================================
export function MascotAssistant({ lang = 'es' }: { lang?: MascotLang }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')

  const [bubbleText, setBubbleText] = useState('')
  const [showCursor, setShowCursor] = useState(false)
  const [phase, setPhase] = useState<'greeting' | 'help' | 'linger' | 'silenced' | 'farewell'>('greeting')

  const [hasOpenedOnce, setHasOpenedOnce] = useState(false)
  const [hasChatted, setHasChatted] = useState(false)
  const [introTyped, setIntroTyped] = useState('')
  const [introDone, setIntroDone] = useState(false)

  const [isDeepSleep, setIsDeepSleep] = useState(false)
  const [nearCursor, setNearCursor] = useState(false)
  const [showHoverCartel, setShowHoverCartel] = useState(false)

  const [pos, setPos] = useState<{ x: number; y: number }>({ x: -1, y: -1 })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const timeoutsRef = useRef<number[]>([])
  const cancelledRef = useRef(false)

  const texts = {
    es: {
      greetMorning: 'Buenos días',
      greetAfternoon: 'Buenas tardes',
      greetEvening: 'Buenas noches',
      help: '¿En qué te puedo ayudar?',
      linger: 'Me quedo por aquí si necesitas algo',
      chatIntro: 'Soy Nova, la asistente de Renovactiva. ¿En qué te puedo ayudar?',
      farewell: 'Gracias por confiar en Renovactiva. Aquí estoy si necesitas algo más.',
      hoverCartel: '¿En qué puedo ayudarte?',
      newChat: 'Nuevo chat',
      thinking: 'Nova está pensando',
      placeholder: 'Pregúntale algo a Nova...',
      inputLabel: 'Mensaje para Nova',
      sendLabel: 'Enviar mensaje',
      openLabel: 'Abrir asistente Nova',
      closeLabel: 'Cerrar asistente Nova',
      role: 'Asistente de Renovactiva',
    },
    ca: {
      greetMorning: 'Bon dia',
      greetAfternoon: 'Bona tarda',
      greetEvening: 'Bona nit',
      help: 'En què et puc ajudar?',
      linger: 'Em quedo per aquí si necessites res',
      chatIntro: "Sóc la Nova, l'assistent de Renovactiva. En què et puc ajudar?",
      farewell: 'Gràcies per confiar en Renovactiva. Aquí estic si necessites res més.',
      hoverCartel: 'En què puc ajudar-te?',
      newChat: 'Nou xat',
      thinking: 'Nova està pensant',
      placeholder: 'Pregunta-li alguna cosa a Nova...',
      inputLabel: 'Missatge per a Nova',
      sendLabel: 'Enviar missatge',
      openLabel: 'Obrir assistent Nova',
      closeLabel: 'Tancar assistent Nova',
      role: 'Assistent de Renovactiva',
    },
  }

  const t = texts[lang]
  const isCa = lang === 'ca'

  const addTimeout = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timeoutsRef.current.push(id)
    return id
  }

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id))
    timeoutsRef.current = []
  }

  const typeText = (text: string, onDone: () => void, speed = 25) => {
    let i = 0
    setBubbleText('')
    setShowCursor(true)
    const tick = () => {
      if (cancelledRef.current) return
      if (i >= text.length) {
        setShowCursor(false)
        onDone()
        return
      }
      setBubbleText(text.slice(0, i + 1))
      const ch = text[i]
      i++
      let d = speed + Math.random() * 15
      if (ch === ',' || ch === ';') d += 80
      else if (ch === '.' || ch === '?' || ch === '!') d += 150
      else if (ch === ' ') d += 10
      addTimeout(tick, d)
    }
    addTimeout(tick, 300)
  }

  const typeIntroInChat = (text: string, onDone: () => void, speed = 25) => {
    let i = 0
    setIntroTyped('')
    const tick = () => {
      if (cancelledRef.current) return
      if (i >= text.length) {
        onDone()
        return
      }
      setIntroTyped(text.slice(0, i + 1))
      const ch = text[i]
      i++
      let d = speed + Math.random() * 15
      if (ch === ',' || ch === ';') d += 80
      else if (ch === '.' || ch === '?' || ch === '!') d += 150
      else if (ch === ' ') d += 10
      addTimeout(tick, d)
    }
    addTimeout(tick, 200)
  }

  useEffect(() => {
    cancelledRef.current = false
    clearAllTimeouts()

    const hour = new Date().getHours()
    const greetingText = hour < 12 ? t.greetMorning : hour < 20 ? t.greetAfternoon : t.greetEvening

    setPhase('greeting')
    setBubbleText('')
    setShowCursor(false)

    addTimeout(() => {
      typeText(greetingText, () => {
        addTimeout(() => {
          setBubbleText('')
          typeText(t.help, () => {
            addTimeout(() => {
              setBubbleText('')
              typeText(t.linger, () => {
                setPhase('linger')
                addTimeout(() => {
                  setBubbleText('')
                  setIsDeepSleep(true)
                }, 5000)
              }, 30)
            }, 2000)
          }, 25)
        }, 1500)
      }, 25)
    }, 1000)

    return () => {
      cancelledRef.current = true
      clearAllTimeouts()
    }
  }, [lang])

  useEffect(() => {
    if (open) {
      setNearCursor(true)
      return
    }
    const handleMouseMove = (e: MouseEvent) => {
      const trigger = triggerRef.current
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dist = Math.sqrt(Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2))
      setNearCursor(dist < 120)
    }
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [open])

  useEffect(() => {
    if (open) {
      setShowHoverCartel(false)
      return
    }
    if (isDeepSleep && nearCursor) {
      setShowHoverCartel(true)
    } else {
      setShowHoverCartel(false)
    }
  }, [isDeepSleep, nearCursor, open])

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat', body: { language: lang } }),
  })

  useEffect(() => {
    if (messages.length > 0 && !hasChatted) {
      setHasChatted(true)
    }
  }, [messages.length, hasChatted])

  useEffect(() => {
    if (!open) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, status, open, introTyped])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      const panel = panelRef.current
      const trigger = triggerRef.current
      const target = e.target as Node
      if (panel && panel.contains(target)) return
      if (trigger && trigger.contains(target)) return
      handleCloseChat()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseChat()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, hasChatted])

  const handleOpenChat = () => {
    cancelledRef.current = true
    clearAllTimeouts()
    cancelledRef.current = false

    setOpen(true)
    setIsDeepSleep(false)
    setShowHoverCartel(false)

    if (!hasOpenedOnce) {
      setHasOpenedOnce(true)
      setIntroDone(false)
      setIntroTyped('')
      addTimeout(() => {
        typeIntroInChat(t.chatIntro, () => setIntroDone(true), 25)
      }, 400)
    } else {
      setIntroTyped(t.chatIntro)
      setIntroDone(true)
    }
  }

  const handleCloseChat = () => {
    setOpen(false)
    cancelledRef.current = true
    clearAllTimeouts()
    cancelledRef.current = false

    if (hasChatted) {
      addTimeout(() => {
        setBubbleText('')
        typeText(t.farewell, () => {
          setPhase('farewell')
          addTimeout(() => {
            setBubbleText('')
            setIsDeepSleep(true)
          }, 5000)
        }, 25)
      }, 500)
    } else {
      setBubbleText(t.linger)
      setPhase('linger')
    }
  }

  const newChat = () => {
    setMessages([])
    setInput('')
    setHasChatted(false)
    setIntroDone(false)
    setIntroTyped('')
    setHasOpenedOnce(false)
    setIsDeepSleep(false)
    cancelledRef.current = true
    clearAllTimeouts()
    cancelledRef.current = false
    addTimeout(() => {
      setIntroTyped('')
      typeIntroInChat(t.chatIntro, () => setIntroDone(true), 25)
    }, 400)
  }

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    dragRef.current = { startX: clientX, startY: clientY, origX: rect.left, origY: rect.top }
    setIsDragging(true)
  }

  useEffect(() => {
    if (!isDragging) return
    const move = (e: MouseEvent | TouchEvent) => {
      if (!dragRef.current || !containerRef.current) return
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY
      const dx = clientX - dragRef.current.startX
      const dy = clientY - dragRef.current.startY
      const w = containerRef.current.offsetWidth
      const h = containerRef.current.offsetHeight
      const newX = Math.max(10, Math.min(window.innerWidth - w - 10, dragRef.current.origX + dx))
      const newY = Math.max(10, Math.min(window.innerHeight - h - 10, dragRef.current.origY + dy))
      setPos({ x: newX, y: newY })
    }
    const end = () => {
      setIsDragging(false)
      dragRef.current = null
    }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', end)
    document.addEventListener('touchmove', move, { passive: false })
    document.addEventListener('touchend', end)
    return () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', end)
      document.removeEventListener('touchmove', move)
      document.removeEventListener('touchend', end)
    }
  }, [isDragging])

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!input.trim() || status !== 'ready') return
    sendMessage({ text: input.trim() })
    setInput('')
    if (!hasChatted) setHasChatted(true)
  }

  const handleBubbleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPhase('silenced')
    setBubbleText('')
    setShowCursor(false)
    cancelledRef.current = true
    clearAllTimeouts()
    cancelledRef.current = false
  }

  const handleRobotClick = () => {
    if (open) {
      handleCloseChat()
    } else {
      handleOpenChat()
    }
  }

  // ============================================================
  // DATOS DINÁMICOS — solo de los últimos 20 mensajes
  // ============================================================
  const extracted = extractFromConversation(messages, lang)

  const waBody = fillTemplate(isCa ? WA_TEMPLATE_CA : WA_TEMPLATE_ES, extracted, isCa)
  const emailBody = fillTemplate(isCa ? EMAIL_BODY_TEMPLATE_CA : EMAIL_BODY_TEMPLATE_ES, extracted, isCa)
  const emailSubject = isCa ? EMAIL_SUBJECT_CA : EMAIL_SUBJECT_ES

  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waBody)}`
  const telHref = `tel:+${WHATSAPP_NUMBER}`
  const mailHref = getMailHref(EMAIL, emailSubject, emailBody)

  const containerStyle: React.CSSProperties =
    pos.x !== -1
      ? { left: `${pos.x}px`, top: `${pos.y}px`, right: 'auto', bottom: 'auto' }
      : {}

  const containerClasses = [
    'mascot-assistant',
    open ? 'is-open' : '',
    isDragging ? 'is-dragging' : '',
    pos.x !== -1 ? 'is-positioned' : '',
    isDeepSleep ? 'is-deep-sleep' : '',
    isDeepSleep && nearCursor ? 'is-hovering' : ''
  ].filter(Boolean).join(' ')

  return (
    <>
      {open && (
        <section ref={panelRef} className="mascot-panel mascot-panel-fixed" aria-label={t.role}>
          <div className="mascot-panel-header">
            <div className="mascot-heading">
              <div>
                <strong>Nova</strong>
                <span>{t.role}</span>
              </div>
            </div>
            <div className="mascot-header-actions">
              <button className="mascot-clear" type="button" onClick={newChat} aria-label={t.newChat} title={t.newChat}>
                <RotateCcw size={12} />
                {t.newChat}
              </button>
              <button className="mascot-close" type="button" onClick={handleCloseChat} aria-label={t.closeLabel}>
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="mascot-messages" aria-live="polite">
            {introTyped && (
              <div className="mascot-message from-nova">
                <span>{introTyped}</span>
                {!introDone && <span className="typing-caret" aria-hidden="true">▍</span>}
              </div>
            )}

            {messages.map((message) => {
              const isUser = message.role === 'user'
              const fullText = message.parts
                .map((part) => (part.type === 'text' ? part.text : ''))
                .join('')

              return (
                <div className={`mascot-message ${isUser ? 'from-user' : 'from-nova'}`} key={message.id}>
                  {isUser ? (
                    <span>{fullText}</span>
                  ) : (
                    <span>{renderMessageWithLinks(fullText, lang)}</span>
                  )}
                </div>
              )
            })}

            {status === 'submitted' && (
              <div className="mascot-message from-nova is-thinking">
                {t.thinking}<span>...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="mascot-quick-actions">
            <a href={telHref} className="mascot-quick-btn" aria-label={isCa ? 'Trucar per telèfon' : 'Llamar por teléfono'} title={isCa ? 'Trucar' : 'Llamar'}>
              <Phone size={14} />
              <span>{isCa ? 'Trucar' : 'Llamar'}</span>
            </a>
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="mascot-quick-btn mascot-quick-wa" aria-label={isCa ? 'Obrir WhatsApp' : 'Abrir WhatsApp'} title="WhatsApp">
              <MessageCircle size={14} />
              <span>WhatsApp</span>
            </a>
            <a href={mailHref} className="mascot-quick-btn" aria-label={isCa ? 'Enviar correu' : 'Enviar correo'} title={isCa ? 'Correu' : 'Correo'}>
              <Mail size={14} />
              <span>{isCa ? 'Correu' : 'Correo'}</span>
            </a>
          </div>

          <form className="mascot-form" onSubmit={submit}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t.placeholder}
              aria-label={t.inputLabel}
              disabled={status !== 'ready'}
            />
            <button type="submit" aria-label={t.sendLabel} disabled={!input.trim() || status !== 'ready'}>
              <Send size={16} />
            </button>
          </form>
        </section>
      )}

      <div ref={containerRef} className={containerClasses} style={containerStyle}>
        {!open && bubbleText && phase !== 'silenced' && !isDeepSleep && (
          <div
            className="mascot-speech"
            aria-live="polite"
            role="button"
            tabIndex={0}
            onClick={handleBubbleClick}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleBubbleClick(e as any)
              }
            }}
            title={lang === 'es' ? 'Toca para cerrar' : 'Toca per tancar'}
            style={{ cursor: 'pointer' }}
          >
            {bubbleText}
            {showCursor && <span className="bubble-cursor" aria-hidden="true">▍</span>}
          </div>
        )}

        {showHoverCartel && <div className="mascot-hover-cartel">{t.hoverCartel}</div>}

        <button
          ref={triggerRef}
          className="mascot-trigger"
          type="button"
          onClick={handleRobotClick}
          onMouseDown={handleDragStart}
          onTouchStart={handleDragStart}
          aria-expanded={open}
          aria-label={open ? t.closeLabel : t.openLabel}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <span className="mascot-avatar" role="img" aria-label="Nova, asistente robot de Renovactiva">
            <span className="live-robot" aria-hidden="true">
              <span className="robot-antenna" />
              <span className="robot-ear left" />
              <span className="robot-ear right" />
              <span className="robot-head">
                <span className="robot-eye left" />
                <span className="robot-eye right" />
                <span className="robot-mouth" />
              </span>
              <span className="robot-body">
                <span className="robot-core" />
                <span className="robot-arm left" />
                <span className="robot-arm right" />
              </span>
              <span className="robot-shadow" />
            </span>
          </span>
        </button>
      </div>
    </>
  )
}