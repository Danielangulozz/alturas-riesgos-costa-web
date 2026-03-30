import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js necesita 'unsafe-inline' para sus scripts
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              // Estilos inline necesarios para Tailwind y animaciones
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              // Imágenes: self, data URIs y cualquier HTTPS (Supabase Storage, etc.)
              "img-src 'self' data: blob: https:",
              // Conexiones a Supabase y Resend
              "connect-src 'self' https://*.supabase.co https://api.resend.com",
              // Mapas de Google si se usa iframe
              "frame-src 'self' https://www.google.com",
              // WhatsApp y links externos abiertos por JS
              "form-action 'self'",
              "base-uri 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

