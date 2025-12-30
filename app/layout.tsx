import "./globals.css";
import type { Metadata } from "next";
import LayoutWrapper from "@/components/LayoutWrapper";

export const metadata: Metadata = {
  title: "Alturas y Riesgos de la Costa S.A.S",
  description:
    "Capacitación en trabajo en alturas conforme a la Resolución 4272 de 2021.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        {/* El Wrapper se encarga de la lógica del Navbar/Footer */}
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}