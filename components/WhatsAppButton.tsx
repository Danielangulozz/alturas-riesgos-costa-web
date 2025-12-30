"use client";

import Image from "next/image";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa"; // Necesitas instalar react-icons

export default function WhatsAppButton() {
  const phoneNumber = "573148475070"; // Tu número con código de país
  const message = "Hola, me gustaría recibir información sobre los cursos de alturas.";
  
  // Codificar el mensaje para la URL
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[9999] group"
      aria-label="Contactar por WhatsApp"
    >
      {/* Efecto de Pulso (Opcional, para que resalte) */}
      <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75 group-hover:bg-yellow-400"></span>
      
      {/* Botón Principal */}
      <div className="relative flex items-center justify-center w-16 h-16 bg-[#25D366] text-white rounded-full shadow-2xl transition-transform duration-300 group-hover:scale-110 group-hover:bg-yellow-400 group-hover:text-[#8B2323]">
        <FaWhatsapp size={35} />
        
        {/* Tooltip opcional que sale al pasar el mouse */}
        <span className="absolute right-20 bg-white text-gray-800 px-4 py-2 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
          ¿Necesitas ayuda? Escríbenos
        </span>
      </div>
    </a>
  );
}