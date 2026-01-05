"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { FaUser, FaIdCard, FaBuilding, FaPhone, FaEnvelope, FaCalendarAlt, FaClock } from "react-icons/fa";

export default function FormPreInscripcion() {
  const [loading, setLoading] = useState(false);
  const [tipoCliente, setTipoCliente] = useState("Particular");
  
  const [formData, setFormData] = useState({
    nombre: "",
    cedula: "",
    edad: "",
    telefono: "",
    email: "",
    curso: "",
    empresa: "",
    nit: "",
    horario_preferencia: "",
    acepta_datos: false
  });

  const opcionesHorario = [
    "Mañana (07:00 AM - 12:00 PM)",
    "Tarde (01:00 PM - 06:00 PM)",
    "Jornada Continua (Sábados)",
    "Por confirmar con asesor"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acepta_datos) return toast.error("Debes aceptar el tratamiento de datos");
    
    setLoading(true);
    const tId = toast.loading("Enviando pre-inscripción...");

    const { error } = await supabase.from('solicitudes').insert([{
      ...formData,
      tipo_cliente: tipoCliente,
      estado_proceso: 'Pre-inscrito',
      created_at: new Date()
    }]);

    if (error) {
      toast.error("Error: " + error.message, { id: tId });
    } else {
      toast.success("¡Pre-inscripción exitosa!", { id: tId });
    }
    setLoading(false);
  };

  return (
    /* mt-32 arregla el choque con el navbar, pb-20 da espacio abajo */
    <div className="mt-32 mb-20 max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
      
      {/* Header Form */}
      <div className="bg-[#0F172A] p-8 text-center">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Pre-Inscripción</h2>
        <p className="text-blue-300 text-sm mt-2">Inicia tu proceso de certificación hoy mismo</p>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        
        {/* Selector Tipo Cliente */}
        <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl">
          {["Particular", "Empresa"].map((tipo) => (
            <button
              key={tipo}
              type="button"
              onClick={() => setTipoCliente(tipo)}
              className={`flex-1 py-3 rounded-xl font-bold transition-all ${tipoCliente === tipo ? 'bg-[#1E3A8A] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}
            >
              {tipo}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Nombre Completo *</label>
            <div className="relative">
              <FaUser className="absolute left-3 top-4 text-slate-400" />
              <input 
                required 
                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1E3A8A] focus:bg-white text-slate-900 font-semibold" 
                onChange={(e) => setFormData({...formData, nombre: e.target.value})} 
              />
            </div>
          </div>

          {/* Cédula */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Documento / Cédula *</label>
            <div className="relative">
              <FaIdCard className="absolute left-3 top-4 text-slate-400" />
              <input 
                required 
                type="number" 
                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1E3A8A] focus:bg-white text-slate-900 font-semibold" 
                onChange={(e) => setFormData({...formData, cedula: e.target.value})} 
              />
            </div>
          </div>

          {/* Edad */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Edad *</label>
            <input 
              required 
              type="number" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1E3A8A] focus:bg-white text-slate-900 font-semibold" 
              onChange={(e) => setFormData({...formData, edad: e.target.value})} 
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Teléfono WhatsApp *</label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-4 text-slate-400" />
              <input 
                required 
                type="tel" 
                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1E3A8A] focus:bg-white text-slate-900 font-semibold" 
                onChange={(e) => setFormData({...formData, telefono: e.target.value})} 
              />
            </div>
          </div>

          {/* Email */}
          <div className="md:col-span-2 space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Correo Electrónico *</label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-4 text-slate-400" />
              <input 
                required 
                type="email" 
                className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1E3A8A] focus:bg-white text-slate-900 font-semibold" 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
              />
            </div>
          </div>

          {/* SI ES EMPRESA */}
          {tipoCliente === "Empresa" && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Empresa *</label>
                <div className="relative">
                  <FaBuilding className="absolute left-3 top-4 text-slate-400" />
                  <input required className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1E3A8A] focus:bg-white text-slate-900 font-semibold" 
                    onChange={(e) => setFormData({...formData, empresa: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">NIT *</label>
                <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1E3A8A] focus:bg-white text-slate-900 font-semibold" 
                  onChange={(e) => setFormData({...formData, nit: e.target.value})} />
              </div>
            </>
          )}

          {/* CURSO */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Curso *</label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-4 text-slate-400 z-10" />
              <select required className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1E3A8A] focus:bg-white text-slate-900 font-bold"
                onChange={(e) => setFormData({...formData, curso: e.target.value})}>
                <option value="">Selecciona curso...</option>
                <option value="Trabajador Autorizado">Trabajador Autorizado (32h)</option>
                <option value="Reentrenamiento">Reentrenamiento (8h)</option>
                <option value="Coordinador">Coordinador en Alturas (80h)</option>
                <option value="Jefe de Area">Jefe de Área (8h)</option>
              </select>
            </div>
          </div>

          {/* HORARIO */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Horario *</label>
            <div className="relative">
              <FaClock className="absolute left-3 top-4 text-slate-400 z-10" />
              <select required className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#1E3A8A] focus:bg-white text-slate-900 font-bold"
                onChange={(e) => setFormData({...formData, horario_preferencia: e.target.value})}>
                <option value="">Selecciona jornada...</option>
                {opcionesHorario.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* TRATAMIENTO DE DATOS */}
        <div className="flex items-start gap-3 pt-4">
          <input 
            type="checkbox" 
            required 
            id="datos" 
            className="mt-1 w-5 h-5 accent-[#1E3A8A] cursor-pointer"
            onChange={(e) => setFormData({...formData, acepta_datos: e.target.checked})}
          />
          <label htmlFor="datos" className="text-xs text-slate-700 leading-tight cursor-pointer select-none">
            Autorizo a <b>Alturas y Riesgos de la Costa S.A.S</b> el tratamiento de mis datos personales para fines de inscripción y certificación bajo la Ley 1581 de 2012.
          </label>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-[#FFD700] text-[#0F172A] py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-[#E6C200] transition-all shadow-xl disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Completar Pre-Inscripción"}
        </button>
      </form>
    </div>
  );
}