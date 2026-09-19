'use client'

import { ServicePage } from '@/components/service-page'

export default function ReformasFincasPage() {
  return (
    <ServicePage
      number="04"
      title={{ es: 'Reformas de fincas', ca: 'Reformes de finques' }}
      accent={{ es: 'habla por sí sola.', ca: 'parla per si sola.' }}
      heading={{
        es: <>Devolvemos el alma<br /><i>a los edificios con historia.</i></>,
        ca: <>Retornem l'ànima<br /><i>als edificis amb història.</i></>
      }}
      copy={{
        es: 'La reforma de una finca es mucho más que una actualización: es devolverle a un edificio su esplendor original, respetando su arquitectura, su historia y su carácter, mientras lo adaptamos a las necesidades actuales. Trabajamos con especial cuidado en la rehabilitación de fachadas, la recuperación de elementos originales y la integración de soluciones modernas que garantizan confort, eficiencia y durabilidad.',
        ca: 'La reforma d\'una finca és molt més que una actualització: és retornar a un edifici el seu esplendor original, respectant la seva arquitectura, la seva història i el seu caràcter, mentre l\'adaptem a les necessitats actuals. Treballem amb especial cura en la rehabilitació de façanes, la recuperació d\'elements originals i la integració de solucions modernes que garanteixen confort, eficiència i durabilitat.'
      }}
      image="https://izvllvunpjryeowponti.supabase.co/storage/v1/object/public/renovactiva-images/services/04/1789254347730-captura-de-pantalla-2026-09-12-225158.png"
    />
  )
}