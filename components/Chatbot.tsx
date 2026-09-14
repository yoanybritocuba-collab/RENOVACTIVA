'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/components/language-provider'
import { X, Send, RotateCcw } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// ============================================================
// 🌐 TEXTOS POR IDIOMA
// ============================================================
const getWelcomeMessage = (language: string): string => {
  const hour = new Date().getHours()
  const isMorning = hour >= 5 && hour < 12
  const isAfternoon = hour >= 12 && hour < 19
  
  const messages: Record<string, { morning: string; afternoon: string; night: string }> = {
    es: {
      morning: '¡Buenos días! 🐶 Soy Renov, el asistente virtual de Renovactiva. Estoy aquí para si tienes alguna pregunta o duda sobre nuestras reformas. ¿En qué te puedo ayudar? 😊',
      afternoon: '¡Buenas tardes! 🐶 Soy Renov, el asistente virtual de Renovactiva. Estoy aquí para si tienes alguna pregunta o duda sobre nuestras reformas. ¿En qué te puedo ayudar? 😊',
      night: '¡Buenas noches! 🐶 Soy Renov, el asistente virtual de Renovactiva. Estoy aquí para si tienes alguna pregunta o duda sobre nuestras reformas. ¿En qué te puedo ayudar? 😊'
    },
    ca: {
      morning: 'Bon dia! 🐶 Sóc en Renov, l\'assistent virtual de Renovactiva. Estic aquí per si tens alguna pregunta o dubte sobre les nostres reformes. En què et puc ajudar? 😊',
      afternoon: 'Bona tarda! 🐶 Sóc en Renov, l\'assistent virtual de Renovactiva. Estic aquí per si tens alguna pregunta o dubte sobre les nostres reformes. En què et puc ajudar? 😊',
      night: 'Bona nit! 🐶 Sóc en Renov, l\'assistent virtual de Renovactiva. Estic aquí per si tens alguna pregunta o dubte sobre les nostres reformes. En què et puc ajudar? 😊'
    }
  }
  
  const lang = messages[language] || messages.es
  if (isMorning) return lang.morning
  if (isAfternoon) return lang.afternoon
  return lang.night
}

const getWelcomeBackMessage = (language: string): string => {
  const texts: Record<string, string> = {
    es: '¡Hola de nuevo! 🐶 ¿Tienes alguna otra duda? Estoy aquí para ayudarte.',
    ca: 'Hola de nou! 🐶 Tens algun altre dubte? Estic aquí per ajudar-te.'
  }
  return texts[language] || texts.es
}

const getPlaceholder = (language: string): string => {
  const texts: Record<string, string> = {
    es: 'Escribe tu pregunta...',
    ca: 'Escriu la teva pregunta...'
  }
  return texts[language] || texts.es
}

const getOnlineText = (language: string): string => {
  const texts: Record<string, string> = {
    es: 'En línea',
    ca: 'En línia'
  }
  return texts[language] || texts.es
}

const getTitle = (language: string): string => {
  const texts: Record<string, string> = {
    es: 'Asistente Renovactiva',
    ca: 'Assistent Renovactiva'
  }
  return texts[language] || texts.es
}

const getErrorText = (language: string): string => {
  const texts: Record<string, string> = {
    es: 'Lo siento, ha habido un error. Escríbenos a info@renovactiva.com y te ayudamos. 🐶',
    ca: 'Ho sento, hi ha hagut un error. Escriu-nos a info@renovactiva.com i t\'ajudem. 🐶'
  }
  return texts[language] || texts.es
}

const getNewChatLabel = (language: string): string => {
  const texts: Record<string, string> = {
    es: 'Nuevo chat',
    ca: 'Xat nou'
  }
  return texts[language] || texts.es
}

// ============================================================
// 🎯 COMPONENTE PRINCIPAL
// ============================================================
interface ChatbotProps {
  isOpen: boolean
  onClose: () => void
}

export function Chatbot({ isOpen, onClose }: ChatbotProps) {
  const { language } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasChattedBefore, setHasChattedBefore] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  // Al abrir el chat: saludo inicial O bienvenida de nuevo
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcome = hasChattedBefore
        ? getWelcomeBackMessage(language)
        : getWelcomeMessage(language)
      setMessages([{ role: 'assistant', content: welcome }])
    }
  }, [isOpen, language, messages.length, hasChattedBefore])

  // Auto-scroll al final cuando hay mensajes nuevos
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus en el input al abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && chatRef.current && !chatRef.current.contains(event.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // ============================================================
  // 🆕 NUEVO CHAT
  // ============================================================
  const startNewChat = () => {
    setMessages([{ role: 'assistant', content: getWelcomeMessage(language) }])
    setHasChattedBefore(false)
    setInput('')
  }

  // ============================================================
  // 📤 ENVIAR MENSAJE CON IA REAL
  // ============================================================
  const sendMessageHandler = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setHasChattedBefore(true)

    const userMsg: Message = { role: 'user', content: userMessage }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setIsLoading(true)

    // Añadir mensaje vacío del asistente (se irá rellenando con el stream)
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          language
        })
      })

      if (!response.ok) throw new Error('Error en la respuesta')
      if (!response.body) throw new Error('No hay respuesta')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        assistantMessage += chunk

        // Actualizar el último mensaje del asistente en tiempo real
        setMessages(prev => {
          const newPrev = [...prev]
          newPrev[newPrev.length - 1] = { role: 'assistant', content: assistantMessage }
          return newPrev
        })
      }

      // Si no se recibió nada, mostrar error
      if (!assistantMessage.trim()) {
        setMessages(prev => {
          const newPrev = [...prev]
          newPrev[newPrev.length - 1] = { role: 'assistant', content: getErrorText(language) }
          return newPrev
        })
      }

    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => {
        const newPrev = [...prev]
        newPrev[newPrev.length - 1] = { role: 'assistant', content: getErrorText(language) }
        return newPrev
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={chatRef}
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed right-3 sm:right-5 z-[99998] w-[calc(100vw-24px)] sm:w-[380px] h-[520px] max-h-[calc(100vh-160px)] rounded-2xl shadow-2xl bg-gradient-to-br from-[#0A0A0A] to-[#050505] flex flex-col overflow-hidden border border-[#10B77F]/40 bottom-[calc(160px+env(safe-area-inset-bottom,0px))] sm:bottom-28"
        >
          {/* ═══════════ HEADER ═══════════ */}
          <div className="bg-gradient-to-r from-[#10B77F] to-[#0e9e6d] py-3.5 px-4 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 bg-gradient-to-br from-[#e8d5a8] via-[#d7bd77] to-[#b89968] rounded-xl shadow-md flex items-center justify-center">
                <div className="absolute -top-2 left-1 w-2 h-3 bg-[#b89968] rounded-t-full" />
                <div className="absolute -top-2 right-1 w-2 h-3 bg-[#b89968] rounded-t-full" />
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-2 bg-white rounded-full relative">
                    <div className="w-1 h-1.5 bg-zinc-800 rounded-full absolute top-0.5 left-0.5" />
                  </div>
                  <div className="w-1.5 h-2 bg-white rounded-full relative">
                    <div className="w-1 h-1.5 bg-zinc-800 rounded-full absolute top-0.5 left-0.5" />
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-white text-sm leading-tight">{getTitle(language)}</h3>
                <span className="text-[10px] text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                  {getOnlineText(language)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Botón nuevo chat — solo aparece si ya hay conversación */}
              {messages.length > 1 && (
                <button
                  onClick={startNewChat}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg w-8 h-8 flex items-center justify-center transition-colors"
                  aria-label={getNewChatLabel(language)}
                  title={getNewChatLabel(language)}
                >
                  <RotateCcw className="size-4" />
                </button>
              )}
              
              {/* Botón cerrar */}
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-lg w-8 h-8 flex items-center justify-center transition-colors"
                aria-label="Cerrar chat"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* ═══════════ MENSAJES ═══════════ */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 px-3.5 rounded-2xl text-[12.5px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#d7bd77] text-[#141310] rounded-br-md font-medium'
                      : 'bg-[#1a1a1a] text-zinc-100 rounded-bl-md border border-[#10B77F]/20'
                  }`}
                >
                  {msg.content ? (
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  ) : (
                    // Muestra los 3 puntitos mientras carga
                    <div className="flex gap-1.5 py-0.5">
                      <span className="w-1.5 h-1.5 bg-[#10B77F] rounded-full animate-bounce" />
                      <span className="w-1.5 h-1.5 bg-[#10B77F] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#10B77F] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            <div ref={messagesEndRef} />
          </div>

          {/* ═══════════ INPUT ═══════════ */}
          <div className="p-3 border-t border-[#10B77F]/20 bg-black/40 flex-shrink-0">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessageHandler()}
                placeholder={getPlaceholder(language)}
                disabled={isLoading}
                className="flex-1 bg-[#1a1a1a] text-white rounded-xl px-3.5 py-2.5 text-[12.5px] placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#10B77F]/50 border border-[#10B77F]/20 disabled:opacity-50"
              />
              <button
                onClick={sendMessageHandler}
                disabled={isLoading || !input.trim()}
                className="bg-[#10B77F] hover:bg-[#d7bd77] text-white hover:text-[#141310] px-3 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                aria-label="Enviar mensaje"
              >
                <Send className="size-4" />
              </button>
            </div>
            <p className="text-[9px] text-white/30 text-center mt-2 uppercase tracking-wider">
              Powered by Groq AI
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}