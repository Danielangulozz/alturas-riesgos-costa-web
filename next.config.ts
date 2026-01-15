import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block' // Evita inyección de scripts básicos
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN' // Evita que otros sitios pongan tu web en un iframe
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff' // Evita que el navegador adivine tipos de archivo
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig

export default nextConfig;
