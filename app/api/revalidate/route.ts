import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    revalidatePath('/', 'page')
    revalidatePath('/reformas-viviendas', 'page')
    revalidatePath('/reformas-oficinas', 'page')
    revalidatePath('/reformas-locales-comerciales', 'page')
    
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