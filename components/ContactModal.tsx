'use client'

import { useEffect, useState } from 'react'
import { X, User, Phone, Mail, MessageSquare, CheckCircle2, ShieldCheck, Clock, Lock, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type ContactLang = 'es' | 'ca'

type ContactModalProps = {
  open: boolean
  onClose: () => void
  lang?: ContactLang
  prefill?: {
    nombre?: string
    telefono?: string
    email?: string
    mensaje?: string
  }
}

export function ContactModal({ open, onClose, lang = 'es', prefill }: ContactModalProps) {
  const isCa = lang === 'ca'
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [acepto, setAcepto] = useState(false)
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
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
        if (privacidadOpen) {
          setPrivacidadOpen(false)
        } else if (!enviando) {
          onClose()
        }
      }
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose, enviando, privacidadOpen])

  useEffect(() => {
    if (open) {
      if (prefill?.nombre) setNombre(prefill.nombre)
      if (prefill?.telefono) setTelefono(prefill.telefono)
      if (prefill?.email) setEmail(prefill.email)
      if (prefill?.mensaje) setMensaje(prefill.mensaje)
    }
  }, [open, prefill])

  useEffect(() => {
    if (!open) {
      setError('')
      setEnviado(false)
      setEnviando(false)
      setPrivacidadOpen(false)
    }
  }, [open])

  function validar(): boolean {
    if (!nombre.trim()) {
      setError(isCa ? 'Escriu el teu nom' : 'Escribe tu nombre')
      return false
    }
    if (!telefono.trim()) {
      setError(isCa ? 'Escriu el teu telèfon' : 'Escribe tu teléfono')
      return false
    }
    if (!mensaje.trim()) {
      setError(isCa ? 'Escriu el teu missatge' : 'Escribe tu mensaje')
      return false
    }
    if (!acepto) {
      setError(isCa ? 'Has d\'acceptar la política de privacitat' : 'Debes aceptar la política de privacidad')
      return false
    }
    setError('')
    return true
  }

  async function enviar() {
    if (!validar()) return

    setEnviando(true)
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          telefono: telefono.trim(),
          email: email.trim(),
          mensaje: mensaje.trim(),
          lang: isCa ? 'ca' : 'es',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || (isCa ? 'No s\'ha pogut enviar. Torna-ho a provar.' : 'No se ha podido enviar. Vuelve a intentarlo.'))
        return
      }

      setEnviado(true)

      setTimeout(() => {
        setNombre('')
        setTelefono('')
        setEmail('')
        setMensaje('')
        setAcepto(false)
        setEnviado(false)
      }, 6000)

    } catch (err) {
      console.error('[CONTACT] Error:', err)
      setError(isCa ? 'Error de connexió. Torna-ho a provar.' : 'Error de conexión. Vuelve a intentarlo.')
    } finally {
      setEnviando(false)
    }
  }

  function aceptarPrivacidad() {
    setAcepto(true)
    setPrivacidadOpen(false)
  }

  return (
    <>
      {/* ============================================ */}
      {/* MODAL PRINCIPAL DEL FORMULARIO */}
      {/* ============================================ */}
      <AnimatePresence>
        {open && !privacidadOpen && (
          <motion.div
            className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => { if (!enviando) onClose() }}
          >
            <motion.div
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden my-8"
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-1.5 bg-gradient-to-r from-[#d7bd77] via-[#e5c989] to-[#d7bd77]" />

              <button
                onClick={() => { if (!enviando) onClose() }}
                aria-label="Cerrar"
                disabled={enviando}
                className="absolute top-4 right-4 z-10 flex items-center justify-center size-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={18} />
              </button>

              <div className="px-6 sm:px-8 py-7">

                <div className="mb-6 pr-10">
                  <h2 className="font-bold text-2xl sm:text-3xl text-[#0a1a3a] leading-tight">
                    {isCa ? 'Demana pressupost' : 'Pídenos presupuesto'}{' '}
                    <span className="text-[#e0a521]">
                      {isCa ? 'GRATIS I SENSE COMPROMÍS' : 'GRATIS Y SIN COMPROMISO'}
                    </span>
                  </h2>
                </div>

                {enviado ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-8 text-center"
                  >
                    <div className="flex justify-center mb-5">
                      <div className="flex items-center justify-center size-20 rounded-full bg-[#10B77F]/15 border-2 border-[#10B77F]">
                        <CheckCircle2 className="size-10 text-[#10B77F]" />
                      </div>
                    </div>
                    <h3 className="font-bold text-2xl text-[#0a1a3a] mb-3">
                      {isCa ? 'Gràcies!' : '¡Gracias!'}
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
                      {isCa
                        ? 'Hem rebut la teva sol·licitud. Ens posarem en contacte amb tu el més aviat possible.'
                        : 'Hemos recibido tu solicitud. Nos pondremos en contacto contigo lo antes posible.'}
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
                          disabled={enviando}
                          placeholder={isCa ? 'Nom' : 'Nombre'}
                          className="w-full rounded-lg border border-gray-300 pl-11 pr-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-[#e0a521] focus:ring-2 focus:ring-[#e0a521]/20 outline-none transition disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-medium text-[#0a1a3a] mb-2">
                        {isCa ? 'Telèfon' : 'Teléfono'}
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input
                          type="tel"
                          value={telefono}
                          onChange={(e) => setTelefono(e.target.value)}
                          disabled={enviando}
                          placeholder={isCa ? 'Telèfon' : 'Teléfono'}
                          className="w-full rounded-lg border border-gray-300 pl-11 pr-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-[#e0a521] focus:ring-2 focus:ring-[#e0a521]/20 outline-none transition disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-medium text-[#0a1a3a] mb-2">
                        Email (opcional)
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={enviando}
                          placeholder="Email"
                          className="w-full rounded-lg border border-gray-300 pl-11 pr-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-[#e0a521] focus:ring-2 focus:ring-[#e0a521]/20 outline-none transition disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="block text-sm font-medium text-[#0a1a3a] mb-2">
                        {isCa ? 'Escriu aquí el teu missatge' : 'Escribe aquí tu mensaje'}
                      </label>
                      <div className="relative">
                        <MessageSquare className="absolute left-3.5 top-3.5 size-4 text-gray-400" />
                        <textarea
                          value={mensaje}
                          onChange={(e) => setMensaje(e.target.value)}
                          disabled={enviando}
                          rows={5}
                          placeholder={isCa ? 'Escriu aquí el teu missatge' : 'Escribe aquí tu mensaje'}
                          className="w-full rounded-lg border border-gray-300 pl-11 pr-4 py-3 text-gray-800 placeholder:text-gray-400 focus:border-[#e0a521] focus:ring-2 focus:ring-[#e0a521]/20 outline-none transition resize-y disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {/* Política de privacidad - abre MODAL interno */}
                    <label className="flex items-start gap-3 mb-5 p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <input
                        type="checkbox"
                        checked={acepto}
                        onChange={(e) => setAcepto(e.target.checked)}
                        disabled={enviando}
                        className="mt-0.5 size-4 accent-[#e0a521] cursor-pointer flex-shrink-0"
                      />
                      <span className="text-sm text-gray-700">
                        {isCa ? 'He llegit i accepto la ' : 'He leído y acepto la '}
                        <button
                          type="button"
                          onClick={() => setPrivacidadOpen(true)}
                          className="font-semibold text-[#0a1a3a] hover:text-[#e0a521] underline cursor-pointer"
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

                    <button
                      type="button"
                      onClick={enviar}
                      disabled={enviando}
                      className="group relative w-full inline-flex items-center justify-center gap-3 bg-[#e0a521] hover:bg-[#c8901a] text-white px-6 py-4 rounded-xl font-bold uppercase tracking-[0.15em] text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.01] hover:shadow-lg"
                    >
                      {enviando ? (
                        <>
                          <Loader2 className="size-5 animate-spin" />
                          {isCa ? 'Enviant...' : 'Enviando...'}
                        </>
                      ) : (
                        <>
                          {isCa ? 'Enviar' : 'Enviar'}
                          <span className="text-lg">→</span>
                        </>
                      )}
                    </button>

                    <p className="mt-5 text-center text-xs text-gray-400">
                      {isCa
                        ? 'T\'atendrem el més aviat possible.'
                        : 'Te atenderemos lo antes posible.'}
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* SUB-MODAL: POLÍTICA DE PRIVACIDAD */}
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
              {/* Barra dorada superior */}
              <div className="h-1.5 bg-gradient-to-r from-[#d7bd77] via-[#e5c989] to-[#d7bd77]" />

              {/* Botón cerrar */}
              <button
                onClick={() => setPrivacidadOpen(false)}
                aria-label="Cerrar"
                className="absolute top-4 right-4 z-10 flex items-center justify-center size-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>

              {/* Contenido con scroll interno */}
              <div className="px-6 sm:px-8 py-7 max-h-[70vh] overflow-y-auto">

                {/* Título */}
                <div className="mb-6 pr-10">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#e0a521] font-semibold mb-2">
                    {isCa ? 'Informació legal' : 'Información legal'}
                  </p>
                  <h2 className="font-bold text-2xl sm:text-3xl text-[#0a1a3a] leading-tight">
                    {isCa ? 'Política de ' : 'Política de '}
                    <span className="text-[#e0a521]">
                      {isCa ? 'privacitat' : 'privacidad'}
                    </span>
                  </h2>
                </div>

                {/* Contenido */}
                <div className="space-y-6 text-sm text-gray-700 leading-relaxed">

                  <section>
                    <h3 className="font-bold text-[#0a1a3a] mb-2">
                      1. {isCa ? 'Responsable del tractament' : 'Responsable del tratamiento'}
                    </h3>
                    <p className="mb-1"><strong>Renovactiva SL</strong></p>
                    <p className="mb-1">
                      Email:{' '}
                      <a href="mailto:info@renovactiva.com" className="text-[#e0a521] hover:underline">
                        info@renovactiva.com
                      </a>
                    </p>
                    <p>
                      {isCa ? 'Telèfon' : 'Teléfono'}:{' '}
                      <a href="tel:+34722454020" className="text-[#e0a521] hover:underline">
                        +34 722 454 020
                      </a>
                    </p>
                  </section>

                  <section>
                    <h3 className="font-bold text-[#0a1a3a] mb-2">
                      2. {isCa ? 'Finalitat del tractament' : 'Finalidad del tratamiento'}
                    </h3>
                    <p className="mb-2">
                      {isCa
                        ? 'Les dades personals que ens facilita a través del formulari seran utilitzades per a:'
                        : 'Los datos personales que nos facilita a través del formulario serán utilizados para:'}
                    </p>
                    <ul className="space-y-1 pl-4">
                      <li>· {isCa ? 'Atendre la sol·licitud de pressupost' : 'Atender la solicitud de presupuesto'}</li>
                      <li>· {isCa ? 'Contactar-lo per telèfon, correu o WhatsApp' : 'Contactarle por teléfono, email o WhatsApp'}</li>
                      <li>· {isCa ? 'Enviar-li informació del seu projecte' : 'Enviarle información de su proyecto'}</li>
                    </ul>
                  </section>

                  <section>
                    <h3 className="font-bold text-[#0a1a3a] mb-2">
                      3. {isCa ? 'Legitimació' : 'Legitimación'}
                    </h3>
                    <p>
                      {isCa
                        ? 'La base legal és el seu consentiment explícit en marcar la casella del formulari.'
                        : 'La base legal es su consentimiento explícito al marcar la casilla del formulario.'}
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
                      {isCa
                        ? 'Pot exercir els seus drets enviant un correu a '
                        : 'Puede ejercer sus derechos enviando un email a '}
                      <a href="mailto:info@renovactiva.com" className="text-[#e0a521] hover:underline">
                        info@renovactiva.com
                      </a>.
                    </p>
                  </section>

                  <section>
                    <h3 className="font-bold text-[#0a1a3a] mb-2">
                      6. {isCa ? 'Destinataris' : 'Destinatarios'}
                    </h3>
                    <p>
                      {isCa
                        ? 'Les seves dades NO es cediran a tercers, excepte obligació legal.'
                        : 'Sus datos NO se cederán a terceros, salvo obligación legal.'}
                    </p>
                  </section>

                </div>

                {/* Botón Aceptar */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={aceptarPrivacidad}
                    className="w-full inline-flex items-center justify-center gap-3 bg-[#e0a521] hover:bg-[#c8901a] text-white px-6 py-4 rounded-xl font-bold uppercase tracking-[0.15em] text-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-lg"
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