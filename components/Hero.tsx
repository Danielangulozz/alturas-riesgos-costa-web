import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="
      -mt-20 relative pt-40 pb-32 overflow-hidden
      /* DEGRADADO DIRECTO: De Rojo Colonial a Amarillo Logo */
      bg-gradient-to-br from-[#8B2323] via-[#A62D2D] to-[#FFD700]
    ">
      
      {/* TEXTURIZADO (Opcional: para que el amarillo no se vea plano) */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center relative z-10">

        {/* TEXTO */}
        <div>
          <h1 className="
            text-5xl md:text-6xl font-bold
            /* Texto blanco con sombra para que se lea sobre el amarillo */
            text-white
            drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]
            leading-tight
          ">
            Formación de{" "}
            <span className="
              /* Usamos el azul del logo aquí para que resalte sobre el fondo cálido */
              text-[#00558A]
            ">
              trabajo en alturas
            </span>{" "}
            y seguridad industrial.
          </h1>

          <p className="
            mt-6 text-lg font-medium
            text-white drop-shadow-sm
          ">
            Cursos certificados, reentrenamiento y validación oficial de competencias 
            bajo normativa colombiana.
          </p>

          {/* BOTONES */}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/cursos"
              className="
                px-8 py-4 rounded-full font-bold
                bg-white text-[#8B2323]
                shadow-xl hover:bg-[#00558A] hover:text-white
                hover:scale-[1.05] transition-all
              "
            >
              Ver cursos
            </Link>

            <Link
              href="/certificados"
              className="
                px-8 py-4 rounded-full font-semibold
                border-2 border-white text-white
                hover:bg-white/20 transition-all
              "
            >
              Consultar certificado
            </Link>
          </div>
        </div>

        {/* BLOQUE VISUAL (LOGO) */}
        <div className="flex justify-center items-center relative">
          <div className="relative group">
            {/* Círculo de contraste detrás del logo para que no se pierda en el amarillo */}
            <div className="absolute inset-0 bg-black/10 blur-[80px] rounded-full"></div>
            
            <Image
              src="/logo-negro.png" 
              alt="Logo"
              width={420}
              height={420}
              /* Usamos el logo negro aquí porque el fondo termina en amarillo claro */
              className="object-contain relative z-10 drop-shadow-2xl animate-glow"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}