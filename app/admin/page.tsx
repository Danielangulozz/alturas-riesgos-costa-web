"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FaUsers, FaUserPlus, FaSignOutAlt, FaUserCog, FaEnvelope, FaShieldAlt,
  FaTrash, FaIdCard, FaFileMedical, FaShieldVirus, FaBars, FaTimes,
  FaCalendarAlt, FaPhoneAlt, FaClipboardList, FaPlus, FaSync, FaCheckCircle,
  FaUserCheck, FaBuilding, FaUserTie, FaMoneyBillWave, FaHistory,
  FaExternalLinkAlt, FaFilePdf, FaExclamationTriangle, FaCopy, FaTimesCircle, FaClock,
  FaMapMarkerAlt, FaUser, FaTrashAlt, FaFire, FaChartLine, FaBell, FaCloudUploadAlt, FaQuestionCircle
} from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import dynamic from 'next/dynamic';
import { motion, AnimatePresence } from "framer-motion";

import { ModalReporte } from "./components/ModalReporte";
import { DocButton } from "./components/DocButton";
import { Sidebar } from "./components/Sidebar";
import { LoadingScreen, LoadingTab } from "./components/LoadingScreens";
import { ConfirmModal } from "./components/ConfirmModal";

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
const TabGuia = dynamic(() => import('./components/TabGuia').then(m => m.TabGuia), { loading: () => <LoadingTab /> });
const TabTicketsDev = dynamic(() => import('./components/TabTicketsDev').then(m => m.TabTicketsDev), { loading: () => <LoadingTab /> });

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
  guia: 'Guía y Soporte',
  tickets: 'Centro Desarrollador',
};

export default function AdminDashboard() {
  const router = useRouter();

  // --- HOOKS ---
  const {
    isRefreshing, isLoadingMore, totalRegistros, listaPerfiles, estudiantes, preinscripciones,
    solicitudes, agendaBD, catalogoCursos, logsRecientes, fetchData,
    historialInscripciones, hasMoreLogs, fetchMasLogs,
    hasMoreEstudiantes, fetchMasEstudiantes
  } = useData();

  const {
    userEmail, userName, userRole,
    horaIngreso, loading,
    cerrarSesion, registrarLog, currentSessionSeconds
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
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isModalEquipoOpen, setIsModalEquipoOpen] = useState(false);
  const [formEquipo, setFormEquipo] = useState({ email: "", pass: "", nombre: "" });
  const [modalARL, setModalARL] = useState<{ isOpen: boolean, item: any }>({ isOpen: false, item: null });
  const [datosARL, setDatosARL] = useState({ nombre: "", nit: "" });
  const [notificacionesNuevas, setNotificacionesNuevas] = useState(0);
  const [busqueda, setBusqueda] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState<string[]>([]);
  const [preciosEditados, setPreciosEditados] = useState<{ [key: string]: string }>({});
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [textoReporte, setTextoReporte] = useState("");
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<any>(null);
  const [cursoSeleccionadoParaEditar, setCursoSeleccionadoParaEditar] = useState("");
  const [descuentoAplicado, setDescuentoAplicado] = useState(0);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean,
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'danger' | 'warning' | 'info' | 'success'
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: 'warning'
  });

  const triggerConfirm = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' | 'info' | 'success' = 'warning') => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, type });
  };

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

  // Debounce para búsqueda en servidor
  useEffect(() => {
    if (loading) return;
    const timeout = setTimeout(() => {
      fetchData(false, busqueda);
    }, 500);
    return () => clearTimeout(timeout);
  }, [busqueda, loading, fetchData]);

  useRealtime({ fetchData, setActiveTab, setNotificacionesNuevas, userName: userName || undefined, userRole: userRole || undefined });

  // --- DARK MODE: Sincronizar con clase del <html> ---
  useEffect(() => {
    const saved = localStorage.getItem('admin_dark_mode');
    if (saved === 'true') setDarkMode(true);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('admin_dark_mode', darkMode ? 'true' : 'false');
  }, [darkMode]);

  // --- ATAJOS DE TECLADO ---
  useEffect(() => {
    const tabMap: Record<string, string> = {
      '0': 'guia', '1': 'dashboard', '2': 'lista', '3': 'solicitudes',
      '4': 'agenda', '5': 'estudiantes', '6': 'listados',
      '7': 'equipo', '8': 'logs', '9': 'precios'
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K = Enfocar buscador
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setActiveTab('lista');
        setTimeout(() => {
          const searchInput = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement;
          if (searchInput) searchInput.focus();
        }, 400);
        return;
      }

      // Ctrl+D = Toggle dark mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        setDarkMode(prev => !prev);
        return;
      }

      // Ctrl+1-9 = Cambiar pestaña
      if ((e.ctrlKey || e.metaKey) && tabMap[e.key]) {
        e.preventDefault();
        setActiveTab(tabMap[e.key]);
        return;
      }

      // Escape = Cerrar modales y menus
      if (e.key === 'Escape') {
        setIsProfileMenuOpen(false);
        setIsModalEquipoOpen(false);
        setModalOpen(false);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    historialInscripciones: historialInscripciones,
    estudiantesPorVencer: listaUnificada.filter(e => {
      if (!e.certificado_generado || !e.certificado_fecha_vencimiento) return false;
      const venc = new Date(e.certificado_fecha_vencimiento);
      const hoy = new Date();
      const limite = new Date();
      limite.setDate(limite.getDate() + 30); // 30 días o menos
      return venc >= hoy && venc <= limite;
    }),
    // 📊 Nuevos datos para gráficas (Contando directamente de los registros)
    distribucionCursos: Object.entries(
      listaUnificada.reduce((acc: any, curr: any) => {
        const c = curr.curso?.trim() || 'Sin Especificar';
        acc[c] = (acc[c] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]: any) => ({ name, value }))
     .sort((a: any, b: any) => b.value - a.value)
     .slice(0, 5),
    
    comparativaMensual: historialInscripciones.map(h => ({
      ...h,
      certificados: listaUnificada.filter(e => {
        if (!e.certificado_generado || !e.created_at) return false;
        const d = new Date(e.created_at);
        const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        return meses[d.getMonth()] === h.mes;
      }).length
    }))
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
    <div className={`flex h-screen text-slate-800 overflow-hidden selection:bg-blue-500 selection:text-white transition-colors duration-300 ${darkMode ? 'bg-slate-900' : 'bg-slate-100'}`}>
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

      <main className={`flex-1 h-screen overflow-y-auto relative transition-all duration-300 ${isCollapsed ? 'lg:pl-0' : ''} ${darkMode ? 'bg-slate-900' : 'bg-[#f8fafc]'}`}>
        <div className="p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto">

          {/* HEADER EJECUTIVO */}
          <header className={`flex flex-col sm:flex-row justify-between items-end sm:items-center mb-10 gap-4 pt-12 lg:pt-0 pb-8 border-b ${darkMode ? 'border-slate-700/60' : 'border-slate-200/60'}`}>
            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
              <h2 className={`text-3xl font-black uppercase tracking-tight leading-none mb-2 ${darkMode ? 'text-white' : 'text-[#0F172A]'}`}>
                {titulos[activeTab] || activeTab}
              </h2>
              <div className="flex items-center gap-2">
                <span className="w-8 h-[2px] bg-blue-600 rounded-full" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Gestión Institucional</p>
              </div>
            </div>

            {/* DARK MODE TOGGLE + PERFIL */}
            <div className="flex items-center gap-3">
              {/* Toggle Dark Mode */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-90 ${
                  darkMode 
                    ? 'bg-slate-700 text-yellow-400 border border-slate-600 hover:bg-slate-600' 
                    : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-blue-600'
                }`}
                title="Modo oscuro (Ctrl+D)"
              >
                {darkMode ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
              </button>

            {/* WIDGET PERFIL - PROFESIONAL (Desplegable) */}
            <div className="relative">
              <div
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`flex items-center gap-4 pl-2 pr-5 py-2 rounded-xl border shadow-sm hover:border-blue-500 transition-all cursor-pointer group ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
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
                <div className={`ml-2 text-slate-300 transition-transform duration-300 ${isProfileMenuOpen ? 'rotate-180 text-blue-500' : 'group-hover:text-blue-500'}`}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </div>

              {/* Menú Desplegable */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                    >
                      <div className="p-2 space-y-1">
                        <button
                          onClick={() => { setActiveTab('config'); setIsProfileMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                          <FaUserCog /> Mi Perfil
                        </button>
                        <button
                          onClick={() => { setActiveTab('guia'); setIsProfileMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        >
                          <FaQuestionCircle /> Guía / Soporte
                        </button>
                        <div className="h-px bg-slate-100 my-1" />
                        <button
                          onClick={() => { 
                            setIsProfileMenuOpen(false);
                            triggerConfirm(
                              "Cerrar Sesión", 
                              "¿Estás seguro de que deseas salir del panel administrativo?", 
                              cerrarSesion, 
                              "info"
                            ); 
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        >
                          <FaSignOutAlt /> Cerrar Sesión
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            </div>
          </header>
 
          {/* TABS (Con animación de transición) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
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
                  triggerConfirm={triggerConfirm}
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
                  triggerConfirm={triggerConfirm}
                  hasMoreEstudiantes={hasMoreEstudiantes}
                  fetchMasEstudiantes={fetchMasEstudiantes}
                  isLoadingMore={isLoadingMore}
                  totalRegistros={totalRegistros}
                />
              )}

              {activeTab === "logs" && (
                <TabLogs
                  userRole={userRole}
                  logsRecientes={logsRecientes}
                  hasMoreLogs={hasMoreLogs}
                  fetchMasLogs={fetchMasLogs}
                />
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
                  triggerConfirm={triggerConfirm}
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
                  registrarLog={registrarLog}
                  triggerConfirm={triggerConfirm}
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
                  currentSessionSeconds={currentSessionSeconds}
                  triggerConfirm={triggerConfirm}
                  setActiveTab={setActiveTab}
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

              {activeTab === "guia" && (
                <TabGuia userName={userName} userRole={userRole} />
              )}

              {activeTab === "tickets" && (
                <TabTicketsDev />
              )}
            </motion.div>
          </AnimatePresence>

        </div>
      </main>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        type={confirmModal.type}
      />
    </div>
  );
}