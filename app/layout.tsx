import "./globals.css";
import type { Metadata, Viewport } from "next";
import LayoutWrapper from "@/components/LayoutWrapper";
import Script from "next/script";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://alturasyriesgos.vercel.app";

export const viewport: Viewport = {
  themeColor: "#1e293b",
  width: "device-width",
  initialScale: 1,
  // maximumScale eliminado: bloquea el zoom para usuarios con baja visión
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),


  verification: {

    google: "3uB2wsfVjDE6Yj0AqUTUmzX-r6YFe8FKytmvs1Azp18",
  },
  title: {
    default: "Alturas y Riesgos de la Costa",
    template: "%s | Alturas y Riesgos de la Costa"
  },

  // CARNADA AÑADIDA AQUÍ (Esto lo lee el buscador)
  description:
    "Centro de entrenamiento líder en Sincelejo. Cursos certificados de alturas, espacios confinados y nivel coordinador (Res. 4272). ¡Pregunta por nuestras promociones y combos para empresas!",

  keywords: [
    "curso de alturas sincelejo",
    "certificación alturas sucre",
    "renovación curso alturas",
    "coordinador de alturas",
    "espacios confinados sincelejo",
    "centro de entrenamiento alturas",
    "promociones curso de alturas"
  ],

  authors: [{ name: "Alturas y Riesgos de la Costa S.A.S", url: BASE_URL }],
  creator: "Alturas y Riesgos de la Costa S.A.S",
  publisher: "Alturas y Riesgos de la Costa S.A.S",

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

  openGraph: {
    type: "website",
    locale: "es_CO",
    url: BASE_URL,
    title: "Cursos de Alturas Certificados en Sincelejo",
    description: "Cursos de alturas, espacios confinados y coordinadores en Sincelejo. Certificados verificables en línea. ¡Consulta promociones!",
    siteName: "Alturas y Riesgos de la Costa",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Entrenamiento Alturas y Riesgos de la Costa en Sincelejo",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Cursos de Alturas Certificados en Sincelejo",
    description: "Cumple con la Resolución 4272. Entrénate con los expertos en Sucre.",
    images: ["/og-image.jpg"],
  },

  icons: {
    icon: [
      { url: "/logo-blanco.webp", media: "(prefers-color-scheme: light)" },
      { url: "/logo-negro.webp", media: "(prefers-color-scheme: dark)" },
    ],
    shortcut: "/logo-blanco.webp",
    apple: "/logo-blanco.webp",
  },

  other: {
    "geo.region": "CO-SU",
    "geo.placename": "Sincelejo",
    "geo.position": "9.3047;-75.3978",
    "ICBM": "9.3047, -75.3978"
  },

  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // JSON-LD Optimizado con la "Carnada"
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "LocalBusiness"],
    "name": "Alturas y Riesgos de la Costa S.A.S",
    "image": `${BASE_URL}/logo-blanco.webp`,
    "description": "Centro de entrenamiento certificado en Sincelejo, Sucre. Ofrecemos cursos de trabajo seguro en alturas, espacios confinados, reentrenamiento y coordinador con excelentes promociones empresariales.",
    "@id": BASE_URL,
    "url": BASE_URL,
    "telephone": "+573148475070",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Cra 17 #27-35 Calle Nariño",
      "addressLocality": "Sincelejo",
      "addressRegion": "Sucre",
      "postalCode": "700001",
      "addressCountry": "CO"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 9.3047,
      "longitude": -75.3978
    },
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