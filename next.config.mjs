/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
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