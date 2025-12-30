import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

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
        <Navbar />
        <main className="flex-1">{children}</main>
        <WhatsAppButton /> {/* <--- Aquí mero bro */}
        <Footer />
      </body>
    </html>
  );
}
