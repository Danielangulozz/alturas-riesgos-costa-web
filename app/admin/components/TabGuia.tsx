import React, { useState, useEffect } from "react";
import { FaBook, FaKeyboard, FaLightbulb, FaEnvelope, FaPaperPlane, FaShieldAlt, FaIdCard, FaHistory, FaCheckCircle, FaSpinner, FaImage, FaTicketAlt, FaReply } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface TabGuiaProps {
  userName: string;
  userRole: string;
}

export function TabGuia({ userName, userRole }: TabGuiaProps) {
  const [sugerencia, setSugerencia] = useState("");
  const [asunto, setAsunto] = useState("Sugerencia de Mejora");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [misTickets, setMisTickets] = useState<any[]>([]);
  const [reabriendo, setReabriendo] = useState<string | null>(null);
  const [nuevoMensajeReabrir, setNuevoMensajeReabrir] = useState<{ [key: string]: string }>({});

  const cargarMisTickets = async () => {
    const { data } = await supabase
      .from('tickets_soporte')
      .select('*')
      .eq('usuario', userName)
      .order('created_at', { ascending: false });
    if (data) setMisTickets(data);
  };

  useEffect(() => {
    cargarMisTickets();
  }, [userName]);

  const reabrirTicket = async (ticketId: string, mensajeAnterior: string) => {
    const adicional = nuevoMensajeReabrir[ticketId];
    if (!adicional) return toast.error("Debes escribir por qué reabres el ticket.");
    
    setReabriendo(ticketId);
    const mensajeActualizado = `${mensajeAnterior}\n\n[Reabierto]: ${adicional}`;
    
    const { error } = await supabase
      .from('tickets_soporte')
      .update({ estado: 'Pendiente', mensaje: mensajeActualizado })
      .eq('id', ticketId);

    if (!error) {
      toast.success("Ticket reabierto correctamente.");
      setNuevoMensajeReabrir(prev => ({ ...prev, [ticketId]: "" }));
      cargarMisTickets();
    } else {
      toast.error("Error al reabrir el ticket.");
    }
    setReabriendo(null);
  };

  const enviarTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sugerencia.trim()) return toast.error("El mensaje no puede estar vacío");

    setIsSubmitting(true);
    const loadingToast = toast.loading("Enviando ticket al desarrollador...");

    try {
      let imagenUrl = null;

      if (archivo) {
        const fileExt = archivo.name.split('.').pop();
        const fileName = `ticket-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("docs_students")
          .upload(fileName, archivo);

        if (uploadError) {
          throw new Error("No se pudo subir la imagen. " + uploadError.message);
        }

        const { data: urlData } = supabase.storage.from("docs_students").getPublicUrl(fileName);
        imagenUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from('tickets_soporte').insert([{
        usuario: userName,
        rol: userRole,
        tipo: asunto,
        mensaje: sugerencia,
        estado: 'Pendiente',
        imagen_url: imagenUrl
      }]);

      if (error) throw error;

      toast.success("¡Ticket enviado exitosamente! El desarrollador lo revisará pronto.", { id: loadingToast });
      setSugerencia("");
      setArchivo(null);
      cargarMisTickets();
    } catch (error: any) {
      toast.error(`Error: ${error.message}`, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">

      {/* HEADER */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 lg:p-8 flex items-center gap-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
          <FaBook size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Guía y Flujo Operativo</h2>
          <p className="text-slate-500 text-sm mt-1">Manual detallado del sistema ARC. Aprende a operar todos los módulos y conoce tus permisos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* COLUMNA PRINCIPAL - CONTENIDO DE LA GUÍA */}
        <div className="lg:col-span-2 space-y-6">

          {/* SECCIÓN: ATAJOS DE TECLADO */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-black text-slate-800 uppercase flex items-center gap-2 mb-4">
              <FaKeyboard className="text-slate-400" /> Atajos Rápidos
            </h3>
            <p className="text-sm text-slate-500 mb-4">Usa estos atajos para navegar como un profesional sin usar el ratón.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-600">Buscar Estudiante</span>
                <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-black text-slate-700 shadow-sm">Ctrl + K</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-600">Modo Oscuro</span>
                <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-black text-slate-700 shadow-sm">Ctrl + D</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-600">Cerrar Modales</span>
                <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-black text-slate-700 shadow-sm">Esc</kbd>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-bold text-slate-600">Navegar Pestañas</span>
                <kbd className="px-2 py-1 bg-white border border-slate-200 rounded text-[10px] font-black text-slate-700 shadow-sm">Ctrl + 1-9</kbd>
              </div>
            </div>
          </div>

          {/* SECCIÓN: ROLES Y PERMISOS */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-lg font-black text-slate-800 uppercase flex items-center gap-2 mb-4">
              <FaShieldAlt className="text-indigo-500" /> Roles y Permisos (Seguridad)
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              El sistema protege la información dependiendo del cargo del usuario.
              <strong> Tu rol actual es: <span className="uppercase text-indigo-600">{userRole.replace('_', ' ')}</span></strong>
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-start gap-3">
                <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest mt-0.5">Admin / Dev</span>
                <p className="text-xs text-slate-600 leading-relaxed">Tienen acceso total. Pueden borrar registros, modificar precios base globales, auditar acciones de otros usuarios y gestionar accesos al equipo.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                <span className="bg-slate-500 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest mt-0.5">Director / Coord</span>
                <p className="text-xs text-slate-600 leading-relaxed">Pueden agendar, matricular, cobrar y verificar. No pueden alterar configuraciones críticas del sistema ni modificar al equipo principal.</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                <span className="bg-slate-400 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest mt-0.5">Entrenador (Trainer)</span>
                <p className="text-xs text-slate-600 leading-relaxed">Su visión está restringida. Tienen acceso principalmente a matricular alumnos y revisar las Planillas de Clase para tomar asistencia, sin ver reportes financieros.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN: FLUJO DE TRABAJO */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-8">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-black text-slate-800 uppercase flex items-center gap-2 mb-2">
                <FaLightbulb className="text-amber-500" /> Flujo de Trabajo Operativo
              </h3>
              <p className="text-sm text-slate-500">
                Así es como la información viaja a través del sistema, garantizando que no se pierda ningún cliente ni dinero.
              </p>
            </div>

            {/* MÓDULO: DASHBOARD */}
            <div className="relative pl-6">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-200"></div>
              <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
              <h4 className="font-black text-slate-700 text-sm mb-1 uppercase tracking-tight">1. Panel Principal (Dashboard)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                El centro de mando. Al entrar, lo primero que ves es si hay <strong>Solicitudes Pendientes</strong>. Revisa las estadísticas generales y las gráficas.
                <span className="block mt-2 font-bold text-slate-700">📌 Tip: Puedes usar el botón verde "Exportar Reporte" para generar un Excel ejecutivo al instante con todas las métricas.</span>
              </p>
              <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img src="/dashboard-guide.png" alt="Dashboard" className="w-full h-auto object-cover" />
              </div>
            </div>

            {/* MÓDULO: SOLICITUDES */}
            <div className="relative pl-6">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-200"></div>
              <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]"></div>
              <h4 className="font-black text-slate-700 text-sm mb-1 uppercase tracking-tight">2. Solicitudes Web (Captación)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cada persona que llena el formulario en la web entra aquí en tiempo real (sonará una notificación).
                Revisa los cursos que piden, envíales un presupuesto instantáneo por WhatsApp con el botón verde. Si aceptan, los puedes agendar desde allí mismo o enviarlos a la Base de Datos.
              </p>
              <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img src="/solicitudes-guide.png" alt="Solicitudes Web" className="w-full h-auto object-cover" />
              </div>
            </div>

            {/* MÓDULO: BASE DE DATOS */}
            <div className="relative pl-6">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-purple-200"></div>
              <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.6)]"></div>
              <h4 className="font-black text-slate-700 text-sm mb-1 uppercase tracking-tight">3. Base de Datos (Gestión Central)</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                El corazón del sistema. Aquí convergen los pre-inscritos de la web (tienen un badge naranja "WEB") y los matriculados manualmente por el equipo.
                Desde aquí gestionas 3 cosas fundamentales:
                <br /><br />
                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded text-[10px] font-bold"><FaCheckCircle /> Pago:</span> Controlas si pagaron o deben.
                <br />
                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold mt-1"><FaIdCard /> Aptitud:</span> Verificas si pasaron sus exámenes médicos (APTO / NO APTO).
                <br />
                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold mt-1"><FaBook /> Documentación:</span> Puedes ver y descargar (ZIP) cédulas, ARL, etc.
              </p>
              <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <img src="/tabla-guide.png" alt="Base de Datos" className="w-full h-auto object-cover" />
              </div>
            </div>

            {/* MÓDULO: PLANILLAS Y CERTIFICADOS */}
            <div className="relative pl-6">
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-200"></div>
              <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]"></div>
              <h4 className="font-black text-slate-700 text-sm mb-1 uppercase tracking-tight">4. Planillas y Certificación</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Una vez asignados a una clase, aparecen en <strong>Planillas de Clase</strong>. El Entrenador puede descargar la planilla en Excel para tomar asistencia física.
                <br /><br />
                Cuando un estudiante está "APTO" y ha completado el curso, en la Base de Datos aparecerá la opción de generar su <strong>Certificado</strong>.
                El certificado se crea en formato A4 con un código QR único que puede ser verificado desde la vista pública del sitio web por cualquier empresa.
              </p>
            </div>

            {/* MÓDULO: AUDITORÍA */}
            <div className="relative pl-6">
              <div className="absolute left-[-5px] top-1 w-3 h-3 rounded-full bg-slate-500 shadow-[0_0_10px_rgba(100,116,139,0.6)]"></div>
              <h4 className="font-black text-slate-700 text-sm mb-1 uppercase tracking-tight flex items-center gap-2">
                <FaHistory /> Auditoría (Todo deja rastro)
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Seguridad estricta. Todo lo que pasa en el sistema (quién modificó un precio, quién eliminó un alumno, quién cambió un estado de pago) se guarda en la pestaña <strong>Auditoría / Logs</strong>.
                Esto asegura responsabilidad total y evita fraudes internos.
              </p>
            </div>

          </div>

          {/* SECCIÓN: MIS TICKETS (Historial) */}
          {misTickets.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-black text-slate-800 uppercase flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                <FaTicketAlt className="text-blue-500" /> Mis Tickets de Soporte
              </h3>
              
              <div className="space-y-4">
                {misTickets.map((t) => (
                  <div key={t.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                          t.estado === 'Resuelto' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {t.estado}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">{t.tipo}</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="text-xs text-slate-700 font-medium whitespace-pre-wrap">{t.mensaje}</p>
                      
                      {t.estado === 'Resuelto' && t.respuesta && (
                        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                          <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1 mb-1">
                            <FaReply /> Respuesta del Dev
                          </p>
                          <p className="text-xs text-emerald-800">{t.respuesta}</p>
                        </div>
                      )}

                      {t.estado === 'Resuelto' && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">¿Aún tienes problemas? Reabre el ticket:</p>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              value={nuevoMensajeReabrir[t.id] || ""}
                              onChange={(e) => setNuevoMensajeReabrir({ ...nuevoMensajeReabrir, [t.id]: e.target.value })}
                              placeholder="Describe por qué lo reabres..."
                              className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                            />
                            <button 
                              onClick={() => reabrirTicket(t.id, t.mensaje)}
                              disabled={reabriendo === t.id}
                              className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1"
                            >
                              {reabriendo === t.id ? <FaSpinner className="animate-spin" /> : "Reabrir"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA LATERAL - FORMULARIO DE SUGERENCIAS AL DEVELOPER */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 sticky top-6 text-white relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/20 rounded-full blur-[40px] pointer-events-none"></div>

            <h3 className="text-lg font-black text-white uppercase flex items-center gap-2 mb-2">
              <FaEnvelope className="text-blue-400" /> Soporte & Developer
            </h3>
            <p className="text-xs text-slate-400 mb-6 font-medium">
              Este buzón está conectado directamente con el Desarrollador del sistema (Daniel). Envía tickets sobre fallos, peticiones de mejora o consultas técnicas.
            </p>

            <form onSubmit={enviarTicket} className="space-y-4 relative z-10">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Tipo de Ticket
                </label>
                <select
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-bold text-white transition-colors"
                >
                  <option value="Sugerencia de Mejora">Sugerencia de Mejora</option>
                  <option value="Reporte de Error (Bug)">Reporte de Error (Bug)</option>
                  <option value="Soporte Técnico">Soporte Técnico</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Detalles del Reporte
                </label>
                <textarea
                  required
                  value={sugerencia}
                  onChange={(e) => setSugerencia(e.target.value)}
                  placeholder="Describe detalladamente qué sucedió o qué te gustaría mejorar..."
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-medium text-white h-32 resize-none placeholder:text-slate-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                  Adjuntar Evidencia (Opcional)
                </label>
                <label className="flex items-center gap-2 w-full p-3 bg-slate-800 border border-slate-700 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                  <FaImage className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-400 truncate flex-1">
                    {archivo ? archivo.name : "Subir imagen (PNG, JPG)..."}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setArchivo(e.target.files ? e.target.files[0] : null)}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50 active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <><FaSpinner className="animate-spin" /> Enviando...</>
                ) : (
                  <><FaPaperPlane size={12} /> Abrir Ticket de Soporte</>
                )}
              </button>

              <div className="flex items-center gap-2 mt-4 justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                  Conexión directa con Base de Datos
                </p>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
