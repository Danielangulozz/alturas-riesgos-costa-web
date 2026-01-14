"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FaTimes, FaBars } from "react-icons/fa"; // Usaremos iconos más consistentes

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  
  const [isAtTop, setIsAtTop] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 20);
    };
    if (isHome) {
      window.addEventListener("scroll", handleScroll);
    } else {
      setIsAtTop(false);
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  // Bloquear scroll cuando el menú está abierto
  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [menuOpen]);

  const navbarStyle = (isHome && isAtTop) 
    ? "bg-transparent shadow-none" 
    : "bg-[#0F172A] shadow-xl border-b border-white/10";

  const logoInvert = (isHome && isAtTop) ? "brightness-0 invert" : "brightness-0 invert";

  return (
    <>
      <div className="fixed top-0 z-50 w-full transition-all duration-300">
        <div className={`px-2 py-3 transition-all duration-300`}>
          <header className={`mx-auto max-w-4xl rounded-2xl backdrop-blur-md transition-all duration-500 ${navbarStyle}`}>
            <nav className="flex items-center justify-between px-6 py-3">
              {/* LOGO */}
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/logo-negro.webp"
                  alt="Logo"
                  width={40}
                  height={40}
                  className={`rounded-full transition-all duration-500 ${logoInvert}`}
                  priority
                />
              </Link>

              {/* MENÚ DESKTOP */}
              <ul className="hidden md:flex flex-1 justify-center gap-8 text-xs font-black uppercase tracking-widest text-white">
                <li><Link href="/" className="hover:text-[#FFD700] transition">Inicio</Link></li>
                <li><Link href="/nosotros" className="hover:text-[#FFD700] transition">Nosotros</Link></li>
                <li><Link href="/cursos" className="hover:text-[#FFD700] transition">Cursos</Link></li>
                <li><Link href="/certificados" className="hover:text-[#FFD700] transition">Certificados</Link></li>
                <li><Link href="/registro" className="hover:text-[#FFD700] transition">Subir Archivos</Link></li>
              </ul>

              {/* CTA DESKTOP */}
              <Link
                href="/preinscripcion"
                className="hidden md:inline-flex rounded-full px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-[#FFD700] text-[#0F172A] hover:bg-white transition-all"
              >
                Pre-Inscripción
              </Link>

              {/* BOTÓN HAMBURGUESA MÓVIL */}
              <button 
                onClick={() => setMenuOpen(true)} 
                className="md:hidden text-white p-2"
              >
                <FaBars size={24} />
              </button>
            </nav>
          </header>
        </div>
      </div>

      {/* ================= OVERLAY MOBILE ================= */}
      <div 
        className={`
          fixed inset-0 z-[100] bg-[#0F172A] 
          transition-all duration-500 ease-in-out
          ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"}
        `}
      >
        {/* TEXTURA DE PUNTOS EN EL MENÚ MÓVIL */}
        <div className="absolute inset-0 opacity-[0.1] pointer-events-none" 
          style={{ backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`, backgroundSize: '30px 30px' }}>
        </div>

        {/* BOTÓN CERRAR */}
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-8 right-8 text-white p-2 z-[110]"
        >
          <FaTimes size={32} />
        </button>

        {/* LINKS MÓVIL */}
        <div className="flex flex-col items-center justify-center h-full gap-8 relative z-10">
          <ul className="flex flex-col gap-6 text-center">
            {['Inicio', 'Nosotros', 'Cursos', 'Certificados'].map((item) => (
              <li key={item}>
                <Link
                  href={item === 'Inicio' ? '/' : `/${item.toLowerCase()}`}
                  onClick={() => setMenuOpen(false)}
                  className="text-4xl font-black text-white uppercase tracking-tighter hover:text-[#FFD700] transition-colors"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
          
          <Link
            href="/certificados"
            onClick={() => setMenuOpen(false)}
            className="mt-4 px-10 py-4 rounded-full bg-[#FFD700] text-[#0F172A] text-lg font-black uppercase tracking-widest shadow-xl"
          >
            Validar Certificado
          </Link>
        </div>
      </div>
    </>
  );
}