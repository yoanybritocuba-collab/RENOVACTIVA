import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // ESTA ES LA MAGIA: Limpia el Layout (Footer, Navbar, etc.) en TODAS las páginas
    revalidatePath('/', 'layout')

    // Limpiamos también las páginas públicas específicas
    revalidatePath('/', 'page')
    revalidatePath('/reformas-viviendas', 'page')
    revalidatePath('/reformas-locales-oficinas', 'page')
    revalidatePath('/reformas-fincas', 'page')
    revalidatePath('/servicios', 'page')

    // Limpiamos las páginas del admin (para que al guardar veas los datos frescos)
    revalidatePath('/admin', 'page')
    revalidatePath('/admin/hero', 'page')
    revalidatePath('/admin/services', 'page')
    revalidatePath('/admin/projects', 'page')
    revalidatePath('/admin/trabajos', 'page')
    revalidatePath('/admin/testimonials', 'page')
    revalidatePath('/admin/contact', 'page')
    revalidatePath('/admin/footer', 'page')

    return NextResponse.json({
      revalidated: true,
      now: Date.now()
    })
  } catch (err) {
    return NextResponse.json({
      revalidated: false,
      error: String(err)
    }, { status: 500 })
  }
}