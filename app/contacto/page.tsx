"use client";

import { useState } from "react";
import { FaUser, FaBuilding, FaCalendarAlt, FaUsers, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const cursos = [
  { titulo: "Trabajo en alturas – Nivel básico", icono: "🪜" },
  { titulo: "Trabajo en alturas – Nivel avanzado", icono: "🏗️" },
  { titulo: "Reentrenamiento en trabajo en alturas", icono: "🔄" },
  { titulo: "Jefes de área", icono: "👷‍♂️" },
  { titulo: "Trabajador autorizado", icono: "🦺" },
  { titulo: "Coordinador de trabajo en alturas", icono: "📋" },
  { titulo: "Autorización de coordinador", icono: "✅" },
  { titulo: "Armado de andamios", icono: "🔩" },
  { titulo: "Andamios", icono: "🏗️" },
  { titulo: "Rescate industrial", icono: "🚑" },
];

export default function Contacto() {
  const [tipoCliente, setTipoCliente] = useState("persona"); // 'persona' o 'empresa'
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    empresa: "",
    cantidadPersonas: "1",
    curso: "",
    disponibilidad: "",
    mensaje: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar a tu API o EmailJS
    console.log("Datos enviados:", { ...formData, tipoCliente });
    alert("¡Cotización enviada con éxito! Nos contactaremos pronto.");
  };

  return (
    <main className="min-h-screen pb-20">
      {/* HEADER DE CONTACTO */}
      <div className="pt-32 pb-20 text-center text-white px-6">
        <h1 className="text-black text-4xl md:text-5xl font-bold">Cotiza tu formación</h1>
        <p className="mt-4 text-black max-w-2xl mx-auto">
          Completa el formulario y recibe una propuesta personalizada para tu certificación en alturas.
        </p>
      </div>

      <div className="max-w-4xl mx-auto -mt-10 px-6">
        <form 
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-100"
        >
          {/* SELECTOR: PERSONA O EMPRESA */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-10">
            <button
              type="button"
              onClick={() => setTipoCliente("persona")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                tipoCliente === "persona" ? "bg-[#00558A] text-white shadow-lg" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <FaUser /> Soy Particular
            </button>
            <button
              type="button"
              onClick={() => setTipoCliente("empresa")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                tipoCliente === "empresa" ? "bg-[#00558A] text-white shadow-lg" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <FaBuilding /> Somos Empresa
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* NOMBRE */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Nombre Completo</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  className="text-black w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] outline-none transition-all"
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                />
              </div>
            </div>

            {/* TELÉFONO */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Teléfono / WhatsApp</label>
              <div className="relative">
                <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  type="tel"
                  placeholder="300 000 0000"
                  className="text-black w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] outline-none transition-all"
                  onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                />
              </div>
            </div>

            {/* LÓGICA DE EMPRESA: NOMBRE DE EMPRESA Y CANTIDAD */}
            {tipoCliente === "empresa" && (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Nombre de la Empresa</label>
                  <div className="relative">
                    <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      required
                      type="text"
                      className="text-black w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] outline-none transition-all"
                      onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">N° de Trabajadores</label>
                  <div className="relative">
                    <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      className="text-black w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] outline-none transition-all"
                      onChange={(e) => setFormData({...formData, cantidadPersonas: e.target.value})}
                    />
                  </div>
                </div>
              </>
            )}

            {/* SELECCIÓN DE CURSO */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Curso de Interés</label>
              <select
                required
                className="text-black w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] outline-none transition-all appearance-none cursor-pointer"
                onChange={(e) => setFormData({...formData, curso: e.target.value})}
              >
                <option value="">Selecciona un curso...</option>
                {cursos.map((c, idx) => (
                  <option key={idx} value={c.titulo}>
                    {c.icono} {c.titulo}
                  </option>
                ))}
              </select>
            </div>

            {/* DISPONIBILIDAD */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Disponibilidad (Fecha aproximada o Turno)</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ej: Próxima semana, fines de semana, mañana..."
                  className="text-black w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#FFD700] outline-none transition-all"
                  onChange={(e) => setFormData({...formData, disponibilidad: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* BOTÓN SUBMIT */}
          <button
            type="submit"
            className="mt-10 w-full py-4 bg-[#FFD700] hover:bg-green-400 text-white hover:text-white font-bold text-lg rounded-2xl shadow-lg shadow-yellow-200 hover:shadow-blue-200 transition-all transform hover:-translate-y-1"
          >
            Solicitar Precios y Disponibilidad
          </button>
        </form>
      </div>
    </main>
  );
}