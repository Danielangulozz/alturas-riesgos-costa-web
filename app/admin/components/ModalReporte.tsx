// ============================================================
// components/ModalReporte.tsx
// Modal que muestra el mensaje generado para notificar
// al estudiante por WhatsApp o copiarlo al portapapeles.
// ============================================================

"use client";

import { FaEnvelope, FaTimes, FaCopy, FaPhoneAlt } from "react-icons/fa";
import toast from "react-hot-toast";

// -----------------------------------------------------------
// TIPOS
// -----------------------------------------------------------
interface ModalReporteProps {
  isOpen: boolean;
  onClose: () => void;
  texto: string;
  telefono: string;
}

// -----------------------------------------------------------
// COMPONENTE
// -----------------------------------------------------------
export function ModalReporte({ isOpen, onClose, texto, telefono }: ModalReporteProps) {
  if (!isOpen) return null;

  const enviarWhatsApp = () => {
    const num = telefono.replace(/\s/g, "").replace("+", "");
    const url = `https://wa.me/57${num}?text=${encodeURIComponent(texto)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[150] flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in duration-200">
        
        {/* HEADER */}
        <div className="bg-[#0F172A] p-5 text-white flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2">
            <FaEnvelope className="text-yellow-400" />
            Notificación al Estudiante
          </h3>
          <button onClick={onClose} className="hover:rotate-90 transition-transform">
            <FaTimes size={20} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6">
          <div className="mb-4 bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-2">
              Vista previa del mensaje:
            </p>
            <textarea
              className="w-full h-56 p-4 bg-white border rounded-xl text-xs font-mono text-slate-700 resize-none outline-none focus:ring-2 focus:ring-blue-500"
              value={texto}
              readOnly
            />
          </div>

          {/* ACCIONES */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(texto);
                toast.success("Copiado al portapapeles");
              }}
              className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition"
            >
              <FaCopy /> Copiar
            </button>
            <button
              onClick={enviarWhatsApp}
              className="py-4 bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition shadow-lg shadow-emerald-200"
            >
              <FaPhoneAlt /> Enviar WhatsApp
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}