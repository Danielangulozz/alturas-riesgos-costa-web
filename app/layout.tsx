import "./globals.css";
import type { Metadata } from "next";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: {
    default: "Alturas y Riesgos de la Costa S.A.S | Capacitación Certificada",
    template: "%s | Alturas y Riesgos de la Costa"
  },
  description:
    "Centro de entrenamiento certificado en Sincelejo y la Costa. Capacitación profesional en trabajo seguro en alturas, espacios confinados y rescate industrial conforme a la Resolución 4272 de 2021. ¡Certifícate con expertos!",
  keywords: ["trabajo en alturas", "certificación alturas Sincelejo", "Resolución 4272 de 2021", "seguridad industrial", "curso de alturas", "AR Costa"],
  authors: [{ name: "Alturas y Riesgos de la Costa S.A.S" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  
  // CONFIGURACIÓN DE ICONOS (Modo claro y oscuro)
  icons: {
    icon: [
      {
        url: "/logo-blanco.webp",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/logo-negro.webp",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    shortcut: "/icon-light.png",
    apple: "/icon-light.png", // Para iPhone
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        {/* Esto ayuda a que el color de la barra del navegador combine con tu marca */}
        <meta name="theme-color" content="#1e293b" />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}