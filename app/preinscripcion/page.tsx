"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import Link from "next/link";
import { 
  FaCheckCircle, FaFileUpload, FaExclamationTriangle, FaShieldAlt, FaExternalLinkAlt
} from "react-icons/fa";

export default function FormPreInscripcion() {
  const [loading, setLoading] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [idSolicitud, setIdSolicitud] = useState("");
  const [tipoCliente, setTipoCliente] = useState("Particular");
  const [catalogoCursos, setCatalogoCursos] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nombre: "",
    cedula: "",
    fecha_nacimiento: "",
    sexo: "",
    telefono: "",
    email: "",
    direccion: "", 
    barrio: "",
    curso: "",
    empresa: "", 
    nit: "",    
    horario_preferencia: "",
    acepta_datos: false
  });

  useEffect(() => {
    const fetchCursos = async () => {
      const { data } = await supabase
        .from('configuracion_cursos')
        .select('*')
        .order('nombre_curso', { ascending: true });
      if (data) setCatalogoCursos(data);
    };
    fetchCursos();
  }, []);

  const opcionesHorario = [
    "Lunes a Miércoles (07:00 AM - 05:00 PM)",
    "Jueves a Sábado (07:00 AM - 05:00 PM)",
    "Horario Especial (A convenir)"
  ];

  const calcularEdad = (fecha: string) => {
    if (!fecha) return "";
    const hoy = new Date();
    const cumple = new Date(fecha);
    let edad = hoy.getFullYear() - cumple.getFullYear();
    const m = hoy.getMonth() - cumple.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < cumple.getDate())) edad--;
    return edad.toString();
  };

  const guardarEnBaseDeDatos = async () => {
    if (!formData.acepta_datos) {
        return toast.error("Debes aceptar la política de privacidad.");
    }

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
        acepta_datos: formData.acepta_datos, // ESTO ES VITAL GUARDARLO
        sexo: formData.sexo,
        fecha_nacimiento: formData.fecha_nacimiento,
        ciudad_residencia: formData.direccion,
        barrio: formData.barrio,
        tipo_cliente: tipoCliente,
        empresa: tipoCliente === "Empresa" ? formData.empresa : "Independiente",
        nit: tipoCliente === "Empresa" ? formData.nit : " ",
        estado_proceso: 'Pre-inscrito',
        resultado_final: 'Pendiente',
        precio_pactado: cursoData ? cursoData.precio_base.toString() : "0"
      };

      const { data, error } = await supabase.from('preinscripciones').insert([payload]).select();
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

  // --- VISTA 3: ÉXITO ---
  if (enviado) {
    return (
      <div className="mt-32 mb-20 max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in">
        <div className="bg-emerald-600 p-10 text-center text-white">
          <FaCheckCircle className="text-7xl mx-auto mb-4 animate-bounce" />
          <h2 className="text-3xl font-black uppercase">¡Registro Exitoso!</h2>
        </div>
        <div className="p-10 text-center space-y-6">
          <div className="bg-slate-50 p-8 rounded-3xl border-2 border-dashed border-slate-200">
            <h3 className="text-xl font-bold text-slate-800">¿Subir documentos ahora?</h3>
            <Link href={`registro/?id=${idSolicitud}&nombre=${encodeURIComponent(formData.nombre)}`}
              className="mt-4 flex items-center justify-center gap-3 px-10 py-5 bg-[#FFD700] text-[#0F172A] rounded-2xl font-black uppercase shadow-xl hover:scale-105 transition-all">
              <FaFileUpload size={22} /> Sí, subir archivos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA 2: CONFIRMACIÓN (AQUÍ ESTÁ EL CAMBIO IMPORTANTE) ---
  if (confirmar) {
    return (
      <div className="mt-32 mb-20 max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-2">
        <div className="bg-[#1E3A8A] p-8 text-center text-white">
          <FaExclamationTriangle className="text-[#FFD700] text-4xl mx-auto mb-2" />
          <h2 className="text-2xl font-black uppercase">Confirmar Registro</h2>
        </div>
        
        <div className="p-8 space-y-6">
          {/* Resumen de Datos */}
          <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-slate-700 text-sm space-y-2">
            <p className="flex justify-between border-b border-slate-200 pb-2"><span>Estudiante:</span> <b className="text-slate-900 uppercase">{formData.nombre}</b></p>
            <p className="flex justify-between border-b border-slate-200 pb-2"><span>Cédula:</span> <b className="text-slate-900">{formData.cedula}</b></p>
            <p className="flex justify-between border-b border-slate-200 pb-2"><span>Curso:</span> <b className="text-blue-700 uppercase">{formData.curso}</b></p>
            <p className="flex justify-between"><span>Tipo:</span> <b className="text-slate-900">{tipoCliente}</b></p>
          </div>

          {/* CHECKBOX LEGAL MEJORADO */}
          <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
             <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative flex items-center pt-1">
                    <input 
                        type="checkbox" 
                        className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-300 transition-all checked:border-blue-600 checked:bg-blue-600 hover:border-blue-400"
                        checked={formData.acepta_datos} 
                        onChange={(e) => setFormData({...formData, acepta_datos: e.target.checked})} 
                    />
                    <FaCheckCircle className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                
                <div className="text-xs text-slate-500 font-medium leading-relaxed">
                    <span className="font-bold text-slate-900 uppercase flex items-center gap-2 mb-1">
                        <FaShieldAlt className="text-blue-600"/> Autorización de Datos
                    </span>
                    De conformidad con la <strong className="text-slate-700">Ley 1581 de 2012</strong>, autorizo de manera libre y voluntaria a 
                    <strong> Alturas y Riesgos de la Costa S.A.S</strong> para el tratamiento de mis datos personales según la 
                    
                    <Link href="/privacidad" target="_blank" className="text-blue-600 hover:text-blue-800 font-bold mx-1 inline-flex items-center gap-0.5">
                        Política de Privacidad <FaExternalLinkAlt size={8}/>
                    </Link> 
                    y el 
                    <Link href="/datos" target="_blank" className="text-blue-600 hover:text-blue-800 font-bold mx-1 inline-flex items-center gap-0.5">
                         Manual de Tratamiento <FaExternalLinkAlt size={8}/>
                    </Link>.
                </div>
             </label>
          </div>

          <div className="grid gap-3">
             <button 
                disabled={loading || !formData.acepta_datos} 
                onClick={guardarEnBaseDeDatos} 
                className={`w-full py-5 rounded-2xl font-black uppercase shadow-xl transition-all ${
                    formData.acepta_datos 
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-[1.02]' 
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
             >
                {loading ? "GUARDANDO..." : "ACEPTAR Y FINALIZAR INSCRIPCIÓN"}
             </button>
             
             <button onClick={() => setConfirmar(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase py-2">
                Volver y corregir datos
             </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VISTA 1: FORMULARIO ---
  return (
    <div className="mt-32 mb-20 max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
      <div className="bg-[#0F172A] p-8 text-center text-white">
        <h2 className="text-3xl font-black uppercase">Pre-Inscripción</h2>
        <p className="text-blue-400 text-xs font-bold uppercase">Registro Oficial</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setConfirmar(true); }} className="p-8 space-y-6 bg-white">
        
        {/* CLIENTE */}
        <div className="space-y-3">
          <label className="text-[11px] font-black text-slate-700 uppercase">¿Quién paga el curso? *</label>
          <div className="flex gap-4 p-1.5 bg-slate-100 rounded-2xl">
            {["Independiente", "Empresa"].map((tipo) => (
              <button key={tipo} type="button" onClick={() => setTipoCliente(tipo)}
                className={`flex-1 py-4 rounded-xl font-black text-xs uppercase transition-all ${tipoCliente === tipo ? 'bg-[#1E3A8A] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}>
                {tipo === "Independiente" ? "Yo Mismo" : "Mi Empresa"}
              </button>
            ))}
          </div>
        </div>

        {/* DATOS BÁSICOS */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-700 uppercase">Nombre Completo *</label>
            <input required className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500 transition-colors" onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-700 uppercase">Cédula *</label>
            <input required type="number" className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500 transition-colors" onChange={(e) => setFormData({...formData, cedula: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-700 uppercase">F. Nacimiento *</label>
            <input required type="date" className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none" onChange={(e) => setFormData({...formData, fecha_nacimiento: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-700 uppercase">Género *</label>
            <select required className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none" onChange={(e) => setFormData({...formData, sexo: e.target.value})}>
              <option value="">Seleccionar...</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>
        </div>

        {/* UBICACIÓN */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-700 uppercase">Ciudad *</label>
            <input required className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500 transition-colors" onChange={(e) => setFormData({...formData, direccion: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-700 uppercase">Barrio *</label>
            <input required className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500 transition-colors" onChange={(e) => setFormData({...formData, barrio: e.target.value})} />
          </div>
        </div>

        {/* CONTACTO */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-700 uppercase">WhatsApp *</label>
            <input required type="tel" className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900" onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-700 uppercase">Correo *</label>
            <input required type="email" className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900" onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
        </div>

        {/* EMPRESA CONDICIONAL */}
        {tipoCliente === "Empresa" && (
          <div className="p-6 bg-blue-50 rounded-3xl border-2 border-blue-200 grid md:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
            <input required placeholder="Nombre Empresa" className="p-3.5 bg-white border border-blue-200 rounded-xl font-bold text-slate-900" onChange={(e) => setFormData({...formData, empresa: e.target.value})} />
            <input required placeholder="NIT" className="p-3.5 bg-white border border-blue-200 rounded-xl font-bold text-slate-900" onChange={(e) => setFormData({...formData, nit: e.target.value})} />
          </div>
        )}

        {/* CURSO DINÁMICO Y HORARIO */}
        <div className="grid md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-700 uppercase">Curso del Catálogo *</label>
            <select required className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none" value={formData.curso} onChange={(e) => setFormData({...formData, curso: e.target.value})}>
              <option value="">Seleccionar curso...</option>
              {catalogoCursos.map((c) => (
                <option key={c.id} value={c.nombre_curso}>{c.nombre_curso} ({c.horas_duracion})</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-700 uppercase">Horario Preferencia *</label>
            <select required className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none" onChange={(e) => setFormData({...formData, horario_preferencia: e.target.value})}>
              <option value="">Seleccionar jornada...</option>
              {opcionesHorario.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>

        <button type="submit" className="w-full bg-[#FFD700] text-[#0F172A] py-5 rounded-2xl font-black uppercase shadow-xl hover:bg-[#E6C200] transition-all hover:scale-[1.01]">
          CONTINUAR A CONFIRMACIÓN
        </button>
      </form>
    </div>
  );
}