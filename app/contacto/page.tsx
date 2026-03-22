"use client";

import { useState, useEffect, useRef } from "react";
import {
  FaUser, FaBuilding, FaCalendarAlt, FaPhoneAlt,
  FaPlus, FaTrash, FaClipboardList, FaArrowRight, FaCheckCircle
} from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";

// ─── Hook inView (mismo sistema que las otras páginas) ───
function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, inView };
}

function AnimateIn({ children, delay = 0, from = "fadeUp", className = "" }: {
  children: React.ReactNode; delay?: number;
  from?: "fadeUp" | "fadeLeft" | "fadeRight" | "fadeIn"; className?: string;
}) {
  const { ref, inView } = useInView();
  const base: Record<string, string> = {
    fadeUp:    "translate-y-6 opacity-0",
    fadeLeft:  "-translate-x-6 opacity-0",
    fadeRight: "translate-x-6 opacity-0",
    fadeIn:    "opacity-0",
  };
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className} ${inView ? "translate-y-0 translate-x-0 opacity-100" : base[from]}`}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

const cursosCatalogo = [
  { titulo: "Trabajo en alturas – Nivel básico",       icono: "🪜" },
  { titulo: "Trabajo en alturas – Nivel avanzado",     icono: "🏗️" },
  { titulo: "Reentrenamiento en trabajo en alturas",   icono: "🔄" },
  { titulo: "Jefes de área",                           icono: "👷‍♂️" },
  { titulo: "Trabajador autorizado",                   icono: "🦺" },
  { titulo: "Coordinador de trabajo en alturas",       icono: "📋" },
  { titulo: "Autorización de coordinador",             icono: "✅" },
  { titulo: "Armado de andamios",                      icono: "🔩" },
  { titulo: "Andamios",                                icono: "🏗️" },
  { titulo: "Rescate industrial",                      icono: "🚑" },
];

const beneficios = [
  { icon: <FaCheckCircle className="text-emerald-500" />, texto: "Respuesta en menos de 2 horas" },
  { icon: <FaCheckCircle className="text-emerald-500" />, texto: "Propuesta personalizada sin costo" },
  { icon: <FaCheckCircle className="text-emerald-500" />, texto: "Certificación bajo Res. 4272 / 2021" },
];

export default function Contacto() {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [tipoCliente, setTipoCliente] = useState<"persona" | "empresa">("persona");
  const [listaCursosEmpresa, setListaCursosEmpresa] = useState([{ curso: "", cantidad: "1" }]);
  const [formData, setFormData] = useState({
    nombre: "", telefono: "", empresa: "", cursoIndividual: "", disponibilidad: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const agregarCurso = () =>
    setListaCursosEmpresa([...listaCursosEmpresa, { curso: "", cantidad: "1" }]);

  const eliminarCurso = (i: number) =>
    setListaCursosEmpresa(listaCursosEmpresa.filter((_, idx) => idx !== i));

  const actualizarCurso = (i: number, campo: string, valor: string) => {
    const next = [...listaCursosEmpresa];
    next[i] = { ...next[i], [campo]: valor };
    setListaCursosEmpresa(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    const tId = toast.loading("Enviando solicitud...");

    const totalPersonas = tipoCliente === "empresa"
      ? listaCursosEmpresa.reduce((acc, c) => acc + parseInt(c.cantidad || "0"), 0)
      : 1;

    const { error } = await supabase.from("solicitudes").insert([{
      nombre: formData.nombre,
      telefono: formData.telefono,
      tipo_cliente: tipoCliente === "empresa" ? "Empresa" : "Persona",
      empresa: tipoCliente === "empresa" ? formData.empresa : "N/A",
      numero_personas: totalPersonas,
      curso: tipoCliente === "empresa" ? listaCursosEmpresa[0].curso : formData.cursoIndividual,
      cursos_detalles: tipoCliente === "empresa" ? listaCursosEmpresa : null,
      disponibilidad_cliente: formData.disponibilidad,
    }]);

    setEnviando(false);

    if (error) {
      toast.error("Error al enviar: " + error.message, { id: tId });
    } else {
      toast.dismiss(tId);
      setEnviado(true);
      setFormData({ nombre: "", telefono: "", empresa: "", cursoIndividual: "", disponibilidad: "" });
      setListaCursosEmpresa([{ curso: "", cantidad: "1" }]);
    }
  };

  return (
    <>
      <style jsx global>{`
        @keyframes growWidth {
          from { width: 0; } to { width: 100%; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRow {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .line-grow     { animation: growWidth 0.9s cubic-bezier(.22,1,.36,1) 0.5s forwards; width: 0; }
        .slide-in-row  { animation: slideInRow 0.4s cubic-bezier(.22,1,.36,1) forwards; }
      `}</style>

      <main className="min-h-screen bg-slate-50 overflow-x-hidden">
        <Toaster position="top-center" />

        {/* ── HERO ── */}
        <section className="relative pt-32 pb-16 px-6 overflow-hidden">
          {/* Blob decorativo */}
          <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-blue-50 rounded-full blur-[120px] opacity-70 -z-10 -mr-32 -mt-32 pointer-events-none" />

          <div
            className={`max-w-3xl mx-auto text-center transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Solicitud de Cotización
            </div>

            <h1
              className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-5"
              style={{ letterSpacing: "-0.03em" }}
            >
              Cotiza tu{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Formación
                </span>
                <span className="absolute -bottom-1 left-0 h-1 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 line-grow" />
              </span>
            </h1>

            <p
              className={`text-lg text-slate-500 max-w-xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              Recibe una propuesta personalizada para tu certificación en alturas.
              Sin compromiso, en menos de 2 horas.
            </p>

            {/* Beneficios rápidos */}
            <div
              className={`flex flex-wrap justify-center gap-4 mt-8 transition-all duration-700 delay-300 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              {beneficios.map((b, i) => (
                <div key={i} className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-full shadow-sm text-sm font-medium text-slate-600">
                  {b.icon} {b.texto}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FORMULARIO ── */}
        <div className="max-w-2xl mx-auto px-6 pb-28">
          <AnimateIn from="fadeUp" delay={100}>

            {/* Estado enviado */}
            {enviado ? (
              <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-16 text-center">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheckCircle className="text-emerald-500 text-4xl" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-3" style={{ letterSpacing: "-0.02em" }}>
                  ¡Solicitud Enviada!
                </h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  Recibimos tu cotización. Un asesor te contactará por WhatsApp en menos de 2 horas.
                </p>
                <button
                  onClick={() => setEnviado(false)}
                  className="px-8 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all"
                >
                  Nueva Solicitud
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 md:p-10 space-y-8"
              >

                {/* Toggle tipo cliente */}
                <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                  {[
                    { id: "persona", icon: <FaUser size={13}/>, label: "Soy Particular" },
                    { id: "empresa", icon: <FaBuilding size={13}/>, label: "Somos Empresa" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTipoCliente(opt.id as "persona" | "empresa")}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm uppercase tracking-wide transition-all duration-200 ${
                        tipoCliente === opt.id
                          ? "bg-slate-900 text-white shadow-lg"
                          : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>

                {/* Campos */}
                <div className="space-y-5">

                  {/* Nombre */}
                  <Field label="Nombre del Contacto" icon={<FaUser size={13}/>}>
                    <input
                      required type="text"
                      value={formData.nombre}
                      placeholder="Ej: Juan Pérez"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 text-sm font-medium"
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    />
                  </Field>

                  {/* Teléfono */}
                  <Field label="WhatsApp de Contacto" icon={<FaPhoneAlt size={13}/>}>
                    <input
                      required type="tel"
                      value={formData.telefono}
                      placeholder="300 000 0000"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 text-sm font-medium"
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </Field>

                  {/* Empresa (condicional) */}
                  {tipoCliente === "empresa" && (
                    <Field label="Razón Social / Empresa" icon={<FaBuilding size={13}/>}>
                      <input
                        required type="text"
                        value={formData.empresa}
                        placeholder="Nombre de la empresa"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 text-sm font-medium"
                        onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                      />
                    </Field>
                  )}

                  {/* Cursos */}
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <FaClipboardList className="text-blue-500" size={12}/> Cursos Requeridos
                    </label>

                    {tipoCliente === "persona" ? (
                      <select
                        required
                        value={formData.cursoIndividual}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 text-sm font-medium"
                        onChange={(e) => setFormData({ ...formData, cursoIndividual: e.target.value })}
                      >
                        <option value="">Selecciona un curso...</option>
                        {cursosCatalogo.map((c, i) => (
                          <option key={i} value={c.titulo}>{c.icono} {c.titulo}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="space-y-3">
                        {listaCursosEmpresa.map((item, idx) => (
                          <div key={idx} className="flex gap-2 items-center slide-in-row">
                            <select
                              required
                              value={item.curso}
                              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 text-sm font-medium"
                              onChange={(e) => actualizarCurso(idx, "curso", e.target.value)}
                            >
                              <option value="">Seleccionar curso...</option>
                              {cursosCatalogo.map((c, i) => (
                                <option key={i} value={c.titulo}>{c.icono} {c.titulo}</option>
                              ))}
                            </select>

                            {/* Input cantidad */}
                            <div className="relative flex-shrink-0">
                              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={10}/>
                              <input
                                type="number" min="1"
                                value={item.cantidad}
                                className="w-20 pl-8 pr-2 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 text-sm font-bold text-center"
                                onChange={(e) => actualizarCurso(idx, "cantidad", e.target.value)}
                              />
                            </div>

                            {listaCursosEmpresa.length > 1 && (
                              <button
                                type="button"
                                onClick={() => eliminarCurso(idx)}
                                className="p-3 text-red-400 bg-red-50 rounded-xl hover:bg-red-100 transition-colors flex-shrink-0"
                              >
                                <FaTrash size={12}/>
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={agregarCurso}
                          className="flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest hover:text-blue-800 transition-colors mt-1"
                        >
                          <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaPlus size={8}/>
                          </div>
                          Agregar otro curso
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Disponibilidad */}
                  <Field label="Tu Disponibilidad (Opcional)" icon={<FaCalendarAlt size={13}/>}>
                    <input
                      type="text"
                      value={formData.disponibilidad}
                      placeholder="Ej: Mañanas, fines de semana, fecha específica..."
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800 text-sm font-medium"
                      onChange={(e) => setFormData({ ...formData, disponibilidad: e.target.value })}
                    />
                  </Field>
                </div>

                {/* Divider */}
                <div className="h-px bg-slate-100" />

                {/* Submit */}
                <button
                  type="submit"
                  disabled={enviando}
                  className="group w-full py-4 bg-slate-900 hover:bg-blue-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-wait"
                >
                  {enviando ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Solicitar Cotización {tipoCliente === "empresa" ? "Corporativa" : "Personal"}
                      <FaArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-slate-400 font-medium">
                  Al enviar aceptas que un asesor te contacte por WhatsApp.
                </p>
              </form>
            )}
          </AnimateIn>
        </div>
      </main>
    </>
  );
}

// ─── Campo con ícono reutilizable ───
function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
        <span className="text-blue-500">{icon}</span> {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}