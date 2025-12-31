"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [isAtTop, setIsAtTop] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // EFECTO PARA BLOQUEAR EL SCROLL (Evita que se desproporcione/mueva el fondo)
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [menuOpen]);

  return (
    <>
      <div className="sticky top-0 z-50 w-full">
        {/* LÍNEA SUPERIOR - Corregida para que no rompa el ancho en móviles */}
        <div
          className={`
            relative mx-auto h-[2px]
            transition-all duration-500 ease-out
            ${isAtTop ? "w-full md:w-128 opacity-100" : "w-16 opacity-0"}
            bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-300
          `}
        />

        <div className="px-4 relative">
          <header
            className={`
              mx-auto max-w-7xl rounded-2xl
              backdrop-blur-md
              transition-all duration-300
              bg-white/90 dark:bg-gray-900/90
              ${isAtTop ? "shadow-none mt-0" : "shadow-xl mt-4"}
            `}
          >
            <nav className="flex items-center justify-between px-6 py-4">
              {/* LOGO */}
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo-negro.png"
                  alt="Logo"
                  width={44}
                  height={44}
                  className="block dark:hidden rounded-full"
                  priority
                />
                <Image
                  src="/logo-blanco.png"
                  alt="Logo"
                  width={44}
                  height={44}
                  className="hidden dark:block rounded-full"
                  priority
                />
              </Link>

              {/* MENÚ DESKTOP */}
              <ul className="hidden md:flex flex-1 justify-center gap-8 text-sm font-medium text-gray-700 dark:text-gray-200">
                <li><Link href="/" className="hover:text-green-400 transition">Inicio</Link></li>
                <li><Link href="/nosotros" className="hover:text-green-400 transition">Nosotros</Link></li>
                <li><Link href="/cursos" className="hover:text-green-400 transition">Cursos</Link></li>
                <li><Link href="/certificados" className="hover:text-green-400 transition">Certificados</Link></li>
                <li><Link href="/registro" className="hover:text-green-400 transition">Carga de archivos</Link></li>
              </ul>

              {/* CTA DESKTOP */}
              <Link
                href="/certificados"
                className="hidden md:inline-flex rounded-full bg-yellow-400 px-6 py-2 text-sm font-semibold text-white hover:bg-green-400 transition"
              >
                Solicitar certificado →
              </Link>

              {/* BOTÓN HAMBURGUESA */}
              <button
                onClick={() => setMenuOpen(true)}
                className="md:hidden p-2 text-gray-800 dark:text-white"
                aria-label="Abrir menú"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </nav>
          </header>
        </div>
      </div>

      {/* ================= OVERLAY MOBILE ================= */}
      <div 
        className={`
          fixed inset-0 z-[999] bg-white dark:bg-gray-900 
          transition-transform duration-300 ease-in-out
          ${menuOpen ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        {/* BOTÓN CERRAR */}
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-6 right-6 text-gray-800 dark:text-white p-2"
          aria-label="Cerrar menú"
        >
          <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* CONTENIDO CENTRADO */}
        <div className="flex flex-col items-center justify-center h-full w-full px-10">
          <ul className="flex flex-col gap-8 text-center mb-10">
            <li>
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="text-3xl font-bold text-gray-900 dark:text-white"
              >
                Inicio
              </Link>
            </li>            
            <li>
              <Link
                href="/nosotros"
                onClick={() => setMenuOpen(false)}
                className="text-3xl font-bold text-gray-900 dark:text-white"
              >
                Nosotros
              </Link>
            </li>
            <li>
              <Link
                href="/cursos"
                onClick={() => setMenuOpen(false)}
                className="text-3xl font-bold text-gray-900 dark:text-white"
              >
                Cursos
              </Link>
            </li>
            <li>
              <Link
                href="/certificados"
                onClick={() => setMenuOpen(false)}
                className="text-3xl font-bold text-gray-900 dark:text-white"
              >
                Certificados
              </Link>
            </li>
          </ul>

          <Link
            href="/certificados"
            onClick={() => setMenuOpen(false)}
            className="w-full max-w-xs text-center rounded-full bg-yellow-400 py-4 text-xl font-semibold text-white shadow-lg shadow-sky-200 dark:shadow-none"
          >
            Solicitar certificado →
          </Link>
        </div>
      </div>
    </>
  );
}