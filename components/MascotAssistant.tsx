'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Send, Sparkles, X, RotateCcw } from 'lucide-react'

type MascotLang = 'es' | 'ca'

// ⭐ TIPO DEL MENSAJE ESPECIAL DE NOVA (letra a letra en el chat)
type NovaIntro = { text: string } | null

export function MascotAssistant({ lang = 'es' }: { lang?: MascotLang }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [greeting, setGreeting] = useState('')

  // ⭐ Texto visible en la burbuja (se reemplaza letra a letra)
  const [bubbleText, setBubbleText] = useState('')
  const [showCursor, setShowCursor] = useState(false)
  const [phase, setPhase] = useState<
    'greeting' | 'help' | 'linger' | 'silenced' | 'farewell'
  >('greeting')

  // ⭐ Estado del chat
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false)     // Ya abrió el chat al menos una vez
  const [hasChatted, setHasChatted] = useState(false)           // Ya escribió algo
  const [introTyped, setIntroTyped] = useState('')              // El saludo escribiéndose letra a letra
  const [introDone, setIntroDone] = useState(false)             // El saludo terminó

  // ⭐ Standby
  const [isStandby, setIsStandby] = useState(false)
  const [nearCursor, setNearCursor] = useState(false)

  const [pos, setPos] = useState<{ x: number; y: number }>({ x: -1, y: -1 })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // ⭐ Control de timers
  const timeoutsRef = useRef<number[]>([])
  const cancelledRef = useRef(false)

  const texts = {
    es: {
      greetMorning: 'Buenos días',
      greetAfternoon: 'Buenas tardes',
      greetEvening: 'Buenas noches',
      help: '¿En qué te puedo ayudar?',
      linger: 'Me quedo por aquí si necesitas algo',
      chatIntro: 'Soy el asistente de Renovactiva. Mi nombre es Nova. ¿En qué le puedo ayudar?',
      farewell: 'Gracias por confiar en Renovactiva. Aquí estoy si necesitas algo más.',
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
      chatIntro: 'Sóc l\'assistent de Renovactiva. El meu nom és Nova. En què li puc ajudar?',
      farewell: 'Gràcies per confiar en Renovactiva. Aquí estic si necessites res més.',
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

  // ============================================================
  // ⏱️ Helper: añade timeouts cancelables
  // ============================================================
  const addTimeout = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms)
    timeoutsRef.current.push(id)
    return id
  }

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id))
    timeoutsRef.current = []
  }

  // ============================================================
  // ⌨️ TECLEO RÁPIDO (humano, ágil)
  // ============================================================
  const typeText = (
    text: string,
    onDone: () => void,
    speed = 25
  ) => {
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

  // ⭐ TECLEO dentro del CHAT (para el saludo de Nova)
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

  // ============================================================
  // 🎬 SECUENCIA DE LA BURBUJA (al entrar en la web)
  // ============================================================
  useEffect(() => {
    cancelledRef.current = false
    clearAllTimeouts()

    const hour = new Date().getHours()
    const greetingText =
      hour < 12 ? t.greetMorning : hour < 20 ? t.greetAfternoon : t.greetEvening
    setGreeting(greetingText)

    setPhase('greeting')
    setBubbleText('')
    setShowCursor(false)

    // PASO 1: Saludo
    addTimeout(() => {
      typeText(greetingText, () => {
        // PASO 2: "¿En qué te puedo ayudar?"
        addTimeout(() => {
          setBubbleText('')
          typeText(t.help, () => {
            // PASO 3: "Me quedo por aquí si necesitas algo"
            addTimeout(() => {
              setBubbleText('')
              typeText(t.linger, () => {
                setPhase('linger')
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  // ============================================================
  // ⭐ STANDBY
  // ============================================================
  useEffect(() => {
    if (open) {
      setNearCursor(true)
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      )
      setNearCursor(distance < 180)
    }

    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [open])

  useEffect(() => {
    if (open || nearCursor || isDragging) {
      setIsStandby(false)
      return
    }
    const timer = window.setTimeout(() => setIsStandby(true), 8000)
    return () => window.clearTimeout(timer)
  }, [open, nearCursor, isDragging, phase])

  // ============================================================
  // 💬 CHAT
  // ============================================================
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat', body: { language: lang } }),
  })

  // Detectar cuando el usuario envía su primer mensaje → marcar hasChatted
  useEffect(() => {
    if (messages.length > 0 && !hasChatted) {
      setHasChatted(true)
    }
  }, [messages.length, hasChatted])

  // Auto-scroll
  useEffect(() => {
    if (!open) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, status, open, introTyped])

  // Cerrar al hacer clic fuera o Escape
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      const panel = panelRef.current
      const trigger = containerRef.current
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hasChatted])

  // ============================================================
  // ⭐ ABRIR EL CHAT
  // ============================================================
  const handleOpenChat = () => {
    cancelledRef.current = true
    clearAllTimeouts()
    cancelledRef.current = false

    setOpen(true)

    // Si es la primera vez que abre el chat → escribir el saludo dentro
    if (!hasOpenedOnce) {
      setHasOpenedOnce(true)
      setIntroDone(false)
      setIntroTyped('')
      // Esperar un momento a que se abra el panel
      addTimeout(() => {
        typeIntroInChat(t.chatIntro, () => {
          setIntroDone(true)
        }, 25)
      }, 400)
    } else {
      // Ya lo abrió antes → mostrar saludo de golpe
      setIntroTyped(t.chatIntro)
      setIntroDone(true)
    }
  }

  // ============================================================
  // ⭐ CERRAR EL CHAT → despedida si hubo conversación
  // ============================================================
  const handleCloseChat = () => {
    setOpen(false)
    cancelledRef.current = true
    clearAllTimeouts()
    cancelledRef.current = false

    // Solo despedirse si el cliente escribió algo
    if (hasChatted) {
      addTimeout(() => {
        setBubbleText('')
        typeText(t.farewell, () => {
          setPhase('farewell')
        }, 25)
      }, 500)
    } else {
      // Si no escribió → mostrar el mensaje persistente
      setBubbleText(hasOpenedOnce ? t.linger : t.linger)
      setPhase('linger')
    }
  }

  // ============================================================
  // ⭐ NUEVO CHAT (reinicia todo)
  // ============================================================
  const newChat = () => {
    setMessages([])
    setInput('')
    setHasChatted(false)
    setIntroDone(false)
    setIntroTyped('')
    setHasOpenedOnce(false)
    cancelledRef.current = true
    clearAllTimeouts()
    cancelledRef.current = false
    addTimeout(() => {
      setIntroTyped('')
      typeIntroInChat(t.chatIntro, () => setIntroDone(true), 25)
    }, 400)
  }

  // ============================================================
  // 🖱️ DRAG
  // ============================================================
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    dragRef.current = {
      startX: clientX,
      startY: clientY,
      origX: rect.left,
      origY: rect.top,
    }
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

  // Silenciar la burbuja al hacer clic en ella
  const silenceBubble = () => {
    setPhase('silenced')
    setBubbleText('')
    setShowCursor(false)
    cancelledRef.current = true
    clearAllTimeouts()
  }

  const containerStyle: React.CSSProperties =
    pos.x !== -1
      ? { left: `${pos.x}px`, top: `${pos.y}px`, right: 'auto', bottom: 'auto' }
      : {}

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
            {/* ⭐ Saludo de Nova escribiéndose letra a letra (primera vez) */}
            {introTyped && (
              <div className="mascot-message from-nova">
                <span>{introTyped}</span>
                {!introDone && <span className="typing-caret" aria-hidden="true">▍</span>}
              </div>
            )}

            {/* Mensajes del chat */}
            {messages.map((message) => {
              const isUser = message.role === 'user'
              const fullText = message.parts
                .map((part) => (part.type === 'text' ? part.text : ''))
                .join('')

              return (
                <div
                  className={`mascot-message ${isUser ? 'from-user' : 'from-nova'}`}
                  key={message.id}
                >
                  <span>{fullText}</span>
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

      <div
        ref={containerRef}
        className={`mascot-assistant ${open ? 'is-open' : ''} ${isDragging ? 'is-dragging' : ''} ${pos.x !== -1 ? 'is-positioned' : ''} ${isStandby ? 'is-standby' : ''}`}
        style={containerStyle}
      >
        {!open && bubbleText && phase !== 'silenced' && (
          <div
            className="mascot-speech"
            aria-live="polite"
            role="button"
            tabIndex={0}
            onClick={silenceBubble}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') silenceBubble() }}
            title={lang === 'es' ? 'Toca para cerrar' : 'Toca per tancar'}
            style={{ cursor: 'pointer' }}
          >
            {bubbleText}
            {showCursor && <span className="bubble-cursor" aria-hidden="true">▍</span>}
          </div>
        )}

        <button
          className="mascot-trigger"
          type="button"
          onClick={() => (open ? handleCloseChat() : handleOpenChat())}
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