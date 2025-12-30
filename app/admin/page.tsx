"use client";

import { useState } from "react";
import { FaUsers, FaUserPlus, FaGraduationCap, FaSignOutAlt, FaChartLine } from "react-icons/fa";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("estudiantes");

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      
      {/* SIDEBAR FIJO */}
      <aside className="w-64 bg-[#00558A] text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-white/10">
          AR Costa <span className="text-yellow-400">Admin</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab("stats")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'stats' ? 'bg-white/20' : 'hover:bg-white/10'}`}
          >
            <FaChartLine /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("estudiantes")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'estudiantes' ? 'bg-white/20' : 'hover:bg-white/10'}`}
          >
            <FaUserPlus /> Nuevo Estudiante
          </button>
          <button 
            onClick={() => setActiveTab("lista")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'lista' ? 'bg-white/20' : 'hover:bg-white/10'}`}
          >
            <FaUsers /> Lista de Alumnos
          </button>
        </nav>

        <button className="m-4 flex items-center gap-3 px-4 py-3 bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white rounded-xl transition">
          <FaSignOutAlt /> Cerrar Sesión
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">
            {activeTab === "estudiantes" ? "Registro de Estudiantes" : "Panel de Control"}
          </h2>
          <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg shadow-sm">
            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center font-bold">A</div>
            <span className="font-medium">Administrador</span>
          </div>
        </header>

        {/* CONTENIDO DINÁMICO */}
        {activeTab === "estudiantes" && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* FORMULARIO DE INGRESO */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-8 border border-slate-200">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <FaUserPlus className="text-blue-600" /> Información del Alumno
              </h3>
              
              <form className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Cédula / ID</label>
                  <input type="text" className="w-full p-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="12345678" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Nombre Completo</label>
                  <input type="text" className="w-full p-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold">Curso a Matricular</label>
                  <select className="w-full p-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Selecciona un curso...</option>
                    <option>Trabajo en Alturas - Avanzado</option>
                    <option>Coordinador de Alturas</option>
                    <option>Reentrenamiento</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Fecha de Inicio</label>
                  <input type="date" className="w-full p-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Estado de Pago</label>
                  <select className="w-full p-3 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option>Pendiente</option>
                    <option>Pagado</option>
                  </select>
                </div>
                
                <button className="md:col-span-2 mt-4 bg-[#8B2323] text-white py-4 rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-200">
                  Registrar Estudiante y Generar Matrícula
                </button>
              </form>
            </div>

            {/* RESUMEN RÁPIDO */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h4 className="font-bold text-slate-500 mb-4 uppercase text-xs tracking-widest">Estadísticas Hoy</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Nuevos Inscritos</span>
                    <span className="font-bold text-blue-600">+12</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Certificados Listos</span>
                    <span className="font-bold text-green-600">8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "lista" && (
           <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
             <table className="w-full text-left">
               <thead className="bg-slate-50 border-b border-slate-200">
                 <tr>
                   <th className="p-4 font-bold text-sm">Estudiante</th>
                   <th className="p-4 font-bold text-sm">Curso</th>
                   <th className="p-4 font-bold text-sm">Estado</th>
                   <th className="p-4 font-bold text-sm">Acciones</th>
                 </tr>
               </thead>
               <tbody>
                 <tr className="border-b border-slate-100">
                   <td className="p-4">Carlos Mario Ruiz</td>
                   <td className="p-4">Avanzado Alturas</td>
                   <td className="p-4"><span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Certificado</span></td>
                   <td className="p-4"><button className="text-blue-600 hover:underline">Ver ficha</button></td>
                 </tr>
               </tbody>
             </table>
           </div>
        )}
      </main>
    </div>
  );
}