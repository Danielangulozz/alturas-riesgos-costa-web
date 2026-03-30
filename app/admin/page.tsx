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
import dynamic from 'next/dynamic';

import { ModalReporte } from "./components/ModalReporte";
import { DocButton } from "./components/DocButton";
import { Sidebar } from "./components/Sidebar";
import { LoadingScreen, LoadingTab } from "./components/LoadingScreens";

import { useAuth } from "./hooks/useAuth";
import { useData } from "./hooks/useData";
import { useRealtime } from "./hooks/useRealtime";
import { useAdminActions } from "./hooks/useAdminActions";
import { useBusinessLogic } from "./hooks/useBusinessLogic";

// --- IMPORTACIONES DINÁMICAS (Lazy Loading) ---
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

// --- MAPA DE TÍTULOS ---
const titulos: Record<string, string> = {
  dashboard: 'Dashboard',
  lista: 'Base de Datos',
  solicitudes: 'Solicitudes Web',
  agenda: 'Agenda',
  estudiantes: 'Matriculación',
  listados: 'Planillas de Clase',
  equipo: 'Gestión de Equipo',
  logs: 'Auditoría',
  precios: 'Precios',
  config: 'Mi Perfil',
};

export default function AdminDashboard() {
  const router = useRouter();

  // --- HOOKS ---
  const {
    isRefreshing, listaPerfiles, estudiantes, preinscripciones,
    solicitudes, agendaBD, catalogoCursos, logsRecientes, fetchData,
    historialInscripciones // 👈 AQUÍ SACAMOS LA GRÁFICA
  } = useData();

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
    toggleVerificacion,
  } = useAdminActions({ fetchData, userName, userRole, registrarLog });

  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalEquipoOpen, setIsModalEquipoOpen] = useState(false);
  const [formEquipo, setFormEquipo] = useState({ email: "", pass: "", nombre: "" });
  const [modalARL, setModalARL] = useState<{ isOpen: boolean, item: any }>({ isOpen: false, item: null });
  const [datosARL, setDatosARL] = useState({ nombre: "", nit: "" });
  const [notificacionesNuevas, setNotificacionesNuevas] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState<string[]>([]);
  const [preciosEditados, setPreciosEditados] = useState<{ [key: string]: string }>({});
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [textoReporte, setTextoReporte] = useState("");
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<any>(null);
  const [cursoSeleccionadoParaEditar, setCursoSeleccionadoParaEditar] = useState("");
  const [descuentoAplicado, setDescuentoAplicado] = useState(0);
  const [formData, setFormData] = useState({
    nombre: "", cedula: "", telefono: "", curso: "", email: "",
    ciudad_residencia: "", barrio: "", empresa: "", nit: "",
    fecha_nacimiento: "", sexo: "", horario_preferencia: "",
    estadoPago: "Pendiente", precio_pactado: ""
  });
  const [agendaData, setAgendaData] = useState({
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: "",
    hora: "07:00"
  });
  const {
    registrarEstudiante,
    guardarEnAgenda,
    enviarWhatsAppMultifecha,
    descargarPDFAsistencia,
  } = useBusinessLogic({
    fetchData, registrarLog,
    formData, setFormData,
    agendaData, setAgendaData,
    fechasSeleccionadas, preciosEditados,
    agendaBD, catalogoCursos,
  });

  // --- EFECTOS ---
  useEffect(() => {
    if (!loading) fetchData();
  }, [loading, fetchData]);

  useRealtime({ fetchData, setActiveTab, setNotificacionesNuevas });

  // --- LÓGICA DE NEGOCIO ---

  // --- DATOS DERIVADOS ---
  const listaUnificada = [
    ...preinscripciones.map(p => ({ ...p, origen: 'preinscripciones', etiqueta: 'WEB' })),
    ...estudiantes.map(e => ({ ...e, origen: 'estudiantes', etiqueta: 'MANUAL' }))
  ].filter(i => JSON.stringify(i).toLowerCase().includes(busqueda.toLowerCase()));

  const statsDashboard = {
    totalAlumnos: estudiantes.length + preinscripciones.length,
    solicitudesPendientes: solicitudes.length,
    cambiosHoy: logsRecientes.filter(l => {
      const f = new Date(l.created_at); const h = new Date();
      return f.getDate() === h.getDate() && f.getMonth() === h.getMonth() && f.getFullYear() === h.getFullYear();
    }).length,
    proximosCursos: agendaBD
      .filter(a => new Date(a.fecha) >= new Date(new Date().setHours(0, 0, 0, 0)))
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .slice(0, 3),
    historialInscripciones: historialInscripciones // 👈 AQUÍ SE LA PASAMOS AL DASHBOARD
  };

  // --- CREAR USUARIO ---
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
          id: data.user.id, email, full_name: nombre, role: 'trainer'
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


  const generarReporte = (est: any) => {
    setEstudianteSeleccionado({ ...est, _agendaBD: agendaBD });
    setModalOpen(true);
  };

  // --- PANTALLA DE CARGA INICIAL ---
  if (loading) return <LoadingScreen />;

  // --- RENDER ---
  return (
    <div className="flex h-screen bg-[#f8fafc] text-[#334155] overflow-hidden">
      <Toaster position="bottom-right" />

      <ModalReporte
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        estudiante={estudianteSeleccionado}
        userName={userName}
      />

      {/* BOTÓN HAMBURGUESA (Solo móvil) */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-3 bg-[#0F172A] text-white rounded-xl shadow-lg active:scale-95"
      >
        {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
      </button>

      {/* SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        notificacionesNuevas={notificacionesNuevas}
        setNotificacionesNuevas={setNotificacionesNuevas}
        userRole={userRole}
      />

      <main className={`flex-1 h-screen overflow-y-auto bg-[#f8fafc] relative transition-all duration-300 ${isCollapsed ? 'lg:pl-0' : ''}`}>
        <div className="p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto">

          {/* HEADER EJECUTIVO */}
          <header className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-10 gap-4 pt-12 lg:pt-0 border-b border-slate-200/60 pb-8">
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <h2 className="text-3xl font-black text-[#0F172A] uppercase tracking-tight leading-none mb-2">
                {titulos[activeTab] || activeTab}
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-8 h-[2px] bg-blue-600 rounded-full" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Gestión Institucional</p>
              </div>
            </div>

            {/* WIDGET PERFIL - PROFESIONAL */}
            <div
              onClick={() => setActiveTab('config')}
              className="flex items-center gap-4 bg-white pl-2 pr-5 py-2 rounded-xl border border-slate-200 shadow-sm hover:border-blue-500 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 bg-[#0F172A] rounded-lg flex items-center justify-center font-black text-[#FFD700] text-base group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                {userName && userName !== "Cargando..." ? userName.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight leading-none mb-1">{userName}</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest whitespace-nowrap">
                    {userRole?.replace('_', ' ') || 'Usuario'}
                  </span>
                </div>
              </div>
              <div className="ml-2 text-slate-300 group-hover:text-blue-500 transition-all">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </div>
            </div>
          </header>

          {/* TABS */}
          {activeTab === "dashboard" && (
            <TabDashboard
              userName={userName}
              userRole={userRole}
              statsDashboard={statsDashboard}
              logsRecientes={logsRecientes}
              setActiveTab={setActiveTab}
            />
          )}

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

          {activeTab === "logs" && (
            <TabLogs userRole={userRole} logsRecientes={logsRecientes} />
          )}

          {activeTab === "precios" && (
            <TabPrecios
              userRole={userRole}
              catalogoCursos={catalogoCursos}
              actualizarPrecioMaestro={actualizarPrecioMaestro}
            />
          )}

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

          {activeTab === "config" && (
            <TabConfig
              userName={userName || "Usuario"}
              userEmail={userEmail || "Cargando..."}
              userRole={userRole || ""}
              horaIngreso={horaIngreso || ""}
              cerrarSesion={cerrarSesion}
            />
          )}

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

        </div>
      </main>
    </div>
  );
}