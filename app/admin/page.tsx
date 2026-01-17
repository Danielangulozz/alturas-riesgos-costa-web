"use client";

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { registrarCertificacion, generarPDFCertificado, revocarCertificacion } from "@/lib/certificadoLogic";
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

// --- COMPONENTE: MODAL REPORTE ---

// --- COMPONENTE: MODAL REPORTE (ACTUALIZADO) ---
function ModalReporte({ isOpen, onClose, texto, telefono }: { isOpen: boolean, onClose: () => void, texto: string, telefono: string }) {
  if (!isOpen) return null;
  
  const enviarWhatsApp = () => {
    const num = telefono.replace(/\s/g, '').replace('+', '');
    const url = `https://wa.me/57${num}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in duration-200">
        <div className="bg-[#0F172A] p-5 text-white flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2"><FaEnvelope className="text-yellow-400"/> Notificación al Estudiante</h3>
          <button onClick={onClose} className="hover:rotate-90 transition-transform"><FaTimes size={20}/></button>
        </div>
        <div className="p-6">
          <div className="mb-4 bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Vista previa del mensaje:</p>
            <textarea 
              className="w-full h-56 p-4 bg-white border rounded-xl text-xs font-mono text-slate-700 resize-none outline-none focus:ring-2 focus:ring-blue-500" 
              value={texto} 
              readOnly 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => { navigator.clipboard.writeText(texto); toast.success("Copiado al portapapeles"); }} 
              className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition"
            >
              <FaCopy/> Copiar
            </button>
            <button 
              onClick={enviarWhatsApp} 
              className="py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
            >
              <FaPhoneAlt/> Enviar WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  
  // --- ESTADOS GLOBALES ---
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // Estado para que el botón de actualizar de vueltas
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // INFO USUARIO
  const [userEmail, setUserEmail] = useState<string | undefined>("");
  const [userName, setUserName] = useState("Cargando...");
  const [userRole, setUserRole] = useState("");
  const [horaIngreso] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [listaPerfiles, setListaPerfiles] = useState<any[]>([]);
  const [isModalEquipoOpen, setIsModalEquipoOpen] = useState(false);
  const [formEquipo, setFormEquipo] = useState({ email: "", pass: "", nombre: "" });

  

  // DATOS
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [preinscripciones, setPreinscripciones] = useState<any[]>([]); 
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [agendaBD, setAgendaBD] = useState<any[]>([]);
  const [catalogoCursos, setCatalogoCursos] = useState<any[]>([]);
  const [logsRecientes, setLogsRecientes] = useState<any[]>([]);
  const [modalARL, setModalARL] = useState<{isOpen: boolean, item: any}>({isOpen: false, item: null});
  const [datosARL, setDatosARL] = useState({nombre: "", nit: ""});
  const [notificacionesNuevas, setNotificacionesNuevas] = useState(0);
  


  // ESTADOS AUXILIARES
  const [busqueda, setBusqueda] = useState("");
  const [fechasSeleccionadas, setFechasSeleccionadas] = useState<string[]>([]);
  const [preciosEditados, setPreciosEditados] = useState<{ [key: string]: string }>({});
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date().toISOString().split('T')[0]);
  const [horaNueva, setHoraNueva] = useState("07:00");
  const [modalOpen, setModalOpen] = useState(false);
  const [textoReporte, setTextoReporte] = useState("");
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<any>(null);

  const handleCrearUsuarioManual = async (email: string, pass: string, nombre: string) => {
  if (!email || !pass || !nombre) return toast.error("Completa todos los campos");
  if (pass.length < 6) return toast.error("La clave mínima es de 6 caracteres");

  const loadingToast = toast.loading("Creando acceso para el equipo...");
  
  try {
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { full_name: nombre }
      }
    });

    if (authError) throw authError;

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: data.user.id,
          email: email,
          full_name: nombre,
          role: 'trainer'
        }
      ]);

      if (profileError) throw profileError;
      
      toast.success("¡Colaborador creado! Ya puede entrar con su clave.", { id: loadingToast });
      
      // RESETEAR CAMPOS Y QUITAR EL FORMULARIO (MODAL)
      setFormEquipo({ email: "", pass: "", nombre: "" });
      setIsModalEquipoOpen(false); 
      
      fetchData(); 
    }
  } catch (err: any) {
    toast.error(`Error: ${err.message}`, { id: loadingToast });
  }
};

const generarReporte = (est: any) => {
    // 1. Buscar Duración Real en el Catálogo
    const infoCursoCat = catalogoCursos.find((c: any) => c.nombre_curso === est.curso);
    const duracionReal = infoCursoCat?.horas_duracion || "40 horas";

    // 2. Análisis de Documentación (Lógica anterior recuperada)
    const requeridos = obtenerRequeridos(est.curso);
    const verif = est.doc_verification || {};
    const faltantes: string[] = [];
    const rechazados: string[] = [];

    requeridos.forEach((req: any) => {
      const url = getDocUrl(est, req.id, req.oldId);
      const status = verif[req.id]?.status;

      if (!url) {
        faltantes.push(req.label);
      } else if (status === 'rejected') {
        rechazados.push(req.label);
      }
    });

    // 3. Análisis de Agenda (Cita programada)
    let infoAgenda = "";
    if (est.agenda_id) {
      const bloque = agendaBD.find((a: any) => a.id === est.agenda_id);
      if (bloque) {
        infoAgenda = `🗓️ *CITACIÓN PROGRAMADA:*\n📍 Curso: ${bloque.curso}\n📅 Fecha: ${formatFechaElegante(bloque.fecha)}\n⏰ Hora: ${bloque.hora}\n⏳ Duración: ${duracionReal}\n\n`;
      }
    }

    // 4. Lógica de Empresa
    const esEmpresa = est.tipo_cliente === "Empresa" || (est.empresa && est.empresa !== "Particular" && est.empresa !== "PARTICULAR" && est.empresa !== "Particular / Independiente");

    // 5. Construcción del Cuerpo del Mensaje
    let msg = `Hola *${est.nombre}*, te saludamos de *Alturas y Riesgos de la Costa*.\n\n`;
    
    if (esEmpresa) {
      msg = `Estimado(a) *${est.nombre}*, reciba un saludo cordial de *Alturas y Riesgos de la Costa*. Notificación de proceso para el personal de *${est.empresa}*.\n\n`;
    }

    // SECCIÓN DOCS Y APTITUD (Unificada)
    if (faltantes.length === 0 && rechazados.length === 0 && est.resultado_final === 'APTO') {
      msg += `✅ *ESTADO:* Documentación y Aptitud Médica *APROBADA*.\n`;
    } else {
      msg += `⚠️ *PENDIENTES DE DOCUMENTACIÓN / APTITUD:*\n`;
      if (rechazados.length > 0) rechazados.forEach(f => msg += `❌ ${f} (Rechazado/Ilegible)\n`);
      if (faltantes.length > 0) faltantes.forEach(f => msg += `⚠️ ${f} (Faltante)\n`);
      
      if (est.resultado_final === 'Pendiente') msg += `🩺 Aptitud Médica: (En revisión)\n`;
      if (est.resultado_final === 'NO APTO') msg += `🚫 Aptitud Médica: (NO APTO)\n`;
      
      msg += `\n_Por favor, póngase al día con estos requisitos para poder certificarlo._\n`;
    }

    msg += `\n`;

    // SECCIÓN PAGO
    const valor = est.precio_final || est.precio_pactado || "0";
    if (est.estado_pago === 'Pagado') {
      msg += `💰 *PAGO:* Registrado con éxito ($${valor}).\n`;
    } else {
      msg += `💳 *PAGO:* PENDIENTE\n💵 Valor pendiente: *$${valor}*\n`;
      if (esEmpresa) msg += `_Nota: Soporte de pago debe incluir el NIT de la empresa._\n`;
    }

    msg += `\n`;

    // SECCIÓN CITA
    if (est.resultado_final === 'APTO') {
      if (infoAgenda) {
        msg += infoAgenda;
      } else {
        msg += `⏳ *PROGRAMACIÓN:* Estamos pendientes de asignarte fecha de entrenamiento.\n`;
      }
    }

    msg += `\nCualquier duda, escríbenos a este número.\nAtte: *${userName}*`;

    // Seteo de estados para abrir el modal
    setEstudianteSeleccionado(est);
    setTextoReporte(msg);
    setModalOpen(true);
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
    nombre: "", 
    cedula: "", 
    telefono: "", 
    curso: "", 
    email: "",
    ciudad_residencia: "", // Nuevo
    barrio: "",    // Nuevo
    empresa: "",   // Nuevo
    nit: "",       // Nuevo
    fecha_nacimiento: "",      // Nuevo
    sexo: "",                // Nuevo
    horario_preferencia: "",   // Nuevo
    estadoPago: "Pendiente", 
    precio_pactado: "" 
  });
  
  const descargarPDFAsistencia = async (bloque: any, inscritos: any[]) => {
  const doc = new jsPDF();
  
  // REGISTRO DE LOG
  registrarLog("DESCARGA PLANILLA", `Generó planilla oficial para: ${bloque.curso} del ${bloque.fecha}`);

  // 1. CARGAR EL LOGO PNG
  // Creamos una promesa para esperar que la imagen cargue antes de generar el PDF
  const addImageProcess = () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = '/logo.png'; // Ruta de tu archivo PNG en public
      img.onload = () => {
        doc.addImage(img, 'PNG', 14, 10, 25, 28);
        resolve(true);
      };
      img.onerror = () => {
        // Si falla el logo, dibujamos un cuadro azul para que no se vea vacío
        doc.setFillColor(30, 41, 59);
        doc.rect(14, 10, 25, 25, 'F');
        resolve(false);
      };
    });
  };

  await addImageProcess();

  // 2. BUSCAR EL ENTRENADOR ASIGNADO
  // Si el bloque de agenda no trae el nombre, usamos el del perfil actual como respaldo
  const instructorNombre = bloque.instructor_asignado || userName;

  // --- ENCABEZADO ---
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("ALTURAS Y RIESGOS DE LA COSTA S.A.S", 45, 20);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("NIT: 901.713.234-2", 45, 25);
  doc.setFont("helvetica", "bold");
  doc.text("PLANILLA DE ASISTENCIA Y REGISTRO DE ENTRENAMIENTO", 45, 31);

  // Información del Bloque
  doc.setDrawColor(230);
  doc.line(14, 40, 196, 40);

  doc.setFontSize(9);
  doc.text("CURSO:", 14, 48);
  doc.setFont("helvetica", "normal");
  doc.text(bloque.curso.toUpperCase(), 30, 48);

  doc.setFont("helvetica", "bold");
  doc.text("ENTRENADOR:", 14, 53);
  doc.setFont("helvetica", "normal");
  doc.text(instructorNombre.toUpperCase(), 40, 53); // AQUÍ SALE EL ENTRENADOR DE LA BD

  doc.setFont("helvetica", "bold");
  doc.text("FECHA:", 130, 48);
  doc.setFont("helvetica", "normal");
  doc.text(`${bloque.fecha} (${bloque.hora})`, 145, 48);

  doc.setFont("helvetica", "bold");
  doc.text("FIRMA ENTRENADOR: ", 130, 55);
  doc.setFont("helvetica", "normal");
  doc.text(`_________________`, 165, 54);

  // --- TABLA ---
  autoTable(doc, {
    startY: 60,
    head: [["N°", "Nombre Completo", "Cédula", "Teléfono", "Firma del Aprendiz"]],
    body: inscritos.map((est, index) => [
      index + 1,
      est.nombre.toUpperCase(),
      est.cedula,
      est.telefono || "N/A",
      "________________________"
    ]),
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], fontSize: 9, halign: 'center' },
    styles: { fontSize: 8, cellPadding: 3 },
    columnStyles: { 0: { cellWidth: 10 }, 4: { cellWidth: 50 } }
  });

  doc.save(`Planilla_${bloque.curso.replace(/ /g, "_")}.pdf`);
  toast.success("Planilla lista para impresión");
};


  // --- CARGA DE DATOS ---
  // --- CARGA DE DATOS (MEJORADA) ---
  const fetchData = async (esManual = false) => {
    // Solo activamos el spinner del botón si fue manual
    if (esManual) setIsRefreshing(true);

    try {
      // Tablas antiguas y nuevas
      const { data: est } = await supabase.from('estudiantes').select('*').order('created_at', { ascending: false });
      const { data: sol } = await supabase.from('solicitudes').select('*').order('created_at', { ascending: false });
      const { data: age } = await supabase.from('agenda').select('*').order('fecha', { ascending: true });
      const { data: cat } = await supabase.from('configuracion_cursos').select('*');
      const { data: pre } = await supabase.from('preinscripciones').select('*').order('created_at', { ascending: false });
      const { data: logs } = await supabase.from('logs_actividad').select('*').order('created_at', { ascending: false }).limit(20);
      const { data: perf } = await supabase.from('profiles').select('*');
  
      if (perf) setListaPerfiles(perf);
      if (est) setEstudiantes(est);
      if (sol) setSolicitudes(sol);
      if (age) setAgendaBD(age);
      if (cat) setCatalogoCursos(cat);
      if (pre) setPreinscripciones(pre);
      if (logs) setLogsRecientes(logs);

      // Si fue manual, avisamos que terminó
      if (esManual) toast.success("Base de datos sincronizada");

    } catch (error) {
      console.error(error);
      if (esManual) toast.error("Error al refrescar");
    } finally {
      // Apagamos el spinner siempre
      if (esManual) setIsRefreshing(false);
    }
  };

  // --- EFECTO REALTIME (AGREGAR ESTO) ---
  // --- EFECTO REALTIME MEJORADO (SONIDO + ESTILO + NAVEGACIÓN) ---
  useEffect(() => {
    // 1. Definimos el sonido suave (Base64 para no depender de archivos externos)
    // Es un "Pop" suave tipo notificación de Apple
    const playNotificationSound = () => {
      try {
        const audio = new Audio("data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIQAykpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKSkpKS//OEAAABAAAAAgAAAAAA/84QAAABAAAAAgAAAAAATEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//OEZAAAA4gAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA//OEZA8A+wAAAAAAABhAAAAAAAAAAAAAAKAAAAAP/zMGRgAgAAAAAA");
        audio.volume = 0.5; // Volumen al 50% para no asustar
        audio.play().catch(e => console.log("Audio bloqueado por navegador hasta interacción", e));
      } catch (err) {
        console.error("Error audio", err);
      }
    };

    const manejarNotificacion = (payload: any, origen: string) => {
      // 1. Sonido
      playNotificationSound();

      // 2. Contador Badge
      setNotificacionesNuevas((prev) => prev + 1);
      
      // 3. Refrescar Datos
      fetchData(); 

      // 4. Datos del evento
      const nombre = payload.new.nombre || "Nuevo Usuario";
      const esSolicitud = origen === 'solicitud';
      const titulo = esSolicitud ? "¡Nueva Solicitud Web!" : "Actualización de Archivos";
      const subtitulo = esSolicitud ? "Quiere información de cursos" : "Ha cargado documentos";
      const colorBorde = esSolicitud ? "border-emerald-500" : "border-blue-500";
      const icono = esSolicitud ? <FaClipboardList size={20} className="text-emerald-600"/> : <FaCloudUploadAlt size={20} className="text-blue-600"/>;
      const bgIcono = esSolicitud ? "bg-emerald-100" : "bg-blue-100";

      // 5. Toast Personalizado (Diseño Limpio + Funcionalidad)
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} 
          max-w-sm w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex flex-col ring-1 ring-black ring-opacity-5 border-l-4 ${colorBorde}`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${bgIcono}`}>
                  {icono}
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                  {titulo}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-bold">{nombre}</span> {subtitulo}
                </p>
              </div>
              {/* Botón cerrar chiquito */}
              <div className="ml-4 flex-shrink-0 flex">
                <button onClick={() => toast.dismiss(t.id)} className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none">
                  <FaTimes />
                </button>
              </div>
            </div>
          </div>
          
          {/* BOTÓN DE ACCIÓN FUNCIONAL */}
          <div className="flex border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button 
              onClick={() => {
                // AQUÍ ESTÁ LA MAGIA: CAMBIAMOS EL TAB Y CERRAMOS EL TOAST
                setActiveTab(esSolicitud ? 'solicitudes' : 'lista');
                toast.dismiss(t.id);
                // Opcional: Reseteamos el contador si queremos
                if (!esSolicitud) setNotificacionesNuevas(0); 
              }} 
              className="w-full rounded-b-2xl p-3 flex items-center justify-center text-xs font-black text-blue-600 uppercase tracking-widest hover:bg-blue-100 transition-colors"
            >
              Ver Detalles Ahora
            </button>
          </div>
        </div>
      ), { duration: 6000, position: 'top-right' }); // Lo ponemos arriba a la derecha que molesta menos
    };

    const channel = supabase
      .channel('tablero-admin-vivo')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'preinscripciones' }, (payload: any) => {
           if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') manejarNotificacion(payload, 'preinscripcion');
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitudes' }, (payload: any) => {
           if (payload.eventType === 'INSERT') manejarNotificacion(payload, 'solicitud');
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

useEffect(() => {
  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/admin/login"); return; }
    
    setUserEmail(session.user.email);
    
    // 1. Obtenemos el perfil primero
    const { data: perfil } = await supabase.from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    let nombreFinal = "Usuario";
    let rolFinal = "trainer";

    if (perfil) {
      nombreFinal = perfil.full_name || "Usuario";
      rolFinal = perfil.role || "trainer";
    } else {
      // Caso de respaldo por si no hay perfil creado aún
      nombreFinal = session.user.email || "Admin";
      rolFinal = "admin_general";
    }

    // 2. Actualizamos estados de la interfaz
    setUserName(nombreFinal);
    setUserRole(rolFinal);

    // 3. REGISTRAMOS EL LOG UNA SOLA VEZ (con datos ya cargados)
    const etiquetaLog = `[${rolFinal.toUpperCase()}] ${nombreFinal}`;
    
    // Usamos una inserción directa para evitar depender de la función registrarLog en este paso crítico
    await supabase.from('logs_actividad').insert([
      { 
        usuario_id: session.user.id,
        nombre_usuario: etiquetaLog,
        accion: "INGRESO",
        detalles: `Sesión iniciada correctamente desde el panel.`
      }
    ]);

    setLoading(false); 
    fetchData();
  };
  
  checkUser();
}, [router]);

  // --- LÓGICA DE NEGOCIO ---
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

    const msg = `Hola *${nombreCliente}*, un gusto saludarte de *Alturas y riesgos de la costa S.A.S*.\n\n` +
      `Adjuntamos la propuesta de capacitación:\n` +
      `${detallesCursosYFechas}\n` +
      `VALOR TOTAL: *$${pFinal}*\n\n` +
      `¿Confirmamos estos horarios para reservar sus cupos?`;

    window.open(`https://wa.me/57${sol.telefono.replace(/\s/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    setFechasSeleccionadas([]);
  };

  // --- LÓGICA DE ACTUALIZACIÓN Y VERIFICACIÓN ---
const registrarLog = async (accion: string, detalles: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  // Si por alguna razón userName está vacío, usamos el email de la sesión
  const idUsuario = `[${userRole.toUpperCase() || '?'}] ${userName || session.user.email}`;

  await supabase.from('logs_actividad').insert([{ 
    usuario_id: session.user.id,
    nombre_usuario: idUsuario,
    accion: accion,
    detalles: detalles
  }]);
};
useEffect(() => {
  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/admin/login"); return; }
    
    setUserEmail(session.user.email);
    
    // Traemos el perfil
    const { data: perfil } = await supabase.from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    // Variables locales para uso inmediato
    const nombreFinal = perfil?.full_name || "Admin/Instructor";
    const rolFinal = perfil?.role || "trainer";

    setUserName(nombreFinal);
    setUserRole(rolFinal);

    // Registro de ingreso con marca de tiempo para cálculo posterior
    const etiquetaLog = `[${rolFinal.toUpperCase()}] ${nombreFinal}`;
    await supabase.from('logs_actividad').insert([{ 
      usuario_id: session.user.id,
      nombre_usuario: etiquetaLog,
      accion: "INGRESO",
      detalles: "Sesión iniciada." // Aquí podrías guardar user-agent si quisieras
    }]);

    setLoading(false); 
    fetchData();
  };
  checkUser();
}, [router]);

const cerrarSesion = async () => {
  if (!confirm("¿Cerrar sesión ahora?")) return;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      // 1. Buscar el último ingreso de este usuario para calcular tiempo
      const { data: ultimoLog } = await supabase
        .from('logs_actividad')
        .select('created_at')
        .eq('usuario_id', session.user.id)
        .eq('accion', 'INGRESO')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      let detalleTiempo = "Duración no calculada";
      
      if (ultimoLog) {
        const entrada = new Date(ultimoLog.created_at);
        const salida = new Date();
        const diffMs = salida.getTime() - entrada.getTime();
        
        const mins = Math.floor(diffMs / 60000);
        const horas = Math.floor(mins / 60);
        detalleTiempo = `Duración de sesión: ${horas}h ${mins % 60}m`;
      }

      // 2. Registrar salida con el cálculo
      const etiqueta = `[${userRole.toUpperCase()}] ${userName}`;
      await supabase.from('logs_actividad').insert([{ 
        usuario_id: session.user.id,
        nombre_usuario: etiqueta,
        accion: "SALIDA",
        detalles: `Cierre de sesión voluntario. ${detalleTiempo}`
      }]);
    }

    await supabase.auth.signOut();
    router.push("/admin/login");
  } catch (err) {
    console.error("Error al cerrar sesión:", err);
    router.push("/admin/login");
  }
};

  // --- FUNCIÓN CORREGIDA Y MEJORADA ---
  const actualizarEstadoEstudiante = async (tabla: string, id: string, campo: string, valor: string, nombreEst: string) => {
    // Validación de seguridad para precios
    if (userRole !== 'admin_general' 
&& (campo === 'precio_final' || campo === 'precio_pactado')) {
      return toast.error("⛔ Solo Admin General edita precios.");
    }
    // 1. Intentar actualizar
    const { error } = await supabase.from(tabla).update({ [campo]: valor }).eq('id', id);

    // 2. Manejo de respuesta
    if (error) {
      console.error("Error actualizando:", error);
      toast.error(`Error: ${error.message}`); // Te dirá qué pasa si falla
    } else {
      toast.success("Actualizado"); 
      registrarLog("Editó Dato", `Cambió ${campo} en ${nombreEst}`); 
      fetchData(); 
    }
  };


  // 1. Esta función solo DECIDE qué hacer
  const toggleVerificacion = async (item: any, docId: string, docLabel: string) => {
  const currentVerification = item.doc_verification || {};
  const currentState = currentVerification[docId]?.status || 'pending';

  // Si el documento es ARL y NO está aprobado aún, abrimos el modal para pedir datos
  if (docId === 'url_arl' && currentState !== 'approved') {
    setModalARL({ isOpen: true, item });
    return;
  }

  // Si es cualquier otro documento o si estamos rechazando la ARL, procede normal
  let newState = currentState === 'approved' ? 'rejected' : 'approved';
  ejecutarCambioEstado(item, docId, docLabel, newState);
};

// 2. Esta función es la que realmente GUARDA en Supabase (la llamamos desde el botón o desde el modal)
const ejecutarCambioEstado = async (item: any, docId: string, docLabel: string, newState: string) => {
  const currentVerification = item.doc_verification || {};
  const timestamp = new Date().toLocaleString('es-CO');
  
  const newVerificationData = {
    ...currentVerification,
    [docId]: { status: newState, by: userName, at: timestamp }
  };

  const tabla = item.origen; 
  const { error } = await supabase.from(tabla).update({ doc_verification: newVerificationData })
  .eq('id', item.id);

  if (!error) {
    if(newState === 'approved') toast.success(`✅ ${docLabel} Aprobado`);
    if(newState === 'rejected') toast.error(`❌ ${docLabel} Rechazado`);
    
    await registrarLog(
      newState === 'approved' ? "Aprobó Documento" : "Rechazó Documento", 
      `${docLabel} de ${item.nombre} (${newState.toUpperCase()})`
    );
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
      reqs.push({ id: 'url_cert_altura', label: 'Cert. Altura', oldId: 'url_cert_altura', icon: 
      <FaFilePdf/> });
    }
    if (c.includes("coordinador") || c.includes("jefe")) {
      reqs.push({ id: 'url_cert_sst', label: 'SST 20h', oldId: 'url_cert_sst', icon: 
      <FaFilePdf/> });
    }
    return reqs;
  };

  const getDocUrl = (item: any, docId: string, oldId: string | null) => {
    return item[docId] || (oldId ? item[oldId] : null);
  };

  // --- ACCIONES ADICIONALES ---
const registrarEstudiante = async (e: React.FormEvent) => {
  e.preventDefault();
  const tId = toast.loading("Registrando pre-inscripción directa...");
  
  const cursoFinal = formData.curso || cursoSeleccionadoParaEditar;

  const { error } = await supabase.from('preinscripciones').insert([{ 
    nombre: formData.nombre.toUpperCase(),
    cedula: formData.cedula,
    telefono: formData.telefono,
    email: formData.email,
    curso: cursoFinal,
    fecha_nacimiento: formData.fecha_nacimiento, // Nuevo
    sexo: formData.sexo,                     // Nuevo
    horario_preferencia: formData.horario_preferencia, // Nuevo
    ciudad_residencia: formData.ciudad_residencia,
    barrio: formData.barrio,
    empresa: formData.empresa || "PARTICULAR",
    nit: formData.nit || "N/A",
    estado_pago: formData.estadoPago,
    resultado_final: "Pendiente",
    precio_pactado: formData.precio_pactado || (obtenerPrecioBase(cursoFinal) - 
    (obtenerPrecioBase(cursoFinal) * (descuentoAplicado/100))).toLocaleString('es-CO')
  }]);
  
  if (error) {
    toast.error(`Error: ${error.message}`, { id: tId });
  } else { 
    toast.success("¡Pre-inscripción Directa Exitosa!", { id: tId }); 
    setFormData({ 
      nombre: "", cedula: "", telefono: "", email: "", curso: "", 
      fecha_nacimiento: "", sexo: "", horario_preferencia: "",
      ciudad_residencia: "", barrio: "", empresa: "", nit: "",
      estadoPago: "Pendiente", precio_pactado: "" 
    });
    setActiveTab("lista");
    fetchData();
  }
};

  const actualizarPrecioMaestro = async (id: string, nuevoPrecio: string) => {
    const { error } = await supabase.from('configuracion_cursos')
    .update({ precio_base: nuevoPrecio }).eq('id', id);
    if (!error) { toast.success("Precio actualizado"); fetchData(); }
  };


// Modifica la función guardarEnAgenda para que sea inteligente

const [agendaData, setAgendaData] = useState({
  fecha_inicio: new Date().toISOString().split('T')[0],
  fecha_fin: "",
  hora: "07:00",
  // No necesitamos 'intensidad' aquí porque la sacaremos del catálogo al guardar
});

const guardarEnAgenda = async () => {
  // 1. Validaciones de campos obligatorios
  if (!cursoSeleccionadoParaEditar) return toast.error("Selecciona un curso");
  if (!agendaData.fecha_inicio || !agendaData.fecha_fin) return toast.error("Faltan fechas");

  // 2. Buscamos la intensidad horaria en el catálogo
  const cursoEnCatalogo = catalogoCursos.find(
    (c) => c.nombre_curso === cursoSeleccionadoParaEditar
  );

  // 3. Si el curso no tiene horas_duracion en la BD, le ponemos "40 horas" por defecto
  const horasParaGuardar = cursoEnCatalogo?.horas_duracion || "40 horas";

  // 4. Insertamos en la tabla 'agenda' usando los nombres reales de tus columnas SQL
  const { error } = await supabase.from('agenda').insert([
    { 
      curso: cursoSeleccionadoParaEditar, 
      fecha: agendaData.fecha_inicio,      // Columna 'fecha' (Inicio)
      fecha_fin: agendaData.fecha_fin,    // Columna 'fecha_fin'
      hora: agendaData.hora,              // Columna 'hora'
      intensidad_horaria: horasParaGuardar // Columna 'intensidad_horaria'
    }
  ]);

  if (error) {
    console.error("Error Supabase:", error);
    toast.error("Error al guardar: " + error.message);
  } else {
    toast.success("Curso agendado correctamente");
    // Registro en Logs para auditoría
    await registrarLog("AGENDA", `Agendó ${cursoSeleccionadoParaEditar} (${horasParaGuardar})`);
    fetchData(); // Refrescar tablas
  }
};

  const borrarRegistro = async (tabla: string, id: string) => {
    if (userRole !== 'admin_general') return toast.error("⛔ Acceso Denegado");
    if(!confirm("¿Borrar permanentemente?")) return;
    const { error } = await supabase.from(tabla).delete().eq('id', id);
    if (!error) { toast.success("Eliminado"); fetchData(); }
  };

  const listaUnificada = [
    ...preinscripciones.map(p => ({ ...p, origen: 'preinscripciones', etiqueta: 'WEB' })),
    ...estudiantes.map(e => ({ ...e, origen: 'estudiantes', etiqueta: 'MANUAL' }))
  ].filter(i => JSON.stringify(i).toLowerCase().includes(busqueda.toLowerCase()));


  // --- CÁLCULOS PARA EL DASHBOARD (BENTO GRID) ---
  const statsDashboard = {
    totalAlumnos: estudiantes.length + preinscripciones.length,
    solicitudesPendientes: solicitudes.length,
    // Cuenta cuántos logs son de HOY para la notificación roja
    cambiosHoy: logsRecientes.filter(l => {
       const fechaLog = new Date(l.created_at);
       const hoy = new Date();
       return fechaLog.getDate() === hoy.getDate() && 
              fechaLog.getMonth() === hoy.getMonth() && 
              fechaLog.getFullYear() === hoy.getFullYear();
    }).length,
    // Filtra las próximas 3 clases ordenadas por fecha
    proximosCursos: agendaBD
      .filter(a => new Date(a.fecha) >= new Date(new Date().setHours(0,0,0,0))) 
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .slice(0, 3)
  };

  // Busca la parte de tu código que dice: if (loading) return ... y cámbiala por esta:

if (loading) return (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-[#f8fafc]">
    <div className="w-24 h-24">
      {/* Este es tu SVG de 3 puntos saltarines */}
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

    {/* SIDEBAR RESPONSIVE */}
    <>
      {/* Overlay para móvil cuando el menú está abierto */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0F172A] text-slate-300 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:flex lg:flex-col shadow-2xl flex-shrink-0 border-r border-slate-800
      `}>
        
        {/* LOGO AYR ADMIN */}
        <div className="p-2 border-b border-slate-800/50 flex flex-col items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <img src="/logo-blanco.webp" alt="AR COSTA" className="w-16 h-16 object-contain" />
          <div className="text-center">
            <h1 className="text-2xl font-black tracking-tighter">
              <span className="text-[#FFD700]">A</span>
              <span className="text-[#00558A]">Y</span>
              <span className="text-[#C41E3A]">R</span>
              <span className="ml-1 text-white font-light text-sm tracking-widest uppercase">Admin</span>
            </h1>
            <div className="flex h-[2px] w-full mt-1">
              <div className="flex-1 bg-[#FFD700]"></div>
              <div className="flex-1 bg-[#00558A]"></div>
              <div className="flex-1 bg-[#C41E3A]"></div>
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="flex-1 p-4  overflow-y-auto">
          {[
            { id: 'solicitudes', icon: <FaClipboardList />, label: 'Solicitudes Web', roles: ['admin_general', 'director'] },
            { id: 'agenda', icon: <FaCalendarAlt />, label: 'Calendario / Agenda', roles: ['admin_general', 'director', 'coordinator'] },
            { id: 'estudiantes', icon: <FaUserPlus />, label: 'Matricular Nuevo', roles: ['admin_general', 'director', 'coordinator', 'trainer'] },
            { id: 'lista', icon: <FaUsers />, label: 'Base de Datos', roles: ['admin_general', 'director', 'coordinator'] },
            { id: 'listados', icon: <FaUserCheck />, label: 'Planillas de Clase', roles: ['admin_general', 'director', 'coordinator', 'trainer'] },
            { id: 'equipo', icon: <FaUserCog />, label: 'Gestionar Equipo', roles: ['admin_general', 'director'] },
            { id: 'logs', icon: <FaHistory />, label: 'Auditoría / Logs', roles: ['admin_general', 'director'] },
            { id: 'precios', icon: <FaMoneyBillWave />, label: 'Precios Cursos', roles: ['admin_general', 'director'] },
            { id: 'config', icon: <FaUser />, label: 'Mi Perfil', roles: ['admin_general', 'director', 'coordinator', 'trainer'] },
          ]
          .filter(item => item.roles.includes(userRole)) 
          .map((item) => (

            
          <button 
            key={item.id} 
            onClick={() => { 
              setActiveTab(item.id); 
              setIsSidebarOpen(false); 
              // Si entran a la base de datos, reiniciamos el contador a 0
              if (item.id === 'lista') setNotificacionesNuevas(0); 
            }} 
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-[11px] uppercase tracking-wider transition-all ${
              activeTab === item.id 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'hover:bg-white/5 text-slate-400'
            }`}
          >
            <span className={activeTab === item.id ? 'text-[#FFD700]' : ''}>{item.icon}</span> 
            <span className="flex-1 text-left">{item.label}</span>

            {/* --- AGREGAR ESTO: BADGE ROJO --- */}
            {item.id === 'lista' && notificacionesNuevas > 0 && (
              <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse shadow-red-500/50 shadow-lg">
                {notificacionesNuevas}
              </span>
            )}
          </button>

          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/50 text-center">
          <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">© 2026 Alturas y Riesgos de la Costa S.A.S</p>
        </div>
      </aside>
    </>

    {/* CONTENIDO PRINCIPAL */}
    <main className="flex-1 h-screen overflow-y-auto bg-[#f8fafc] relative">
      <div className="p-4 md:p-8 lg:p-10 max-w-[1600px] mx-auto">
        
        {/* HEADER SUPERIOR */}
        {/* HEADER SUPERIOR CORREGIDO */}
<header className="flex flex-col sm:flex-row justify-between items-end sm:items-center mb-8 gap-4 pt-12 lg:pt-0">
  <div>
    <h2 className="text-2xl font-black text-[#0F172A] uppercase tracking-tight">
      {/* Corrección del nombre del Tab */}
      {activeTab === 'lista' ? 'Base de Datos' : activeTab.replace('solicitudes', 'Solicitudes')}
    </h2>
    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Gestión Institucional</p>
  </div>

  {/* WIDGET PERFIL - VERSIÓN EJECUTIVA LIMPIA */}
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

{/* --- INICIO DASHBOARD BENTO GRID (CON ROLES) --- */}
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in zoom-in duration-300 mb-8">
              
              {/* 1. BIENVENIDA (VISIBLE PARA TODOS - MENSAJE DINÁMICO) */}
              <div className="md:col-span-2 bg-gradient-to-r from-blue-900 to-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
                 <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><FaShieldAlt size={180} /></div>
                 <div className="relative z-10">
                    <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20">👋 Hola de nuevo</span>
                    <h2 className="text-3xl font-black mb-2">Bienvenido, {userName.split(' ')[0]}</h2>
                    
                    {/* LÓGICA DEL MENSAJE DE BIENVENIDA */}
                    <p className="text-blue-200 text-sm max-w-sm leading-relaxed">
                      {userRole === 'trainer' 
                        ? "Aquí tienes tu programación de entrenamientos. Revisa tu agenda y prepárate para la próxima clase."
                        : `Resumen general de la academia. Tienes ${statsDashboard.solicitudesPendientes} solicitudes web esperando gestión.`
                      }
                    </p>

                    <button onClick={() => setActiveTab('listados')} className="mt-6 px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-xs uppercase hover:bg-blue-50 transition shadow-lg flex items-center gap-2">
                       <FaCalendarAlt /> Ver Calendario Completo
                    </button>
                 </div>
              </div>

              {/* 2. ESTADÍSTICAS RÁPIDAS (OCULTO PARA TRAINERS) */}
              {userRole !== 'trainer' && (
                <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:border-blue-200 transition-all">
                   <div className="flex items-start justify-between">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FaUsers size={20}/></div>
                      <span className="text-[10px] font-black uppercase text-slate-300 bg-slate-50 px-2 py-1 rounded-lg">Total</span>
                   </div>
                   <div>
                      <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{statsDashboard.totalAlumnos}</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase mt-1">Alumnos en Base de Datos</p>
                   </div>
                </div>
              )}

              {/* 3. NOTIFICACIONES LOGS (SOLO ADMIN Y DIRECTOR) */}
              {['admin_general', 'director'].includes(userRole) && (
                <div className="bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden hover:border-purple-200 transition-all cursor-pointer" onClick={() => setActiveTab('logs')}>
                   <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
                   <div className="flex items-start justify-between relative z-10">
                      <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><FaFire size={20}/></div>
                      {statsDashboard.cambiosHoy > 0 && (
                        <span className="text-[10px] font-black uppercase text-white bg-red-500 px-2 py-1 rounded-lg animate-pulse shadow-red-200 shadow-lg">
                          +{statsDashboard.cambiosHoy} Nuevos hoy
                        </span>
                      )}
                   </div>
                   <div className="relative z-10">
                      <h3 className="text-4xl font-black text-slate-800 tracking-tighter">{logsRecientes.length}</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase mt-1">Movimientos Recientes</p>
                      <span className="text-[10px] font-bold text-purple-600 mt-2 hover:underline block">Ver historial →</span>
                   </div>
                </div>
              )}

              {/* 4. PRÓXIMAS CLASES (VISIBLE PARA TODOS) */}
              {/* Nota: Si es trainer, ocupa ancho completo si no hay stats/logs */}
              <div className={`md:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm ${userRole === 'trainer' ? 'md:col-span-2' : ''}`}>
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><FaClock className="text-blue-500"/> Próximos Entrenamientos</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Agenda Cercana</span>
                 </div>
                 <div className="space-y-3">
                    {statsDashboard.proximosCursos.length > 0 ? (
                       statsDashboard.proximosCursos.map((curso:any) => (
                          <div key={curso.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                             <div className="bg-white p-3 rounded-xl text-center shadow-sm min-w-[70px]">
                                <span className="block text-[10px] font-black text-blue-600 uppercase">{new Date(curso.fecha).toLocaleDateString('es-ES', {month:'short'})}</span>
                                <span className="block text-xl font-black text-slate-800 leading-none">{new Date(curso.fecha).getDate()+1}</span>
                             </div>
                             <div>
                                <h4 className="font-bold text-slate-700 text-sm">{curso.curso}</h4>
                                <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
                                   <FaClock size={10}/> {curso.hora} 
                                   <span className="w-1 h-1 bg-slate-300 rounded-full"></span> 
                                   {curso.intensidad_horaria}
                                </p>
                             </div>
                          </div>
                       ))
                    ) : (
                       <p className="text-sm text-slate-400 italic">No hay cursos programados para los próximos días.</p>
                    )}
                 </div>
              </div>

              {/* 5. ACCESO DIRECTO SOLICITUDES (OCULTO PARA TRAINERS) */}
              {userRole !== 'trainer' && (
                <div className="md:col-span-2 bg-gradient-to-br from-emerald-50 to-white rounded-[2.5rem] p-8 border border-emerald-100 shadow-sm flex items-center justify-between">
                   <div>
                      <div className="flex items-center gap-2 mb-2">
                         <span className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><FaClipboardList size={14}/></span>
                         <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Solicitudes Web</span>
                      </div>
                      <h3 className="text-4xl font-black text-slate-800">{statsDashboard.solicitudesPendientes}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">Personas esperando respuesta</p>
                   </div>
                   <button onClick={() => setActiveTab('solicitudes')} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition">
                      Gestionar Ahora
                   </button>
                </div>
              )}

            </div>
          )}
          {/* --- FIN DASHBOARD BENTO GRID --- */}
          {/* SOLICITUDES */}
          {activeTab === "solicitudes" && (
            <div className="grid gap-6 animate-in fade-in">
              {solicitudes.map((sol) => (
                <div key={sol.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md">
                   {/* ... (código existente de solicitudes) ... */}
                   <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {sol.tipo_cliente === "Empresa" ? <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1"><FaBuilding/> EMPRESA: {sol.empresa}</span> : <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-0.5 rounded-lg font-bold flex items-center gap-1"><FaUsers/> PARTICULAR</span>}
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2"><FaUserTie className="text-slate-400" size={14}/> {sol.nombre}</h4>
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

          {/* LISTA BASE DE DATOS (CORREGIDA) */}
          {activeTab === "lista" && (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4">
                <input type="text" placeholder="Buscar por nombre o cédula..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl outline-none" />
                <button 
                onClick={() => fetchData(true)} // <-- IMPORTANTE: Pasar true
                disabled={isRefreshing} // Evita doble clic
                className={`
                  px-6 py-2 rounded-xl font-bold flex items-center gap-2 transition-all shadow-sm
                  ${isRefreshing 
                    ? 'bg-blue-100 text-blue-400 cursor-wait' 
                    : 'bg-slate-100 text-slate-600 hover:bg-white hover:text-blue-600 hover:shadow-md border border-transparent hover:border-blue-100'
                  }
                `}
                 >
              <FaSync className={isRefreshing ? "animate-spin" : ""} /> {/* Gira si carga */}
              {isRefreshing ? "Sincronizando..." : " "}
            </button>
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
            
            // Lógica para el badge de empresa
            const esEmpresa = item.tipo_cliente === "Empresa" || (item.empresa && item.empresa !== "Particular / Independiente" && item.empresa !== "Particular");

            return (
            <tr key={item.id + item.origen} className="hover:bg-slate-50 transition group">
              <td className="px-6 py-4">
                  <div className="flex gap-1 mb-1">
                    <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black ${item.etiqueta === 'WEB' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'}`}>{item.etiqueta}</span>
                    
                    {esEmpresa ? (
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[8px] font-black flex items-center gap-1">
                        <FaBuilding size={8}/> {item.empresa} {item.nit && item.nit !== 'N/A' ? `(NIT: ${item.nit})` : ''}
                      </span>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[8px] font-black flex items-center gap-1">
                        <FaUser size={8}/> INDEPENDIENTE
                      </span>
                    )}
                  </div>

                  <div className="font-bold text-slate-700 text-base">{item.nombre}</div>
                  <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1"><FaIdCard size={10}/> {item.cedula}</div>
                  
                  {/* Ubicación: Dirección y Barrio */}
                  <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <FaMapMarkerAlt className="text-red-400" size={10}/> 
                    <span className="font-medium">{item.ciudad_residencia || item.direccion || 'Sin dirección'}</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-bold text-slate-600">Barrio: {item.barrio || 'N/A'}</span>
                  </div>

                  <div className="text-[10px] text-blue-600 font-black uppercase mt-1 tracking-tight">{item.curso}</div>
              </td>
              <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                      {reqs.map(r => (
                          <DocButton 
                              key={item.id + r.id}
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
                            <select value={item.estado_pago || "Pendiente"} onChange={(e)=>actualizarEstadoEstudiante(item.origen, item.id, 'estado_pago', e.target.value, item.nombre || 'Estudiante')} className={`text-[10px] p-1.5 rounded border-none font-bold w-full mb-1 ${item.estado_pago === 'Pagado' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}><option value="Pendiente">PENDIENTE</option><option value="Pagado">PAGADO</option></select>
                            <div className="flex items-center gap-1 font-bold text-blue-600 text-xs">$ <input defaultValue={item.precio_final || item.precio_pactado || "0"} onBlur={(e) => actualizarEstadoEstudiante(item.origen, item.id, item.origen === 'preinscripciones' ? 'precio_pactado' : 'precio_final', e.target.value, item.nombre || 'Estudiante')} className="w-20 bg-transparent outline-none border-b border-transparent hover:border-blue-300"/></div>
                        </td>
                        <td className="px-6 py-4"><select value={item.resultado_final || "Pendiente"} onChange={(e)=>actualizarEstadoEstudiante(item.origen, item.id, 'resultado_final', e.target.value, item.nombre || 'Estudiante')} className={`text-[10px] p-1.5 rounded font-black w-full ${item.resultado_final === 'APTO' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100'}`}><option>Pendiente</option><option>APTO</option><option>NO APTO</option></select></td>
                       <td className="px-6 py-4">
  {/* Solo permitimos asignar si el resultado es APTO o si ya tiene una agenda asignada */}
  {item.resultado_final === "APTO" || item.agenda_id ? (
    <div className="flex flex-col gap-1">
      <select 
        className={`text-[10px] p-1 border rounded w-full font-bold outline-none ${
          item.agenda_id ? 'bg-green-50 border-green-200 text-green-700' : 'bg-blue-50 border-blue-200 text-blue-700'
        }`}
        value={item.agenda_id || ""}
        onChange={(e) => actualizarEstadoEstudiante(item.origen, item.id, 'agenda_id', e.target.value, item.nombre)}
      >
        <option value="">-- Seleccionar Fecha --</option>
        {agendaBD
          .filter(a => {
            // Limpiamos ambos textos para comparar sin errores de espacios o mayúsculas
            const cursoAgenda = (a.curso || "").trim().toLowerCase();
            const cursoEstudiante = (item.curso || "").trim().toLowerCase();
            return cursoAgenda === cursoEstudiante;
          })
          .map(a => (
            <option key={a.id} value={a.id}>
              {formatFechaElegante(a.fecha)} ({a.hora}) - {a.intensidad_horaria}
            </option>
          ))
        }
      </select>
      
      {item.agenda_id && (
        <span className="text-[8px] font-black text-green-600 flex items-center gap-1 justify-center uppercase">
          <FaCheckCircle/> Cupo Reservado
        </span>
      )}
    </div>
  ) : (
    <span className="text-[10px] text-slate-300 italic">Esperando Aptitud</span>
  )}
</td>

                        <td className="px-6 py-4 text-center space-y-2">
                            <button onClick={() => generarReporte(item)} className="w-full py-1.5 bg-slate-800 text-white rounded text-[9px] font-bold uppercase hover:bg-slate-900 transition flex items-center justify-center gap-1"><FaEnvelope className="text-yellow-400"/> Reporte</button>
                            <button onClick={() => borrarRegistro(item.origen, item.id)} className="text-red-300 hover:text-red-500 transition"><FaTrash size={12}/></button>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* MODAL PARA CAPTURAR DATOS DE ARL */}
{modalARL.isOpen && (
  <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-200 animate-in zoom-in duration-200">
      <div className="text-center mb-6">
        <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaShieldVirus size={30}/>
        </div>
        <h3 className="text-xl font-bold text-slate-800">Verificar ARL</h3>
        <p className="text-xs text-slate-500 mt-1">Ingresa el nombre de la aseguradora</p>
      </div>

      <div className="space-y-4">
        <input 
          placeholder="Nombre ARL (SURA, Positiva...)" 
          className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-purple-400 font-bold"
          value={datosARL.nombre}
          onChange={(e) => setDatosARL({...datosARL, nombre: e.target.value})}
        />
        <input 
          placeholder="NIT (Opcional)" 
          className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-purple-400"
          value={datosARL.nit}
          onChange={(e) => setDatosARL({...datosARL, nit: e.target.value})}
        />

        <button 
          onClick={async () => {
            if(!datosARL.nombre) return toast.error("Escribe el nombre de la ARL");
            const item = modalARL.item;
            
            // Guardar datos extras
            const { error } = await supabase.from(item.origen)
              .update({ arl_nombre: datosARL.nombre, arl_nit: datosARL.nit })
              .eq('id', item.id);
            
            if(!error) {
              await ejecutarCambioEstado(item, 'url_arl', 'ARL', 'approved');
              setModalARL({isOpen: false, item: null});
              setDatosARL({nombre: "", nit: ""});
            }
          }}
          className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold shadow-lg"
        >
          Aprobar ARL
        </button>
        <button onClick={() => setModalARL({isOpen: false, item: null})} className="w-full text-xs font-bold text-slate-400">Cancelar</button>
      </div>
    </div>
  </div>
)}
              </div>
            </div>
          )}

              {/* LOGS */}
              {activeTab === 'logs' && (userRole === 'admin_general' || userRole === 'director') && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4 animate-in fade-in">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <FaHistory className="text-blue-500"/> Historial de Actividad
                  </h3>
                  
                  <div className="space-y-3">
                    {logsRecientes.map(log => (
                      <div key={log.id} className="border-b pb-3 last:border-0 border-slate-100">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-bold text-slate-800">
                            {log.accion} {/* Cambiado de .action a .accion */}
                            <span className="font-normal text-slate-500 ml-2">por {log.nombre_usuario}</span> {/* Cambiado de .admin_name a .nombre_usuario */}
                          </p>
                          <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 italic">"{log.detalles}"</p> {/* Cambiado de .details a .detalles */}
                      </div>
                    ))}
                  </div>
                </div>
              )}

          {/* PRECIOS */}
          {activeTab === "precios" && (userRole === 'admin_general' || userRole === 'director') && (
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

{/* AGENDA */}
{activeTab === "agenda" && (
  <div className="grid md:grid-cols-3 gap-6 animate-in fade-in">
    {/* Formulario de Creación */}
    <div className="bg-white p-6 rounded-3xl border border-slate-200 h-fit shadow-sm">
      <h3 className="font-bold mb-6 flex items-center gap-2 text-slate-700">
        <FaPlus className="text-blue-500"/> Programar Bloque
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Curso del Catálogo</label>
          <select 
            className="w-full p-3 bg-slate-50 border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
            value={cursoSeleccionadoParaEditar} 
            onChange={(e) => setCursoSeleccionadoParaEditar(e.target.value)}
          >
            <option value="">Seleccione un curso...</option>
            {catalogoCursos.map(c => (
              <option key={c.id} value={c.nombre_curso}>{c.nombre_curso}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Fecha Inicio</label>
            <input 
              type="date" 
              className="w-full p-3 bg-slate-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
              value={agendaData.fecha_inicio} 
              onChange={(e) => setAgendaData({...agendaData, fecha_inicio: e.target.value})} 
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Fecha Fin</label>
            <input 
              type="date" 
              className="w-full p-3 bg-slate-50 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
              value={agendaData.fecha_fin} 
              onChange={(e) => setAgendaData({...agendaData, fecha_fin: e.target.value})} 
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Hora de Ingreso</label>
          <input 
            type="time" 
            className="w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
            value={agendaData.hora} 
            onChange={(e) => setAgendaData({...agendaData, hora: e.target.value})} 
          />
        </div>

        <button 
          onClick={guardarEnAgenda} 
          className="w-full py-4 bg-[#1E3A8A] text-white rounded-2xl font-bold shadow-lg hover:bg-blue-900 transition-all transform active:scale-95 flex items-center justify-center gap-2"
        >
          <FaCalendarAlt/> Crear en Agenda
        </button>
      </div>
    </div>

    {/* Visualización de la Agenda */}
    <div className="md:col-span-2 space-y-4">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center">
        <h3 className="font-bold text-slate-500 text-xs uppercase tracking-widest">Cursos Programados</h3>
        <span className="text-[10px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full font-bold">Total: {agendaBD.length} bloques</span>
      </div>

      <div className="grid gap-3 overflow-y-auto max-h-[600px] pr-2">
        {agendaBD.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center hover:border-blue-300 transition-all group">
            <div className="flex items-center gap-4">
              <div className="bg-slate-50 p-3 rounded-xl text-center min-w-[80px] border border-slate-100">
                <p className="text-[10px] font-black text-blue-600 uppercase">{item.hora}</p>
                <p className="text-[9px] font-bold text-slate-400 mt-1">{item.intensidad_horaria}</p>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">{item.curso}</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {item.fecha} <span className="text-blue-300 mx-1">➔</span> {item.fecha_fin}
                </p>
              </div>
            </div>
            <button 
              onClick={() => borrarRegistro('agenda', item.id)} 
              className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <FaTrash size={14}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
)}


{/* LISTADOS DE ASISTENCIA */}  
{activeTab === "listados" && (
  <div className="space-y-6 animate-in fade-in">
    
    {/* --- MODAL RÁPIDO DE DETALLES DEL ESTUDIANTE --- */}
    {estudianteSeleccionado && (
      <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-in zoom-in duration-200">
          
          {/* Header del Modal */}
          <div className="flex justify-between items-start mb-4">
            <div className="bg-blue-100 p-3 rounded-2xl text-blue-600">
              <FaUser size={24}/>
            </div>
            <button onClick={() => setEstudianteSeleccionado(null)} className="text-slate-400 hover:text-red-500">
              <FaTimes size={20}/>
            </button>
          </div>

          <h4 className="font-black text-slate-800 text-xl leading-tight mb-1 uppercase">{estudianteSeleccionado.nombre}</h4>
          <p className="text-blue-600 font-bold text-xs mb-4">{estudianteSeleccionado.curso}</p>
          
          {/* Datos Informativos */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase">Cédula:</span>
              <span className="text-slate-700 font-mono font-bold">{estudianteSeleccionado.cedula}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase">Pago:</span>
              {/* Mostramos alerta visual si debe dinero */}
              <span className={`font-bold ${estudianteSeleccionado.estado_pago === 'Pendiente' ? 'text-red-500' : 'text-emerald-600'}`}>
                {estudianteSeleccionado.estado_pago || 'Pendiente'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 font-bold uppercase">Estado Aptitud:</span>
              <span className={`font-black ${estudianteSeleccionado.resultado_final === 'APTO' ? 'text-emerald-600' : 'text-red-500'}`}>
                {estudianteSeleccionado.resultado_final || 'Pendiente'}
              </span>
            </div>
          </div>
          
          {/* --- ZONA DE ACCIONES DE CERTIFICACIÓN --- */}
          <div className="grid gap-3">
            
            {estudianteSeleccionado.certificado_generado ? (
              // =========================================================
              // CASO 1: YA TIENE CERTIFICADO (Descargar o Revocar)
              // =========================================================
              <>
                {/* Botón Descargar PDF */}
                <button 
                  onClick={() => {
                     const bloque = agendaBD.find(a => a.id === estudianteSeleccionado.agenda_id);
                     if(bloque) generarPDFCertificado(estudianteSeleccionado, bloque);
                     else toast.error("No se encontraron datos de la agenda");
                  }}
                  className="w-full py-3 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl font-black text-center flex items-center justify-center gap-2 hover:bg-emerald-200 transition-all uppercase text-xs tracking-widest"
                >
                  <FaCheckCircle/> Descargar Certificado
                </button>

                {/* Botón REVOCAR (Nuevo) */}
                <button 
                   onClick={async () => {
                      if(!confirm("⚠️ ¿Estás seguro de ANULAR este certificado?\n\nEl código QR dejará de funcionar inmediatamente.")) return;
                      
                      const tId = toast.loading("Revocando certificado...");
                      try {
                          // Llamamos a la nueva función de anular
                          const estRevocado = await revocarCertificacion(estudianteSeleccionado.id);
                          
                          // Actualizamos estado local y global
                          setEstudianteSeleccionado(estRevocado);
                          fetchData(); 
                          
                          toast.success("Certificado anulado correctamente", { id: tId });
                      } catch (err: any) {
                          toast.error(err.message, { id: tId });
                      }
                   }}
                   className="w-full py-3 bg-red-50 text-red-500 border border-red-100 rounded-xl font-bold text-center flex items-center justify-center gap-2 hover:bg-red-100 transition-all uppercase text-[10px] tracking-widest"
                >
                   <FaTrashAlt/> Anular Certificado
                </button>
              </>
            ) : (
              // =========================================================
              // CASO 2: NO TIENE CERTIFICADO (Botón Certificar)
              // =========================================================
              <button 
                onClick={async () => {
                   if(confirm(`¿Confirmas la certificación de ${estudianteSeleccionado.nombre}?`)) {
                      const tId = toast.loading("Validando requisitos...");
                      try {
                        const bloque = agendaBD.find(a => a.id === estudianteSeleccionado.agenda_id);
                        if(!bloque) throw new Error("Agenda no encontrada");

                        // 1. Intentar registrar (Aquí saltarán los errores de Pago o Médico)
                        const estActualizado = await registrarCertificacion(estudianteSeleccionado, bloque);
                        
                        // 2. Si pasa, actualizamos la vista
                        setEstudianteSeleccionado(estActualizado);
                        fetchData(); 
                        
                        toast.success("¡Certificado Generado!", { id: tId });

                        // 3. Ofrecer descarga inmediata
                        if(confirm("Certificación exitosa. ¿Descargar PDF ahora?")) {
                           await generarPDFCertificado(estActualizado, bloque);
                        }
                      } catch (err: any) {
                        // AQUÍ SE MUESTRA EL ERROR ROJO (Si debe plata o no es apto)
                        toast.error(err.message, { id: tId, duration: 4000 });
                      }
                   }
                }}
                // Deshabilitamos visualmente si sabemos que no es apto, pero la validación real está en el onClick
                disabled={estudianteSeleccionado.resultado_final !== 'APTO'} 
                className={`w-full py-3 rounded-xl font-black text-center flex items-center justify-center gap-2 transition-all uppercase text-xs tracking-widest shadow-md ${
                  estudianteSeleccionado.resultado_final === 'APTO' 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02]' 
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                }`}
              >
                <FaFilePdf/> Generar Certificación
              </button>
            )}

            {/* Botón WhatsApp */}
            <a 
              href={`https://wa.me/57${estudianteSeleccionado.telefono}`} 
              target="_blank"
              className="w-full py-3 bg-white border-2 border-slate-100 text-slate-500 rounded-xl font-bold text-center block hover:border-emerald-400 hover:text-emerald-500 transition-all uppercase text-xs tracking-widest"
            >
              Contactar WhatsApp
            </a>
          </div>

        </div>
      </div>
    )}

    {/* HEADER DE FECHA */}
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h3 className="font-bold text-slate-800">Planillas de Asistencia</h3>
        <p className="text-xs text-slate-400">Instructor: Selecciona la fecha de hoy para ver tu grupo.</p>
      </div>
      <input 
        type="date" 
        className="p-3 border-2 border-slate-100 rounded-2xl bg-slate-50 font-black text-sm outline-none focus:border-blue-500 transition-all" 
        value={fechaSeleccionada} 
        onChange={(e) => setFechaSeleccionada(e.target.value)} 
      />
    </div>

    {/* TARJETAS DE CLASES (Mantenido igual) */}
    <div className="grid md:grid-cols-2 gap-6">
      {agendaBD.filter(a => a.fecha === fechaSeleccionada).map(bloque => {
        const inscritos = [
          ...estudiantes.filter(e => e.agenda_id === bloque.id),
          ...preinscripciones.filter(p => p.agenda_id === bloque.id)
        ];

        return (
          <div key={bloque.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
            <div className="bg-[#1e293b] p-5 text-white flex justify-between items-center">
              <div>
                <span className="font-black block uppercase text-[10px] text-blue-400 tracking-tighter">
                  {bloque.intensidad_horaria} | {bloque.hora}
                </span>
                <span className="font-bold text-base leading-none">{bloque.curso}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-blue-600 px-3 py-1 rounded-full font-black uppercase">
                  {inscritos.length} Alumnos
                </span>
              </div>
            </div>
            
            <div className="p-5 flex-1">
              {inscritos.length > 0 ? (
                <div className="space-y-2">
                  {inscritos.map((e, idx) => (
                    <div 
                      key={e.id} 
                      onClick={() => setEstudianteSeleccionado(e)} 
                      className={`flex justify-between items-center p-3 rounded-2xl cursor-pointer transition-all border group ${
                        e.certificado_generado 
                          ? 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-100' 
                          : 'bg-white border-transparent hover:bg-blue-50 hover:border-blue-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-slate-300 group-hover:text-blue-400">{idx + 1}</span>
                        <div>
                          <p className="text-xs font-bold text-slate-700 uppercase">{e.nombre}</p>
                          {e.certificado_generado && (
                            <span className="text-[8px] font-black text-emerald-600 flex items-center gap-1">
                              <FaCheckCircle size={8}/> CERTIFICADO
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         {e.resultado_final !== 'APTO' && (
                           <FaExclamationTriangle className="text-amber-400" size={12} title="No Apto / Pendiente"/>
                         )}
                         <FaExternalLinkAlt className="text-slate-200 group-hover:text-blue-400" size={10}/>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                    <p className="text-xs text-slate-300 italic">No hay estudiantes cargados para este bloque.</p>
                </div>
              )}
            </div>

            <div className="bg-slate-50 p-4 border-t flex justify-center">
               <button 
                onClick={() => descargarPDFAsistencia(bloque, inscritos)}
                className="w-full py-3 bg-white border-2 border-blue-100 text-blue-600 rounded-xl font-black text-[10px] uppercase flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
               >
                 <FaFilePdf size={14}/> Generar Planilla Oficial PDF
               </button>
            </div>
          </div>
        );
      })}
    </div>
  </div>
)}
          {/* ESTUDIANTES */}
          {activeTab === "estudiantes" && (
            <div className="max-w-4xl bg-white rounded-3xl p-8 border border-slate-200 shadow-sm mx-auto animate-in fade-in">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2"><FaUserPlus className="text-blue-600"/> Matriculación Manual</h3>
            <form onSubmit={registrarEstudiante} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input required placeholder="Nombre Completo" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.nombre} onChange={(e)=>setFormData({...formData, nombre: e.target.value})} />
              <input required placeholder="Cédula" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.cedula} onChange={(e)=>setFormData({...formData, cedula: e.target.value})} />
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Fecha de Nacimiento</label>
                <input required type="date" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.fecha_nacimiento} onChange={(e)=>setFormData({...formData, fecha_nacimiento: e.target.value})} />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Género</label>
                <select required className="p-3 bg-slate-50 border rounded-xl outline-none text-sm" value={formData.sexo} onChange={(e)=>setFormData({...formData, sexo: e.target.value})}>
                  <option value="">Seleccione Género</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <input required type="email" placeholder="Correo Electrónico" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} />
              <input required placeholder="WhatsApp (Ej: 3001234567)" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.telefono} onChange={(e)=>setFormData({...formData, telefono: e.target.value})} />

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase">Horario de Preferencia</label>
                <select required className="p-3 bg-slate-50 border rounded-xl outline-none text-sm" value={formData.horario_preferencia} onChange={(e)=>setFormData({...formData, horario_preferencia: e.target.value})}>
                  <option value="">Seleccione Horario</option>
                  <option value="Mañana (7:00 AM)">Mañana (7:00 AM)</option>
                  <option value="Tarde (1:00 PM)">Tarde (1:00 PM)</option>
                </select>
              </div>

              <select 
                required
                className="w-full p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm font-bold mt-5" 
                value={cursoSeleccionadoParaEditar} 
                onChange={(e) => {
                  setCursoSeleccionadoParaEditar(e.target.value);
                  setFormData({...formData, curso: e.target.value});
                }}
              >
                <option value="">Seleccione el curso...</option>
                {catalogoCursos.map(c => (
                  <option key={c.id} value={c.nombre_curso}>{c.nombre_curso}</option>
                ))}
              </select>

              <input placeholder="CIUDAD o DIRECCIÓN" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.ciudad_residencia} onChange={(e)=>setFormData({...formData, ciudad_residencia: e.target.value})} />
              <input placeholder="Barrio" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.barrio} onChange={(e)=>setFormData({...formData, barrio: e.target.value})} />

              <input placeholder="Empresa (Opcional)" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.empresa} onChange={(e)=>setFormData({...formData, empresa: e.target.value})} />
              <input placeholder="NIT Empresa" className="p-3 bg-slate-50 border rounded-xl outline-none" value={formData.nit} onChange={(e)=>setFormData({...formData, nit: e.target.value})} />

              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Estado inicial de pago</label>
                <select className="w-full p-3 bg-slate-50 border rounded-xl outline-none mt-1" value={formData.estadoPago} onChange={(e)=>setFormData({...formData, estadoPago: e.target.value})}>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Pagado">Pagado</option>
                </select>
              </div>

              <button type="submit" className="md:col-span-2 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition shadow-lg uppercase tracking-widest mt-4">
                Realizar Pre-Inscripción Directa
              </button>
            </form>
            </div>
          )}

          {/* MI PERFIL - DISEÑO MEJORADO */}
{activeTab === "config" && (
  <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
    <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">
      
      {/* Header con Gradiente y Avatar */}
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] p-10 text-white relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <FaUserCog size={80} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="w-24 h-24 bg-[#FFD700] rounded-3xl flex items-center justify-center text-[#0F172A] text-4xl font-black shadow-2xl rotate-3">
            {userName?.charAt(0)}
          </div>
          <div className="text-center md:text-left">
            <h3 className="text-3xl font-black tracking-tighter uppercase">{userName}</h3>
            <div className="inline-block bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full mt-2">
              <p className="text-[10px] text-blue-300 uppercase font-black tracking-widest flex items-center gap-2">
                <FaShieldAlt size={10}/> Sistema de Gestión de Riesgos
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-2 bg-white">
        
        {/* Nombre Completo */}
        <div className="group flex items-center gap-5 p-5 bg-slate-50 rounded-[24px] border border-transparent hover:border-slate-200 transition-all">
          <div className="p-4 bg-white text-slate-400 rounded-2xl shadow-sm group-hover:text-blue-600 transition-colors">
            <FaUser size={15}/>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nombre del Colaborador</p>
            <p className="text-lg font-bold text-slate-700">{userName}</p>
          </div>
        </div>

        {/* Correo */}
        <div className="group flex items-center gap-5 p-5 bg-slate-50 rounded-[24px] border border-transparent hover:border-slate-200 transition-all">
          <div className="p-4 bg-white text-slate-400 rounded-2xl shadow-sm group-hover:text-blue-600 transition-colors">
            <FaEnvelope size={20}/>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Correo Institucional</p>
            <p className="text-lg font-bold text-slate-700">{userEmail}</p>
          </div>
        </div>

        {/* Rango con Estilo de Badge */}
        <div className={`group flex items-center gap-5 p-5 rounded-[24px] border transition-all ${
          userRole === 'admin_general' ? 'bg-red-50/50 border-red-100' : 
          userRole === 'director' ? 'bg-purple-50/50 border-purple-100' : 'bg-blue-50/50 border-blue-100'
        }`}>
          <div className={`p-4 bg-white rounded-2xl shadow-sm ${
            userRole === 'admin_general' ? 'text-red-500' : 
            userRole === 'director' ? 'text-purple-500' : 'text-blue-500'
          }`}>
            <FaShieldAlt size={20}/>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Rango de Acceso</p>
            <p className={`text-lg font-black uppercase tracking-tight ${
              userRole === 'admin_general' ? 'text-red-700' : 
              userRole === 'director' ? 'text-purple-700' : 'text-blue-700'
            }`}>
              {userRole === 'admin_general' ? 'Administrador General' : 
               userRole === 'director' ? 'Director Estratégico' :
               userRole === 'coordinator' ? 'Coordinador Académico' : 'Entrenador Especializado'}
            </p>
          </div>
        </div>

        {/* Sesión Info */}
        <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-[24px] border border-transparent hover:border-slate-200 transition-all">
          <div className="p-4 bg-white text-slate-400 rounded-2xl shadow-sm">
            <FaClock size={20}/>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ingreso al Panel</p>
            <p className="text-sm font-mono text-slate-600 font-bold">{horaIngreso}</p>
          </div>
        </div>

        {/* Botón Salida */}
        <div className="pt-6 mt-4">
          <button 
            onClick={cerrarSesion} 
            className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 active:scale-95"
          >
            <FaSignOutAlt size={18} /> Finalizar Sesión
          </button>
        </div>
      </div>
    </div>
  </div>
)}
</div>
          {/* GESTIÓN DE PERSONAL ACTUALIZADO */}
{activeTab === "equipo" && (userRole === 'admin_general' || userRole === 'director') && (
  <div className="space-y-6 animate-in fade-in">
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <FaUserCog className="text-blue-600"/> Gestión de Personal
        </h3>
        <p className="text-xs text-slate-400 mt-1">Administra los accesos y rangos de tu equipo.</p>
      </div>
      
      {/* BOTÓN QUE ABRE EL FORMULARIO BONITO */}
      <button 
        onClick={() => {
          setFormEquipo({ email: "", pass: "", nombre: "" });
          setIsModalEquipoOpen(true);
        }}
        className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 shadow-lg transition-all"
      >
        <FaPlus/> Registrar Colaborador
      </button>
    </div>

    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b">
          <tr>
            <th className="px-6 py-4">Colaborador</th>
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Rango</th>
            <th className="px-6 py-4">Cambiar Rango</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {listaPerfiles.length > 0 ? listaPerfiles.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50 transition">
              <td className="px-6 py-4 font-bold text-slate-700 uppercase">{p.full_name}</td>
              <td className="px-6 py-4 text-slate-500 font-mono text-xs">{p.email}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                  p.role === 'admin_general' ? 'bg-red-100 text-red-600' :
                  p.role === 'director' ? 'bg-purple-100 text-purple-600' :
                  p.role === 'coordinator' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {p.role}
                </span>
              </td>
              <td className="px-6 py-4">
                <select 
                  className="p-2 bg-slate-50 border rounded-xl text-xs font-bold outline-none border-transparent hover:border-blue-200"
                  value={p.role}
                  onChange={async (e) => {
                    const nuevoRol = e.target.value;
                    const { error } = await supabase.from('profiles').update({ role: nuevoRol }).eq('id', p.id);
                    if (!error) {
                      toast.success(`Rol actualizado`);
                      fetchData(); 
                    }
                  }}
                >
                  <option value="trainer">trainer</option>
                  <option value="coordinator">coordinator</option>
                  <option value="director">director</option>
                  <option value="admin_general">admin_general</option>
                </select>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={4} className="p-10 text-center text-slate-400 italic text-xs">No hay perfiles registrados aún.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {/* --- EL FORMULARIO MODAL BONITO (DENTRO DEL MISMO BLOQUE) --- */}
    {isModalEquipoOpen && (
      <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in zoom-in duration-200">
          <div className="text-center mb-8">
            <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
              <FaUserPlus size={30}/>
            </div>
            <h3 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">Nuevo Miembro</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Acceso AR COSTA</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre Completo</label>
              <input 
                type="text" 
                placeholder="Ej: Juan Pérez" 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-slate-700 transition-all"
                value={formEquipo.nombre}
                onChange={(e) => setFormEquipo({...formEquipo, nombre: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Correo Electrónico</label>
              <input 
                type="email" 
                placeholder="correo@arcosta.com" 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-slate-700 transition-all"
                value={formEquipo.email}
                onChange={(e) => setFormEquipo({...formEquipo, email: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Contraseña Temporal</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold text-slate-700 transition-all"
                value={formEquipo.pass}
                onChange={(e) => setFormEquipo({...formEquipo, pass: e.target.value})}
              />
            </div>

            <div className="pt-4 space-y-3">
              <button 
                onClick={() => handleCrearUsuarioManual(formEquipo.email, formEquipo.pass, formEquipo.nombre)}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
              >
                CREAR CUENTA
              </button>
              <button 
                onClick={() => setIsModalEquipoOpen(false)}
                className="w-full py-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-red-500 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
)}
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