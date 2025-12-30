import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Sección Empresa */}
      <section className="max-h-7xl mx-auto px-6 py-20 bg-gradient-to-b from-[#F8FAFC] to-[#F8FAFC]">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              ¿Quiénes somos?
            </h2>
            <p className="mt-4 text-gray-700 leading-relaxed">
              <strong>Alturas y Riesgos de la Costa S.A.S</strong> es una empresa
              ubicada en Sincelejo, dedicada a la capacitación en trabajo en
              alturas, reentrenamiento y seguridad industrial.
            </p>
            <p className="mt-4 text-gray-700 leading-relaxed">
              Nuestro enfoque está en la formación responsable, segura y
              conforme a la normativa vigente del Ministerio del Trabajo.
            </p>
          </div>

          <div className="bg-[#E2E8F0] rounded-xl p-8">
            <ul className="space-y-4 text-gray-800">
              <li>✔ Formación certificada</li>
              <li>✔ Instructores calificados</li>
              <li>✔ Cumplimiento legal</li>
              <li>✔ Certificados digitales</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Nuestros servicios
          </h2>

          <div className="mt-12 grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Trabajo en alturas",
                desc: "Capacitación inicial conforme a la Resolución 4272.",
              },
              {
                title: "Reentrenamiento",
                desc: "Actualización periódica obligatoria para trabajadores.",
              },
              {
                title: "Certificación digital",
                desc: "Consulta pública y descarga inmediata de certificados.",
              },
            ].map((s) => (
              <div
                key={s.title}
                className="bg-white border border-green-400 rounded-xl shadow-md p-6 hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold text-green-400">
                  {s.title}
                </h3>
                <p className="mt-3 text-gray-700">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-b from-[#F8FAFC] to-[#F8FAFC] text-black py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold">
            Consulta o valida tu certificado
          </h2>
          <p className="mt-4 text-gray-300">
            Verifica la autenticidad de certificados emitidos por nuestra
            plataforma.
          </p>

          <a
            href="/certificados"
            className="inline-block mt-8 px-8 py-3 rounded-md bg-yellow-400 text-black font-medium hover:bg-yellow-300"
          >
            Ir a certificados
          </a>
        </div>
      </section>
    </>
  );
}
