export default function Footer() {
  return (
    <footer className="mt-32 border-t border-borderSoft bg-white/90 dark:bg-gray-900/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-10">

        <div>
          <h3 className="text-lg font-semibold text-textMain">
            Alturas y Riesgos de la Costa S.A.S
          </h3>
          <p className="mt-3 text-sm text-textSoft">
            Formación y certificación en trabajo seguro en alturas.
          </p>
        </div>

        <div>
          <h4 className="font-medium text-textMain">Servicios</h4>
          <ul className="mt-4 space-y-2 text-sm text-textSoft">
            <li>Cursos de alturas</li>
            <li>Reentrenamiento</li>
            <li>Certificados</li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-textMain">Contacto</h4>
          <p className="mt-4 text-sm text-textSoft">
            Sincelejo, Colombia<br />
            contacto@alturasyriesgos.com
          </p>
        </div>

      </div>

      {/* BANDA INFERIOR */}
      <div className="text-center text-xs text-textSoft py-4 border-t border-borderSoft">
        © {new Date().getFullYear()} Alturas y Riesgos de la Costa S.A.S
      </div>
    </footer>
  );
}
