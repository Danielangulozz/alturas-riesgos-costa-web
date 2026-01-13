"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import Link from "next/link";
import { 
  FaUser, FaIdCard, FaBuilding, FaPhone, FaEnvelope, 
  FaCalendarAlt, FaClock, FaCheckCircle, FaFileUpload, 
  FaMapMarkerAlt, FaVenusMars, FaHome, FaUserTie, FaMapSigns, FaExclamationTriangle
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
      const { data, error } = await supabase
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
        empresa: tipoCliente === "Empresa" ? formData.empresa : "Particular",
        nit: tipoCliente === "Empresa" ? formData.nit : "N/A",
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

  // --- VISTA 2: CONFIRMACIÓN ---
  if (confirmar) {
    return (
      <div className="mt-32 mb-20 max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-[#1E3A8A] p-8 text-center text-white">
          <FaExclamationTriangle className="text-[#FFD700] text-4xl mx-auto mb-2" />
          <h2 className="text-2xl font-black uppercase">Confirmar Registro</h2>
        </div>
        <div className="p-8 space-y-6">
          <div className="bg-slate-100 p-8 rounded-3xl border-2 border-slate-200 text-slate-900">
            <p className="mb-2"><b>Estudiante:</b> {formData.nombre}</p>
            <p className="mb-2"><b>Cédula:</b> {formData.cedula}</p>
            <p className="mb-2"><b>Edad:</b> {calcularEdad(formData.fecha_nacimiento)} años</p>
            <p className="mb-2 text-blue-800"><b>Curso:</b> {formData.curso}</p>
          </div>
          <div className="flex items-start gap-4 p-5 bg-amber-50 rounded-2xl border-2 border-amber-200">
            <input type="checkbox" className="mt-1 w-8 h-8 accent-[#1E3A8A]" checked={formData.acepta_datos} onChange={(e) => setFormData({...formData, acepta_datos: e.target.checked})} />
            <p className="text-[11px] text-slate-900 font-bold uppercase">Acepto Tratamiento de Datos (Obligatorio)</p>
          </div>
          <button disabled={loading || !formData.acepta_datos} onClick={guardarEnBaseDeDatos} className={`w-full py-5 rounded-2xl font-black uppercase shadow-xl ${formData.acepta_datos ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
            {loading ? "GUARDANDO..." : "CONFIRMAR Y GUARDAR"}
          </button>
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
            {["Particular", "Empresa"].map((tipo) => (
              <button key={tipo} type="button" onClick={() => setTipoCliente(tipo)}
                className={`flex-1 py-4 rounded-xl font-black text-xs uppercase ${tipoCliente === tipo ? 'bg-[#1E3A8A] text-white shadow-lg' : 'text-slate-500'}`}>
                {tipo === "Particular" ? "Yo Mismo" : "Mi Empresa"}
              </button>
            ))}
          </div>
        </div>

        {/* DATOS BÁSICOS */}
        <div className="grid md:grid-cols-2 gap-5">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-700 uppercase">Nombre Completo *</label>
            <input required className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-700 uppercase">Cédula *</label>
            <input required type="number" className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, cedula: e.target.value})} />
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
            <input required className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, direccion: e.target.value})} />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-700 uppercase">Barrio *</label>
            <input required className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, barrio: e.target.value})} />
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

        <button type="submit" className="w-full bg-[#FFD700] text-[#0F172A] py-5 rounded-2xl font-black uppercase shadow-xl hover:bg-[#E6C200] transition-all">
          CONTINUAR A CONFIRMACIÓN
        </button>
      </form>
    </div>
  );
}