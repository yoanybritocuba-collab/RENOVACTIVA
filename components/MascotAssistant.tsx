'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Send, X, RotateCcw, Phone, MessageCircle, Mail } from 'lucide-react'

type MascotLang = 'es' | 'ca'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '34722454020'
const EMAIL = 'info@renovactiva.com'

// ============================================================
// PLANTILLAS
// ============================================================
const WA_TEMPLATE_ES = `Hola, soy {{nombre}}.

Quiero reformar: {{proyecto}}.
Zona: {{zona}}.

Me gustaría agendar una visita técnica para que valoren el espacio y me preparen un presupuesto detallado.

Gracias.`

const WA_TEMPLATE_CA = `Hola, sóc {{nombre}}.

Vull reformar: {{proyecto}}.
Zona: {{zona}}.

M'agradaria agendar una visita tècnica perquè valorin l'espai i em preparin un pressupost detallat.

Gràcies.`

const EMAIL_SUBJECT_ES = 'Solicitud de visita técnica — Renovactiva'
const EMAIL_BODY_TEMPLATE_ES = `Hola equipo Renovactiva,

Soy {{nombre}}.

Quiero reformar: {{proyecto}}.
Zona: {{zona}}.

Me gustaría agendar una visita técnica para valorar el espacio y recibir un presupuesto detallado.

Gracias.`

const EMAIL_SUBJECT_CA = 'Sol·licitud de visita tècnica — Renovactiva'
const EMAIL_BODY_TEMPLATE_CA = `Hola equip Renovactiva,

Sóc {{nombre}}.

Vull reformar: {{proyecto}}.
Zona: {{zona}}.

M'agradaria agendar una visita tècnica per valorar l'espai i rebre un pressupost detallat.

Gràcies.`

// ============================================================
// PARSER DEL BLOQUE <<<DATA...>>>
// ============================================================
type SavedData = {
  nombre: string
  proyecto: string
  zona: string
}

const EMPTY_DATA: SavedData = {
  nombre: 'a completar',
  proyecto: 'a completar',
  zona: 'a completar',
}

function parseDataBlock(text: string): { cleanText: string; data: Partial<SavedData> } {
  const data: Partial<SavedData> = {}
  let cleanText = text

  const blockRegex = /<<<DATA\s*([\s\S]*?)\s*>>>/i
  const match = text.match(blockRegex)

  if (match) {
    const blockContent = match[1]
    const lines = blockContent.split('\n')
    for (const line of lines) {
      const cleanLine = line.trim()
      if (!cleanLine) continue
      const kvMatch = cleanLine.match(/^(nombre|proyecto|zona)\s*:\s*(.+)$/i)
      if (kvMatch) {
        const key = kvMatch[1].toLowerCase() as keyof SavedData
        const value = kvMatch[2].trim()
        if (value && value.toLowerCase() !== 'a completar') {
          data[key] = value
        }
      }
    }
    cleanText = text.replace(blockRegex, '').trim()
  }

  return { cleanText, data }
}

// ============================================================
// FALLBACK regex
// ============================================================
function extractFallback(messages: any[]): Partial<SavedData> {
  const recentMessages = messages.slice(-20)
  const userText = recentMessages
    .filter((m: any) => m.role === 'user')
    .map((m: any) =>
      m.parts?.map((p: any) => (p.type === 'text' ? p.text : '')).join('') || ''
    )
    .join(' · ')

  const data: Partial<SavedData> = {}

  const nombreMatch = userText.match(/(?:me llamo|mi nombre es|soy)\s+([A-Za-zÀ-ÿ]{2,20})/i)
  if (nombreMatch && nombreMatch[1]) {
    const exclude = ['mi', 'el', 'la', 'un', 'una', 'de', 'y', 'o', 'es', 'tu']
    if (!exclude.includes(nombreMatch[1].toLowerCase())) {
      data.nombre = nombreMatch[1].charAt(0).toUpperCase() + nombreMatch[1].slice(1).toLowerCase()
    }
  }

  return data
}

function fillTemplate(template: string, data: SavedData): string {
  return template
    .replace(/{{nombre}}/g, data.nombre || 'a completar')
    .replace(/{{proyecto}}/g, data.proyecto || 'a completar')
    .replace(/{{zona}}/g, data.zona || 'a completar')
}

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

function renderMessageWithLinks(text: string) {
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
      parts.push(<a key={`tel-${key++}`} href={telHref} className="mascot-link mascot-link-phone">{matched}</a>)
    } else if (matched.includes('💬')) {
      parts.push(<a key={`wa-${key++}`} href={genericWaHref} target="_blank" rel="noopener noreferrer" className="mascot-link mascot-link-wa">{matched}</a>)
    } else if (matched.includes('📧')) {
      parts.push(<a key={`mail-${key++}`} href={genericMailHref} className="mascot-link mascot-link-mail">{matched}</a>)
    }

    lastIndex = match.index + matched.length
  }

  if (lastIndex < text.length) {
    parts.push(<span key={`t-end-${key++}`}>{text.slice(lastIndex)}</span>)
  }

  if (parts.length === 0) return text
  return <>{parts}</>
}

function getGreetingText(lang: MascotLang): string {
  const hour = new Date().getHours()
  const isCa = lang === 'ca'

  if (hour >= 6 && hour < 12) return isCa ? 'Bon dia' : 'Buenos días'
  if (hour >= 12 && hour < 20) return isCa ? 'Bona tarda' : 'Buenas tardes'
  return isCa ? 'Bona nit' : 'Buenas noches'
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

  const [savedData, setSavedData] = useState<SavedData>(EMPTY_DATA)

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
      help: '¿En qué te puedo ayudar?',
      linger: 'Me quedo por aquí si necesitas algo',
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
      help: 'En què et puc ajudar?',
      linger: 'Em quedo per aquí si necessites res',
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

  // ⭐ NUEVO SALUDO: "¿Con quién tengo el gusto de hablar?"
  const buildChatIntro = () => {
    const greeting = getGreetingText(lang)
    if (isCa) {
      return `${greeting}, sóc la Nova, l'assistent de Renovactiva. Amb qui tinc el gust de parlar?`
    }
    return `${greeting}, soy Nova, la asistente de Renovactiva. ¿Con quién tengo el gusto de hablar?`
  }

  useEffect(() => {
    cancelledRef.current = false
    clearAllTimeouts()

    const greetingText = getGreetingText(lang)

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
    const lastAssistantMsg = [...messages].reverse().find((m: any) => m.role === 'assistant')
    if (!lastAssistantMsg) return

    const fullText = lastAssistantMsg.parts
      ?.map((p: any) => (p.type === 'text' ? p.text : ''))
      .join('') || ''

    const { data } = parseDataBlock(fullText)

    if (Object.keys(data).length > 0) {
      setSavedData(prev => ({
        nombre: data.nombre ?? prev.nombre,
        proyecto: data.proyecto ?? prev.proyecto,
        zona: data.zona ?? prev.zona,
      }))
    }
  }, [messages])

  useEffect(() => {
    if (savedData.nombre === 'a completar' && messages.length > 4) {
      const fallback = extractFallback(messages)
      if (fallback.nombre) {
        setSavedData(prev => ({ ...prev, nombre: fallback.nombre! }))
      }
    }
  }, [messages, savedData.nombre])

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
        typeIntroInChat(buildChatIntro(), () => setIntroDone(true), 25)
      }, 400)
    } else {
      setIntroTyped(buildChatIntro())
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
    setSavedData(EMPTY_DATA)
    cancelledRef.current = true
    clearAllTimeouts()
    cancelledRef.current = false
    addTimeout(() => {
      setIntroTyped('')
      typeIntroInChat(buildChatIntro(), () => setIntroDone(true), 25)
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

  const waBody = fillTemplate(isCa ? WA_TEMPLATE_CA : WA_TEMPLATE_ES, savedData)
  const emailBody = fillTemplate(isCa ? EMAIL_BODY_TEMPLATE_CA : EMAIL_BODY_TEMPLATE_ES, savedData)
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
              const rawText = message.parts
                .map((part) => (part.type === 'text' ? part.text : ''))
                .join('')

              const fullText = isUser ? rawText : parseDataBlock(rawText).cleanText

              return (
                <div className={`mascot-message ${isUser ? 'from-user' : 'from-nova'}`} key={message.id}>
                  {isUser ? (
                    <span>{fullText}</span>
                  ) : (
                    <span>{renderMessageWithLinks(fullText)}</span>
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
            <a href={waHref} target="_blank" rel="noopener noreferrer" className="mascot-quick-btn mascot-quick-wa" aria-label="WhatsApp" title="WhatsApp">
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