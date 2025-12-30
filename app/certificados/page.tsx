export default function CertificadosPage() {
  return (
    <section className="relative min-h-screen bg-gradient-to-b bg-white px-6 py-24">
      
      {/* CONTENEDOR */}
      <div className="max-w-4xl mx-auto text-center" >
        
        {/* TÍTULO */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Consulta de certificados
        </h1>

        {/* SUBTÍTULO */}
        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
          Verifica la validez de tu certificado ingresando el número de cédula
          o el código asignado.
        </p>

        {/* TARJETA */}
        <div className="mt-14 bg-white dark:bg-gray-900 backdrop-blur-xl border border-yellow-100 shadow-xl rounded-2xl p-8 md:p-10 text-left">
          
          <label className="block text-sm font-medium text-white">
            Cédula o código del certificado
          </label>

          <input
            type="text"
            placeholder="Ej: 123456789 o ARC-2025-001"
            className="
              mt-3 w-full px-5 py-4 rounded-xl
              border border-gray-200
              text-white
              focus:outline-none
              focus:ring-2 focus:ring-blue-200
              focus:border-blue-200
              transition
            "
          />

<button
  type="button"
  className="
    mt-4 w-full
    relative overflow-hidden
    rounded-xl px-6 py-4
    font-semibold text-white

    bg-gradient-to-r from-cyan-500 to-blue-500
    shadow-lg shadow-cyan-500/30

    transition-all duration-300 ease-out

    hover:scale-[1.03]
    hover:shadow-xl hover:shadow-cyan-500/50

    active:scale-[0.96]
    active:shadow-md

    focus:outline-none focus:ring-4
    focus:ring-cyan-300
  "
>
  <span className="relative z-10">Buscar certificado</span>
</button>

        </div>

        {/* TEXTO LEGAL */}
        <p className="mt-8 text-sm text-gray-500">
          Este sistema permite la verificación pública de certificados emitidos
          por <span className="font-medium text-gray-700">
            Alturas y Riesgos de la Costa S.A.S
          </span>
        </p>
      </div>
    </section>
  );
}
