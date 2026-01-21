import "./globals.css";
import type { Metadata, Viewport } from "next";
import LayoutWrapper from "@/components/LayoutWrapper";
import Script from "next/script"; // Importante para JSON-LD

// 1. DEFINE TU URL BASE (Vital para que Next.js no de errores)
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://alturas-riesgos-costa-web.vercel.app/"; 

export const viewport: Viewport = {
  themeColor: "#1e293b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  
  // TÍTULO OPTIMIZADO
  title: {
    default: "Alturas y Riesgos de la Costa | Certificación de Alturas en Sincelejo",
    template: "%s | Alturas y Riesgos de la Costa S.A.S"
  },
  
  // DESCRIPCIÓN CON LLAMADO A LA ACCIÓN (CTR)
  description:
    "Centro de entrenamiento líder en Sincelej y Sucre. Cursos certificados de trabajo seguro en alturas, espacios confinados y rescate industrial (Res. 4272). ¡Valida tu certificado en línea!",
  
  // PALABRAS CLAVE (Aunque Google las mira poco, otros buscadores sí)
  keywords: [
    "curso de alturas sincelejo", 
    "certificación alturas sucre", 
    "renovación curso alturas", 
    "coordinador de alturas", 
    "espacios confinados sincelejo",
    "centro de entrenamiento sincelejo",
    "alturas y riesgos de la costa"
  ],

  // AUTOR Y CREADOR
  authors: [{ name: "Alturas y Riesgos de la Costa S.A.S", url: BASE_URL }],
  creator: "Alturas y Riesgos de la Costa S.A.S",
  publisher: "Alturas y Riesgos de la Costa S.A.S",

  // ROBOTS (Indispensable)
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // OPEN GRAPH (Cómo se ve en Facebook, WhatsApp, LinkedIn)
  openGraph: {
    type: "website",
    locale: "es_CO",
    url: BASE_URL,
    title: "Certifícate en Alturas en Sincelejo - Avalado por MinTrabajo",
    description: "Cursos de alturas, reentrenamiento y coordinadores en Sincelejo. Certificados verificables en línea al instante.",
    siteName: "Alturas y Riesgos de la Costa",
    images: [
      {
        url: "/og-image.jpg", // ¡Crea esta imagen y ponla en public!
        width: 1200,
        height: 630,
        alt: "Centro de Entrenamiento Alturas y Riesgos de la Costa",
      },
    ],
  },

  // TWITTER CARDS
  twitter: {
    card: "summary_large_image",
    title: "Cursos de Alturas Certificados en Sincelejo",
    description: "Cumple con la Resolución 4272. Entrénate con los expertos en Sucre.",
    images: ["/og-image.jpg"],
  },

  // ICONOS
  icons: {
    icon: [
      { url: "/logo-blanco.webp", media: "(prefers-color-scheme: light)" },
      { url: "/logo-negro.webp", media: "(prefers-color-scheme: dark)" },
    ],
    shortcut: "/logo-blanco.webp",
    apple: "/logo-blanco.webp",
  },

  // GEO-TAGS (Súper importante para SEO Local)
  other: {
    "geo.region": "CO-SU", // Colombia - Sucre
    "geo.placename": "Sincelejo",
    // Si tienes coordenadas exactas, ponlas aquí:
    // "geo.position": "9.3047;-75.3978", 
    // "ICBM": "9.3047, -75.3978"
  },
  
  // CANONICAL (Evita contenido duplicado)
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  // DATOS ESTRUCTURADOS (JSON-LD)
  // Esto es lo que Google ama para mostrarte en mapas y búsquedas locales
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Alturas y Riesgos de la Costa S.A.S",
    "image": `${BASE_URL}/logo-blanco.webp`,
    "description": "Centro de entrenamiento certificado para trabajo seguro en alturas en Sincelejo, Sucre.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Cra 17 #27-35 Calle Nariño", 
      "addressLocality": "Sincelejo",
      "addressRegion": "Sucre",
      "postalCode": "700001",
      "addressCountry": "CO"
    },
    "url": BASE_URL,
    "telephone": "+573148475070", // Pon tu teléfono real
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        "opens": "07:00",
        "closes": "17:00"
      }
    ],
    "sameAs": [
      "https://www.facebook.com/alturasyriesgos",
      "https://www.instagram.com/alturasyriesgos/"
    ]
  };

  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col antialiased bg-slate-50">
        
        {/* INYECCIÓN DE JSON-LD PARA GOOGLE */}
        <Script
          id="schema-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}