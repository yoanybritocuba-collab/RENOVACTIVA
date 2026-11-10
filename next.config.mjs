/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  // ✅ NUEVO: Genera un ID único en cada despliegue para romper la caché de los clientes
  generateBuildId: async () => {
    return new Date().getTime().toString();
  },

  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        // ✅ NUEVO: Obliga al navegador a revalidar el HTML (que es el que lleva el ID de versión)
        { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
      ],
    }]
  },
  async redirects() {
    return [
      // ✅ Redirige la URL antigua de locales a la nueva unificada
      {
        source: '/reformas-locales-comerciales',
        destination: '/reformas-locales-oficinas',
        permanent: true, // 308: permanente (mejor para SEO)
      },
      // ✅ Redirige la URL antigua de oficinas a la nueva unificada
      {
        source: '/reformas-oficinas',
        destination: '/reformas-locales-oficinas',
        permanent: true, // 308: permanente (mejor para SEO)
      },
    ]
  },
}

export default nextConfig