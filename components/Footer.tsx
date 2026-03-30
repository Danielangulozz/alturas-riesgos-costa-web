import Link from "next/link";
import Image from "next/image";
import {
  FaFacebook, FaInstagram, FaMapMarkerAlt,
  FaEnvelope, FaPhoneAlt, FaArrowRight, FaShieldAlt
} from "react-icons/fa";

const servicios = [
  { label: "Cursos de Alturas",   path: "/cursos" },
  { label: "Subir Documentos",    path: "/registro" },
  { label: "Certificados",        path: "/certificados" },
  { label: "Nosotros",            path: "/nosotros" },
];

const legal = [
  { label: "Política de Privacidad", path: "/privacidad" },
  { label: "Tratamiento de Datos",   path: "/datos" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] border-t border-white/8">

      {/* ── BANDA SUPERIOR — CTA ── */}
      <div className="border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 flex-shrink-0">
              <FaShieldAlt size={16}/>
            </div>
            <div>
              <p className="text-white font-black text-sm uppercase tracking-tight">
                ¿Listo para certificarte?
              </p>
              <p className="text-slate-400 text-xs mt-0.5">
                Pre-inscríbete ahora y asegura tu cupo.
              </p>
            </div>
          </div>
          <Link
            href="/preinscripcion"
            className="group inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#FFD700] text-[#0F172A] text-xs font-black uppercase tracking-widest hover:bg-white transition-all duration-300 hover:scale-105 shadow-lg shadow-yellow-500/10 flex-shrink-0"
          >
            Pre-Inscripción
            <FaArrowRight size={10} className="transition-transform group-hover:translate-x-1"/>
          </Link>
        </div>
      </div>

      {/* ── CUERPO DEL FOOTER ── */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">

          {/* COLUMNA 1: MARCA */}
          <div className="md:col-span-1 space-y-5">
            <Link href="/" className="inline-block">
              <Image
                src="/logo-blanco.webp"
                alt="Alturas y Riesgos de la Costa"
                width={56}
                height={56}
                className="object-contain"
              />
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Líderes en formación y certificación de trabajo seguro en alturas en Sincelejo.
              Bajo la <span className="text-white font-bold">Resolución 4272 de 2021</span>.
            </p>
            {/* Redes sociales */}
            <div className="flex gap-3 pt-1">
              <a
                href="https://www.facebook.com/alturasyriesgos"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200"
              >
                <FaFacebook size={15}/>
              </a>
              <a
                href="https://www.instagram.com/alturasyriesgos/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-pink-600 hover:text-white hover:border-pink-600 transition-all duration-200"
              >
                <FaInstagram size={15}/>
              </a>
            </div>
          </div>

          {/* COLUMNA 2: SERVICIOS */}
          <div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-5">
              Servicios
            </h4>
            <ul className="space-y-3">
              {servicios.map((s) => (
                <li key={s.path}>
                  <Link
                    href={s.path}
                    className="group flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors duration-200 font-medium"
                  >
                    <span className="w-1 h-1 bg-slate-600 group-hover:bg-[#FFD700] rounded-full transition-colors duration-200 flex-shrink-0" />
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMNA 3: CONTACTO */}
          <div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-5">
              Contacto
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <FaMapMarkerAlt className="text-[#FFD700] mt-0.5 flex-shrink-0" size={13}/>
                <span className="leading-relaxed">
                  Cra 17 #27-35, Calle Nariño<br />
                  Sincelejo, Sucre
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <FaPhoneAlt className="text-[#FFD700] flex-shrink-0" size={12}/>
                <a href="tel:+573148475070" className="hover:text-white transition-colors">
                  +57 314 847 5070
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <FaEnvelope className="text-[#FFD700] flex-shrink-0" size={12}/>
                <a href="mailto:contacto@alturasyriesgos.com" className="hover:text-white transition-colors break-all">
                  contacto@alturasyriesgos.com
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMNA 4: LEGAL */}
          <div>
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-5">
              Legal
            </h4>
            <ul className="space-y-3">
              {legal.map((l) => (
                <li key={l.path}>
                  <Link
                    href={l.path}
                    className="group flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors duration-200 font-medium"
                  >
                    <span className="w-1 h-1 bg-slate-600 group-hover:bg-[#FFD700] rounded-full transition-colors duration-200 flex-shrink-0" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Badge Res. */}
            <div className="mt-8 inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
              <FaShieldAlt className="text-blue-400" size={11}/>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Res. 4272 / 2021
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* ── BANDA INFERIOR ── */}
      <div className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500 font-medium">
            © {new Date().getFullYear()} Alturas y Riesgos de la Costa S.A.S. Todos los derechos reservados.
          </p>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            Sincelejo · Sucre · Colombia
          </p>
        </div>
      </div>

    </footer>
  );
}