// ============================================================
// components/DocButton.tsx
// Botón inteligente para visualizar y verificar documentos
// de un estudiante. Muestra estado: pending, approved, rejected.
// ============================================================

"use client";

import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaUsers,
  FaClock,
} from "react-icons/fa";

// -----------------------------------------------------------
// TIPOS
// -----------------------------------------------------------
interface StatusData {
  status: "pending" | "approved" | "rejected";
  by?: string;
  at?: string;
}

interface DocButtonProps {
  label: string;
  url: string | null;
  icon: React.ReactNode;
  statusData: StatusData | undefined;
  onToggle: () => void;
}

// -----------------------------------------------------------
// COMPONENTE
// -----------------------------------------------------------
export function DocButton({ label, url, icon, statusData, onToggle }: DocButtonProps) {
  const status = statusData?.status || "pending";

  // Estilos visuales según el estado del documento
  const visual = {
    pending: {
      bg: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-200",
      btnBg: "bg-amber-100 hover:bg-emerald-100 hover:text-emerald-600",
      btnIcon: <FaCheckCircle size={10} />,
    },
    approved: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-200",
      btnBg: "bg-emerald-100 text-emerald-600 hover:bg-red-100 hover:text-red-600",
      btnIcon: <FaCheckCircle size={10} />,
    },
    rejected: {
      bg: "bg-red-50",
      text: "text-red-600",
      border: "border-red-200",
      btnBg: "bg-red-100 text-red-600 hover:bg-emerald-100 hover:text-emerald-600",
      btnIcon: <FaTimesCircle size={10} />,
    },
  }[status];

  // Si no hay URL, mostramos que el documento falta
  if (!url) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg border border-slate-100 bg-slate-50 text-slate-300 italic opacity-70">
        <span className="text-[10px]">
          <FaExclamationTriangle />
        </span>
        <span className="text-[9px] font-bold uppercase">{label} (Falta)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 group relative">
      
      {/* LINK AL DOCUMENTO */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex-1 flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all ${visual.bg} ${visual.text} ${visual.border}`}
        title="Clic para abrir documento"
      >
        <span className="text-[10px]">{icon}</span>
        <span className="text-[9px] font-bold uppercase">{label}</span>
        <FaExternalLinkAlt className="ml-auto opacity-0 group-hover:opacity-50" size={8} />
      </a>

      {/* BOTÓN DE TOGGLE (aprobar/rechazar) */}
      <button
        onClick={onToggle}
        className={`p-1.5 rounded-lg transition border border-transparent ${visual.btnBg} relative group/btn`}
      >
        {visual.btnIcon}

        {/* TOOLTIP con quién verificó y cuándo */}
        {statusData?.by && (
          <div className="absolute bottom-full right-0 mb-2 w-max max-w-[200px] hidden group-hover/btn:block z-50 animate-in fade-in zoom-in">
            <div className="bg-[#1e293b] text-white text-[9px] p-2 rounded-lg shadow-xl relative">
              <p className="font-bold flex items-center gap-1">
                <FaUsers size={8} /> {statusData.by}
              </p>
              <p className="font-mono text-slate-300 flex items-center gap-1 mt-1">
                <FaClock size={8} /> {statusData.at}
              </p>
              <div className="absolute top-full right-2 -mt-1 border-4 border-transparent border-t-[#1e293b]"></div>
            </div>
          </div>
        )}
      </button>

    </div>
  );
}