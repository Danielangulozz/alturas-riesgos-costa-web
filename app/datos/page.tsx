"use client";

import React from "react";
import { FaBalanceScale, FaArrowLeft, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import Link from "next/link";

export default function TratamientoDatosPage() {
  return (
    <section className="min-h-screen bg-[#F8FAFC] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-10">
            <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-xs uppercase tracking-widest mb-6 transition-colors">
                <FaArrowLeft/> Volver al inicio
            </Link>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">
                Manual de Tratamiento de Datos
            </h1>
            <p className="text-slate-500 text-lg">
                Cumplimiento Ley 1581 de 2012 (Habeas Data)
            </p>
        </div>

        {/* CONTENIDO LEGAL */}
        <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 text-slate-600 leading-relaxed space-y-8">
            
            <section>
                <h2 className="text-xl font-black text-slate-800 mb-4 uppercase flex items-center gap-2">
                    <FaBalanceScale className="text-blue-600"/> Marco Legal
                </h2>
                <p>
                    <strong>ALTURAS Y RIESGOS DE LA COSTA S.A.S</strong> actúa como Responsable del Tratamiento de los datos personales. 
                    Esta política se rige por lo dispuesto en la Constitución Política de Colombia (Art. 15 y 20), la Ley 1581 de 2012, 
                    el Decreto 1377 de 2013 y demás normas concordantes.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-black text-slate-800 mb-4 uppercase">
                    Derechos de los Titulares (ARCO)
                </h2>
                <p className="mb-4">
                    Como titular de sus datos personales, usted tiene derecho a:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <strong className="block text-slate-800 uppercase text-xs font-black mb-1">Acceso</strong>
                        <span className="text-sm">Conocer, actualizar y rectificar sus datos personales.</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <strong className="block text-slate-800 uppercase text-xs font-black mb-1">Prueba</strong>
                        <span className="text-sm">Solicitar prueba de la autorización otorgada para el tratamiento.</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <strong className="block text-slate-800 uppercase text-xs font-black mb-1">Uso</strong>
                        <span className="text-sm">Ser informado sobre el uso que se le ha dado a sus datos.</span>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <strong className="block text-slate-800 uppercase text-xs font-black mb-1">Revocación</strong>
                        <span className="text-sm">Revocar la autorización y/o solicitar la supresión del dato cuando no se respeten los principios legales.</span>
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-black text-slate-800 mb-4 uppercase">
                    Tratamiento de Datos Sensibles
                </h2>
                <p>
                    Se informa al Titular que no está obligado a autorizar el tratamiento de datos sensibles. Sin embargo, para el caso de los cursos de alturas, 
                    el tratamiento de datos relacionados con la <strong>aptitud médica (salud)</strong> es estrictamente necesario para cumplir con la normatividad vigente y garantizar su seguridad durante el entrenamiento. 
                    Estos datos serán tratados con la máxima reserva y seguridad.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-black text-slate-800 mb-4 uppercase">
                    Transmisión a Terceros
                </h2>
                <p>
                    Sus datos podrán ser transmitidos a:
                </p>
                <ul className="list-disc pl-5 mt-4 space-y-2 marker:text-blue-500">
                    <li>Ministerio del Trabajo (Plataformas de registro de capacitación).</li>
                    <li>Administradoras de Riesgos Laborales (ARL) para verificación de cobertura.</li>
                    <li>Entidades auditoras o de control cuando la ley así lo exija.</li>
                </ul>
            </section>

            <section className="bg-slate-900 text-white p-8 rounded-2xl mt-8">
                <h2 className="text-lg font-black uppercase mb-4 text-white">
                    Canales de Atención (Habeas Data)
                </h2>
                <p className="mb-6 text-slate-300">
                    Para ejercer sus derechos de conocer, actualizar, rectificar y suprimir sus datos, puede contactarnos a través de:
                </p>
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg"><FaEnvelope/></div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Correo Electrónico</p>
                            <a href="mailto:admin@alturasyriesgos.com" className="font-bold hover:text-blue-400">admin@alturasyriesgos.com</a>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg"><FaMapMarkerAlt/></div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase">Oficina Principal</p>
                            <p className="font-bold">Sincelejo, Sucre, Colombia</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="border-t border-slate-100 pt-8 mt-8">
                <p className="text-sm text-slate-400 font-medium text-center">
                    La presente política rige a partir de su publicación.
                </p>
            </div>
        </div>
      </div>
    </section>
  );
}