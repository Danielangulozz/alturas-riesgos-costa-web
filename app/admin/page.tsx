"use client";


import React, { useState, useEffect } from "react";
import { 
  FaUsers, FaUserPlus, FaSignOutAlt, FaUserCog, FaEnvelope, FaShieldAlt, 
  FaTrash, FaIdCard, FaFileMedical, FaShieldVirus, FaBars, FaTimes,
  FaCalendarAlt, FaPhoneAlt, FaClipboardList, FaPlus, FaSync, FaCheckCircle, 
  FaUserCheck, FaBuilding, FaUserTie, FaMoneyBillWave, FaHistory, 
  FaExternalLinkAlt, FaFilePdf, FaExclamationTriangle, FaCopy, FaTimesCircle, FaClock,
  FaMapMarkerAlt, FaUser, FaTrashAlt, FaFire, FaChartLine, FaBell, FaCloudUploadAlt
} from "react-icons/fa";
import { supabase } from "@/lib/supabase"; 
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { ModalReporte } from "./components/ModalReporte";
import { DocButton } from "./components/DocButton";
import { useAuth } from "./hooks/useAuth";
import { useData } from "./hooks/useData"; 
import { useRealtime } from "./hooks/useRealtime"; 
import { Sidebar } from "./components/Sidebar";
import { useAdminActions } from "./hooks/useAdminActions";
import { useBusinessLogic } from "./hooks/useBusinessLogic";

import dynamic from 'next/dynamic';

// Un loader visual mientras se descarga el trozo de código de la pestaña
const LoadingTab = () => (
  <div className="flex justify-center items-center h-64 text-slate-400 font-bold animate-pulse gap-2">
    <FaSync className="animate-spin" /> Cargando módulo...
  </div>
);

// Importaciones dinámicas (Lazy Loading)
const TabDashboard = dynamic(() => import('./components/TabDashboard').then(m => m.TabDashboard), { loading: () => <LoadingTab /> });
const TabLista = dynamic(() => import('./components/TabLista').then(m => m.TabLista), { loading: () => <LoadingTab /> });
const TabAgenda = dynamic(() => import('./components/TabAgenda').then(m => m.TabAgenda), { loading: () => <LoadingTab /> });
const TabSolicitudes = dynamic(() => import('./components/TabSolicitudes').then(m => m.TabSolicitudes), { loading: () => <LoadingTab /> });
const TabListados = dynamic(() => import('./components/TabListados').then(m => m.TabListados), { loading: () => <LoadingTab /> });
const TabEstudiantes = dynamic(() => import('./components/TabEstudiantes').then(m => m.TabEstudiantes), { loading: () => <LoadingTab /> });
const TabEquipo = dynamic(() => import('./components/TabEquipo').then(m => m.TabEquipo), { loading: () => <LoadingTab /> });
const TabLogs = dynamic(() => import('./components/TabLogs').then(m => m.TabLogs), { loading: () => <LoadingTab /> });
const TabPrecios = dynamic(() => import('./components/TabPrecios').then(m => m.TabPrecios), { loading: () => <LoadingTab /> });
const TabConfig = dynamic(() => import('./components/TabConfig').then(m => m.TabConfig), { loading: () => <LoadingTab /> });

export default function AdminDashboard() {
  const router = useRouter();

  // 1. HOOK DE DATOS
  const { 
    isRefreshing, listaPerfiles, estudiantes, preinscripciones, 
    solicitudes, agendaBD, catalogoCursos, logsRecientes, fetchData 
  } = useData();

  // 2. HOOK DE AUTH
  const { 
    userEmail, userName, userRole, 
    horaIngreso, loading,
    cerrarSesion, registrarLog 
  } = useAuth();

  const {
    borrarRegistro,
    actualizarEstadoEstudiante,
    actualizarPrecioMaestro,
    ejecutarCambioEstado,
    toggleVerificacion
  } = useAdminActions({ fetchData, userName, userRole, registrarLog });


  useEffect(() => {
    if (!loading) {
      fetchData();
    }
  }, [loading, fetchData]);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isModalEquipoOpen, setIsModalEquipoOpen] = useState(false);
  const [formEquipo, setFormEquipo] = useState({ email: "", pass: "", nombre: "" });
  const [modalARL, setModalARL] = useState<{isOpen: boolean, item: any}>({isOpen: false, item: null});
  const [datosARL, setDatosARL] = useState({nombre: "", nit: ""});
  const [notificacionesNuevas, setNotificacionesNuevas] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState<string[]>([]);
  const [preciosEditados, setPreciosEditados] = useState<{ [key: string]: string }>({});
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [textoReporte, setTextoReporte] = useState("");
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<any>(null);

  useRealtime({ 
    fetchData, 
    setActiveTab, 
    setNotificacionesNuevas 
  });


  // --- LÓGICA DE USUARIOS ---
  const handleCrearUsuarioManual = async (email: string, pass: string, nombre: string) => {
    if (!email || !pass || !nombre) return toast.error("Completa todos los campos");
    if (pass.length < 6) return toast.error("La clave mínima es de 6 caracteres");

    const loadingToast = toast.loading("Creando acceso para el equipo...");
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email, password: pass, options: { data: { full_name: nombre } }
      });
      if (authError) throw authError;

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert([{
            id: data.user.id, email: email, full_name: nombre, role: 'trainer'
        }]);
        if (profileError) throw profileError;
        
        toast.success("¡Colaborador creado!", { id: loadingToast });
        setFormEquipo({ email: "", pass: "", nombre: "" });
        setIsModalEquipoOpen(false); 
        fetchData(); 
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`, { id: loadingToast });
    }
  };


  const listaCursos = [
    "Trabajo en alturas – Nivel básico", "Trabajo en alturas – Nivel avanzado",
    "Reentrenamiento en trabajo en alturas", "Jefes de área", "Trabajador autorizado",
    "Coordinador de trabajo en alturas", "Autorización de coordinador",
    "Armado de andamios", "Andamios", "Rescate industrial"
  ];

  const [cursoSeleccionadoParaEditar, setCursoSeleccionadoParaEditar] = useState(listaCursos[0]);
  const [descuentoAplicado, setDescuentoAplicado] = useState(0);
  const [formData, setFormData] = useState({ 
    nombre: "", cedula: "", telefono: "", curso: "", email: "",
    ciudad_residencia: "", barrio: "", empresa: "", nit: "",
    fecha_nacimiento: "", sexo: "", horario_preferencia: "",
    estadoPago: "Pendiente", precio_pactado: "" 
  });
  

  const [agendaData, setAgendaData] = useState({ fecha_inicio: new Date().toISOString().split('T')[0], fecha_fin: "", hora: "07:00" });

  const listaUnificada = [
    ...preinscripciones.map(p => ({ ...p, origen: 'preinscripciones', etiqueta: 'WEB' })),
    ...estudiantes.map(e => ({ ...e, origen: 'estudiantes', etiqueta: 'MANUAL' }))
  ].filter(i => JSON.stringify(i).toLowerCase().includes(busqueda.toLowerCase()));

  const statsDashboard = {
    totalAlumnos: estudiantes.length + preinscripciones.length,
    solicitudesPendientes: solicitudes.length,
    cambiosHoy: logsRecientes.filter(l => {
       const fechaLog = new Date(l.created_at); const hoy = new Date();
       return fechaLog.getDate() === hoy.getDate() && fechaLog.getMonth() === hoy.getMonth() && fechaLog.getFullYear() === hoy.getFullYear();
    }).length,
    proximosCursos: agendaBD.filter(a => new Date(a.fecha) >= new Date(new Date().setHours(0,0,0,0))).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()).slice(0, 3)
  };
    const {
    registrarEstudiante,
    guardarEnAgenda,
    enviarWhatsAppMultifecha,
    generarReporte,
    descargarPDFAsistencia
  } = useBusinessLogic({
    fetchData,
    registrarLog,
    formData,
    setFormData,
    agendaData,
    setAgendaData,
    fechasSeleccionadas,
    preciosEditados,
    agendaBD,
    catalogoCursos
  });
if (loading) return (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc]">
    <div className="w-24 h-24">
      {/* SVG carga*/}
      <svg fill="#0035ce" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <circle cx="4" cy="12" r="3">
          <animate id="spinner_qFRN" begin="0;spinner_OcgL.end+0.25s" attributeName="cy" calcMode="spline" dur="0.6s" values="12;6;12" keySplines=".33,.66,.66,1;.33,0,.66,.33"/>
        </circle>
        <circle cx="12" cy="12" r="3">
          <animate begin="spinner_qFRN.begin+0.1s" attributeName="cy" calcMode="spline" dur="0.6s" values="12;6;12" keySplines=".33,.66,.66,1;.33,0,.66,.33"/>
        </circle>
        <circle cx="20" cy="12" r="3">
          <animate id="spinner_OcgL" begin="spinner_qFRN.begin+0.2s" attributeName="cy" calcMode="spline" dur="0.6s" values="12;6;12" keySplines=".33,.66,.66,1;.33,0,.66,.33"/>
        </circle>
      </svg>
    </div>
    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-4 animate-pulse">
      Cargando AYR Admin
    </span>
  </div>
);

  

 return (
  <div className="flex h-screen bg-[#f8fafc] text-[#334155] overflow-hidden">
    <Toaster position="bottom-right" />
    <ModalReporte 
      isOpen={modalOpen} 
      onClose={() => setModalOpen(false)} 
      texto={textoReporte} 
      telefono={estudianteSeleccionado?.telefono || ""} 
    />    
  {/* BOTÓN HAMBURGUESA (Solo móvil) */}
    <button 
      onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
      className="lg:hidden fixed top-4 left-4 z-[60] p-3 bg-[#0F172A] text-white rounded-xl shadow-lg active:scale-95"
    >
      {isSidebarOpen ? <FaTimes size={20}/> : <FaBars size={20}/>}
    </button>

    {/* SIDEBAR */}
    <Sidebar 
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      notificacionesNuevas={notificacionesNuevas}
      setNotificacionesNuevas={setNotificacionesNuevas}
      userRole={userRole}
    />

    {/* CONTENIDO PRINCIPAL */}
    <main className="flex-1 h-screen overflow-y-auto bg-[#f8fafc] relative">
      <div className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto">
        
        {/* HEADER SUPERIOR */}
<header className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-8 gap-4 pt-12 lg:pt-0">
  <div>
    <h2 className="text-2xl font-black text-[#0F172A] uppercase tracking-tight">
      {activeTab === 'lista' ? 'Base de Datos' : activeTab.replace('solicitudes', 'Solicitudes')}
    </h2>
    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gestión Institucional</p>
  </div>

  {/* WIDGET PERFIL */}
  <div 
    onClick={() => setActiveTab('config')}
    className="flex items-center gap-3 bg-white pl-1.5 pr-4 py-1.5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-500 transition-all cursor-pointer group"
  >
    {/* Avatar Cuadrado Redondeado (Estilo Corporativo) */}
    <div className="w-10 h-10 bg-[#0F172A] rounded-xl flex items-center justify-center font-black text-[#FFD700] text-base shadow-sm group-hover:scale-105 transition-transform">
      {userName && userName !== "Cargando..." ? userName.charAt(0).toUpperCase() : "?"}
    </div>

    <div className="flex flex-col justify-center">
      <span className="text-[12px] font-black text-slate-800 uppercase tracking-tight leading-none">
        {userName}
      </span>
      <div className="flex items-center gap-1.5 mt-1">
        <div className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
        </div>
        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
          {userRole.replace('_', ' ')}
        </span>
      </div>
    </div>

    {/* Flecha indicadora */}
    <div className="ml-2 text-slate-300 group-hover:text-blue-500 transition-colors">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6"/>
      </svg>
    </div>
  </div>
</header>
          {/*DASHBOARD */}
        {activeTab === "dashboard" && (
          <TabDashboard 
            userName={userName}
            userRole={userRole}
            statsDashboard={statsDashboard}
            logsRecientes={logsRecientes}
            setActiveTab={setActiveTab}
          />
        )}
          {/* SOLICITUDES */}
          {activeTab === "solicitudes" && (
          <TabSolicitudes 
            solicitudes={solicitudes}
            agendaBD={agendaBD}
            fechasSeleccionadas={fechasSeleccionadas}
            setFechasSeleccionadas={setFechasSeleccionadas}
            preciosEditados={preciosEditados}
            setPreciosEditados={setPreciosEditados}
            catalogoCursos={catalogoCursos}
            enviarWhatsAppMultifecha={enviarWhatsAppMultifecha}
            fetchData={fetchData}
          />
        )}
          {/* ESTUDIANTES */}
        {activeTab === "lista" && (
          <TabLista 
            busqueda={busqueda}
            setBusqueda={setBusqueda}
            fetchData={fetchData}
            isRefreshing={isRefreshing}
            listaUnificada={listaUnificada}
            agendaBD={agendaBD}
            toggleVerificacion={(item, docId, docLabel) => toggleVerificacion(item, docId, docLabel, setModalARL)}
            actualizarEstadoEstudiante={actualizarEstadoEstudiante}
            generarReporte={generarReporte}
            borrarRegistro={borrarRegistro}
            modalARL={modalARL}
            setModalARL={setModalARL}
            datosARL={datosARL}
            setDatosARL={setDatosARL}
            ejecutarCambioEstado={ejecutarCambioEstado}
          />
        )}
        {/* LOGS */}
        {activeTab === 'logs' && (
          <TabLogs userRole={userRole} logsRecientes={logsRecientes} />
        )}

          {/* PRECIOS */}
          {activeTab === "precios" && (
          <TabPrecios 
            userRole={userRole} 
            catalogoCursos={catalogoCursos} 
            actualizarPrecioMaestro={actualizarPrecioMaestro} 
          />
        )}

            {/* AGENDA */}
          {activeTab === "agenda" && (
          <TabAgenda 
            cursoSeleccionadoParaEditar={cursoSeleccionadoParaEditar}
            setCursoSeleccionadoParaEditar={setCursoSeleccionadoParaEditar}
            catalogoCursos={catalogoCursos}
            agendaData={agendaData}
            setAgendaData={setAgendaData}
            guardarEnAgenda={guardarEnAgenda}
            agendaBD={agendaBD}
            borrarRegistro={borrarRegistro}
          />
        )}


          {/* LISTADOS DE ASISTENCIA */}  
          {activeTab === "listados" && (
          <TabListados 
            estudianteSeleccionado={estudianteSeleccionado}
            setEstudianteSeleccionado={setEstudianteSeleccionado}
            fechaSeleccionada={fechaSeleccionada}
            setFechaSeleccionada={setFechaSeleccionada}
            agendaBD={agendaBD}
            estudiantes={estudiantes}
            preinscripciones={preinscripciones}
            descargarPDFAsistencia={descargarPDFAsistencia}
            fetchData={fetchData}
          />
        )}
          {/* ESTUDIANTES */}
          {activeTab === "estudiantes" && (
          <TabEstudiantes 
            formData={formData}
            setFormData={setFormData}
            registrarEstudiante={registrarEstudiante}
            cursoSeleccionadoParaEditar={cursoSeleccionadoParaEditar}
            setCursoSeleccionadoParaEditar={setCursoSeleccionadoParaEditar}
            catalogoCursos={catalogoCursos}
          />
        )}

          {/* MI PERFIL */}
          {activeTab === "config" && (
          <TabConfig 
            userName={userName || "Usuario"} 
            userEmail={userEmail || "Cargando..."}
            userRole={userRole || ""} 
            horaIngreso={horaIngreso || ""} 
            cerrarSesion={cerrarSesion} 
          />
        )}
      </div>
          {/* GESTIÓN DE PERSONAL*/}
          {activeTab === "equipo" && (
          <TabEquipo 
            userRole={userRole}
            listaPerfiles={listaPerfiles}
            fetchData={fetchData}
            formEquipo={formEquipo}
            setFormEquipo={setFormEquipo}
            isModalEquipoOpen={isModalEquipoOpen}
            setIsModalEquipoOpen={setIsModalEquipoOpen}
            handleCrearUsuarioManual={handleCrearUsuarioManual}
          />
        )}
      </main>
    </div>
  );
}