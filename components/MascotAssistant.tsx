'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Send, Sparkles, X, RotateCcw } from 'lucide-react'

type MascotLang = 'es' | 'ca'

export function MascotAssistant({ lang = 'es' }: { lang?: MascotLang }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [greeting, setGreeting] = useState('')

  // Texto de la burbuja
  const [bubbleText, setBubbleText] = useState('')
  const [showCursor, setShowCursor] = useState(false)
  const [phase, setPhase] = useState<
    'greeting' | 'help' | 'linger' | 'silenced' | 'farewell'
  >('greeting')

  // Estado del chat
  const [hasOpenedOnce, setHasOpenedOnce] = useState(false)
  const [hasChatted, setHasChatted] = useState(false)
  const [introTyped, setIntroTyped] = useState('')
  const [introDone, setIntroDone] = useState(false)

  // ⭐ STANDBY PROFUNDO + HOVER ACTIVO
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
      chatIntro: 'Soy el asistente de Renovactiva. Mi nombre es Nova. ¿En qué le puedo ayudar?',
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
      chatIntro: "Sóc l'assistent de Renovactiva. El meu nom és Nova. En què li puc ajudar?",
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

  // ============================================================
  // TIMERS
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
  // TECLEO LETRA A LETRA
  // ============================================================
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

  // ============================================================
  // SECUENCIA DE LA BURBUJA
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang])

  // ============================================================
  // DETECTAR CURSOR CERCA DEL ROBOT
  // ============================================================
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

  // ⭐ CARTEL HOVER + ACTIVACIÓN
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

  // ============================================================
  // CHAT
  // ============================================================
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, hasChatted])

  // ============================================================
  // ABRIR / CERRAR CHAT
  // ============================================================
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

  // ============================================================
  // DRAG
  // ============================================================
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

  const containerStyle: React.CSSProperties =
    pos.x !== -1
      ? { left: `${pos.x}px`, top: `${pos.y}px`, right: 'auto', bottom: 'auto' }
      : {}

  // ⭐ Clases del contenedor
  const containerClasses = [
    'mascot-assistant',
    open ? 'is-open' : '',
    isDragging ? 'is-dragging' : '',
    pos.x !== -1 ? 'is-positioned' : '',
    isDeepSleep ? 'is-deep-sleep' : '',
    // ⭐ NUEVO: cuando el cursor está cerca Y está dormido → activar
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
        className={containerClasses}
        style={containerStyle}
      >
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

        {showHoverCartel && (
          <div className="mascot-hover-cartel">
            {t.hoverCartel}
          </div>
        )}

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