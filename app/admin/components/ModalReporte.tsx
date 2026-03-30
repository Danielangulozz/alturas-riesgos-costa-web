"use client";

// ============================================================
// components/ModalReporte.tsx
// Modal con mensajes separados por tema.
// Adaptado para Independientes vs Empresas con UI Moderna.
// ============================================================

import { useState, useEffect } from "react";
import {
  FaTimes, FaCopy, FaPhoneAlt, FaEnvelope, FaCheck,
  FaMoneyBillWave, FaCalendarAlt, FaCheckCircle,
  FaBuilding, FaUser, FaEdit, FaFileAlt, FaWhatsapp
} from "react-icons/fa";
import toast from "react-hot-toast";
import { obtenerRequeridos, getDocUrl } from "../utils/documentos";

// -----------------------------------------------------------
// TIPOS
// -----------------------------------------------------------
interface ModalReporteProps {
  isOpen: boolean;
  onClose: () => void;
  estudiante: any;
  userName: string;
}

type TabMensaje = "docs" | "pago" | "cita" | "completo";

// -----------------------------------------------------------
// HELPERS
// -----------------------------------------------------------

// Valida si el estudiante pertenece a una empresa real o es independiente
function esEmpresa(est: any): boolean {
  if (est?.tipo_cliente === "Particular" || est?.tipo_cliente === "Independiente") return false;
  if (est?.tipo_cliente === "Empresa") return true;

  const nombreEmpresa = (est?.empresa || "").trim().toLowerCase();

  // Lista de palabras que indican que es independiente
  const esIndependiente = [
    "",
    "particular",
    "independiente",
    "particular / independiente",
    "ninguna",
    "n/a"
  ].includes(nombreEmpresa);

  return !esIndependiente;
}

// Devuelve lista de docs faltantes y rechazados del estudiante
function analizarDocs(est: any): { faltantes: string[]; rechazados: string[] } {
  const requeridos = obtenerRequeridos(est?.curso || "");
  const verif = est?.doc_verification || {};
  const faltantes: string[] = [];
  const rechazados: string[] = [];

  requeridos.forEach((req: any) => {
    const url = getDocUrl(est, req.id, req.oldId);
    const status = verif[req.id]?.status;
    if (!url) faltantes.push(req.label);
    else if (status === "rejected") rechazados.push(req.label);
  });

  return { faltantes, rechazados };
}

// -----------------------------------------------------------
// GENERADORES DE MENSAJE
// -----------------------------------------------------------

function msgDocs(est: any, userName: string): string {
  const empresa = esEmpresa(est);
  const { faltantes, rechazados } = analizarDocs(est);
  const valor = est?.precio_final || est?.precio_pactado || "0";

  const saludo = empresa
    ? `Estimado(a) *${est.nombre}*, buen día.\nLe escribe *${userName}* de *Alturas y Riesgos de la Costa S.A.S*, en relación al proceso de capacitación del personal de *${est.empresa}*.`
    : `Hola *${est.nombre}*, buen día 👋\nTe escribe *${userName}* de *Alturas y Riesgos de la Costa S.A.S*.`;

  let cuerpo = `\n\n📋 *ESTADO DE DOCUMENTACIÓN*\n`;

  if (faltantes.length === 0 && rechazados.length === 0) {
    cuerpo += `\n✅ ¡Documentación completa y verificada!`;
  } else {
    if (faltantes.length > 0) {
      cuerpo += `\n⚠️ *Documentos pendientes de entrega:*\n`;
      faltantes.forEach(d => cuerpo += `• ${d}\n`);
    }
    if (rechazados.length > 0) {
      cuerpo += `\n❌ *Documentos rechazados (ilegibles o incorrectos):*\n`;
      rechazados.forEach(d => cuerpo += `• ${d}\n`);
    }

    // Condicional: Recomendación Empresa vs Independiente
    cuerpo += empresa
      ? `\n_Le solicitamos coordinar con el área de SST o RR.HH. de su empresa para gestionar estos documentos a la brevedad. Sin ellos no es posible avanzar con la certificación._`
      : `\n_Al estar realizando tu proceso de forma independiente, recuerda que debes enviarnos estos documentos por este medio lo antes posible. Sin la documentación completa no podemos avanzar._`;
  }

  cuerpo += `\n\n💳 *Estado de pago:* ${est?.estado_pago === "Pagado" ? `✅ Cancelado ($${valor})` : `⚠️ Pendiente — $${valor}`}`;

  return `${saludo}${cuerpo}\n\nQuedamos atentos.\nAtte: *${userName}* | Alturas y Riesgos de la Costa S.A.S`;
}

function msgPago(est: any, userName: string): string {
  const empresa = esEmpresa(est);
  const valor = est?.precio_final || est?.precio_pactado || "0";
  const { faltantes, rechazados } = analizarDocs(est);
  const totalDocs = faltantes.length + rechazados.length;

  const saludo = empresa
    ? `Estimado(a) *${est.nombre}*, buen día.\nLe escribe *${userName}* de *Alturas y Riesgos de la Costa S.A.S*, en relación al proceso con *${est.empresa}*.`
    : `Hola *${est.nombre}*, buen día 👋\nTe escribe *${userName}* de *Alturas y Riesgos de la Costa S.A.S*.`;

  let cuerpo = `\n\n💳 *ESTADO DE PAGO*\n`;

  if (est?.estado_pago === "Pagado") {
    cuerpo += `\n✅ Pago registrado correctamente por *$${valor}*. ¡Gracias!`;
  } else {
    cuerpo += `\n⚠️ El proceso presenta *pago pendiente*.\n\n💵 *Valor a cancelar: $${valor}*\n`;

    // Condicional: Recomendación Empresa vs Independiente
    cuerpo += empresa
      ? `\nLe solicitamos escalar este tema con el área administrativa o financiera de su empresa. El comprobante debe incluir el *NIT de la empresa* para el registro contable. Una vez confirmado, programaremos el entrenamiento.`
      : `\nAl ser tu proceso independiente, puedes realizar el pago y enviarnos el comprobante por este chat. ¡Tan pronto lo verifiquemos, te aseguramos tu cupo! 🎯`;
  }

  if (totalDocs > 0) {
    cuerpo += `\n\n📋 *Recordatorio de documentación:*\n`;
    faltantes.forEach(d => cuerpo += `• ⚠️ ${d} (faltante)\n`);
    rechazados.forEach(d => cuerpo += `• ❌ ${d} (rechazado)\n`);
  }

  return `${saludo}${cuerpo}\n\nQuedamos atentos.\nAtte: *${userName}* | Alturas y Riesgos de la Costa S.A.S`;
}

function msgCita(est: any, userName: string, agendaBD: any[]): string {
  const empresa = esEmpresa(est);
  const valor = est?.precio_final || est?.precio_pactado || "0";
  const bloque = agendaBD.find((a: any) => a.id === est?.agenda_id);

  const saludo = empresa
    ? `Estimado(a) *${est.nombre}*, buen día.\nLe escribe *${userName}* de *Alturas y Riesgos de la Costa S.A.S*.`
    : `Hola *${est.nombre}*, buen día 👋\nTe escribe *${userName}* de *Alturas y Riesgos de la Costa S.A.S*.`;

  let cuerpo = `\n\n🗓️ *INFORMACIÓN DE ENTRENAMIENTO*\n`;

  if (bloque) {
    cuerpo += `\nTienes entrenamiento programado:\n`;
    cuerpo += `📚 *Curso:* ${bloque.curso}\n`;
    cuerpo += `📅 *Fecha:* ${bloque.fecha}\n`;
    cuerpo += `⏰ *Hora:* ${bloque.hora}\n`;
    cuerpo += `⏳ *Duración:* ${bloque.intensidad_horaria || "Por confirmar"}\n`;

    // Condicional: Recomendación Empresa vs Independiente
    cuerpo += empresa
      ? `\nLes recordamos tener en cuenta:\n✅ Puntualidad (presentarse 15 min antes)\n✅ Documentación y pago al día\n✅ Ropa cómoda, zapatos cerrados\n\n*Cualquier novedad con la asistencia del personal, gestionarla a través de la empresa.*`
      : `\nTen en cuenta:\n✅ Llegar 15 minutos antes\n✅ Traer documentación completa y pago al día\n✅ Ropa cómoda, zapatos cerrados\n\n_Al ser tu proceso independiente, es tu responsabilidad asistir puntualmente. Si tienes algún contratiempo, avísanos con anticipación._ 📅`;
  } else {
    cuerpo += `\nAún no tienes fecha de entrenamiento asignada. `;

    cuerpo += empresa
      ? `Una vez solucionados los pendientes, nos comunicaremos con la empresa para programar las fechas.`
      : `En cuanto tengamos todo al día y haya disponibilidad, te notificaremos tus fechas.`;
  }

  cuerpo += `\n\n💳 *Pago:* ${est?.estado_pago === "Pagado" ? `✅ Cancelado ($${valor})` : `⚠️ Pendiente — $${valor}`}`;

  return `${saludo}${cuerpo}\n\nQuedamos atentos.\nAtte: *${userName}* | Alturas y Riesgos de la Costa S.A.S`;
}

function msgCompleto(est: any, userName: string, agendaBD: any[]): string {
  const empresa = esEmpresa(est);
  const valor = est?.precio_final || est?.precio_pactado || "0";
  const { faltantes, rechazados } = analizarDocs(est);
  const bloque = agendaBD.find((a: any) => a.id === est?.agenda_id);

  const saludo = empresa
    ? `Estimado(a) *${est.nombre}*, buen día.\nLe escribe *${userName}* de *Alturas y Riesgos de la Costa S.A.S*.\nA continuación el resumen del proceso de capacitación con *${est.empresa}*:`
    : `Hola *${est.nombre}*, buen día 👋\nTe escribe *${userName}* de *Alturas y Riesgos de la Costa S.A.S*.\nAquí tienes el resumen detallado de tu proceso independiente:`;

  let secDocs = `\n\n📋 *DOCUMENTACIÓN:*\n`;
  if (faltantes.length === 0 && rechazados.length === 0) {
    secDocs += `✅ Completa y verificada`;
  } else {
    faltantes.forEach(d => secDocs += `• ⚠️ ${d} (faltante)\n`);
    rechazados.forEach(d => secDocs += `• ❌ ${d} (rechazado)\n`);
  }

  const aptitud = est?.resultado_final || "Pendiente";
  const secAptitud = `\n\n🩺 *APTITUD MÉDICA:* ${aptitud === "APTO" ? "✅ APTO" : aptitud === "NO APTO" ? "🚫 NO APTO" : "⏳ Pendiente de revisión"}`;

  const secPago = `\n\n💳 *PAGO:* ${est?.estado_pago === "Pagado" ? `✅ Cancelado ($${valor})` : `⚠️ Pendiente — $${valor}`}`;

  let secCita = `\n\n🗓️ *ENTRENAMIENTO:* `;
  if (bloque) {
    secCita += `${bloque.fecha} a las ${bloque.hora}`;
  } else {
    secCita += `⏳ Por programar`;
  }

  // Condicional final Empresa vs Independiente
  const conclusion = empresa
    ? `\n\n_Para avanzar, le sugerimos validar con el personal encargado de su empresa para dar solución a los puntos pendientes._`
    : `\n\n_Recuerda gestionar los puntos pendientes lo antes posible para avanzar con tu certificación. ¡Aquí estamos para apoyarte!_ 😊`;

  return `${saludo}${secDocs}${secAptitud}${secPago}${secCita}${conclusion}\n\nAtte: *${userName}* | Alturas y Riesgos de la Costa S.A.S`;
}

// -----------------------------------------------------------
// CONFIG TABS
// -----------------------------------------------------------
const TABS: { id: TabMensaje; label: string; icon: React.ReactNode }[] = [
  { id: "docs", label: "Documentos", icon: <FaFileAlt /> },
  { id: "pago", label: "Pago", icon: <FaMoneyBillWave /> },
  { id: "cita", label: "Cita", icon: <FaCalendarAlt /> },
  { id: "completo", label: "Resumen", icon: <FaCheckCircle /> },
];

// -----------------------------------------------------------
// COMPONENTE
// -----------------------------------------------------------
export function ModalReporte({ isOpen, onClose, estudiante, userName }: ModalReporteProps & { agendaBD?: any[] }) {
  const agendaBD = (estudiante as any)?._agendaBD || [];

  const [tabActiva, setTabActiva] = useState<TabMensaje>("docs");
  const [textoEditado, setTextoEditado] = useState("");
  const [emailCopiado, setEmailCopiado] = useState(false);
  const [msgCopiado, setMsgCopiado] = useState(false);

  const generarTexto = (tab: TabMensaje) => {
    if (!estudiante) return "";
    switch (tab) {
      case "docs": return msgDocs(estudiante, userName);
      case "pago": return msgPago(estudiante, userName);
      case "cita": return msgCita(estudiante, userName, agendaBD);
      case "completo": return msgCompleto(estudiante, userName, agendaBD);
    }
  };

  useEffect(() => {
    if (isOpen && estudiante) {
      setTabActiva("docs");
      setTextoEditado(generarTexto("docs"));
      setEmailCopiado(false);
      setMsgCopiado(false);
    }
  }, [isOpen, estudiante]);

  useEffect(() => {
    if (isOpen && estudiante) {
      setTextoEditado(generarTexto(tabActiva));
      setMsgCopiado(false);
    }
  }, [tabActiva]);

  if (!isOpen || !estudiante) return null;

  const empresa = esEmpresa(estudiante);
  const { faltantes, rechazados } = analizarDocs(estudiante);
  const totalDocsPendientes = faltantes.length + rechazados.length;

  const copiarEmail = () => {
    if (!estudiante.email) return toast.error("Sin email registrado");
    navigator.clipboard.writeText(estudiante.email);
    setEmailCopiado(true);
    toast.success("Email copiado");
    setTimeout(() => setEmailCopiado(false), 2500);
  };

  const copiarMensaje = () => {
    navigator.clipboard.writeText(textoEditado);
    setMsgCopiado(true);
    toast.success("Mensaje copiado");
    setTimeout(() => setMsgCopiado(false), 2500);
  };

  const enviarWhatsApp = () => {
    const num = (estudiante.telefono || "").replace(/\D/g, "").replace(/^57/, "");
    if (!num) return toast.error("Sin número de teléfono registrado");
    window.open(`https://wa.me/57${num}?text=${encodeURIComponent(textoEditado)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[150] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200 animate-in zoom-in duration-200">

        {/* ── HEADER MODERNO ── */}
        <div className="bg-blue-900 px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-xl bg-white/20 shadow-inner flex-shrink-0 border border-white/10">
              {estudiante.nombre?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-bold text-base tracking-tight leading-tight">
                {estudiante.nombre}
              </p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {empresa
                  ? <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-[10px] text-blue-100 font-medium tracking-wide"><FaBuilding size={10} /> {estudiante.empresa}</span>
                  : <span className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-[10px] text-slate-100 font-medium tracking-wide"><FaUser size={10} /> Independiente</span>
                }
                <span className="text-[10px] text-blue-200 font-mono truncate max-w-[180px] bg-black/10 px-2 py-0.5 rounded">
                  {estudiante.curso}
                </span>
                {totalDocsPendientes > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                    {totalDocsPendientes} doc{totalDocsPendientes > 1 ? "s" : ""} pendiente{totalDocsPendientes > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white hover:bg-white/10 rounded-full p-2 transition-all duration-200">
            <FaTimes size={18} />
          </button>
        </div>

        {/* ── TABS DE MENSAJE ── */}
        <div className="px-6 pt-5 pb-2 flex-shrink-0 border-b border-slate-100">
          <div className="flex gap-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setTabActiva(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-all ${tabActiva === tab.id
                  ? "bg-blue-900 text-white shadow-md shadow-indigo-200"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }`}
              >
                <span className={tabActiva === tab.id ? "text-indigo-200" : "text-slate-400"}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── EDITOR ── */}
        <div className="px-6 py-4 flex-1 overflow-y-auto bg-slate-50/50">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <FaEdit size={10} className="text-indigo-400" /> VISTA PREVIA DEL MENSAJE (Editable)
            </p>
            <span className="text-[10px] text-slate-400 font-mono bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
              {textoEditado.length} chars
            </span>
          </div>

          <textarea
            className="w-full h-56 p-4 bg-white border border-slate-200 rounded-2xl text-[12px] font-mono text-slate-700 resize-none outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all leading-relaxed shadow-sm"
            value={textoEditado}
            onChange={(e) => setTextoEditado(e.target.value)}
            spellCheck={false}
          />

          {/* FILA EMAIL */}
          <div className={`mt-4 flex items-center justify-between rounded-xl px-4 py-3 border bg-white shadow-sm ${estudiante.email ? "border-slate-200" : "border-dashed border-slate-200"
            }`}>
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-slate-100 p-2 rounded-lg text-slate-400">
                <FaEnvelope size={12} />
              </div>
              <span className={`text-xs font-mono truncate ${estudiante.email ? "text-slate-600 font-medium" : "text-slate-400 italic"}`}>
                {estudiante.email || "Sin email registrado en el sistema"}
              </span>
            </div>
            {estudiante.email && (
              <button
                onClick={copiarEmail}
                className={`flex-shrink-0 flex items-center gap-1.5 text-[10px] font-black uppercase px-3 py-2 rounded-lg ml-3 transition-all ${emailCopiado
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100"
                  }`}
              >
                {emailCopiado ? <FaCheck size={10} /> : <FaCopy size={10} />}
                {emailCopiado ? "Copiado" : "Copiar"}
              </button>
            )}
          </div>
        </div>

        {/* ── ACCIONES ── */}
        <div className="px-6 py-5 bg-white border-t border-slate-100 flex-shrink-0">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={copiarMensaje}
              className={`py-3.5 rounded-2xl font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-2 transition-all border-2 ${msgCopiado
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : "bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50"
                }`}
            >
              {msgCopiado ? <FaCheck size={14} /> : <FaCopy size={14} />}
              {msgCopiado ? "¡Mensaje Copiado!" : "Copiar Texto"}
            </button>
            <button
              onClick={enviarWhatsApp}
              className="py-3.5 bg-[#25D366] text-white rounded-2xl font-bold text-[12px] uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#1EBE5D] active:scale-95 transition-all shadow-lg shadow-emerald-200"
            >
              <FaWhatsapp size={16} /> Enviar por WhatsApp
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}