import Link from "next/link";
import { FaFacebook, FaInstagram, FaMapMarkerAlt, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-12">
          
          {/* COLUMNA 1: EMPRESA */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-xl font-bold text-[#0F172A] dark:text-white">
              Alturas y Riesgos de la Costa S.A.S
            </h3>
            <p className="mt-4 text-sm text-slate-500 leading-relaxed">
              Líderes en formación y certificación de trabajo seguro en alturas en Sincelejo. 
              Garantizamos excelencia técnica bajo la Resolución 4272 de 2021.
            </p>
          </div>

          {/* COLUMNA 2: SERVICIOS */}
          <div>
            <h4 className="font-bold text-[#0F172A] dark:text-white mb-4">Servicios</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link href="/cursos" className="hover:text-[#1E3A8A] transition">Cursos de alturas</Link></li>
              <li><Link href="/cursos" className="hover:text-[#1E3A8A] transition">Reentrenamiento</Link></li>
              <li><Link href="/certificados" className="hover:text-[#1E3A8A] transition">Certificados</Link></li>
            </ul>
          </div>

          {/* COLUMNA 3: CONTACTO */}
          <div>
            <h4 className="font-bold text-[#0F172A] dark:text-white mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li className="flex items-start gap-2">
                <FaMapMarkerAlt className="mt-1 text-[#FFD700]" />
                <span>Sincelejo, Sucre <br /> Troncal de Occidente</span>
              </li>
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-[#FFD700]" />
                <span>contacto@alturasyriesgos.com</span>
              </li>
            </ul>
          </div>

          {/* COLUMNA 4: REDES Y LEGAL */}
          <div>
            <h4 className="font-bold text-[#0F172A] dark:text-white mb-4">Síguenos</h4>
            <div className="flex gap-4 mb-6">
              <a href="#" className="text-slate-400 hover:text-[#1E3A8A] text-xl transition"><FaFacebook /></a>
              <a href="#" className="text-slate-400 hover:text-[#1E3A8A] text-xl transition"><FaInstagram /></a>
            </div>
            <ul className="space-y-2 text-[11px] text-slate-400 font-medium">
              <li><Link href="/privacidad" className="hover:underline">Política de Privacidad</Link></li>
              <li><Link href="/datos" className="hover:underline">Tratamiento de Datos</Link></li>
            </ul>
          </div>

        </div>

        {/* BANDA INFERIOR */}
        <div className="mt-16 pt-8 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium tracking-wide">
            © {new Date().getFullYear()} Alturas y Riesgos de la Costa S.A.S. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}