export default function CursosPage() {
  const cursos = [
    {
      titulo: "Trabajo en alturas – Nivel básico",
      desc: "Formación inicial para trabajadores que realizan tareas en altura.",
      horas: "8 horas",
      icono: "🪜",
    },
    {
      titulo: "Trabajo en alturas – Nivel avanzado",
      desc: "Capacitación para trabajadores con tareas de alto riesgo en alturas.",
      horas: "40 horas",
      icono: "🏗️",
    },
    {
      titulo: "Reentrenamiento en trabajo en alturas",
      desc: "Actualización obligatoria de conocimientos según normativa vigente.",
      horas: "8 horas",
      icono: "🔄",
    },
    {
      titulo: "Jefes de área",
      desc: "Curso dirigido a responsables de supervisar trabajos en altura y garantizar condiciones seguras.",
      horas: "8 horas",
      icono: "👷‍♂️",
    },
    {
      titulo: "Trabajador autorizado",
      desc: "Capacitación para personal autorizado a ejecutar labores operativas en alturas.",
      horas: "32 horas",
      icono: "🦺",
    },
    {
      titulo: "Coordinador de trabajo en alturas",
      desc: "Formación para coordinar, controlar y supervisar trabajos en altura conforme a la normativa.",
      horas: "80 horas",
      icono: "📋",
    },
    {
      titulo: "Autorización de coordinador",
      desc: "Actualización y validación de competencias para coordinadores certificados.",
      horas: "16 horas",
      icono: "✅",
    },
    {
      titulo: "Armado de andamios",
      desc: "Capacitación práctica sobre el montaje seguro de sistemas de andamiaje.",
      horas: "16 horas",
      icono: "🔩",
    },
    {
      titulo: "Andamios",
      desc: "Formación teórica y práctica sobre uso, inspección y seguridad en andamios.",
      horas: "12 horas",
      icono: "🏗️",
    },
    {
      titulo: "Rescate industrial",
      desc: "Entrenamiento especializado para atención de emergencias y rescate en alturas.",
      horas: "24 horas",
      icono: "🚑",
    },
  ];

  return (
    <section className="bg-soft">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h1 className="text-4xl font-bold text-black">
          Nuestros cursos
        </h1>

        <p className="mt-4 text-soft max-w-2xl text-black">
          Todos nuestros cursos cumplen con la Resolución 4272 de 2021 del
          Ministerio del Trabajo.
        </p>

        <div className="mt-14 grid md:grid-cols-3 gap-8">
          {cursos.map((curso) => (
            <div
              key={curso.titulo}
              className="
                group bg-main rounded-2xl p-8
                border border-soft
                shadow-sm hover:shadow-xl
                transition-all duration-300
                hover:-translate-y-1
                flex flex-col
              "
            >
              {/* ICONO */}
              <div className="text-4xl mb-4">
                {curso.icono}
              </div>

              {/* BADGE HORAS */}
              <span
                className="
                  w-fit mb-3
                  rounded-full px-4 py-1
                  text-sm font-semibold
                  bg-blue-600 text-primary
                "
              >
                {curso.horas}
              </span>

              <h3 className="text-xl font-semibold text-black">
                {curso.titulo}
              </h3>

              <p className="mt-3 text-gray-800 leading-relaxed flex-1">
                {curso.desc}
              </p>

              {/* BOTÓN CTA */}
              <a
                href="/contacto"
                className="
                  mt-6 inline-flex items-center justify-center
                  rounded-xl px-6 py-3
                  font-semibold
                  bg-green-400
                  text-black
                  shadow-md
                  hover:brightness-105
                  hover:scale-[1.05]
                  active:scale-[0.97]
                  transition-all
                "
              >
                Solicitar curso →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
