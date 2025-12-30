export default function NosotrosPage() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-gray-900">
        Sobre nosotros
      </h1>

      <p className="mt-6 text-gray-700 leading-relaxed max-w-3xl">
        <strong>Alturas y Riesgos de la Costa S.A.S</strong> es una empresa
        ubicada en la ciudad de Sincelejo – Sucre, dedicada a la capacitación en trabajo en
        alturas, reentrenamiento y seguridad industrial, conforme a la
        normativa vigente en Colombia.
      </p>

      <div className="mt-12 grid md:grid-cols-3 gap-8">
        <div className="bg-gray-100 p-6 rounded-xl">
          <h3 className="font-semibold text-lg">Misión</h3>
          <p className="mt-2 text-gray-700">
            Formar trabajadores competentes y conscientes del riesgo,
            garantizando cumplimiento legal y seguridad.
          </p>
        </div>

        <div className="bg-gray-100 p-6 rounded-xl">
          <h3 className="font-semibold text-lg">Visión</h3>
          <p className="mt-2 text-gray-700">
            Ser referente regional en capacitación certificada en trabajo en
            alturas y seguridad industrial.
          </p>
        </div>

        <div className="bg-gray-100 p-6 rounded-xl">
          <h3 className="font-semibold text-lg">Valores</h3>
          <p className="mt-2 text-gray-700">
            Responsabilidad, legalidad, compromiso y excelencia.
          </p>
        </div>
      </div>
    </section>
  );
}
