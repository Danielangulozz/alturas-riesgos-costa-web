import Hero from "@/components/Hero";
import Image from "next/image";
import { 
  FaClock, 
  FaClipboardList, 
  FaUserShield, 
  FaUsers, 
  FaUserGraduate, 
  FaSyncAlt,
  FaCheckCircle,
  FaHardHat,
  FaBuilding
} from "react-icons/fa";

export default function HomePage() {
  const academiaFotos = [
    { title: "Pista de Entrenamiento", desc: "Estructuras certificadas para práctica real.", img: "/pic1.webp" },
    { title: "Equipamiento Técnico", desc: "Arneses y conectores de última generación.", img: "/equipament.webp" },
    { title: "Aulas Teóricas", desc: "Espacios climatizados para formación técnica.", img: "/aula.webp" },
    { title: "Simulación de Rescate", desc: "Escenarios controlados de alta complejidad.", img: "/rescate.webp" }
  ];

  const cursos = [
    {
      title: "Jefes de Área",
      desc: "Diseñado para personal administrativo que dicta políticas y toma decisiones sobre seguridad en alturas.",
      duration: "8 Horas",
      reqs: "Cédula y Examen",
      icon: <FaUserShield />,
      img: "/picboss.webp" 
    },
    {
      title: "Trabajador Autorizado",
      desc: "Formación técnica para operarios que realizan labores directas en alturas siguiendo procedimientos seguros.",
      duration: "32 Horas",
      reqs: "Aptitud Médica",
      icon: <FaUsers />,
      img: "/pictrabj.webp"
    },
    {
      title: "Coordinador de Alturas",
      desc: "Capacitación de alto nivel para identificar peligros y supervisar medidas de protección en sitio.",
      duration: "80 Horas",
      reqs: "Exp. Certificada",
      icon: <FaUserGraduate />,
      img: "/piccoo.webp"
    },
    {
      title: "Reentrenamiento",
      desc: "Actualización anual obligatoria para mantener vigentes las competencias y conocimientos técnicos.",
      duration: "8 Horas",
      reqs: "Certificado Previo",
      icon: <FaSyncAlt />,
      img: "/picree.webp"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <main className="flex-grow">
        <Hero />

        {/* --- SECCIÓN QUIÉNES SOMOS --- */}
        <section className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ backgroundImage: `radial-gradient(#0F172A 1px, transparent 1px)`, backgroundSize: '30px 30px' }}>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
            <div className="animate-in fade-in slide-in-from-left duration-1000">
              <h2 className="text-4xl font-black text-[#0F172A] tracking-tighter uppercase">
                ¿Quiénes somos?
              </h2>
              <div className="w-20 h-1.5 bg-[#FFD700] mt-2 mb-8 rounded-full"></div>
              
              <p className="text-slate-600 text-lg leading-relaxed mb-6 font-medium">
                En <span className="font-bold text-[#0F172A]">Alturas y Riesgos de la Costa S.A.S</span>, 
                lideramos la formación industrial en Sincelejo, con un compromiso inquebrantable por la vida.
              </p>
              <p className="text-slate-600 text-lg border-l-4 border-[#FFD700] pl-6 py-4 bg-slate-50 rounded-r-xl font-medium">
                Operamos bajo la <strong>Resolución 4272 de 2021</strong>, garantizando certificaciones 
                con total validez legal ante el Ministerio del Trabajo.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                "Formación Certificada", "Instructores Expertos", 
                "Cumplimiento Legal", "Certificados Digitales"
              ].map((item, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col items-center text-center group hover:border-[#FFD700] hover:shadow-2xl transition-all duration-500">
                  <FaCheckCircle className="text-[#0F172A] text-2xl mb-3 transition-colors group-hover:text-[#FFD700]" />
                  <span className="font-black text-[#0F172A] text-[10px] uppercase tracking-[0.2em]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- SECCIÓN GALERÍA --- */}
        <section className="py-24 bg-[#0F172A] relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
                  Nuestro centro de entrenamiento
                </h2>
                <p className="text-blue-100/60 font-bold uppercase tracking-widest text-xs mt-2">
                  Infraestructura técnica de vanguardia
                </p>
              </div>
              <div className="flex gap-4 text-white/20 text-4xl hidden md:flex">
                 <FaHardHat /> <FaBuilding />
              </div>
            </div>

            {/* TARJETAS CON IMÁGENES */}
            <div className="flex flex-col md:flex-row gap-4 h-[500px]">
              {academiaFotos.map((foto, idx) => (
                <div 
                  key={idx} 
                  className="relative flex-1 hover:flex-[2.5] transition-all duration-700 ease-in-out group overflow-hidden rounded-3xl border border-white/10"
                >
                  {/* Imagen Real de la Academia */}
                  <Image 
                    src={foto.img} 
                    alt={foto.title} 
                    fill 
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Capa de overlay para legibilidad */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/20 to-transparent opacity-90"></div>
                  
                  {/* Texto */}
                  <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-[#FFD700] font-black text-[10px] uppercase tracking-[0.3em] mb-2 opacity-0 group-hover:opacity-100 transition-opacity">0{idx + 1}</p>
                    <h3 className="text-white text-xl font-black uppercase tracking-tighter">{foto.title}</h3>
                    <p className="text-white/60 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 line-clamp-1">
                      {foto.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="absolute -right-20 top-20 text-[20rem] font-black text-white/[0.02] pointer-events-none select-none uppercase">
            AR Costa
          </div>
        </section>

        {/* --- SECCIÓN SERVICIOS (CURSOS) --- */}
        <section className="bg-slate-50 py-24 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
            style={{ backgroundImage: `radial-gradient(#0F172A 1px, transparent 1px)`, backgroundSize: '20px 20px' }}>
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-[#0F172A] uppercase tracking-tighter">
                Nuestros Servicios
              </h2>
              <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs">Capacitación técnica de alto nivel</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {cursos.map((curso, idx) => (
                <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                  <div className="relative h-52 w-full overflow-hidden">
                    <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>
                    <Image src={curso.img} alt={curso.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent opacity-90"></div>
                    <div className="absolute bottom-4 left-4 text-[#FFD700] text-3xl drop-shadow-lg">{curso.icon}</div>
                  </div>

                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="bg-slate-100 text-[#0F172A] text-[9px] font-black px-2 py-1 rounded-md uppercase border border-slate-200 flex items-center gap-1">
                        <FaClock size={10} /> {curso.duration}
                      </span>
                      <span className="bg-[#FFD700]/10 text-[#0F172A] text-[9px] font-black px-2 py-1 rounded-md uppercase border border-[#FFD700]/20 flex items-center gap-1">
                        <FaClipboardList size={10} /> {curso.reqs}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-[#0F172A] leading-tight mb-3 uppercase tracking-tight">{curso.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 h-12 line-clamp-2 font-medium">{curso.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- SECCIÓN CTA FINAL --- */}
        <section className="relative py-32 bg-[#0F172A] overflow-hidden text-center">
          <div className="absolute inset-0 opacity-[0.15] z-0" 
            style={{ backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`, backgroundSize: '30px 30px' }}>
          </div>
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-6">¿Ya realizaste tu curso?</h2>
            <p className="text-blue-100/70 text-lg mb-12 font-medium max-w-2xl mx-auto">Valida la legalidad de tu certificación en nuestra base de datos oficial.</p>
            <a href="/certificados" className="inline-block px-12 py-5 bg-[#FFD700] text-[#0F172A] rounded-full font-black uppercase tracking-widest hover:bg-white hover:scale-110 transition-all duration-500 shadow-xl">
              Validar Certificado Ahora
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
