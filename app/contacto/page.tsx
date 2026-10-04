'use client'

import Link from 'next/link'
import { ArrowLeft, Phone, MessageCircle, Mail, MapPin, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useLanguage } from '@/components/language-provider'
import { TopNav } from '@/components/TopNav'
import { ContactModal } from '@/components/ContactModal'
import { WhatsAppModal } from '@/components/WhatsAppModal'

const WHATSAPP_NUMBER = '34722454020'
const PHONE_NUMBER = '+34 722 454 020'
const EMAIL = 'info@renovactiva.com'

export default function ContactoPage() {
  const { language } = useLanguage()
  const ca = language === 'ca'

  // ✅ Estados para los modales (igual que la home)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false)

  const telHref = `tel:+${WHATSAPP_NUMBER}`

  return (
    <main className="min-h-screen bg-[#080808] text-[#f3f0e9]">
      <TopNav
        variant="dark"
        onOpenContactModal={() => setContactModalOpen(true)}
      />

      <section className="relative overflow-hidden pt-32 lg:pt-40 pb-20 lg:pb-28 px-6 lg:px-10">
        {/* Halos decorativos */}
        <motion.div
          className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[#10B77F]/10 blur-3xl"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-[#d7bd77]/10 blur-3xl"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        />

        <div className="relative mx-auto max-w-[1100px]">
          {/* Volver */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Link
              href="/"
              className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-[#d7bd77] hover:text-[#10B77F] transition-colors mb-10"
            >
              <ArrowLeft className="size-4" />
              {ca ? 'Tornar a l\'inici' : 'Volver al inicio'}
            </Link>
          </motion.div>

          {/* Título */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-center mb-16"
          >
            <p className="eyebrow">
              {ca ? 'Parlem del teu projecte' : 'Hablemos de tu proyecto'}
            </p>
            <h1
              className="mt-4 font-serif text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-[-0.03em]"
              style={{ textTransform: 'uppercase' }}
            >
              <span className="text-white">Contacta</span>
              <br />
              <i className="text-[#10B77F]">{ca ? 'amb nosaltres.' : 'con nosotros.'}</i>
            </h1>
            <p className="mt-8 max-w-xl mx-auto text-white/60 leading-relaxed text-base">
              {ca
                ? 'Estem a la teva disposició. Tria el canal que prefereixis i et responem el més aviat possible.'
                : 'Estamos a tu disposición. Elige el canal que prefieras y te respondemos lo antes posible.'}
            </p>
          </motion.div>

          {/* Botones de contacto */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid gap-5 md:grid-cols-3 mb-16"
          >
            {/* 📞 TELÉFONO — Llama directo */}
            <a
              href={telHref}
              className="group relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-[#10B77F]/30 bg-[#0A0A0A] p-8 transition-all duration-500 hover:border-[#10B77F] hover:shadow-[0_0_60px_10px_rgba(16,183,127,0.4)] hover:-translate-y-1"
            >
              <div className="flex items-center justify-center size-16 rounded-full bg-[#10B77F]/10 border border-[#10B77F]/40 transition-all duration-500 group-hover:bg-[#10B77F]/20 group-hover:scale-110">
                <Phone className="size-7 text-[#10B77F]" />
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#d7bd77] mb-2">
                  {ca ? 'Truca\'ns' : 'Llámanos'}
                </p>
                <p className="font-serif text-lg text-white group-hover:text-[#10B77F] transition-colors">
                  {PHONE_NUMBER}
                </p>
              </div>
              <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.2em] text-white/20 group-hover:text-[#10B77F]/60 transition-colors">
                01
              </span>
            </a>

            {/* 💬 WHATSAPP — Abre el modal */}
            <button
              type="button"
              onClick={() => setWhatsAppModalOpen(true)}
              className="group relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-[#25D366]/30 bg-[#0A0A0A] p-8 transition-all duration-500 hover:border-[#25D366] hover:shadow-[0_0_60px_10px_rgba(37,211,102,0.4)] hover:-translate-y-1 cursor-pointer w-full"
            >
              <div className="flex items-center justify-center size-16 rounded-full bg-[#25D366]/10 border border-[#25D366]/40 transition-all duration-500 group-hover:bg-[#25D366]/20 group-hover:scale-110">
                <MessageCircle className="size-7 text-[#25D366]" />
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#d7bd77] mb-2">
                  WhatsApp
                </p>
                <p className="font-serif text-lg text-white group-hover:text-[#25D366] transition-colors">
                  {PHONE_NUMBER}
                </p>
              </div>
              <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.2em] text-white/20 group-hover:text-[#25D366]/60 transition-colors">
                02
              </span>
            </button>

            {/* 📧 CORREO — Abre el modal */}
            <button
              type="button"
              onClick={() => setContactModalOpen(true)}
              className="group relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-[#d7bd77]/30 bg-[#0A0A0A] p-8 transition-all duration-500 hover:border-[#d7bd77] hover:shadow-[0_0_60px_10px_rgba(215,189,119,0.4)] hover:-translate-y-1 cursor-pointer w-full"
            >
              <div className="flex items-center justify-center size-16 rounded-full bg-[#d7bd77]/10 border border-[#d7bd77]/40 transition-all duration-500 group-hover:bg-[#d7bd77]/20 group-hover:scale-110">
                <Mail className="size-7 text-[#d7bd77]" />
              </div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#d7bd77] mb-2">
                  {ca ? 'Correu' : 'Correo'}
                </p>
                <p className="font-serif text-base text-white group-hover:text-[#d7bd77] transition-colors break-all">
                  {EMAIL}
                </p>
              </div>
              <span className="absolute top-4 right-4 text-[10px] uppercase tracking-[0.2em] text-white/20 group-hover:text-[#d7bd77]/60 transition-colors">
                03
              </span>
            </button>
          </motion.div>

          {/* Info adicional */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="grid gap-5 md:grid-cols-2 max-w-3xl mx-auto"
          >
            <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[.02] p-6">
              <div className="flex-shrink-0 flex items-center justify-center size-10 rounded-full bg-[#10B77F]/10 border border-[#10B77F]/30">
                <MapPin className="size-4 text-[#10B77F]" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#d7bd77] mb-2">
                  {ca ? 'On som' : 'Dónde estamos'}
                </p>
                <p className="text-sm text-white/75 leading-relaxed">
                  Carrer Exemple 123<br />
                  08001 Barcelona
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[.02] p-6">
              <div className="flex-shrink-0 flex items-center justify-center size-10 rounded-full bg-[#10B77F]/10 border border-[#10B77F]/30">
                <Clock className="size-4 text-[#10B77F]" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#d7bd77] mb-2">
                  {ca ? 'Horari' : 'Horario'}
                </p>
                <p className="text-sm text-white/75 leading-relaxed">
                  {ca ? 'De dilluns a divendres' : 'Lunes a Viernes'}<br />
                  9:00 — 18:00
                </p>
              </div>
            </div>
          </motion.div>

          {/* Nota final */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-12 text-center text-xs text-white/40 max-w-md mx-auto leading-relaxed"
          >
            {ca
              ? 'Els nostres missatges de WhatsApp i correu ja surten amb un text preparat. Només has de completar les teves dades i enviar.'
              : 'Nuestros mensajes de WhatsApp y correo ya salen con un texto preparado. Solo tienes que completar tus datos y enviar.'}
          </motion.p>
        </div>
      </section>

      {/* ✅ MODALES (mismos que la home, se renderizan encima) */}
      <ContactModal
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        lang={ca ? 'ca' : 'es'}
      />
      <WhatsAppModal
        open={whatsAppModalOpen}
        onClose={() => setWhatsAppModalOpen(false)}
        lang={ca ? 'ca' : 'es'}
      />
    </main>
  )
}