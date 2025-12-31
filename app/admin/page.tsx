"use client";

import React, { useState, useEffect } from "react";
import { 
  FaUsers, FaUserPlus, FaSignOutAlt, FaChartLine, FaUserCog, 
  FaEnvelope, FaShieldAlt, FaSync, FaTrash, FaIdCard, 
  FaFileMedical, FaShieldVirus 
} from "react-icons/fa";
import { supabase } from "@/lib/supabase"; 
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  // ---------------------------------------------------------
  // 1. ESTADOS Y CONFIGURACIÓN
  // ---------------------------------------------------------
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("estudiantes");
  const [userEmail, setUserEmail] = useState<string | undefined>("");
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [cargandoLista, setCargandoLista] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [formData, setFormData] = useState({
    nombre: "",
    cedula: "",
    telefono: "",
    curso: "",
    estadoPago: "Pendiente",
    email: "", // <-- Asegúrate de que tenga las comillas ""
  });

  // ---------------------------------------------------------
// FUNCION PARA ENVIAR NOTIFICACIONES
// ---------------------------------------------------------
const enviarNotificacion = async (est: any, tipo: "bienvenida" | "estado_docs") => {
  if (!est.email) {
    alert("Este estudiante no tiene un correo registrado.");
    return;
  }

  try {
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: est.email,
        nombre: est.nombre,
        curso: est.curso,
        tipo: tipo,
        estado: est.estado_documentacion
      }),
    });

    if (res.ok) alert(`Correo de ${tipo} enviado a ${est.nombre}`);
    else throw new Error("Error al enviar");
  } catch (error) {
    console.error(error);
    alert("No se pudo enviar el correo.");
  }
};

  const listaCursos = [
    "Trabajo en alturas – Nivel básico",
    "Trabajo en alturas – Nivel avanzado",
    "Reentrenamiento en trabajo en alturas",
    "Jefes de área",
    "Trabajador autorizado",
    "Coordinador de trabajo en alturas",
    "Autorización de coordinador",
    "Armado de andamios",
    "Andamios",
    "Rescate industrial"
  ];

  // ---------------------------------------------------------
  // 2. EFECTOS Y DATOS (LOGICA)
  // ---------------------------------------------------------
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
      } else {
        setUserEmail(session.user.email);
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const fetchEstudiantes = async () => {
    setCargandoLista(true);
    const { data, error } = await supabase
      .from('estudiantes')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error) setEstudiantes(data || []);
    setCargandoLista(false);
  };

  useEffect(() => {
    if (activeTab === "lista") fetchEstudiantes();
  }, [activeTab]);

const actualizarEstado = async (id: string, campo: string, valor: string) => {
  const { error } = await supabase.from('estudiantes').update({ [campo]: valor }).eq('id', id);
  
  if (error) {
    alert("Error al actualizar: " + error.message);
  } else {
    // Actualizamos el estado local para que la tabla se vea bien
    setEstudiantes(estudiantes.map(est => 
      est.id === id ? { ...est, [campo]: valor } : est
    ));
  }
};

const registrarEstudiante = async (e: React.FormEvent) => {
  e.preventDefault();
  // Validar email básico antes de enviar a la DB
  if (formData.email && !formData.email.includes('@')) {
    alert("Por favor ingresa un correo válido");
    return;
  }

  const { error } = await supabase.from('estudiantes').insert([{ 
    nombre: formData.nombre, 
    cedula: formData.cedula,
    telefono: formData.telefono,
    curso: formData.curso,
    email: formData.email, // <--- Guardamos el email
    estado_pago: formData.estadoPago,
    estado_documentacion: "Pendiente"
  }]);

  if (error) alert("Error: " + error.message);
  else {
    alert("¡Estudiante guardado!");
    setFormData({ nombre: "", cedula: "", telefono: "", curso: "", estadoPago: "Pendiente", email: "" });
    setActiveTab("lista");
  }
};

  const eliminarEstudiante = async (id: string) => {
    if (confirm("¿Eliminar registro?")) {
      await supabase.from('estudiantes').delete().eq('id', id);
      fetchEstudiantes();
    }
  };

  const estudiantesFiltrados = estudiantes.filter(est => {
    const term = busqueda.toLowerCase();
    return (est.nombre || "").toLowerCase().includes(term) || (est.cedula || "").toString().includes(term);
  });

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#1e293b]"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] text-[#334155]">
      
      {/* ---------------------------------------------------------
          ASIDE / SIDEBAR (DISEÑO ORIGINAL)
      --------------------------------------------------------- */}
      <aside className="w-64 bg-[#1e293b] text-slate-300 flex flex-col fixed h-full shadow-xl">
        <div className="p-6 text-xl font-bold border-b border-slate-700 text-white tracking-tight">
          AR Costa <span className="text-blue-400">Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'stats', icon: <FaChartLine />, label: 'Dashboard' },
            { id: 'estudiantes', icon: <FaUserPlus />, label: 'Inscripción' },
            { id: 'lista', icon: <FaUsers />, label: 'Base de Datos' },
            { id: 'config', icon: <FaUserCog />, label: 'Mi Perfil' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => supabase.auth.signOut().then(() => router.push("/admin/login"))} className="m-4 flex items-center gap-3 px-4 py-3 bg-red-900/30 hover:bg-red-800 text-red-200 rounded-lg transition">
          <FaSignOutAlt /> Salir del Sistema
        </button>
      </aside>

      <main className="flex-1 ml-64 p-10">
        {/* ---------------------------------------------------------
            HEADER
        --------------------------------------------------------- */}
        <header className="flex justify-between items-center mb-10">
          <h2 className="text-2xl font-bold text-[#1e293b] capitalize">
            {activeTab === "estudiantes" ? "Panel de Inscripción" : activeTab === "lista" ? "Listado Maestro" : activeTab === "config" ? "Configuración" : "Dashboard"}
          </h2>
          <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm p-2 pr-5 rounded-full border border-slate-200 shadow-sm">
            <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600 border border-slate-300">
              {userEmail?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-slate-600">{userEmail}</span>
          </div>
        </header>

        {/* ---------------------------------------------------------
            VISTA: FORMULARIO DE INSCRIPCIÓN (DISEÑO ORIGINAL RECUPERADO)
        --------------------------------------------------------- */}
        {activeTab === "estudiantes" && (
          <div className="max-w-4xl bg-white rounded-xl shadow-sm p-8 border border-slate-200 animate-in fade-in duration-500">
            <form onSubmit={registrarEstudiante} className="grid md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Cédula del Estudiante</label>
                <input required type="text" value={formData.cedula} onChange={(e) => setFormData({...formData, cedula: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" placeholder="Ej: 1045..." />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Nombre Completo</label>
                <input required type="text" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Curso Especializado</label>
                <select required value={formData.curso} onChange={(e) => setFormData({...formData, curso: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none">
                  <option value="">Seleccione el curso...</option>
                  {listaCursos.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Teléfono de Contacto</label>
                <input type="text" value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Estado de Pago Inicial</label>
                <select value={formData.estadoPago} onChange={(e) => setFormData({...formData, estadoPago: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none">
                  <option value="Pendiente">⚠️ Pendiente</option>
                  <option value="Pagado">✅ Pagado</option>
                </select>
              </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Correo Electrónico</label>
                  <input 
                    type="text" // Usamos text para que no moleste con el @
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})} 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none" 
                    placeholder="ejemplo@correo.com" 
                  />
                </div>
              <button type="submit" className="md:col-span-2 mt-4 bg-[#7f1d1d] text-white py-4 rounded-lg font-bold hover:bg-[#991b1b] transition shadow-md active:scale-[0.98]">
                Finalizar Registro
              </button>
            </form>
          </div>
        )}

        {/* ---------------------------------------------------------
            VISTA: BASE DE DATOS / LISTA MAESTRA
        --------------------------------------------------------- */}
        {activeTab === "lista" && (
          <div className="space-y-4 animate-in fade-in duration-500">
            {/* BARRA DE BÚSQUEDA */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="relative w-full md:w-96">
                <input 
                  type="text" 
                  placeholder="Buscar por nombre o cédula..." 
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                />
                <span className="absolute left-3 top-2.5 text-slate-400">🔍</span>
              </div>
              <button onClick={fetchEstudiantes} className="flex items-center gap-2 text-xs bg-slate-100 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-200 transition">
                <FaSync className={cargandoLista ? 'animate-spin' : ''} /> Actualizar Datos
              </button>
            </div>

            {/* TABLA DE GESTIÓN */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest border-b">
                      <th className="px-6 py-4">Estudiante / ID</th>
                      <th className="px-6 py-4">Documentación</th>
                      <th className="px-6 py-4">Revisión</th>
                      <th className="px-6 py-4">Pago</th>
                      <th className="px-6 py-4">Resultado</th>
                      <th className="px-6 py-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {estudiantesFiltrados.map((est) => (
                      <tr key={est.id} className="hover:bg-blue-50/20 transition group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-700">{est.nombre}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{est.cedula}</div>
                          <div className="text-[10px] text-blue-500 font-bold uppercase">{est.curso}</div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <DocButton label="CÉDULA" url={est.url_cedula} icon={<FaIdCard/>} color="blue" />
                            <DocButton label="MÉDICO" url={est.url_medico} icon={<FaFileMedical/>} color="emerald" />
                            <DocButton label="SSALUD" url={est.url_seguridad_social} icon={<FaShieldVirus/>} color="purple" />
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <select 
                            value={est.estado_documentacion || "Pendiente"}
                            onChange={(e) => actualizarEstado(est.id, 'estado_documentacion', e.target.value)}
                            className={`text-[10px] font-black p-1.5 rounded border-none outline-none cursor-pointer ${
                              est.estado_documentacion === 'Aprobado' ? 'bg-green-100 text-green-700' : 
                              est.estado_documentacion === 'Rechazado' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            <option value="Pendiente">⏳ PENDIENTE</option>
                            <option value="Aprobado">✅ APROBADO</option>
                            <option value="Rechazado">❌ RECHAZADO</option>
                          </select>
                        </td>

                        <td className="px-6 py-4">
                          <select 
                            value={est.estado_pago || "Pendiente"}
                            onChange={(e) => actualizarEstado(est.id, 'estado_pago', e.target.value)}
                            className={`text-[10px] font-bold p-1.5 rounded border-none outline-none cursor-pointer ${
                              est.estado_pago === 'Pagado' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <option value="Pendiente">PENDIENTE</option>
                            <option value="Pagado">PAGADO</option>
                          </select>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            {['APTO', 'NO APTO'].map((opcion) => (
                              <button 
                                key={opcion}
                                onClick={() => actualizarEstado(est.id, 'resultado_final', opcion)}
                                className={`px-2 py-1 rounded text-[9px] font-black border transition-all ${
                                  est.resultado_final === opcion 
                                  ? (opcion === 'APTO' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-rose-600 text-white border-rose-600')
                                  : 'bg-white text-slate-300 border-slate-200 hover:border-slate-400'
                                }`}
                              >
                                {opcion}
                              </button>
                            ))}
                          </div>
                        </td>
 <td className="px-6 py-4 text-center">
  <div className="flex items-center justify-center gap-3">
    {/* BOTÓN DE NOTIFICAR MANUAL */}
    <button 
      onClick={() => {
        if(confirm(`¿Enviar notificación de estado a ${est.nombre}?`)) {
          enviarNotificacion(est, "estado_docs");
        }
      }}
      className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
      title="Enviar Correo de Estado"
    >
      <FaEnvelope size={14} />
    </button>

    {/* BOTÓN DE ELIMINAR */}
    <button 
      onClick={() => eliminarEstudiante(est.id)} 
      className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100"
    >
      <FaTrash size={12} />
    </button>
  </div>
</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------
            VISTA: MI PERFIL (RECUPERADA)
        --------------------------------------------------------- */}
        {activeTab === "config" && (
          <div className="max-w-2xl bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-[#1e293b] p-6 text-white">
              <h3 className="text-xl font-bold">Perfil del Administrador</h3>
              <p className="opacity-70 text-sm">Información de la cuenta activa</p>
            </div>
            <div className="p-8 space-y-4">
              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg shadow-sm"><FaEnvelope /></div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Correo de acceso</p>
                  <p className="text-lg font-medium text-slate-700">{userEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="p-3 bg-green-100 text-green-600 rounded-lg shadow-sm"><FaShieldAlt /></div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Nivel de Seguridad</p>
                  <p className="text-lg font-medium text-slate-700">Acceso Total Administrativo</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------
// 3. SUB-COMPONENTES (PARA ORGANIZACIÓN)
// ---------------------------------------------------------
function DocButton({ label, url, icon, color }: { label: string, url: string, icon: any, color: string }) {
  const colors: any = {
    blue: "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100",
    purple: "bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100"
  };

  if (!url) return (
    <span className="flex items-center gap-2 px-2 py-0.5 rounded text-[8px] font-bold border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed italic">
      {icon} FALTANTE
    </span>
  );

  return (
    <a 
      href={url} 
      target="_blank" 
      className={`flex items-center gap-2 px-2 py-0.5 rounded text-[8px] font-bold border transition-colors ${colors[color]}`}
    >
      {icon} {label}
    </a>
  );
}