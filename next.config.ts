import type { NextConfig } from "next";

export default {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },
  reactStrictMode: true,
  // Configuración PWA
  // Nota: next-pwa v5 funciona con Next 14/15. Usa runtimeCaching por defecto.
  images: { domains: [] },
  // @ts-ignore - next-pwa importado dinámicamente para evitar problemas en desarrollo
  ...((phase => {
    // cargamos next-pwa sólo en build
    const isProd = process.env.NODE_ENV === 'production'
    if (!isProd) return {}
    const withPWA = require('next-pwa')({
      dest: 'public',
      disable: !isProd,
      register: true,
      skipWaiting: true,
      fallbacks: {
        document: '/offline.html'
      }
    })
    return withPWA({})
  })())
}

export default nextConfig;
