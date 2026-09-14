'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '@/components/language-provider'

// ============================================================
// 🐶 FUNCIONES DE IDIOMA (ES/CA)
// ============================================================
const getGreeting = (language: string): string => {
  const hour = new Date().getHours()
  const isMorning = hour >= 5 && hour < 12
  const isAfternoon = hour >= 12 && hour < 19
  
  const greetings: Record<string, { morning: string; afternoon: string; night: string }> = {
    es: { morning: 'Buenos días', afternoon: 'Buenas tardes', night: 'Buenas noches' },
    ca: { morning: 'Bon dia', afternoon: 'Bona tarda', night: 'Bona nit' }
  }
  
  const lang = greetings[language] || greetings.es
  if (isMorning) return lang.morning
  if (isAfternoon) return lang.afternoon
  return lang.night
}

const getHelpText = (language: string): string => {
  const texts: Record<string, string> = {
    es: '¿Necesitas ayuda? ¡Pregúntame!',
    ca: 'Necessites ajuda? Pregunta\'m!'
  }
  return texts[language] || texts.es
}

const getTypingText = (language: string): string => {
  const texts: Record<string, string> = {
    es: 'Escribiendo',
    ca: 'Escrivint'
  }
  return texts[language] || texts.es
}

const getAriaLabel = (language: string): string => {
  const texts: Record<string, string> = {
    es: 'Abrir chat',
    ca: 'Obrir xat'
  }
  return texts[language] || texts.es
}

interface PuppyMascotProps {
  onClick: () => void
}

export function PuppyMascot({ onClick }: PuppyMascotProps) {
  const { language } = useLanguage()
  const [showBubble, setShowBubble] = useState(false)
  const [isTyping, setIsTyping] = useState(true)
  const [bubblePhase, setBubblePhase] = useState<'greeting' | 'help'>('greeting')
  const [tongueOut, setTongueOut] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [blink, setBlink] = useState(false)

  // Mostrar saludo al entrar (después de 2s)
  useEffect(() => {
    const t0 = setTimeout(() => {
      setShowBubble(true)
      setBubblePhase('greeting')
      setIsTyping(true)
    }, 2000)
    
    const t1 = setTimeout(() => setIsTyping(false), 3500)
    
    // Cambia a "¿Necesitas ayuda?" después de 12s
    const t2 = setTimeout(() => {
      setShowBubble(false)
      setTimeout(() => {
        setBubblePhase('help')
        setIsTyping(true)
        setShowBubble(true)
        setTimeout(() => setIsTyping(false), 1500)
      }, 500)
    }, 12000)
    
    return () => { 
      clearTimeout(t0)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [language])

  // Lengua que sale cada 5s
  useEffect(() => {
    const tongueInterval = setInterval(() => {
      setTongueOut(true)
      setTimeout(() => setTongueOut(false), 700)
    }, 5000)
    return () => clearInterval(tongueInterval)
  }, [])

  // Parpadeo de ojos cada 4s
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 200)
    }, 4000)
    return () => clearInterval(blinkInterval)
  }, [])

  const shakeVariants = {
    initial: { x: 0, rotate: 0, scale: 1 },
    animate: {
      x: [0, -4, 4, -3, 3, -2, 2, 0],
      rotate: [0, -2, 2, -1.5, 1.5, -1, 1, 0],
      scale: [1, 1.02, 0.98, 1.01, 0.99, 1],
      transition: {
        duration: 0.8,
        ease: 'easeInOut',
        times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1]
      }
    },
    idle: { x: 0, rotate: 0, scale: 1, transition: { duration: 0.3 } }
  }

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ scale: 0, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 1.5 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed right-4 sm:right-6 z-[99999] bg-transparent border-0 cursor-pointer p-0 outline-none focus:outline-none
                 bottom-[calc(80px+env(safe-area-inset-bottom,0px))] 
                 sm:bottom-6"
      aria-label={getAriaLabel(language)}
    >
      <div className="relative flex items-end gap-3 flex-row-reverse">
        
        {/* 🐶 PERRITO GOLDEN RETRIEVER REALISTA */}
        <motion.div
          animate={{ 
            y: [0, -3, 0],
            rotate: isHovered ? [0, -4, 4, 0] : 0
          }}
          transition={{ 
            y: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: 0.6 }
          }}
          className="relative w-12 h-12 sm:w-14 sm:h-14"
        >
          {/* SVG del perrito */}
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
            {/* Cola moviéndose */}
            <motion.g
              animate={{ rotate: [0, 20, -10, 20, 0] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '75px 65px' }}
            >
              <ellipse cx="82" cy="60" rx="8" ry="5" fill="#b89968" />
              <ellipse cx="84" cy="58" rx="5" ry="4" fill="#d7bd77" />
            </motion.g>

            {/* Cuerpo */}
            <ellipse cx="50" cy="70" rx="28" ry="20" fill="#d7bd77" />
            <ellipse cx="50" cy="68" rx="24" ry="16" fill="#e8d5a8" />

            {/* Patas delanteras */}
            <ellipse cx="35" cy="85" rx="6" ry="8" fill="#b89968" />
            <ellipse cx="65" cy="85" rx="6" ry="8" fill="#b89968" />

            {/* Patas traseras */}
            <ellipse cx="30" cy="82" rx="5" ry="7" fill="#a88960" />
            <ellipse cx="70" cy="82" rx="5" ry="7" fill="#a88960" />

            {/* Cabeza */}
            <ellipse cx="50" cy="40" rx="28" ry="26" fill="#d7bd77" />
            <ellipse cx="50" cy="42" rx="24" ry="22" fill="#e8d5a8" />

            {/* Orejas caídas */}
            <motion.ellipse 
              cx="25" cy="42" rx="9" ry="16" fill="#b89968"
              animate={{ rotate: isHovered ? [-5, 5, -5] : 0 }}
              transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0 }}
              style={{ transformOrigin: '25px 30px' }}
            />
            <motion.ellipse 
              cx="75" cy="42" rx="9" ry="16" fill="#b89968"
              animate={{ rotate: isHovered ? [5, -5, 5] : 0 }}
              transition={{ duration: 0.8, repeat: isHovered ? Infinity : 0 }}
              style={{ transformOrigin: '75px 30px' }}
            />

            {/* Hocico */}
            <ellipse cx="50" cy="52" rx="14" ry="11" fill="#f5e9c8" />

            {/* Nariz */}
            <ellipse cx="50" cy="47" rx="3.5" ry="3" fill="#2a2a2a" />
            <ellipse cx="49" cy="46.5" rx="1" ry="0.8" fill="#666" />

            {/* Boca */}
            <path d="M 46 52 Q 50 55 54 52" stroke="#2a2a2a" strokeWidth="0.8" fill="none" strokeLinecap="round" />

            {/* Lengua */}
            <AnimatePresence>
              {tongueOut && (
                <motion.ellipse 
                  cx="50" cy="56" rx="3" ry="4" fill="#ff8fa3"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  style={{ transformOrigin: '50px 52px' }}
                />
              )}
            </AnimatePresence>

            {/* Ojos */}
            <g>
              {/* Ojo izquierdo */}
              <ellipse cx="42" cy="38" rx="4" ry={blink ? 0.5 : 4.5} fill="#ffffff" />
              {!blink && (
                <>
                  <ellipse cx="42" cy="38" rx="3" ry="3.5" fill="#2a2a2a" />
                  <circle cx="43" cy="36.5" r="1.2" fill="#ffffff" />
                </>
              )}
              
              {/* Ojo derecho */}
              <ellipse cx="58" cy="38" rx="4" ry={blink ? 0.5 : 4.5} fill="#ffffff" />
              {!blink && (
                <>
                  <ellipse cx="58" cy="38" rx="3" ry="3.5" fill="#2a2a2a" />
                  <circle cx="59" cy="36.5" r="1.2" fill="#ffffff" />
                </>
              )}
            </g>

            {/* Cejas sutiles */}
            <path d="M 37 32 Q 42 30 47 32" stroke="#a88960" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            <path d="M 53 32 Q 58 30 63 32" stroke="#a88960" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </svg>

          {/* Brillo suave detrás del perrito */}
          <div className="absolute inset-0 -z-10 bg-[#d7bd77]/20 rounded-full blur-xl" />
        </motion.div>

        {/* 💬 BURBUJA DE SALUDO */}
        <AnimatePresence>
          {showBubble && (
            <motion.div
              variants={shakeVariants}
              initial="initial"
              animate={bubblePhase === 'greeting' ? 'animate' : 'idle'}
              exit="idle"
              className="bg-[#0A0A0A] text-white px-3.5 py-2.5 rounded-2xl text-[11px] sm:text-xs font-medium shadow-2xl whitespace-nowrap border border-[#10B77F]/40"
            >
              {isTyping ? (
                <span className="flex items-center gap-1.5 text-[#d7bd77]">
                  {getTypingText(language)}
                  <span className="flex gap-0.5">
                    <span className="w-1 h-1 bg-[#d7bd77] rounded-full animate-bounce" />
                    <span className="w-1 h-1 bg-[#d7bd77] rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
                    <span className="w-1 h-1 bg-[#d7bd77] rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  </span>
                </span>
              ) : bubblePhase === 'greeting' ? (
                <span className="text-[#d7bd77]">{getGreeting(language)}! 🐶</span>
              ) : (
                <span className="text-[#10B77F]">{getHelpText(language)} 🐶</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  )
}