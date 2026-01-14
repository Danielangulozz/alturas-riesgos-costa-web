"use client";

import React from "react";
import { FaShieldAlt, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

export default function PoliticaPrivacidadPage() {
  return (
    <section className="min-h-screen bg-[#F8FAFC] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-xs uppercase tracking-widest mb-6 transition-colors">
                <FaArrowLeft/> Volver al inicio
            </Link>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">
                Política de Privacidad
            </h1>
            <p className="text-slate-500 text-lg">
                Última actualización: Enero 2026
            </p>
        </div>

        {/* CONTENIDO LEGAL */}
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 text-slate-600 leading-relaxed space-y-8">
            
            <div className="bg-blue-50 p-6 rounded-2xl border-l-4 border-blue-600">
                <p className="text-sm font-medium text-blue-900">
                    <strong>ALTURAS Y RIESGOS DE LA COSTA S.A.S</strong> (en adelante "LA EMPRESA"), identificada con NIT <strong>901.713.234-2</strong>, 
                    está comprometida con la protección de la privacidad y los datos personales de sus usuarios, estudiantes y clientes.
                </p>
            </div>

            <section>
                <h2 className="text-xl font-black text-slate-800 mb-4 uppercase flex items-center gap-2">
                    1. Información que Recopilamos
                </h2>
                <p>
                    Para la prestación de nuestros servicios de capacitación y certificación en trabajo seguro en alturas, recopilamos los siguientes tipos de datos:
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-2 marker:text-blue-500">
                    <li><strong>Datos de Identificación:</strong> Nombres, apellidos, número de cédula de ciudadanía o extranjería.</li>
                    <li><strong>Datos de Contacto:</strong> Dirección física, correo electrónico, número de teléfono fijo y móvil.</li>
                    <li><strong>Datos Socioeconómicos:</strong> Empresa donde labora, cargo, ARL a la que está afiliado.</li>
                    <li><strong>Datos Sensibles (Salud):</strong> Conceptos de aptitud médica (EMO) necesarios para verificar la idoneidad física para realizar trabajo en alturas, conforme a la Resolución 4272 de 2021.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-black text-slate-800 mb-4 uppercase">
                    2. Finalidad del Tratamiento
                </h2>
                <p>Los datos personales recolectados serán utilizados para:</p>
                <ul className="list-disc pl-5 mt-4 space-y-2 marker:text-blue-500">
                    <li>Gestionar la inscripción y matrícula a los cursos de formación.</li>
                    <li>Reportar la certificación ante el Ministerio del Trabajo y plataformas gubernamentales pertinentes.</li>
                    <li>Verificar la vigencia de la seguridad social y aptitud médica.</li>
                    <li>Generar los certificados físicos y digitales.</li>
                    <li>Enviar notificaciones sobre vencimientos, reentrenamientos y novedades normativas.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-black text-slate-800 mb-4 uppercase">
                    3. Seguridad de la Información
                </h2>
                <p>
                    Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger sus datos personales contra acceso no autorizado, 
                    pérdida, alteración o divulgación. Utilizamos protocolos de encriptación (SSL) en nuestro sitio web y bases de datos seguras.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-black text-slate-800 mb-4 uppercase">
                    4. Uso de Cookies
                </h2>
                <p>
                    Nuestro sitio web puede utilizar cookies para mejorar la experiencia del usuario, analizar el tráfico y personalizar el contenido. 
                    El usuario puede configurar su navegador para rechazar las cookies, aunque esto podría limitar algunas funcionalidades de la plataforma.
                </p>
            </section>

            <div className="border-t border-slate-100 pt-8 mt-8">
                <p className="text-sm text-slate-400 font-medium text-center">
                    Alturas y Riesgos de la Costa S.A.S - Sincelejo, Sucre, Colombia.
                </p>
            </div>
        </div>
      </div>
    </section>
  );
}