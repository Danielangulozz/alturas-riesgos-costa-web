import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    // Usamos la misma URL base que ya tienes
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://alturasyriesgos.vercel.app";

    return [
        {
            url: `${baseUrl}/`, // Tu página de inicio
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1, // 1 es la máxima prioridad
        },
        {
            url: `${baseUrl}/cursos`, // Ejemplo: si tienes una página de cursos
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/contacto`, // Ejemplo: si tienes una página de contacto
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        // Puedes ir agregando más bloques de estos por cada página que quieras que Google vea
    ];
}