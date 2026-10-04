'use client'

import { useEffect, useState } from 'react'
import { X, User, MessageSquare, MapPin, CheckCircle2, ShieldCheck, Lock, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '34722454020'

type WhatsAppLang = 'es' | 'ca'

type WhatsAppModalProps = {
  open: boolean
  onClose: () => void
  lang?: WhatsAppLang
}

export function WhatsAppModal({ open, onClose, lang = 'es' }: WhatsAppModalProps) {
  const isCa = lang === 'ca'
  const [nombre, setNombre] = useState('')
  const [proyecto, setProyecto] = useState('')
  const [zona, setZona] = useState('')
  const [acepto, setAcepto] = useState(false)
  const [error, setError] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [privacidadOpen, setPrivacidadOpen] = useState(false)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (privacidadOpen) setPrivacidadOpen(false)
        else onClose()
      }
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose, privacidadOpen])

  useEffect(() => {
    if (!open) {
      setError('')
      setAbierto(false)
      setPrivacidadOpen(false)
    }
  }, [open])

  function validar(): boolean {
    if (!nombre.trim()) {
      setError(isCa ? 'Escriu el teu nom' : 'Escribe tu nombre')
      return false
    }
    if (!acepto) {
      setError(isCa ? 'Has d\'acceptar la política de privacitat' : 'Debes aceptar la política de privacidad')
      return false
    }
    setError('')
    return true
  }

  function abrirWhatsApp() {
    if (!validar()) return

    let mensaje = ''

    if (isCa) {
      mensaje = `Hola, vengo de la web de Renovactiva.

Sóc ${nombre.trim()}.`
      if (proyecto.trim()) mensaje += `\nVull reformar: ${proyecto.trim()}.`
      if (zona.trim()) mensaje += `\nZona: ${zona.trim()}.`
      mensaje += `

M'agradaria rebre informació i concertar una visita tècnica sense compromís per valorar el meu projecte.

Gràcies.`
    } else {
      mensaje = `Hola, vengo de la web de Renovactiva.

Soy ${nombre.trim()}.`
      if (proyecto.trim()) mensaje += `\nQuiero reformar: ${proyecto.trim()}.`
      if (zona.trim()) mensaje += `\nZona: ${zona.trim()}.`
      mensaje += `

Me gustaría recibir información y concertar una visita técnica sin compromiso para valorar mi proyecto.

Gracias.`
    }

    const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`

    window.open(href, '_blank', 'noopener,noreferrer')
    setAbierto(true)

    setTimeout(() => {
      setNombre('')
      setProyecto('')
      setZona('')
      setAcepto(false)
      setAbierto(false)
    }, 5000)
  }

  function aceptarPrivacidad() {
    setAcepto(true)
    setPrivacidadOpen(false)
  }

  return (
    <>
      {/* ============================================ */}
      {/* MODAL PRINCIPAL DE WHATSAPP */}
      {/* ============================================ */}
      <AnimatePresence>
        {open && !privacidadOpen && (
          <motion.div
            className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          >
            <motion.div
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-8"
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ✅ Verde WhatsApp — NO TOCAR */}
              <div className="h-1.5 bg-gradient-to-r from-[#25D366] via-[#4ae085] to-[#25D366]" />

              <button
                onClick={onClose}
                aria-label="Cerrar"
                className="absolute top-4 right-4 z-10 flex items-center justify-center size-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="px-6 sm:px-8 py-7">

                <div className="mb-6 pr-10">
                  {/* ✅ Verde WhatsApp — NO TOCAR */}
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#25D366] font-semibold mb-2">
                    {isCa ? 'Contacte ràpid' : 'Contacto rápido'}
                  </p>
                  <h2 className="font-bold text-2xl sm:text-3xl text-[#0a1a3a] leading-tight">
                    {isCa ? 'Contacta per ' : 'Contacta por '}
                    {/* ✅ Verde WhatsApp — NO TOCAR */}
                    <span className="text-[#25D366]">WhatsApp</span>
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    {isCa
                      ? 'Rellena aquestes dades i s\'obrirà WhatsApp amb un missatge ja preparat.'
                      : 'Rellena estos datos y se abrirá WhatsApp con un mensaje ya preparado.'}
                  </p>
                </div>

                {abierto ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-8 text-center"
                  >
                    <div className="flex justify-center mb-5">
                      {/* ✅ Verde WhatsApp — NO TOCAR */}
                      <div className="flex items-center justify-center size-20 rounded-full bg-[#25D366]/15 border-2 border-[#25D366]">
                        <CheckCircle2 className="size-10 text-[#25D366]" />
                      </div>
                    </div>
                    <h3 className="font-bold text-2xl text-[#0a1a3a] mb-3">
                      {isCa ? 'Perfecte!' : '¡Perfecto!'}
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                      {isCa
                        ? 'S\'ha obert WhatsApp amb el teu missatge. Només has de prémer ENVIAR.'
                        : 'Se ha abierto WhatsApp con tu mensaje. Solo tienes que pulsar ENVIAR.'}
                    </p>
                    <button
                      onClick={onClose}
                      className="mt-7 px-6 py-3 rounded-lg bg-[#0a1a3a] text-white text-sm font-semibold hover:bg-[#152a5a] transition-colors"
                    >
                      {isCa ? 'Tancar' : 'Cerrar'}
                    </button>
                  </motion.div>
                ) : (
                  <>
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-[#0a1a3a] mb-2">
                        {isCa ? 'Nom' : 'Nombre'}
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input
                          type="text"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          placeholder={isCa ? 'El teu nom' : 'Tu nombre'}
                          /* ✅ Focus verde WhatsApp — NO TOCAR */
                          className="w-full rounded-lg border border-gray-300 pl-11 pr-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-medium text-[#0a1a3a] mb-2">
                        {isCa ? 'Què vols reformar?' : '¿Qué quieres reformar?'}
                        <span className="text-gray-400 font-normal ml-1">({isCa ? 'opcional' : 'opcional'})</span>
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input
                          type="text"
                          value={proyecto}
                          onChange={(e) => setProyecto(e.target.value)}
                          placeholder={isCa ? 'Ex: bany, cuina, pis sencer...' : 'Ej: baño, cocina, piso entero...'}
                          className="w-full rounded-lg border border-gray-300 pl-11 pr-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-medium text-[#0a1a3a] mb-2">
                        {isCa ? 'Zona' : 'Zona'}
                        <span className="text-gray-400 font-normal ml-1">({isCa ? 'opcional' : 'opcional'})</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input
                          type="text"
                          value={zona}
                          onChange={(e) => setZona(e.target.value)}
                          placeholder={isCa ? 'Ex: Eixample, Gràcia...' : 'Ej: Eixample, Gràcia...'}
                          className="w-full rounded-lg border border-gray-300 pl-11 pr-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 outline-none transition"
                        />
                      </div>
                    </div>

                    <label className="flex items-start gap-3 mb-5 p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <input
                        type="checkbox"
                        checked={acepto}
                        onChange={(e) => setAcepto(e.target.checked)}
                        /* ✅ Checkbox verde WhatsApp — NO TOCAR */
                        className="mt-0.5 size-4 accent-[#25D366] cursor-pointer flex-shrink-0"
                      />
                      <span className="text-sm text-gray-700">
                        {isCa ? 'He llegit i accepto la ' : 'He leído y acepto la '}
                        <button
                          type="button"
                          onClick={() => setPrivacidadOpen(true)}
                          className="font-semibold text-[#0a1a3a] hover:text-[#25D366] underline cursor-pointer"
                        >
                          {isCa ? 'política de privacitat' : 'política de privacidad'}
                        </button>
                      </span>
                    </label>

                    <div className="flex items-center justify-center gap-6 mb-6 text-gray-400">
                      <Lock size={18} />
                      <ShieldCheck size={18} />
                      <Clock size={18} />
                    </div>

                    {error && (
                      <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm text-center">
                        {error}
                      </div>
                    )}

                    {/* ✅ Botón verde WhatsApp — NO TOCAR */}
                    <button
                      type="button"
                      onClick={abrirWhatsApp}
                      className="group relative w-full inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1faa53] text-white px-6 py-4 rounded-xl font-bold uppercase tracking-[0.15em] text-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
                    >
                      <svg viewBox="0 0 24 24" className="size-5 fill-current">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                      {isCa ? 'Obrir WhatsApp' : 'Abrir WhatsApp'}
                      <span className="text-lg">→</span>
                    </button>

                    <p className="mt-5 text-center text-xs text-gray-400">
                      {isCa
                        ? 'S\'obrirà WhatsApp amb el missatge preparat.'
                        : 'Se abrirá WhatsApp con el mensaje preparado.'}
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* SUB-MODAL: POLÍTICA DE PRIVACIDAD (dentro de WhatsAppModal) */}
      {/* ============================================ */}
      <AnimatePresence>
        {open && privacidadOpen && (
          <motion.div
            className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setPrivacidadOpen(false)}
          >
            <motion.div
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-8"
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* ✅ Barra superior DORADO UNIFICADO */}
              <div className="h-1.5 bg-[#d7bd77]" />

              <button
                onClick={() => setPrivacidadOpen(false)}
                aria-label="Cerrar"
                className="absolute top-4 right-4 z-10 flex items-center justify-center size-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="px-6 sm:px-8 py-7 max-h-[70vh] overflow-y-auto">

                <div className="mb-6 pr-10">
                  {/* ✅ Dorado unificado */}
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#d7bd77] font-semibold mb-2">
                    {isCa ? 'Informació legal' : 'Información legal'}
                  </p>
                  <h2 className="font-bold text-2xl sm:text-3xl text-[#0a1a3a] leading-tight">
                    {isCa ? 'Política de ' : 'Política de '}
                    {/* ✅ Dorado unificado */}
                    <span className="text-[#d7bd77]">
                      {isCa ? 'privacitat' : 'privacidad'}
                    </span>
                  </h2>
                </div>

                <div className="space-y-6 text-sm text-gray-700 leading-relaxed">

                  <section>
                    <h3 className="font-bold text-[#0a1a3a] mb-2">
                      1. {isCa ? 'Responsable del tractament' : 'Responsable del tratamiento'}
                    </h3>
                    <p className="mb-1"><strong>Renovactiva SL</strong></p>
                    <p className="mb-1">
                      Email:{' '}
                      {/* ✅ Dorado unificado */}
                      <a href="mailto:info@renovactiva.com" className="text-[#d7bd77] hover:underline">
                        info@renovactiva.com
                      </a>
                    </p>
                    <p>
                      {isCa ? 'Telèfon' : 'Teléfono'}:{' '}
                      <a href="tel:+34722454020" className="text-[#d7bd77] hover:underline">
                        +34 722 454 020
                      </a>
                    </p>
                  </section>

                  <section>
                    <h3 className="font-bold text-[#0a1a3a] mb-2">
                      2. {isCa ? 'Finalitat del tractament' : 'Finalidad del tratamiento'}
                    </h3>
                    <p>
                      {isCa
                        ? 'Les dades personals que ens facilita seran utilitzades per contactar-lo i atendre la seva sol·licitud d\'informació.'
                        : 'Los datos personales que nos facilita serán utilizados para contactarle y atender su solicitud de información.'}
                    </p>
                  </section>

                  <section>
                    <h3 className="font-bold text-[#0a1a3a] mb-2">
                      3. {isCa ? 'Legitimació' : 'Legitimación'}
                    </h3>
                    <p>
                      {isCa
                        ? 'La base legal és el seu consentiment explícit.'
                        : 'La base legal es su consentimiento explícito.'}
                    </p>
                  </section>

                  <section>
                    <h3 className="font-bold text-[#0a1a3a] mb-2">
                      4. {isCa ? 'Conservació' : 'Conservación'}
                    </h3>
                    <p>
                      {isCa
                        ? 'Les dades es conservaran durant el temps necessari per atendre la sol·licitud.'
                        : 'Los datos se conservarán durante el tiempo necesario para atender la solicitud.'}
                    </p>
                  </section>

                  <section>
                    <h3 className="font-bold text-[#0a1a3a] mb-2">
                      5. {isCa ? 'Drets' : 'Derechos'}
                    </h3>
                    <p>
                      {isCa ? 'Pot exercir els seus drets enviant un correu a ' : 'Puede ejercer sus derechos enviando un email a '}
                      <a href="mailto:info@renovactiva.com" className="text-[#d7bd77] hover:underline">
                        info@renovactiva.com
                      </a>.
                    </p>
                  </section>

                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  {/* ✅ Botón verde WhatsApp — NO TOCAR */}
                  <button
                    type="button"
                    onClick={aceptarPrivacidad}
                    className="w-full inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1faa53] text-white px-6 py-4 rounded-xl font-bold uppercase tracking-[0.15em] text-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
                  >
                    {isCa ? 'Acceptar i continuar' : 'Aceptar y continuar'}
                    <span className="text-lg">→</span>
                  </button>
                  <p className="mt-3 text-center text-xs text-gray-400">
                    {isCa
                      ? 'En acceptar, es marcarà automàticament la casella.'
                      : 'Al aceptar, se marcará automáticamente la casilla.'}
                  </p>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}