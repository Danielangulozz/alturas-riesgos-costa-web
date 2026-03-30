import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alturasyriesgos.vercel.app";

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Bloquear rutas privadas al crawling
        disallow: ['/admin/', '/api/', '/datos'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
