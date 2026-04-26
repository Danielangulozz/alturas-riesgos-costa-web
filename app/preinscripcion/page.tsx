"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import {
  FaCheckCircle, FaFileUpload, FaExclamationTriangle,
  FaShieldAlt, FaExternalLinkAlt, FaArrowRight,
  FaUser, FaBuilding, FaIdCard, FaCalendarAlt,
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaBookOpen
} from "react-icons/fa";

// ─── Hook inView ───
function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, inView };
}

function AnimateIn({ children, delay = 0, from = "fadeUp", className = "" }: {
  children: React.ReactNode; delay?: number;
  from?: "fadeUp" | "fadeLeft" | "fadeIn"; className?: string;
}) {
  const { ref, inView } = useInView();
  const base: Record<string, string> = {
    fadeUp:  "translate-y-6 opacity-0",
    fadeLeft: "-translate-x-6 opacity-0",
    fadeIn:  "opacity-0",
  };
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${className} ${
        inView ? "translate-y-0 translate-x-0 opacity-100" : base[from]
      }`}
      style={{ transitionDelay: inView ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

// ─── Campo reutilizable ───
function Field({ label, icon, children, required }: {
  label: string; icon: React.ReactNode;
  children: React.ReactNode; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
        <span className="text-blue-500">{icon}</span>
        {label}{required && <span className="text-red-400">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-800 text-sm outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:font-normal placeholder:text-slate-400";

export default function FormPreInscripcion() {
  const [loading,       setLoading]       = useState(false);
  const [confirmar,     setConfirmar]     = useState(false);
  const [enviado,       setEnviado]       = useState(false);
  const [idSolicitud,   setIdSolicitud]   = useState("");
  const [tipoCliente,   setTipoCliente]   = useState("Independiente");
  const [catalogoCursos, setCatalogoCursos] = useState<any[]>([]);
  const [headerVisible, setHeaderVisible] = useState(false);

  const MUNICIPIOS_SUCRE = [
    "Sincelejo", "Buenavista", "Caimito", "Chalán", "Colosó", "Corozal", "Coveñas", "El Roble",
    "Galeras", "Guaranda", "La Unión", "Los Palmitos", "Majagual", "Morroa", "Ovejas", "Palmito",
    "Sampués", "San Benito Abad", "San Juan de Betulia", "San Marcos", "San Onofre", "San Pedro",
    "Sincé", "Sucre", "Tolú", "Toluviejo"
  ].sort();

  const BARRIOS_SINCELEJO = [
    "La Sabana", "Centro", "Majagual", "Florencia", "La Palma", "Las Peñitas", "El Cortijo", "El Bosque",
    "Pioneros", "Los Alpes", "Las Margaritas", "Boston", "San Vicente", "Camilo Torres", "El Cauca", "La María",
    "El Edén", "San Luis", "Bitar", "La Bucaramanga", "San Antonio", "Cielo Azul", "El Progreso", "La Fe",
    "La Pollita", "Mochila", "Los Libertadores", "Las Colinas", "Uribe Uribe"
  ].sort();

  const [formData, setFormData] = useState({
    nombre: "", cedula: "", fecha_nacimiento: "", sexo: "",
    telefono: "", email: "", direccion: "", barrio: "",
    curso: "", empresa: "", nit: "", horario_preferencia: "",
    acepta_datos: false,
    url_cc: "", url_arl: "", url_emo: "", url_eps: "", url_cert_altura: "", url_cert_sst: ""
  });

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    supabase.from("configuracion_cursos").select("*").order("nombre_curso", { ascending: true })
      .then(({ data }) => { if (data) setCatalogoCursos(data); });
  }, []);

  const calcularEdad = (fecha: string) => {
    if (!fecha) return "";
    const hoy = new Date();
    const cumple = new Date(fecha);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    const m = hoy.getMonth() - cumple.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) edad--;
    return edad.toString();
  };

  const buscarDatosPrevios = async (cedula: string) => {
    if (!cedula || cedula.length < 5) return;
    try {
      let { data } = await supabase.from("estudiantes")
        .select("*").eq("cedula", cedula).order("created_at", { ascending: false }).limit(1).maybeSingle();
      
      if (!data) {
        const { data: pre } = await supabase.from("preinscripciones")
          .select("*").eq("cedula", cedula).order("created_at", { ascending: false }).limit(1).maybeSingle();
        data = pre;
      }

      if (data) {
        toast.success(`¡Hola de nuevo ${data.nombre.split(" ")[0]}! Hemos cargado tus datos previos para facilitar el registro.`);
        setFormData(prev => ({
          ...prev,
          nombre: data.nombre || prev.nombre,
          fecha_nacimiento: data.fecha_nacimiento || prev.fecha_nacimiento,
          sexo: data.sexo || prev.sexo,
          telefono: data.telefono || prev.telefono,
          email: data.email || prev.email,
          direccion: data.ciudad_residencia || data.direccion || prev.direccion,
          barrio: data.barrio || prev.barrio,
          url_cc: data.url_cc || "",
          url_arl: "",
          url_emo: "",
          url_eps: "",
          url_cert_altura: "",
          url_cert_sst: "",
        }));
        if (data.tipo_cliente) setTipoCliente(data.tipo_cliente);
        if (data.empresa && data.tipo_cliente === "Empresa") {
           setFormData(prev => ({ ...prev, empresa: data.empresa, nit: data.nit || "" }));
        }
      }
    } catch (err) {
      console.error("Error buscando datos previos:", err);
    }
  };

  const guardarEnBaseDeDatos = async () => {
    if (!formData.acepta_datos) return toast.error("Debes aceptar la política de privacidad.");
    setLoading(true);
    try {
      const cursoData = catalogoCursos.find(c => c.nombre_curso === formData.curso);
      const payload = {
        nombre: formData.nombre,
        cedula: formData.cedula,
        edad: calcularEdad(formData.fecha_nacimiento),
        telefono: formData.telefono,
        email: formData.email,
        curso: formData.curso,
        horario_preferencia: formData.horario_preferencia,
        acepta_datos: formData.acepta_datos,
        sexo: formData.sexo,
        fecha_nacimiento: formData.fecha_nacimiento,
        ciudad_residencia: formData.direccion,
        barrio: formData.barrio,
        tipo_cliente: tipoCliente,
        empresa: tipoCliente === "Empresa" ? formData.empresa : "Independiente",
        nit: tipoCliente === "Empresa" ? formData.nit : " ",
        estado_proceso: "Pre-inscrito",
        resultado_final: "Pendiente",
        precio_pactado: cursoData ? cursoData.precio_base.toString() : "0",
        url_cc: formData.url_cc || null,
        url_arl: formData.url_arl || null,
        url_emo: formData.url_emo || null,
        url_eps: formData.url_eps || null,
        url_cert_altura: formData.url_cert_altura || null,
        url_cert_sst: formData.url_cert_sst || null,
      };
      const { data, error } = await supabase.from("preinscripciones").insert([payload]).select();
      if (error) throw error;
      setIdSolicitud(data[0].id);
      setEnviado(true);
      toast.success("¡Registro guardado!");
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const opcionesHorario = [
    "Lunes a Miércoles (07:00 AM - 05:00 PM)",
    "Jueves a Sábado (07:00 AM - 05:00 PM)",
    "Horario Especial (A convenir)",
  ];

  // ══════════════════════════════════════════
  // VISTA 3: ÉXITO
  // ══════════════════════════════════════════
  if (enviado) return (
    <section className="relative min-h-screen bg-slate-50 flex items-center justify-center px-4 py-20 overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[140px] opacity-60 -z-10 -mr-40 -mt-40 pointer-events-none" />

      <div className="max-w-md w-full bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Header verde */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-10 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaCheckCircle size={32}/>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight" style={{ letterSpacing: "-0.02em" }}>
            ¡Registro Exitoso!
          </h2>
          <p className="text-emerald-100 text-sm mt-2">
            Bienvenido, <strong className="text-white">{formData.nombre.split(" ")[0]}</strong>
          </p>
        </div>

        <div className="p-8 space-y-5">
          {/* Info curso */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Curso registrado</p>
            <p className="font-black text-slate-800 text-sm uppercase">{formData.curso}</p>
          </div>

          <div className="h-px bg-slate-100" />

          {/* CTA subir docs */}
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-700 text-center">
              ¿Tienes tus documentos a mano? Súbelos ahora y agiliza el proceso.
            </p>
            <Link
              href={`/registro?id=${idSolicitud}&nombre=${encodeURIComponent(formData.nombre)}`}
              className="group flex items-center justify-center gap-3 w-full py-4 bg-slate-900 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:-translate-y-0.5 shadow-xl"
            >
              <FaFileUpload size={14}/>
              Subir Documentos Ahora
              <FaArrowRight size={10} className="transition-transform group-hover:translate-x-1"/>
            </Link>
            <button
              onClick={() => {
                setEnviado(false); setConfirmar(false);
                setFormData({ 
                  nombre: "", cedula: "", fecha_nacimiento: "", sexo: "", telefono: "", email: "", direccion: "", barrio: "", curso: "", empresa: "", nit: "", horario_preferencia: "", acepta_datos: false,
                  url_cc: "", url_arl: "", url_emo: "", url_eps: "", url_cert_altura: "", url_cert_sst: ""
                });
              }}
              className="w-full py-3 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
            >
              Registrar otra persona
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  // ══════════════════════════════════════════
  // VISTA 2: CONFIRMACIÓN
  // ══════════════════════════════════════════
  if (confirmar) return (
    <section className="relative min-h-screen bg-slate-50 flex items-center justify-center px-4 py-20 overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[140px] opacity-60 -z-10 -mr-40 -mt-40 pointer-events-none" />

      <div className="max-w-md w-full bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-7 flex items-center gap-4">
          <div className="w-11 h-11 bg-amber-400/20 rounded-xl flex items-center justify-center text-amber-400 flex-shrink-0">
            <FaExclamationTriangle size={18}/>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Paso 2 de 2</p>
            <h2 className="text-lg font-black text-white uppercase" style={{ letterSpacing: "-0.01em" }}>
              Confirmar Registro
            </h2>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Resumen */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
            {[
              { label: "Estudiante", value: formData.nombre.toUpperCase() },
              { label: "Cédula",     value: formData.cedula },
              { label: "Curso",      value: formData.curso, highlight: true },
              { label: "Tipo",       value: tipoCliente },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                className={`flex items-center justify-between px-5 py-3.5 text-sm ${i < arr.length - 1 ? "border-b border-slate-100" : ""}`}
              >
                <span className="text-slate-400 font-bold text-xs uppercase tracking-wide">{row.label}</span>
                <span className={`font-black text-right max-w-[55%] ${row.highlight ? "text-blue-600" : "text-slate-800"}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Checkbox legal */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5">
            <label className="flex items-start gap-4 cursor-pointer">
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-slate-300 transition-all checked:border-blue-600 checked:bg-blue-600 hover:border-blue-400"
                  checked={formData.acepta_datos}
                  onChange={(e) => setFormData({ ...formData, acepta_datos: e.target.checked })}
                />
                <FaCheckCircle className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[9px] text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <div className="text-xs text-slate-500 leading-relaxed">
                <span className="flex items-center gap-1.5 font-black text-slate-800 uppercase text-[10px] tracking-widest mb-1.5">
                  <FaShieldAlt className="text-blue-600" size={10}/> Autorización de Datos Personales
                </span>
                De conformidad con la <strong className="text-slate-700">Ley 1581 de 2012</strong>, autorizo
                el tratamiento de mis datos a{" "}
                <strong>Alturas y Riesgos de la Costa S.A.S</strong> según la{" "}
                <Link href="/privacidad" target="_blank" className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-0.5">
                  Política de Privacidad <FaExternalLinkAlt size={8}/>
                </Link>{" "}y el{" "}
                <Link href="/datos" target="_blank" className="text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-0.5">
                  Manual de Tratamiento <FaExternalLinkAlt size={8}/>
                </Link>.
              </div>
            </label>
          </div>

          {/* Botones */}
          <div className="space-y-3">
            <button
              disabled={loading || !formData.acepta_datos}
              onClick={guardarEnBaseDeDatos}
              className={`group w-full py-4 rounded-2xl font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 transition-all shadow-lg ${
                formData.acepta_datos
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white hover:-translate-y-0.5 shadow-emerald-200"
                  : "bg-slate-100 text-slate-300 cursor-not-allowed"
              }`}
            >
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Guardando...</>
                : <><FaCheckCircle size={13}/> Aceptar y Finalizar Inscripción</>
              }
            </button>
            <button
              onClick={() => setConfirmar(false)}
              className="w-full py-3 text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest transition-colors"
            >
              ← Volver y corregir datos
            </button>
          </div>
        </div>
      </div>
    </section>
  );

  // ══════════════════════════════════════════
  // VISTA 1: FORMULARIO
  // ══════════════════════════════════════════
  return (
    <>
      <style>{`
        @keyframes growWidth {
          from { width: 0; } to { width: 100%; }
        }
        .line-grow { animation: growWidth 0.9s cubic-bezier(.22,1,.36,1) 0.5s forwards; width: 0; }
      `}</style>

      <section className="relative min-h-screen bg-slate-50 overflow-x-hidden">
        <Toaster position="top-center"/>

        {/* Blobs */}
        <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[140px] opacity-60 -z-10 -mr-40 -mt-40 pointer-events-none" />
        <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-cyan-50 rounded-full blur-[120px] opacity-50 -z-10 -ml-32 pointer-events-none" />

        <div className="max-w-2xl mx-auto px-4 pt-28 pb-20">

          {/* Header */}
          <div
            className={`text-center mb-10 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-5">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"/>
              Formulario Oficial
            </div>
            <h1
              className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-4"
              style={{ letterSpacing: "-0.03em" }}
            >
              Pre-{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Inscripción
                </span>
                <span className="line-grow absolute -bottom-1 left-0 h-[3px] rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"/>
              </span>
            </h1>
            <p
              className={`text-slate-500 text-sm max-w-sm mx-auto leading-relaxed transition-all duration-700 delay-200 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            >
              Completa el formulario y reserva tu cupo. El proceso toma menos de 3 minutos.
            </p>
          </div>

          {/* Formulario */}
          <AnimateIn from="fadeUp" delay={100}>
            <form
              onSubmit={(e) => { e.preventDefault(); setConfirmar(true); }}
              className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
            >

              {/* Header del form */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6 flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400 flex-shrink-0">
                  <FaUser size={16}/>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Paso 1 de 2</p>
                  <h2 className="text-base font-black text-white uppercase" style={{ letterSpacing: "-0.01em" }}>
                    Datos del Estudiante
                  </h2>
                </div>
              </div>

              <div className="p-8 space-y-7">

                {/* Toggle tipo cliente */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    ¿Quién financia el curso? *
                  </label>
                  <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
                    {[
                      { id: "Independiente", icon: <FaUser size={12}/>,     label: "Yo Mismo" },
                      { id: "Empresa",       icon: <FaBuilding size={12}/>,  label: "Mi Empresa" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setTipoCliente(opt.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-xs uppercase tracking-wide transition-all duration-200 ${
                          tipoCliente === opt.id
                            ? "bg-slate-900 text-white shadow-lg"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-100"/>

                {/* Datos personales */}
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Nombre Completo" icon={<FaUser size={10}/>} required>
                    <input required placeholder="Ej: Juan Carlos Pérez" className={inputCls}
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}/>
                  </Field>
                  <Field label="Cédula" icon={<FaIdCard size={10}/>} required>
                    <input required type="number" placeholder="Ej: 1102839100" className={inputCls}
                      value={formData.cedula}
                      onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                      onBlur={(e) => buscarDatosPrevios(e.target.value)}
                    />
                  </Field>
                  <Field label="Fecha de Nacimiento" icon={<FaCalendarAlt size={10}/>} required>
                    <input required type="date" className={inputCls}
                      value={formData.fecha_nacimiento}
                      onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}/>
                  </Field>
                  <Field label="Género" icon={<FaUser size={10}/>} required>
                    <select required className={inputCls}
                      value={formData.sexo}
                      onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}>
                      <option value="">Seleccionar...</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </Field>
                </div>

                <div className="h-px bg-slate-100"/>

                {/* Ubicación */}
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Ciudad" icon={<FaMapMarkerAlt size={10}/>} required>
                    <input required list="municipios-sucre" placeholder="Ej: Sincelejo" className={inputCls}
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}/>
                    <datalist id="municipios-sucre">
                      {MUNICIPIOS_SUCRE.map(m => <option key={m} value={m} />)}
                    </datalist>
                  </Field>
                  <Field label="Barrio" icon={<FaMapMarkerAlt size={10}/>} required>
                    <input required list="barrios-sincelejo" placeholder="Ej: La Sabana" className={inputCls}
                      value={formData.barrio}
                      onChange={(e) => setFormData({ ...formData, barrio: e.target.value })}/>
                    <datalist id="barrios-sincelejo">
                      {BARRIOS_SINCELEJO.map(b => <option key={b} value={b} />)}
                    </datalist>
                  </Field>
                </div>

                <div className="h-px bg-slate-100"/>

                {/* Contacto */}
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="WhatsApp" icon={<FaPhoneAlt size={10}/>} required>
                    <input required type="tel" placeholder="3XX XXX XXXX" className={inputCls}
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}/>
                  </Field>
                  <Field label="Correo Electrónico" icon={<FaEnvelope size={10}/>} required>
                    <input required type="email" placeholder="correo@ejemplo.com" className={inputCls}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}/>
                  </Field>
                </div>

                {/* Empresa condicional */}
                {tipoCliente === "Empresa" && (
                  <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 grid md:grid-cols-2 gap-4">
                    <Field label="Nombre Empresa" icon={<FaBuilding size={10}/>} required>
                      <input required placeholder="Razón social" className={inputCls}
                        value={formData.empresa}
                        onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}/>
                    </Field>
                    <Field label="NIT" icon={<FaIdCard size={10}/>} required>
                      <input required placeholder="900.XXX.XXX-X" className={inputCls}
                        value={formData.nit}
                        onChange={(e) => setFormData({ ...formData, nit: e.target.value })}/>
                    </Field>
                  </div>
                )}

                <div className="h-px bg-slate-100"/>

                {/* Curso y horario */}
                <div className="grid md:grid-cols-2 gap-5">
                  <Field label="Curso" icon={<FaBookOpen size={10}/>} required>
                    <select required className={inputCls} value={formData.curso}
                      onChange={(e) => setFormData({ ...formData, curso: e.target.value })}>
                      <option value="">Seleccionar curso...</option>
                      {catalogoCursos.map((c) => (
                        <option key={c.id} value={c.nombre_curso}>
                          {c.nombre_curso} ({c.horas_duracion})
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Horario de Preferencia" icon={<FaCalendarAlt size={10}/>} required>
                    <select required className={inputCls}
                      onChange={(e) => setFormData({ ...formData, horario_preferencia: e.target.value })}>
                      <option value="">Seleccionar jornada...</option>
                      {opcionesHorario.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                <div className="h-px bg-slate-100"/>

                {/* Botón submit */}
                <button
                  type="submit"
                  className="group w-full py-4 bg-[#FFD700] hover:bg-white text-[#0F172A] rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-3"
                >
                  Continuar a Confirmación
                  <FaArrowRight size={12} className="transition-transform group-hover:translate-x-1"/>
                </button>

                <p className="text-center text-xs text-slate-400 font-medium">
                  Tus datos están protegidos bajo la Ley 1581 de 2012.
                </p>
              </div>
            </form>
          </AnimateIn>

        </div>
      </section>
    </>
  );
}