import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="
      -mt-20 relative pt-48 pb-32 overflow-hidden
      bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#1E40AF]
    ">
      
      {/* TEXTURA: Dots Matrix */}
      <div className="absolute inset-0 opacity-[0.15] z-0" 
        style={{ 
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`, 
          backgroundSize: '30px 30px' 
        }}>
      </div>

      {/* LUZ AMBIENTAL */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-blue-400/10 blur-[120px] rounded-full z-0"></div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">

        {/* CONTENIDO TEXTUAL */}
        <div className="animate-in fade-in slide-in-from-left duration-1000">
          <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tighter">
            Formación de{" "}
            <span className="text-[#FFD700] drop-shadow-[0_0_20px_rgba(255,215,0,0.3)]">
              trabajo en alturas
            </span>{" "}
            y seguridad industrial.
          </h1>

          <p className="mt-8 text-xl font-medium text-blue-100/80 max-w-xl leading-relaxed">
            Cursos certificados y validación oficial bajo la normativa de la 
            <span className="text-white font-bold ml-2 uppercase">Resolución 4272 de 2021</span>.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="#cursos"
              className="px-10 py-4 rounded-full font-black uppercase tracking-wider text-sm bg-[#FFD700] text-[#0F172A] shadow-xl hover:bg-white hover:scale-105 transition-all duration-300"
            >
              Ver cursos
            </Link>

            <Link
              href="/certificados"
              className="px-10 py-4 rounded-full font-bold uppercase tracking-wider text-sm border-2 border-white/20 text-white hover:bg-white/10 hover:border-white transition-all duration-300 backdrop-blur-sm"
            >
              Validar Certificado
            </Link>
          </div>
        </div>

        {/* LOGO CON SÚPER ANIMACIÓN */}
        <div className="flex justify-center items-center relative">
          {/* Contenedor con animación de entrada (Zoom + Fade + Slide) */}
          <div className="relative group animate-in fade-in zoom-in slide-in-from-right-20 duration-1000 delay-300 ease-out fill-mode-both">
            
            {/* Resplandor animado de fondo */}
            <div className="absolute inset-0 bg-blue-500/30 blur-[100px] rounded-full animate-pulse group-hover:bg-blue-400/50 transition-all duration-700"></div>
            
            {/* Imagen con efecto de flotación constante (CSS inline para no depender de archivos externos) */}
            <div className="relative z-10 animate-float">
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes float {
                  0% { transform: translateY(0px) rotate(0deg); }
                  50% { transform: translateY(-20px) rotate(2deg); }
                  100% { transform: translateY(0px) rotate(0deg); }
                }
                .animate-float {
                  animation: float 80s ease-in-out infinite;
                }
              `}} />
              
              <Image
                src="/logo-blanco.webp" 
                alt="Logo Alturas y Riesgos de la Costa"
                width={500}
                height={500}
                className="object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.4)] transition-transform duration-700"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* SEPARADOR DE ONDA */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-[80px] fill-white">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
    </section>
  );
}