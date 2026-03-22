"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FaTimes, FaBars, FaArrowRight } from "react-icons/fa";

const links = [
  { label: "Inicio",           path: "/" },
  { label: "Nosotros",         path: "/nosotros" },
  { label: "Cursos",           path: "/cursos" },
  { label: "Certificados",     path: "/certificados" },
  { label: "Subir Documentos", path: "/registro" },
  { label: "Contacto",         path: "/contacto" },
];

export default function Navbar() {
  const pathname  = usePathname();
  const isHome    = pathname === "/";

  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [navReady,  setNavReady]  = useState(false);

  // Scroll listener
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    if (isHome) window.addEventListener("scroll", onScroll, { passive: true });
    else         setScrolled(true);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  // Entrada suave del navbar al montar
  useEffect(() => {
    const t = setTimeout(() => setNavReady(true), 80);
    return () => clearTimeout(t);
  }, []);

  // Bloquear scroll del body cuando el menú está abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const frosted = scrolled || !isHome;

  return (
    <>
      <style>{`
        @keyframes navDrop {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes menuItemIn {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes overlayOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }

        .nav-ready { animation: navDrop 0.6s cubic-bezier(.22,1,.36,1) forwards; }

        /* Indicador de página activa */
        .nav-link-active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0; right: 0;
          height: 2px;
          border-radius: 99px;
          background: #FFD700;
        }

        /* Underline hover en links desktop */
        .nav-link::before {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0; right: 0;
          height: 2px;
          border-radius: 99px;
          background: rgba(255,215,0,0.5);
          transform: scaleX(0);
          transition: transform 0.25s cubic-bezier(.22,1,.36,1);
          transform-origin: left;
        }
        .nav-link:hover::before { transform: scaleX(1); }
      `}</style>

      {/* ── BARRA PRINCIPAL ── */}
      <div
        className={`fixed top-0 z-50 w-full px-3 pt-3 transition-all duration-500 ${navReady ? "nav-ready" : "opacity-0"}`}
      >
        <header
          className={`mx-auto max-w-5xl rounded-2xl transition-all duration-500 ${
            frosted
              ? "bg-[#0F172A]/97 backdrop-blur-xl shadow-2xl shadow-black/40 border border-white/8"
              : "bg-transparent shadow-none border border-transparent"
          }`}
        >
          <nav className="flex items-center justify-between px-6 py-3 gap-6">

            {/* LOGO */}
            <Link href="/" className="flex-shrink-0 group">
              <Image
                src="/logo-negro.webp"
                alt="Alturas y Riesgos de la Costa"
                width={38}
                height={38}
                priority
                className="rounded-full brightness-0 invert transition-transform duration-300 group-hover:scale-110"
              />
            </Link>

            {/* LINKS DESKTOP */}
            <ul className="hidden md:flex items-center gap-7">
              {links.map((l) => {
                const active = pathname === l.path;
                return (
                  <li key={l.path}>
                    <Link
                      href={l.path}
                      className={`relative nav-link text-[11px] font-black uppercase tracking-widest transition-colors duration-200 ${
                        active
                          ? "text-[#FFD700] nav-link-active"
                          : "text-white/80 hover:text-white"
                      }`}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* CTA DESKTOP */}
            <Link
              href="/preinscripcion"
              className="hidden md:inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-[#FFD700] text-[#0F172A] hover:bg-white hover:scale-105 transition-all duration-300 shadow-lg shadow-yellow-500/20 flex-shrink-0"
            >
              Pre-Inscripción
              <FaArrowRight size={9}/>
            </Link>

            {/* HAMBURGUESA MÓVIL */}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors duration-200 flex-shrink-0"
            >
              <FaBars size={18}/>
            </button>

          </nav>
        </header>
      </div>

      {/* ── MENÚ MÓVIL ── */}
      {/* Backdrop */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm transition-opacity duration-400 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel deslizante desde la derecha */}
      <aside
        className={`fixed top-0 right-0 bottom-0 z-[100] w-[min(85vw,360px)] bg-[#0F172A] flex flex-col
          transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)]
          ${menuOpen ? "translate-x-0" : "translate-x-full"}
          border-l border-white/10 shadow-2xl`}
      >
        {/* Dot grid decorativo */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />

        {/* Blob de luz */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/15 blur-[80px] rounded-full pointer-events-none -mr-16 -mt-16" />

        {/* Header del panel */}
        <div className="relative z-10 flex items-center justify-between px-7 pt-8 pb-6 border-b border-white/8">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <Image
              src="/logo-negro.webp"
              alt="Logo"
              width={36}
              height={36}
              className="rounded-full brightness-0 invert"
            />
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Cerrar menú"
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors duration-200 hover:rotate-90 transition-transform"
          >
            <FaTimes size={18}/>
          </button>
        </div>

        {/* Links del panel */}
        <nav className="relative z-10 flex-1 flex flex-col justify-center px-7 gap-1">
          {links.map((l, i) => {
            const active = pathname === l.path;
            return (
              <Link
                key={l.path}
                href={l.path}
                onClick={() => setMenuOpen(false)}
                className={`
                  group flex items-center justify-between
                  px-4 py-4 rounded-2xl
                  font-black text-lg uppercase tracking-tight
                  transition-all duration-200
                  ${active
                    ? "bg-white/10 text-[#FFD700]"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                  }
                `}
                style={{
                  transitionProperty: "transform, opacity, background-color, color",
                  transitionDuration: "0.4s, 0.4s, 0.2s, 0.2s",
                  transitionTimingFunction: "cubic-bezier(.22,1,.36,1), ease, ease, ease",
                  transitionDelay: menuOpen ? `${i * 45}ms, ${i * 45}ms, 0ms, 0ms` : "0ms",
                  transform: menuOpen ? "translateX(0)" : "translateX(12px)",
                  opacity: menuOpen ? 1 : 0,
                }}
              >
                <span>{l.label}</span>
                {active && (
                  <span className="w-1.5 h-1.5 bg-[#FFD700] rounded-full flex-shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer del panel — CTA */}
        <div className="relative z-10 px-7 pb-10 pt-4 border-t border-white/8">
          <Link
            href="/preinscripcion"
            onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-[#FFD700] text-[#0F172A] text-sm font-black uppercase tracking-widest shadow-xl hover:bg-white transition-all duration-300 active:scale-95"
            style={{
              transitionProperty: "transform, opacity, background-color",
              transitionDuration: "0.4s, 0.4s, 0.3s",
              transitionTimingFunction: "cubic-bezier(.22,1,.36,1), ease, ease",
              transitionDelay: menuOpen ? `${links.length * 45}ms, ${links.length * 45}ms, 0ms` : "0ms",
              transform: menuOpen ? "translateY(0)" : "translateY(12px)",
              opacity: menuOpen ? 1 : 0,
            }}
          >
            Pre-Inscripción
            <FaArrowRight size={12}/>
          </Link>

          <p className="text-center text-[9px] text-white/20 font-bold uppercase tracking-widest mt-4">
            © {new Date().getFullYear()} Alturas y Riesgos de la Costa S.A.S
          </p>
        </div>
      </aside>
    </>
  );
}