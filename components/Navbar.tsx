"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/"; // Verificamos si es la página de inicio
  
  const [isAtTop, setIsAtTop] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY < 20);
    };
    if (isHome) {
      window.addEventListener("scroll", handleScroll);
    } else {
      setIsAtTop(false); // En otras páginas, nunca se comporta como si estuviera al top (para ser sólido)
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  // Si no es el Home, queremos que el Navbar siempre tenga fondo
  const navbarStyle = (isHome && isAtTop) 
    ? "bg-transparent shadow-none" 
    : "bg-[#0F172A] shadow-xl border-b border-white/10";

  const textColor = (isHome && isAtTop) ? "text-white" : "text-white"; 
  const logoInvert = (isHome && isAtTop) ? "brightness-0 invert" : "brightness-0 invert";

  return (
    <div className="fixed top-0 z-50 w-full transition-all duration-300">
      <div className={`px-4 py-3 transition-all duration-300`}>
        <header className={`mx-auto max-w-7xl rounded-2xl backdrop-blur-md transition-all duration-500 ${navbarStyle}`}>
          <nav className="flex items-center justify-between px-6 py-3">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo-negro.png"
                alt="Logo"
                width={40}
                height={40}
                className={`rounded-full transition-all duration-500 ${logoInvert}`}
                priority
              />
            </Link>

            <ul className="hidden md:flex flex-1 justify-center gap-8 text-xs font-black uppercase tracking-widest text-white">
              <li><Link href="/" className="hover:text-[#FFD700] transition">Inicio</Link></li>
              <li><Link href="/nosotros" className="hover:text-[#FFD700] transition">Nosotros</Link></li>
              <li><Link href="/cursos" className="hover:text-[#FFD700] transition">Cursos</Link></li>
              <li><Link href="/certificados" className="hover:text-[#FFD700] transition">Certificados</Link></li>
            </ul>

            <Link
              href="/certificados"
              className="hidden md:inline-flex rounded-full px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-[#FFD700] text-[#0F172A] hover:bg-white transition-all"
            >
              Certificados
            </Link>

            <button onClick={() => setMenuOpen(true)} className="md:hidden text-white">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </nav>
        </header>
      </div>
    </div>
  );
}