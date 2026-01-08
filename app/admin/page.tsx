"use client";

import React, { useState, useEffect } from "react";
import { 
  FaUsers, FaUserPlus, FaSignOutAlt, FaUserCog, FaEnvelope, FaShieldAlt, 
  FaTrash, FaIdCard, FaFileMedical, FaShieldVirus, FaBars, FaTimes,
  FaCalendarAlt, FaPhoneAlt, FaClipboardList, FaPlus, FaSync, FaCheckCircle, 
  FaUserCheck, FaBuilding, FaUserTie, FaMoneyBillWave, FaHistory, 
  FaExternalLinkAlt, FaFilePdf, FaExclamationTriangle, FaCopy, FaTimesCircle, FaClock
} from "react-icons/fa";
import { supabase } from "@/lib/supabase"; 
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

// --- COMPONENTE: MODAL REPORTE (NUEVO) ---
function ModalReporte({ isOpen, onClose, texto }: { isOpen: boolean, onClose: () => void, texto: string }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="bg-[#0F172A] p-4 text-white flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2"><FaEnvelope className="text-yellow-400"/> Notificación</h3>
          <button onClick={onClose}><FaTimes/></button>
        </div>
        <div className="p-6">
          <textarea className="w-full h-48 p-4 bg-slate-50 border rounded-xl text-xs font-mono text-slate-700 resize-none outline-none" value={texto} readOnly />
          <button onClick={() => { navigator.clipboard.writeText(texto); toast.success("Copiado"); }} className="mt-4 w-full py-3 bg-[#1E3A8A] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-900 transition shadow-lg">
            <FaCopy/> Copiar Texto
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  
  // --- ESTADOS GLOBALES ---
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("solicitudes");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // INFO USUARIO
  const [userEmail, setUserEmail] = useState<string | undefined>("");
  const [userName, setUserName] = useState("Cargando...");
  const [userRole, setUserRole] = useState("");
  const [horaIngreso] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // DATOS
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [preinscripciones, setPreinscripciones] = useState<any[]>([]); // DATA WEB
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [agendaBD, setAgendaBD] = useState<any[]>([]);
  const [catalogoCursos, setCatalogoCursos] = useState<any[]>([]);
  const [logsRecientes, setLogsRecientes] = useState<any[]>([]); // LOGS

  // ESTADOS AUXILIARES (Filtros, Modales, Edición)
  const [busqueda, setBusqueda] = useState("");
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState<string[]>([]);
  const [preciosEditados, setPreciosEditados] = useState<{ [key: string]: string }>({});
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [horaNueva, setHoraNueva] = useState("07:00");
  const [modalOpen, setModalOpen] = useState(false);
  const [textoReporte, setTextoReporte] = useState("");

  const listaCursos = [
    "Trabajo en alturas – Nivel básico", "Trabajo en alturas – Nivel avanzado",
    "Reentrenamiento en trabajo en alturas", "Jefes de área", "Trabajador autorizado",
    "Coordinador de trabajo en alturas", "Autorización de coordinador",
    "Armado de andamios", "Andamios", "Rescate industrial"
  ];

  const [cursoSeleccionadoParaEditar, setCursoSeleccionadoParaEditar] = useState(listaCursos[0]);
  const [descuentoAplicado, setDescuentoAplicado] = useState(0);
  const [formData, setFormData] = useState({ 
    nombre: "", cedula: "", telefono: "", curso: "", 
    estadoPago: "Pendiente", email: "", precio_pactado: "" 
  });

  // --- CARGA DE DATOS COMPLETA ---
  const fetchData = async () => {
    // 1. Datos Antiguos
    const { data: est } = await supabase.from('estudiantes').select('*').order('created_at', { ascending: false });
    const { data: sol } = await supabase.from('solicitudes').select('*').order('created_at', { ascending: false });
    const { data: age } = await supabase.from('agenda').select('*').order('fecha', { ascending: true });
    const { data: cat } = await supabase.from('configuracion_cursos').select('*');
    
    // 2. Datos Nuevos (Web y Logs)
    const { data: pre } = await supabase.from('preinscripciones').select('*').order('created_at', { ascending: false });
    const { data: logs } = await supabase.from('logs_actividad').select('*').order('created_at', { ascending: false }).limit(20);

    if (est) setEstudiantes(est);
    if (sol) setSolicitudes(sol);
    if (age) setAgendaBD(age);
    if (cat) setCatalogoCursos(cat);
    if (pre) setPreinscripciones(pre);
    if (logs) setLogsRecientes(logs);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/admin/login"); return; }
      
      setUserEmail(session.user.email);
      
      // Obtener perfil detallado para el nombre y rol
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (profile) {
        setUserName(profile.full_name || "Admin");
        setUserRole(profile.role || "coordinator");
      } else {
        setUserName("Admin General");
        setUserRole("admin_general");
      }
      
      setLoading(false); 
      fetchData();
    };
    checkUser();
  }, [router]);

  // --- LÓGICA: WHATSAPP Y PRECIOS (ANTIGUO) ---
  const obtenerPrecioBase = (nombreCurso: string) => {
    const curso = catalogoCursos.find(c => c.nombre_curso === nombreCurso);
    return curso ? parseFloat(curso.precio_base) : 180000;
  };

  const calcularTotalSolicitud = (sol: any, descuento: number) => {
    let subtotal = 0;
    if (sol.cursos_detalles && Array.isArray(sol.cursos_detalles)) {
      sol.cursos_detalles.forEach((item: any) => {
        const base = obtenerPrecioBase(item.curso);
        subtotal += base * parseInt(item.cantidad || "1");
      });
    } else {
      const base = obtenerPrecioBase(sol.curso);
      subtotal = base * (sol.numero_personas || 1);
    }
    const final = subtotal - (subtotal * (descuento / 100));
    return final.toLocaleString('es-CO');
  };

  const formatFechaElegante = (fechaStr: string) => {
    const fecha = new Date(fechaStr + "T00:00:00");
    return fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^\w/, (c) => c.toUpperCase());
  };

  const enviarWhatsAppMultifecha = (sol: any) => {
    const seleccion = agendaBD.filter(a => fechasSeleccionadas.includes(a.id));
    if (seleccion.length === 0) return toast.error("Selecciona fechas primero");
    
    const pFinal = preciosEditados[sol.id] || calcularTotalSolicitud(sol, 0);
    const esEmpresa = sol.tipo_cliente === "Empresa";
    const nombreCliente = esEmpresa ? `${sol.nombre} (${sol.empresa.toUpperCase()})` : sol.nombre;

    let detallesCursosYFechas = "";
    const cursosParaMensaje = sol.cursos_detalles ? sol.cursos_detalles : [{ curso: sol.curso, cantidad: sol.numero_personas || 1 }];

    cursosParaMensaje.forEach((item: any) => {
      const fechasDeEsteCurso = seleccion
        .filter(a => a.curso === item.curso)
        .map(a => `   - ${formatFechaElegante(a.fecha)} a las ${a.hora}`)
        .join("\n");
      
      if (fechasDeEsteCurso) {
        const infoCurso = esEmpresa ? `*${item.curso.toUpperCase()}* (${item.cantidad} personas)` : `*${item.curso.toUpperCase()}*`;
        detallesCursosYFechas += `\n${infoCurso}:\n${fechasDeEsteCurso}\n`;
      }
    });

    const msg = `Hola *${nombreCliente}*, un gusto saludarte de *AR Costa*.\n\n` +
      `Adjuntamos la propuesta de capacitación:\n` +
      `${detallesCursosYFechas}\n` +
      `VALOR TOTAL: *$${pFinal}*\n\n` +
      `¿Confirmamos estos horarios para reservar sus cupos?`;

    window.open(`https://wa.me/57${sol.telefono.replace(/\s/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    setFechasSeleccionadas([]);
  };

  // --- LÓGICA: NUEVA DE VERIFICACIÓN (SEMAFORO) ---
  const registrarLog = async (action: string, details: string) => {
    await supabase.from('logs_actividad').insert([{ admin_name: userName, action, details }]);
  };

  const toggleVerificacion = async (item: any, docId: string, docLabel: string) => {
    // 1. Obtener estado actual
    const currentVerification = item.doc_verification || {};
    const currentState = currentVerification[docId]?.status || 'pending';

    // 2. Determinar nuevo estado (Ciclo: Pending -> Approved -> Rejected -> Approved)
    let newState = 'approved';
    if (currentState === 'approved') newState = 'rejected';
    else if (currentState === 'rejected') newState = 'approved';

    // 3. Crear objeto de actualización
    const timestamp = new Date().toLocaleString('es-CO');
    const newVerificationData = {
      ...currentVerification,
      [docId]: { status: newState, by: userName, at: timestamp }
    };

    // 4. Guardar en BD (Detectar si es de estudiantes o preinscripciones)
    const tabla = item.origen; 
    const { error } = await supabase.from(tabla).update({ doc_verification: newVerificationData }).eq('id', item.id);

    if (!error) {
      if(newState === 'approved') toast.success(`✅ ${docLabel} Aprobado`);
      if(newState === 'rejected') toast.error(`❌ ${docLabel} Rechazado`);
      await registrarLog(newState === 'approved' ? "Aprobó Documento" : "Rechazó Documento", `${docLabel} de ${item.nombre} (${newState.toUpperCase()})`);
      fetchData();
    } else {
      toast.error("Error al guardar estado");
    }
  };

  const obtenerRequeridos = (curso: string) => {
    const c = (curso || "").toLowerCase();
    let reqs: { id: string; label: string; oldId: string | null; icon: any }[] = [
      { id: 'url_cc', label: 'Cédula', oldId: 'url_cedula', icon: <FaIdCard/> },
      { id: 'url_arl', label: 'ARL', oldId: 'url_seguridad_social', icon: <FaShieldVirus/> },
      { id: 'url_emo', label: 'Médico', oldId: 'url_medico', icon: <FaFileMedical/> },
      { id: 'url_eps', label: 'EPS', oldId: 'url_seguridad_social', icon: <FaShieldVirus/> }
    ];
    if (c.includes("reentrenamiento") || c.includes("coordinador") || c.includes("jefe")) {
      reqs.push({ id: 'url_cert_altura', label: 'Cert. Altura', oldId: 'url_cert_altura', icon: <FaFilePdf/> });
    }
    if (c.includes("coordinador") || c.includes("jefe")) {
      reqs.push({ id: 'url_cert_sst', label: 'SST 20h', oldId: 'url_cert_sst', icon: <FaFilePdf/> });
    }
    return reqs;
  };

  const getDocUrl = (item: any, docId: string, oldId: string | null) => {
    return item[docId] || (oldId ? item[oldId] : null);
  };

  // --- ACCIONES BD GENERALES ---
  const registrarEstudiante = async (e: React.FormEvent) => {
    e.preventDefault();
    const tId = toast.loading("Matriculando...");
    const { error } = await supabase.from('estudiantes').insert([{ 
      nombre: formData.nombre,
      cedula: formData.cedula,
      telefono: formData.telefono,
      curso: formData.curso,
      email: formData.email,
      estado_pago: formData.estadoPago,
      estado_documentacion: "Pendiente",
      resultado_final: "Pendiente",
      precio_final: formData.precio_pactado || (obtenerPrecioBase(formData.curso) - (obtenerPrecioBase(formData.curso) * (descuentoAplicado/100))).toLocaleString('es-CO')
    }]);
    
    if (error) toast.error(error.message, { id: tId });
    else { 
      toast.success("Estudiante Matriculado", { id: tId }); 
      setFormData({ nombre: "", cedula: "", telefono: "", curso: "", estadoPago: "Pendiente", email: "", precio_pactado: "" });
      setActiveTab("lista"); fetchData();
    }
  };

  const actualizarPrecioMaestro = async (id: string, nuevoPrecio: string) => {
    const { error } = await supabase.from('configuracion_cursos').update({ precio_base: nuevoPrecio }).eq('id', id);
    if (!error) { toast.success("Precio actualizado"); fetchData(); }
  };

  const actualizarEstadoEstudiante = async (tabla: string, id: string, campo: string, valor: string, nombre: string) => {
    const { error } = await supabase.from(tabla).update({ [campo]: valor }).eq('id', id);
    if (!error) { toast.success("Actualizado"); registrarLog("Editó Dato", `Cambió ${campo} en ${nombre}`); fetchData(); }
  };

  const guardarEnAgenda = async () => {
    const { error } = await supabase.from('agenda').insert([{ curso: cursoSeleccionadoParaEditar, fecha: fechaSeleccionada, hora: horaNueva }]);
    if (!error) { toast.success("Agenda actualizada"); fetchData(); }
  };

  const generarReporte = (est: any) => {
    const requeridos = obtenerRequeridos(est.curso);
    const verif = est.doc_verification || {};
    const faltantes: string[] = [];
    const rechazados: string[] = [];

    requeridos.forEach(req => {
      if (!getDocUrl(est, req.id, req.oldId)) faltantes.push(req.label);
      else if (verif[req.id]?.status === 'rejected') rechazados.push(req.label);
    });
    
    let msg = `Hola *${est.nombre}*, mensaje de AR Costa.\nCurso: *${est.curso}*.\n\n`;
    if (faltantes.length === 0 && rechazados.length === 0) {
      msg += `✅ *DOCUMENTACIÓN APROBADA*.\nEstado Pago: *${est.estado_pago || 'Pendiente'}*.\n`;
    } else {
      msg += `⚠️ *NOVEDADES EN DOCUMENTACIÓN*:\n`;
      if(rechazados.length > 0) rechazados.forEach(f => msg += `❌ ${f} (Rechazado/Illegible)\n`);
      if(faltantes.length > 0) faltantes.forEach(f => msg += `⚠️ ${f} (Faltante)\n`);
    }
    msg += `\nAtte: ${userName}.`;
    setTextoReporte(msg);
    setModalOpen(true);
  };

  const borrarRegistro = async (tabla: string, id: string) => {
    if (userRole !== 'admin_general') return toast.error("⛔ Acceso Denegado");
    if(!confirm("¿Borrar permanentemente?")) return;
    const { error } = await supabase.from(tabla).delete().eq('id', id);
    if (!error) { toast.success("Eliminado"); fetchData(); }
  };

  // --- FILTROS ---
  const listaUnificada = [
    ...preinscripciones.map(p => ({ ...p, origen: 'preinscripciones', etiqueta: 'WEB' })),
    ...estudiantes.map(e => ({ ...e, origen: 'estudiantes', etiqueta: 'MANUAL' }))
  ].filter(i => JSON.stringify(i).toLowerCase().includes(busqueda.toLowerCase()));

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#f1f5f9] font-bold text-slate-400">CARGANDO...</div>;

  return (
    <div className="flex h-screen bg-[#f1f5f9] text-[#334155] overflow-hidden">
      <Toaster position="bottom-right" />
      <ModalReporte isOpen={modalOpen} onClose={() => setModalOpen(false)} texto={textoReporte} />
      
      {/* SIDEBAR */}
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-[#1e293b] text-white rounded-xl shadow-lg">
        {isSidebarOpen ? <FaTimes size={20}/> : <FaBars size={20}/>}
      </button>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1e293b] text-slate-300 transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex lg:flex-col shadow-xl flex-shrink-0`}>
        <div className="p-6 text-xl font-bold border-b border-slate-700 text-white tracking-tight">AR Costa <span className="text-blue-400">Admin</span></div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'solicitudes', icon: <FaClipboardList />, label: 'Solicitudes Web' },
            { id: 'agenda', icon: <FaCalendarAlt />, label: 'Calendario / Agenda' },
            { id: 'estudiantes', icon: <FaUserPlus />, label: 'Matricular Nuevo' },
            { id: 'lista', icon: <FaUsers />, label: 'Base de Datos' },
            { id: 'logs', icon: <FaHistory />, label: 'Auditoría / Logs' },
            { id: 'listados', icon: <FaUserCheck />, label: 'Planillas de Clase' },
            { id: 'precios', icon: <FaMoneyBillWave />, label: 'Precios Cursos' },
            { id: 'config', icon: <FaUserCog />, label: 'Mi Perfil' },
          ].map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-slate-800 hover:text-white'}`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => supabase.auth.signOut().then(() => router.push("/admin/login"))} className="m-4 flex items-center gap-3 px-4 py-3 bg-red-900/30 hover:bg-red-800 text-red-200 rounded-lg transition"><FaSignOutAlt /> Salir</button>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto relative bg-[#f1f5f9] pt-16 lg:pt-0">
        <div className="p-4 md:p-10 max-w-[1800px] mx-auto">
          
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[#1e293b] capitalize">{activeTab.replace('precios', 'Configuración de Precios')}</h2>
              <p className="text-xs text-slate-500 font-bold uppercase mt-1">Panel Administrativo</p>
            </div>
            <div className="flex items-center gap-3 bg-white p-2 pr-5 rounded-full border border-slate-200 shadow-sm">
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white uppercase">{userEmail?.charAt(0)}</div>
              <div className="flex flex-col"><span className="text-xs font-bold text-slate-700">{userName}</span><span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">🟢 Conectado</span></div>
            </div>
          </header>

          {/* --- VISTA: SOLICITUDES (ANTIGUO) --- */}
          {activeTab === "solicitudes" && (
            <div className="grid gap-6 animate-in fade-in">
              {solicitudes.map((sol) => (
                <div key={sol.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {sol.tipo_cliente === "Empresa" ? <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1"><FaBuilding/> EMPRESA: {sol.empresa}</span> : <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1"><FaUsers/> PARTICULAR</span>}
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FaUserTie className="text-slate-400" size={14}/> {sol.nombre}</h4>
                      {sol.disponibilidad_cliente && (
                        <div className="mt-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800 italic">
                          <b className="text-[10px] uppercase not-italic block mb-1 text-amber-600">Disponibilidad/Observaciones:</b> "{sol.disponibilidad_cliente}"
                        </div>
                      )}
                    </div>
                    <button onClick={async () => { if(confirm("¿Eliminar?")) { await supabase.from('solicitudes').delete().eq('id', sol.id); fetchData(); }}} className="text-slate-200 hover:text-red-500"><FaTrash size={14}/></button>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 mb-4 border border-slate-100">
                    {sol.cursos_detalles ? sol.cursos_detalles.map((c: any, i: number) => (
                      <div key={i} className="flex flex-col py-2 border-b last:border-0">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-700">{c.curso}</span>
                          <span className="text-blue-600 font-black">{c.cantidad} pers.</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {agendaBD.filter(a => a.curso === c.curso).map(op => (
                            <button key={op.id} onClick={() => fechasSeleccionadas.includes(op.id) ? setFechasSeleccionadas(prev => prev.filter(f => f !== op.id)) : setFechasSeleccionadas(prev => [...prev, op.id])} className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all ${fechasSeleccionadas.includes(op.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400'}`}>{formatFechaElegante(op.fecha).split(',')[1]} ({op.hora})</button>
                          ))}
                        </div>
                      </div>
                    )) : (
                      <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold">{sol.curso} ({sol.numero_personas || 1} pers.)</span>
                        <div className="flex flex-wrap gap-1">
                           {agendaBD.filter(a => a.curso === sol.curso).map(op => (
                            <button key={op.id} onClick={() => fechasSeleccionadas.includes(op.id) ? setFechasSeleccionadas(prev => prev.filter(f => f !== op.id)) : setFechasSeleccionadas(prev => [...prev, op.id])} className={`px-2 py-1 rounded-lg text-[9px] font-bold border transition-all ${fechasSeleccionadas.includes(op.id) ? 'bg-blue-600 text-white' : 'bg-white'}`}>{formatFechaElegante(op.fecha)}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t pt-4">
                    <div className="flex gap-2">
                      {[0, 10, 20, 30].map(d => (
                        <button key={d} onClick={() => setPreciosEditados({...preciosEditados, [sol.id]: calcularTotalSolicitud(sol, d)})} className={`px-2 py-1 rounded text-[10px] font-bold border ${preciosEditados[sol.id] === calcularTotalSolicitud(sol, d) ? 'bg-blue-600 text-white' : 'bg-slate-50'}`}>{d === 0 ? 'Base' : `${d}% OFF`}</button>
                      ))}
                    </div>
                    <div className="bg-blue-50/50 px-4 py-2 rounded-xl border border-dashed border-blue-200">
                      <div className="flex items-center gap-1 font-black text-blue-800 text-lg">
                        <span>$</span><input type="text" className="bg-transparent outline-none w-32" value={preciosEditados[sol.id] || calcularTotalSolicitud(sol, 0)} onChange={(e) => setPreciosEditados({...preciosEditados, [sol.id]: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  <button onClick={() => enviarWhatsAppMultifecha(sol)} className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-lg transition-all"><FaPhoneAlt/> Enviar Propuesta a WhatsApp</button>
                </div>
              ))}
            </div>
          )}

          {/* --- VISTA: LISTA BASE DE DATOS (NUEVA CON LÓGICA DE SEMÁFORO) --- */}
          {activeTab === "lista" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
                <input type="text" placeholder="Buscar por nombre o cédula..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl outline-none" />
                <button onClick={fetchData} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600 flex items-center gap-2"><FaSync/> Actualizar</button>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[1200px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400 text-[10px] uppercase border-b font-black tracking-widest">
                        <th className="px-6 py-4">Estudiante / Cédula</th>
                        <th className="px-6 py-4">Documentación</th>
                        <th className="px-6 py-4">Pago / Valor Final</th>
                        <th className="px-6 py-4">Aptitud</th>
                        <th className="px-6 py-4">Asignar Clase</th>
                        <th className="px-6 py-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {listaUnificada.map((item: any) => {
                      const reqs = obtenerRequeridos(item.curso);
                      const verificacion = item.doc_verification || {};

                      return (
                      <tr key={item.id + item.origen} className="hover:bg-slate-50 transition group">
                        <td className="px-6 py-4">
                            <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black mb-1 ${item.etiqueta === 'WEB' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>{item.etiqueta}</span>
                            <div className="font-bold text-slate-700">{item.nombre}</div>
                            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1"><FaIdCard size={10}/> {item.cedula}</div>
                            <div className="text-[10px] text-blue-500 font-bold uppercase mt-1">{item.curso}</div>
                        </td>
                        <td className="px-6 py-4">
                            <div className="flex flex-col gap-1.5">
                                {reqs.map(r => (
                                    <DocButton 
                                        key={r.id}
                                        label={r.label}
                                        url={getDocUrl(item, r.id, r.oldId)}
                                        icon={r.icon}
                                        statusData={verificacion[r.id]}
                                        onToggle={() => toggleVerificacion(item, r.id, r.label)}
                                    />
                                ))}
                            </div>
                        </td>
                        <td className="px-6 py-4">
                            <select value={item.estado_pago || "Pendiente"} onChange={(e)=>actualizarEstadoEstudiante(item.origen, item.id, 'estado_pago', e.target.value, item.nombre)} className={`text-[10px] p-1.5 rounded border-none font-bold w-full mb-1 ${item.estado_pago === 'Pagado' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}><option value="Pendiente">PENDIENTE</option><option value="Pagado">PAGADO</option></select>
                            <div className="flex items-center gap-1 font-bold text-blue-600 text-xs">$ <input defaultValue={item.precio_final || item.precio_pactado || "0"} onBlur={(e) => actualizarEstadoEstudiante(item.origen, item.id, item.origen === 'preinscripciones' ? 'precio_pactado' : 'precio_final', e.target.value, item.nombre)} className="w-20 bg-transparent outline-none border-b border-transparent hover:border-blue-300"/></div>
                        </td>
                        <td className="px-6 py-4"><select value={item.resultado_final || "Pendiente"} onChange={(e)=>actualizarEstadoEstudiante(item.origen, item.id, 'resultado_final', e.target.value, item.nombre)} className={`text-[10px] p-1.5 rounded font-black w-full ${item.resultado_final === 'APTO' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}><option>Pendiente</option><option>APTO</option><option>NO APTO</option></select></td>
                        <td className="px-6 py-4">{item.resultado_final === "APTO" ? (item.agenda_id ? <span className="text-[10px] font-bold text-green-600 flex items-center gap-1"><FaCheckCircle/> ASIGNADO</span> : <select className="text-[10px] p-1 border rounded bg-blue-50 w-full" onChange={(e) => actualizarEstadoEstudiante(item.origen, item.id, 'agenda_id', e.target.value)}><option value="">Elegir fecha...</option>{agendaBD.filter(a => a.curso === item.curso).map(a => <option key={a.id} value={a.id}>{formatFechaElegante(a.fecha)}</option>)}</select>) : "N/A"}</td>
                        <td className="px-6 py-4 text-center space-y-2">
                            <button onClick={() => generarReporte(item)} className="w-full py-1.5 bg-slate-800 text-white rounded text-[9px] font-bold uppercase hover:bg-slate-900 transition flex items-center justify-center gap-1"><FaEnvelope className="text-yellow-400"/> Reporte</button>
                            <button onClick={() => borrarRegistro(item.origen, item.id)} className="text-red-300 hover:text-red-500 transition"><FaTrash size={12}/></button>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* --- VISTA: LOGS (NUEVA) --- */}
          {activeTab === 'logs' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4 animate-in fade-in">
              <h3 className="font-bold text-slate-700 flex items-center gap-2"><FaHistory/> Historial de Actividad</h3>
              {logsRecientes.map(log => (<div key={log.id} className="border-b pb-2 last:border-0"><p className="text-sm font-bold text-slate-800">{log.action} <span className="font-normal text-slate-500">por {log.admin_name}</span></p><p className="text-xs text-slate-400">{log.details} • {new Date(log.created_at).toLocaleString()}</p></div>))}
            </div>
          )}

          {/* --- VISTA: PRECIOS MAESTROS (ANTIGUO) --- */}
          {activeTab === "precios" && (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm animate-in fade-in">
              <div className="p-6 border-b bg-slate-50"><h3 className="font-bold text-slate-700 flex items-center gap-2"><FaMoneyBillWave className="text-blue-600"/> Lista de Precios Base</h3></div>
              <table className="w-full text-left text-sm">
                <thead><tr className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b"><th className="px-6 py-4">Curso</th><th className="px-6 py-4">Precio Base</th><th className="px-6 py-4">Acción</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {catalogoCursos.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-bold text-slate-700">{c.nombre_curso}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-blue-600 font-bold">$ <input type="number" defaultValue={c.precio_base} onBlur={(e) => actualizarPrecioMaestro(c.id, e.target.value)} className="bg-transparent border-b border-blue-200 w-24 outline-none focus:border-blue-600 transition-colors" /></div>
                      </td>
                      <td className="px-6 py-4"><span className="text-[10px] text-slate-400 italic">Auto-guardar al salir del campo</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* --- VISTA: AGENDA (ANTIGUO) --- */}
          {activeTab === "agenda" && (
            <div className="grid md:grid-cols-3 gap-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit">
                <h3 className="font-bold mb-4 flex items-center gap-2"><FaPlus className="text-blue-500"/> Nuevo Bloque</h3>
                <div className="space-y-4">
                  <select className="w-full p-2 bg-slate-50 border rounded-lg text-sm" value={cursoSeleccionadoParaEditar} onChange={(e) => setCursoSeleccionadoParaEditar(e.target.value)}>{listaCursos.map(c => <option key={c} value={c}>{c}</option>)}</select>
                  <input type="date" className="w-full p-2 border rounded-lg" value={fechaSeleccionada} onChange={(e) => setFechaSeleccionada(e.target.value)} />
                  <input type="time" className="w-full p-2 border rounded-lg" value={horaNueva} onChange={(e) => setHoraNueva(e.target.value)} />
                  <button onClick={guardarEnAgenda} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg">Crear en Agenda</button>
                </div>
              </div>
              <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200">
                <h3 className="font-bold mb-4 uppercase text-slate-400 text-xs">Cupos para: {formatFechaElegante(fechaSeleccionada)}</h3>
                {agendaBD.filter(a => a.fecha === fechaSeleccionada).map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border-l-4 border-blue-500 mb-2">
                    <div><p className="text-xs font-bold text-blue-600">{item.hora}</p><p className="text-sm font-bold">{item.curso}</p></div>
                    <button onClick={async () => { if(confirm("¿Borrar?")) { await supabase.from('agenda').delete().eq('id', item.id); fetchData(); }}} className="text-red-200 hover:text-red-500"><FaTrash size={14}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- VISTA: LISTADOS (ANTIGUO) --- */}
          {activeTab === "listados" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="font-bold mb-2">Ver Planilla del Día</h3><input type="date" className="p-2 border rounded-lg" value={fechaSeleccionada} onChange={(e) => setFechaSeleccionada(e.target.value)} /></div>
              {agendaBD.filter(a => a.fecha === fechaSeleccionada).map(bloque => (
                <div key={bloque.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-4">
                  <div className="bg-[#1e293b] p-4 text-white flex justify-between items-center"><div><span className="font-bold block uppercase text-xs text-blue-400">{formatFechaElegante(bloque.fecha)}</span><span className="font-bold">{bloque.curso}</span></div><span className="text-xs bg-blue-600 px-2 py-1 rounded font-bold">{bloque.hora}</span></div>
                  <div className="p-4">{estudiantes.filter(e => e.agenda_id === bloque.id).length > 0 ? (<div className="space-y-2">{estudiantes.filter(e => e.agenda_id === bloque.id).map((e, idx) => (<div key={e.id} className="flex justify-between items-center border-b pb-2 text-sm"><span>{idx + 1}. <b>{e.nombre}</b></span><span className="text-slate-400 font-mono text-[10px]">{e.cedula}</span></div>))}</div>) : <p className="text-xs text-slate-400 italic">No hay estudiantes asignados.</p>}</div>
                </div>
              ))}
            </div>
          )}

          {/* --- VISTA: ESTUDIANTES MANUALES (ANTIGUO) --- */}
          {activeTab === "estudiantes" && (
            <div className="max-w-4xl bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mx-auto animate-in fade-in">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><FaUserPlus className="text-blue-600"/> Matriculación Manual</h3>
              <form onSubmit={registrarEstudiante} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input required placeholder="Nombre Completo" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.nombre} onChange={(e)=>setFormData({...formData, nombre: e.target.value})} />
                <input required placeholder="Documento (Cédula)" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.cedula} onChange={(e)=>setFormData({...formData, cedula: e.target.value})} />
                <select required className="md:col-span-2 p-3 bg-slate-50 border rounded-xl outline-none" value={formData.curso} onChange={(e)=>setFormData({...formData, curso: e.target.value})}><option value="">Seleccione el curso...</option>{listaCursos.map(c => <option key={c} value={c}>{c}</option>)}</select>
                <input placeholder="WhatsApp" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.telefono} onChange={(e)=>setFormData({...formData, telefono: e.target.value})} />
                <input type="email" placeholder="Correo" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} />
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Estado del Pago</label>
                  <select className="w-full p-3 bg-slate-50 border rounded-xl outline-none mt-1" value={formData.estadoPago} onChange={(e)=>setFormData({...formData, estadoPago: e.target.value})}><option value="Pendiente">Pendiente</option><option value="Pagado">Pagado</option></select>
                </div>
                <div className="md:col-span-2 flex gap-2">{[0, 10, 20, 30].map(d => (<button key={d} type="button" onClick={() => setDescuentoAplicado(d)} className={`flex-1 p-3 rounded-xl text-xs font-bold border ${descuentoAplicado === d ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}>{d === 0 ? 'Sin Descuento' : `${d}% OFF`}</button>))}</div>
                <input placeholder="Valor Pactado ($)" className="p-3 bg-blue-50 border border-blue-100 rounded-xl outline-none font-bold text-blue-700" value={formData.precio_pactado || (obtenerPrecioBase(formData.curso) - (obtenerPrecioBase(formData.curso) * (descuentoAplicado/100))).toLocaleString('es-CO')} onChange={(e)=>setFormData({...formData, precio_pactado: e.target.value})} />
                <button type="submit" className="md:col-span-2 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg">Completar Matrícula</button>
              </form>
            </div>
          )}

          {/* --- VISTA: CONFIGURACIÓN (ANTIGUO) --- */}
          {activeTab === "config" && (
            <div className="max-w-2xl bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mx-auto animate-in fade-in">
              <div className="bg-gradient-to-r from-[#1e293b] to-[#334155] p-8 text-white flex justify-between items-center">
                <div><h3 className="text-2xl font-bold">Mi Perfil</h3><p className="text-blue-400 text-xs uppercase tracking-widest font-bold mt-1">Sesión Administrativa</p></div>
                <FaUserCog size={40} className="opacity-20"/>
              </div>
              <div className="p-8 space-y-4">
                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><FaEnvelope size={20}/></div>
                  <div><p className="text-[10px] font-bold uppercase text-slate-400">Usuario</p><p className="text-lg font-bold text-slate-700">{userEmail}</p></div>
                </div>
                <div className="flex items-center gap-4 p-5 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl"><FaShieldAlt size={20}/></div>
                  <div><p className="text-[10px] font-bold uppercase text-slate-400">Rango de Acceso</p><p className="text-lg font-bold text-emerald-700">Administrador General</p></div>
                </div>
                <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="p-3 bg-slate-200 text-slate-600 rounded-xl"><FaSync size={20}/></div>
                  <div><p className="text-[10px] font-bold uppercase text-slate-400">Hora de ingreso al panel</p><p className="text-sm font-mono text-slate-600 font-bold">{horaIngreso}</p></div>
                </div>
                <div className="pt-6 border-t border-slate-100 mt-4">
                  <button onClick={() => { if(confirm("¿Seguro que deseas cerrar sesión?")) { supabase.auth.signOut().then(() => router.push("/admin/login")); }}} className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100">
                    <FaSignOutAlt size={18} /> Cerrar Sesión
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// --- SUB-COMPONENTE: BOTÓN DE DOCUMENTO INTELIGENTE ---
function DocButton({ label, url, icon, statusData, onToggle }: { label: string, url: string | null, icon: any, statusData: any, onToggle: () => void }) {
  const status = statusData?.status || 'pending';
  
  const visual = {
    pending: { 
      bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", 
      btnBg: "bg-amber-100 hover:bg-emerald-100 hover:text-emerald-600", btnIcon: <FaCheckCircle size={10}/>
    },
    approved: { 
      bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", 
      btnBg: "bg-emerald-100 text-emerald-600 hover:bg-red-100 hover:text-red-600", btnIcon: <FaCheckCircle size={10}/>
    },
    rejected: { 
      bg: "bg-red-50", text: "text-red-600", border: "border-red-200", 
      btnBg: "bg-red-100 text-red-600 hover:bg-emerald-100 hover:text-emerald-600", btnIcon: <FaTimesCircle size={10}/>
    }
  }[status as 'pending' | 'approved' | 'rejected'];

  if (!url) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-300 italic opacity-70">
        <span className="text-[10px]"><FaExclamationTriangle/></span>
        <span className="text-[9px] font-bold uppercase">{label} (Falta)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 group relative">
      <a href={url} target="_blank" rel="noopener noreferrer" className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all ${visual.bg} ${visual.text} ${visual.border}`} title="Clic para abrir documento">
        <span className="text-[10px]">{icon}</span>
        <span className="text-[9px] font-bold uppercase">{label}</span>
        <FaExternalLinkAlt className="ml-auto opacity-0 group-hover:opacity-50" size={8}/>
      </a>
      <button onClick={onToggle} className={`p-1.5 rounded-lg transition border border-transparent ${visual.btnBg} relative group/btn`}>
        {visual.btnIcon}
        {statusData?.by && (
          <div className="absolute bottom-full right-0 mb-2 w-max max-w-[200px] hidden group-hover/btn:block z-50 animate-in fade-in zoom-in">
            <div className="bg-[#1e293b] text-white text-[9px] p-2 rounded-lg shadow-xl relative">
              <p className="font-bold flex items-center gap-1"><FaUsers size={8}/> {statusData.by}</p>
              <p className="font-mono text-slate-300 flex items-center gap-1 mt-1"><FaClock size={8}/> {statusData.at}</p>
              <div className="absolute top-full right-2 -mt-1 border-4 border-transparent border-t-[#1e293b]"></div>
            </div>
          </div>
        )}
      </button>
    </div>
  );
}