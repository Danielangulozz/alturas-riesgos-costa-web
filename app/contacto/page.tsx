"use client";

import { useState } from "react";
import { FaUser, FaBuilding, FaCalendarAlt, FaUsers, FaPhoneAlt, FaPlus, FaTrash, FaClipboardList } from "react-icons/fa";
import { supabase } from "@/lib/supabase"; 
import toast, { Toaster } from "react-hot-toast"; 

const cursosCatalogo = [
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
  const [tipoCliente, setTipoCliente] = useState("persona"); 
  const [listaCursosEmpresa, setListaCursosEmpresa] = useState([{ curso: "", cantidad: "1" }]);
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    empresa: "",
    cursoIndividual: "",
    disponibilidad: "",
  });

  // Funciones para manejar múltiples cursos (Empresas)
  const agregarCurso = () => setListaCursosEmpresa([...listaCursosEmpresa, { curso: "", cantidad: "1" }]);
  
  const eliminarCurso = (index: number) => {
    const nuevaLista = listaCursosEmpresa.filter((_, i) => i !== index);
    setListaCursosEmpresa(nuevaLista);
  };

  const actualizarCursoEmpresa = (index: number, campo: string, valor: string) => {
    const nuevaLista = [...listaCursosEmpresa];
    nuevaLista[index] = { ...nuevaLista[index], [campo]: valor };
    setListaCursosEmpresa(nuevaLista);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading("Enviando solicitud...");

    // Si es empresa, calculamos el total de personas sumando las cantidades de cada curso
    const totalPersonas = tipoCliente === "empresa" 
      ? listaCursosEmpresa.reduce((acc, curr) => acc + parseInt(curr.cantidad || "0"), 0)
      : 1;
    // Dentro de tu función handleSubmit en el archivo de Contacto
    const { error } = await supabase.from('solicitudes').insert([{
      nombre: formData.nombre,
      telefono: formData.telefono,
      tipo_cliente: tipoCliente === "empresa" ? "Empresa" : "Persona",
      empresa: tipoCliente === "empresa" ? formData.empresa : "N/A",
      numero_personas: totalPersonas, // Verifica que se llame así en tu SQL
      curso: tipoCliente === "empresa" ? listaCursosEmpresa[0].curso : formData.cursoIndividual,
      cursos_detalles: tipoCliente === "empresa" ? listaCursosEmpresa : null,
      disponibilidad_cliente: formData.disponibilidad
    }]);

    if (error) {
      toast.error("Error al enviar: " + error.message, { id: loadingToast });
    } else {
      toast.success("¡Solicitud enviada! Nos contactaremos pronto.", { id: loadingToast });
      setFormData({ nombre: "", correo: "", telefono: "", empresa: "", cursoIndividual: "", disponibilidad: "" });
      setListaCursosEmpresa([{ curso: "", cantidad: "1" }]);
    }
  };

  return (
    <main className="min-h-screen pb-20 bg-slate-50">
      <Toaster position="top-center" />
      
      <div className="pt-32 pb-20 text-center px-6">
        <h1 className="text-black text-4xl md:text-5xl font-bold tracking-tight">Cotiza tu formación</h1>
        <p className="mt-4 text-slate-600 max-w-2xl mx-auto font-medium">
          Recibe una propuesta personalizada para tu certificación en alturas.
        </p>
      </div>

      <div className="max-w-4xl mx-auto -mt-10 px-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 border border-slate-100">
          
          {/* SELECTOR TIPO CLIENTE */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-10">
            <button type="button" onClick={() => setTipoCliente("persona")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${tipoCliente === "persona" ? "bg-[#1e293b] text-white shadow-lg" : "text-slate-500 hover:bg-white"}`}>
              <FaUser /> Soy Particular
            </button>
            <button type="button" onClick={() => setTipoCliente("empresa")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${tipoCliente === "empresa" ? "bg-[#1e293b] text-white shadow-lg" : "text-slate-500 hover:bg-white"}`}>
              <FaBuilding /> Somos Empresa
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Nombre del Contacto</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input required type="text" value={formData.nombre} placeholder="Ej: Juan Pérez" className="text-black w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all" onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">WhatsApp de Contacto</label>
              <div className="relative">
                <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input required type="tel" value={formData.telefono} placeholder="300 000 0000" className="text-black w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all" onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
              </div>
            </div>

            {tipoCliente === "empresa" && (
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-slate-700">Razón Social / Empresa</label>
                <div className="relative">
                  <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input required type="text" value={formData.empresa} placeholder="Nombre de la empresa" className="text-black w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, empresa: e.target.value})} />
                </div>
              </div>
            )}

            {/* CURSOS DINÁMICOS */}
            <div className="md:col-span-2 space-y-4">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <FaClipboardList className="text-blue-500"/> Cursos Requeridos
              </label>
              
              {tipoCliente === "persona" ? (
                <select required value={formData.cursoIndividual} className="text-black w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, cursoIndividual: e.target.value})}>
                  <option value="">Selecciona un curso...</option>
                  {cursosCatalogo.map((c, i) => <option key={i} value={c.titulo}>{c.icono} {c.titulo}</option>)}
                </select>
              ) : (
                <div className="space-y-3">
                  {listaCursosEmpresa.map((item, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-3 animate-in slide-in-from-left-2">
                      <select required value={item.curso} className="flex-1 text-black px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" onChange={(e) => actualizarCursoEmpresa(index, "curso", e.target.value)}>
                        <option value="">Seleccionar curso...</option>
                        {cursosCatalogo.map((c, i) => <option key={i} value={c.titulo}>{c.icono} {c.titulo}</option>)}
                      </select>
                      <div className="flex gap-2">
                        <input type="number" min="1" value={item.cantidad} className="w-24 text-black px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" onChange={(e) => actualizarCursoEmpresa(index, "cantidad", e.target.value)} />
                        {listaCursosEmpresa.length > 1 && (
                          <button type="button" onClick={() => eliminarCurso(index)} className="p-3 text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"><FaTrash /></button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={agregarCurso} className="flex items-center gap-2 text-blue-600 font-bold text-sm mt-2 hover:text-blue-800 transition-colors">
                    <FaPlus size={12}/> Agregar otro curso para la empresa
                  </button>
                </div>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-bold text-slate-700">Tu Disponibilidad</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={formData.disponibilidad} placeholder="Ej: Mañanas, fines de semana, fecha específica..." className="text-black w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500" onChange={(e) => setFormData({...formData, disponibilidad: e.target.value})} />
              </div>
            </div>
          </div>

          <button type="submit" className="mt-10 w-full py-4 bg-[#1e293b] hover:bg-blue-900 text-white font-bold text-lg rounded-2xl shadow-xl transition-all transform hover:-translate-y-1">
            Solicitar Cotización {tipoCliente === "empresa" ? "Corporativa" : "Personal"}
          </button>
        </form>
      </div>
    </main>
  );
}