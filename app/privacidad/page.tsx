'use client'

import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLanguage } from '@/components/language-provider'
import { LanguageSwitcher } from '@/components/language-switcher'

export default function PrivacidadPage() {
  const { language } = useLanguage()
  const ca = language === 'ca'

  return (
    <main className="min-h-screen bg-[#080808] text-[#f3f0e9]">

      {/* HEADER igual que la web */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1380px] items-center justify-between px-4 py-4 lg:px-10 lg:py-5">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/logo.png" alt="Renovactiva" className="h-8 w-auto lg:h-10" />
            <span className="font-serif text-base tracking-[0.28em] text-[#d7bd77] lg:text-xl whitespace-nowrap">
              Renovactiva<span className="text-white/40"> SL</span>
            </span>
          </Link>

          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
            <LanguageSwitcher />
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 border border-[#d7bd77]/60 px-3 py-1.5 lg:px-4 lg:py-2 text-[9px] lg:text-[10px] uppercase tracking-[0.2em] text-[#d7bd77] transition-colors hover:bg-[#d7bd77] hover:text-[#000000] rounded"
            >
              <Shield className="size-3" />
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <div className="mx-auto max-w-3xl px-6 lg:px-10 py-16 lg:py-20">

        {/* Volver */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
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
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <p className="eyebrow">
            {ca ? 'Informació legal' : 'Información legal'}
          </p>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-[-0.02em]">
            {ca ? 'Política de' : 'Política de'}{' '}
            <i className="text-[#10B77F]">
              {ca ? 'privacitat.' : 'privacidad.'}
            </i>
          </h1>
        </motion.div>

        {/* Separador dorado */}
        <motion.div
          className="h-px w-24 bg-[#d7bd77] mb-12"
          initial={{ width: 0 }}
          animate={{ width: 96 }}
          transition={{ duration: 1, delay: 0.3 }}
        />

        {/* Contenido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-10 text-white/75 leading-relaxed text-[15px]"
        >

          <section>
            <h2 className="font-serif text-2xl text-[#d7bd77] mb-4">
              1. {ca ? 'Responsable del tractament' : 'Responsable del tratamiento'}
            </h2>
            <p className="mb-2">
              <strong className="text-white/95">Renovactiva SL</strong>
            </p>
            <p className="mb-2">
              <span className="text-[#d7bd77]">Email:</span>{' '}
              <a
                href="mailto:info@renovactiva.com"
                className="text-[#10B77F] hover:text-[#d7bd77] transition-colors underline-offset-4 hover:underline"
              >
                info@renovactiva.com
              </a>
            </p>
            <p>
              <span className="text-[#d7bd77]">{ca ? 'Telèfon' : 'Teléfono'}:</span>{' '}
              <a
                href="tel:+34722454020"
                className="text-[#10B77F] hover:text-[#d7bd77] transition-colors underline-offset-4 hover:underline"
              >
                +34 722 454 020
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#d7bd77] mb-4">
              2. {ca ? 'Finalitat del tractament' : 'Finalidad del tratamiento'}
            </h2>
            <p className="mb-3">
              {ca
                ? 'Les dades personals que ens facilita a través del formulari de contacte de la nostra web seran utilitzades per a:'
                : 'Los datos personales que nos facilita a través del formulario de contacto de nuestra web serán utilizados para:'}
            </p>
            <ul className="space-y-2 pl-5">
              <li className="flex gap-3">
                <span className="text-[#10B77F] flex-shrink-0">·</span>
                <span>
                  {ca
                    ? 'Atendre la seva sol·licitud de pressupost'
                    : 'Atender su solicitud de presupuesto'}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#10B77F] flex-shrink-0">·</span>
                <span>
                  {ca
                    ? 'Contactar-lo per telèfon, correu electrònic o WhatsApp'
                    : 'Contactarle por teléfono, email o WhatsApp'}
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#10B77F] flex-shrink-0">·</span>
                <span>
                  {ca
                    ? 'Enviar-li informació relacionada amb el seu projecte de reforma'
                    : 'Enviarle información relacionada con su proyecto de reforma'}
                </span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#d7bd77] mb-4">
              3. {ca ? 'Legitimació' : 'Legitimación'}
            </h2>
            <p>
              {ca
                ? 'La base legal per al tractament de les seves dades és el seu consentiment explícit (en marcar la casella del formulari) i l\'interès legítim a respondre la seva sol·licitud.'
                : 'La base legal para el tratamiento de sus datos es su consentimiento explícito (al marcar la casilla del formulario) y el interés legítimo en responder a su solicitud.'}
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#d7bd77] mb-4">
              4. {ca ? 'Conservació de les dades' : 'Conservación de los datos'}
            </h2>
            <p>
              {ca
                ? 'Les seves dades es conservaran durant el temps necessari per atendre la seva sol·licitud i, posteriorment, durant el termini legalment establert.'
                : 'Sus datos se conservarán durante el tiempo necesario para atender su solicitud y, posteriormente, durante el plazo legalmente establecido.'}
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#d7bd77] mb-4">
              5. {ca ? 'Drets' : 'Derechos'}
            </h2>
            <p>
              {ca
                ? 'Pot exercir els seus drets d\'accés, rectificació, supressió, oposició, limitació i portabilitat enviant un correu electrònic a '
                : 'Puede ejercer sus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad enviando un email a '}
              <a
                href="mailto:info@renovactiva.com"
                className="text-[#10B77F] hover:text-[#d7bd77] transition-colors underline-offset-4 hover:underline"
              >
                info@renovactiva.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl text-[#d7bd77] mb-4">
              6. {ca ? 'Destinataris' : 'Destinatarios'}
            </h2>
            <p>
              {ca
                ? 'Les seves dades NO es cediran a tercers, excepte obligació legal.'
                : 'Sus datos NO se cederán a terceros, salvo obligación legal.'}
            </p>
          </section>

        </motion.div>

        {/* Botón volver abajo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 pt-10 border-t border-white/10"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-3 bg-[#d7bd77] hover:bg-[#10B77F] text-[#141310] px-6 py-3 rounded-lg transition-colors text-[11px] uppercase tracking-[0.2em] font-medium"
          >
            <ArrowLeft className="size-4" />
            {ca ? 'Tornar a l\'inici' : 'Volver al inicio'}
          </Link>
        </motion.div>

      </div>
    </main>
  )
}