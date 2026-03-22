"use client";

import { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";

export default function WhatsAppButton() {
  const [visible,  setVisible]  = useState(false);
  const [hovered,  setHovered]  = useState(false);

  const phoneNumber = "573148475070";
  const message     = "Hola, me gustaría recibir información sobre los cursos de trabajo en alturas.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  // Aparece medio segundo después de montar — no interrumpe la carga
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes waPulse {
          0%   { transform: scale(1);   opacity: 0.45; }
          70%  { transform: scale(1.55); opacity: 0; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        @keyframes waIn {
          from { opacity: 0; transform: translateY(16px) scale(0.85); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes tooltipIn {
          from { opacity: 0; transform: translateX(8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .wa-pulse  { animation: waPulse 2.4s ease-out infinite; }
        .wa-in     { animation: waIn 0.5s cubic-bezier(.22,1,.36,1) forwards; }
        .tooltip-in { animation: tooltipIn 0.25s cubic-bezier(.22,1,.36,1) forwards; }
      `}</style>

      {/* Botón */}
      <div
        className={`fixed bottom-6 right-6 z-[9999] flex items-center justify-end gap-3 transition-opacity duration-500 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >

        {/* Tooltip — aparece a la izquierda del botón */}
        {hovered && (
          <div className="tooltip-in flex flex-col bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 pointer-events-none">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
              ¿Necesitas ayuda?
            </span>
            <span className="text-sm font-bold text-slate-800 whitespace-nowrap">
              Escríbenos por WhatsApp
            </span>
            {/* Flecha apuntando a la derecha */}
            <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-white" />
          </div>
        )}

        {/* Botón principal */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={`wa-in relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl shadow-green-900/30 transition-transform duration-300 ${
            hovered ? "scale-110" : "scale-100"
          }`}
          style={{ background: "linear-gradient(135deg, #25D366 0%, #1da851 100%)" }}
        >
          {/* Anillo de pulso — solo cuando no está hovered */}
          {!hovered && (
            <span
              className="wa-pulse absolute inset-0 rounded-full"
              style={{ background: "rgba(37,211,102,0.5)" }}
            />
          )}

          {/* Ícono */}
          <FaWhatsapp
            size={28}
            className="relative z-10 text-white drop-shadow-sm"
          />
        </a>
      </div>
    </>
  );
}