'use client'

import { ServicePage } from '@/components/service-page'

export default function ReformasLocalesOficinasPage() {
  return (
    <ServicePage
      number="02"
      title={{ es: 'Reformas de', ca: 'Reformes de' }}
      accent={{ es: 'locales y oficinas.', ca: 'locals i oficines.' }}
      heading={{
        es: <>Tu negocio,<br /><i>en escena.</i></>,
        ca: <>El teu negoci,<br /><i>en escena.</i></>
      }}
      copy={{
        es: 'Creamos espacios que hablan de tu negocio. Ya sea un local comercial, una oficina o cualquier espacio profesional, tu entorno es mucho más que cuatro paredes: es la primera impresión que reciben tus clientes, el reflejo de tu marca y el escenario donde tu negocio cobra vida. En Renovactiva SL realizamos reformas de locales comerciales y oficinas diseñadas para crear espacios atractivos, funcionales y alineados con la identidad de cada negocio. Analizamos cada proyecto de forma personalizada y nos encargamos de todo el proceso: distribución, albañilería, instalaciones, iluminación, revestimientos, carpintería, pintura y acabados. Un espacio diseñado para hacer crecer tu negocio, combinando estética, comodidad y practicidad.',
        ca: 'Creem espais que parlen del teu negoci. Ja sigui un local comercial, una oficina o qualsevol espai professional, el teu entorn és molt més que quatre parets: és la primera impressió que reben els teus clients, el reflex de la teva marca i l\'escenari on el teu negoci cobra vida. A Renovactiva SL fem reformes de locals comercials i oficines dissenyades per crear espais atractius, funcionals i alineats amb la identitat de cada negoci. Analitzem cada projecte de manera personalitzada i ens encarreguem de tot el procés: distribució, obra, instal·lacions, il·luminació, revestiments, fusteria, pintura i acabats. Un espai pensat per fer créixer el teu negoci, combinant estètica, comoditat i practicitat.'
      }}
      image="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2200&q=90"
    />
  )
}