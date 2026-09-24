// ============================================================
// HELPER: Genera el mejor enlace de correo según dispositivo
// - Móvil: mailto: → abre la app de correo por defecto (Gmail app)
// - PC: Gmail web directo a "Redactar"
// ============================================================
export function getMailHref(email: string, subject: string, body: string): string {
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
// CONFIGURACIÓN
// ============================================================
export const EMAIL = 'info@renovactiva.com'

// ============================================================
// PLANTILLA 1: Botón "Solicitar presupuesto" (banda dorada)
// El cursor caerá justo después de "Mi nombre es: "
// ============================================================
export function getPresupuestoMailHref(): string {
  const subject = 'Solicitud de presupuesto — Renovactiva'
  const body = `Mi nombre es: 

Hola equipo Renovactiva,

Me gustaría solicitar un presupuesto para un proyecto de reforma.

Quedo a la espera de su respuesta para agendar una visita técnica sin compromiso.

Muchas gracias por su atención.`
  return getMailHref(EMAIL, subject, body)
}

// ============================================================
// PLANTILLA 2: Correo del footer
// El cursor caerá justo después de "Mi nombre es: "
// ============================================================
export function getFooterMailHref(): string {
  const subject = 'Consulta — Renovactiva'
  const body = `Mi nombre es: 

Hola equipo Renovactiva,

Me gustaría hacerles una consulta.

Quedo a la espera de su respuesta.

Muchas gracias por su atención.`
  return getMailHref(EMAIL, subject, body)
}