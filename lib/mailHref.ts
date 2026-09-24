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
// PLANTILLAS DE CORREO (para los botones de la web)
// ============================================================
export const EMAIL = 'info@renovactiva.com'

// --- Botón "Solicitar presupuesto" (banda dorada) ---
export function getPresupuestoMailHref(): string {
  const subject = 'Solicitud de presupuesto — Renovactiva'
  const body = `Hola equipo Renovactiva,

Me gustaría solicitar un presupuesto para mi proyecto.

· Nombre:
· Teléfono:
· Tipo de reforma:
· Zona:
· Descripción breve:

Gracias.`
  return getMailHref(EMAIL, subject, body)
}

// --- Enlace "Escríbenos a info@" (sección reseña) ---
export function getResenaMailHref(): string {
  const subject = 'Consulta sobre código de reseña — Renovactiva'
  const body = `Hola equipo Renovactiva,

Me gustaría recibir un código de cliente para dejar mi reseña.

· Nombre:
· Teléfono:
· Proyecto realizado con vosotros:

Gracias.`
  return getMailHref(EMAIL, subject, body)
}

// --- Correo del footer ---
export function getFooterMailHref(): string {
  const subject = 'Consulta — Renovactiva'
  const body = `Hola equipo Renovactiva,

Me gustaría haceros una consulta.

· Nombre:
· Teléfono:
· Mensaje:

Gracias.`
  return getMailHref(EMAIL, subject, body)
}