"use client";

import React from "react";
import dynamic from "next/dynamic";
import { FaBullseye, FaEye, FaHandHoldingHeart, FaCheckCircle, FaWaze, FaHardHat, FaCertificate, FaUserShield, FaMapMarkerAlt } from "react-icons/fa";import Link from "next/link";
import GoogleMapsEmbed from "@/components/GoogleMapsEmbed";
export default function NosotrosPage() {
  return (
    <div className="bg-white min-h-screen">
      
      {/* 1. HERO SECTION: INTRODUCCIÓN */}
      <section className="relative py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          
          {/* Texto */}
          <div className="order-2 md:order-1 space-y-6 animate-in slide-in-from-left duration-700">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest">
              Sobre Nosotros
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
              Líderes en formación de <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Trabajo Seguro en Alturas
              </span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              <strong>Alturas y Riesgos de la Costa S.A.S</strong> es tu aliado estratégico en seguridad industrial en Sincelejo y Sucre. 
              Nos dedicamos a transformar la cultura de seguridad de las empresas mediante capacitación de alta calidad, 
              cumpliendo estrictamente con la normativa colombiana vigente.
            </p>
            <div className="pt-4 flex gap-4">
               <Link href="/cursos" className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold uppercase hover:bg-slate-800 transition shadow-lg hover:-translate-y-1">
                 Ver Cursos
               </Link>
               <Link href="/contacto" className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-700 rounded-xl font-bold uppercase hover:border-blue-500 hover:text-blue-600 transition">
                 Contáctanos
               </Link>
            </div>
          </div>

          {/* Imagen Decorativa (Collage) */}
          <div className="order-1 md:order-2 relative">
             {/* Círculo decorativo de fondo */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-50/50 rounded-full blur-3xl -z-10"></div>
             
             <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500 border-4 border-white">
                {/* IMAGEN PRINCIPAL (Reemplaza src con una foto tuya entrenando) */}
                <img 
                  src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000&auto=format&fit=crop" 
                  alt="Entrenamiento en Alturas" 
                  className="w-full h-[500px] object-cover"
                />
                
                {/* Tarjeta flotante sobre la imagen */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white/50">
                   <div className="flex items-center gap-3">
                      <div className="bg-emerald-100 p-2 rounded-full text-emerald-600">
                         <FaCheckCircle size={20}/>
                      </div>
                      <div>
                         <p className="text-xs font-black text-slate-400 uppercase">Cumplimiento Legal</p>
                         <p className="text-sm font-bold text-slate-900">Resolución 4272 de 2021</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>


      {/* 2. MISIÓN, VISIÓN Y VALORES (GRID MODERNO) */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
           
           <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-slate-900 mb-4">Nuestra Identidad Corporativa</h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                 Más que certificar, buscamos salvar vidas a través de la educación consciente y la excelencia operativa.
              </p>
           </div>

           <div className="grid md:grid-cols-3 gap-8">
              
              {/* Misión */}
              <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-transform duration-300 group">
                 <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FaBullseye/>
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-3">Nuestra Misión</h3>
                 <p className="text-slate-600 leading-relaxed text-sm">
                   Formar trabajadores competentes y conscientes del riesgo. No solo entregamos un certificado, garantizamos que cada estudiante tenga las habilidades para proteger su vida.
                 </p>
              </div>

              {/* Visión */}
              <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-transform duration-300 group">
                 <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 text-2xl mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <FaEye/>
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-3">Nuestra Visión</h3>
                 <p className="text-slate-600 leading-relaxed text-sm">
                   Ser el centro de entrenamiento referente en la Región Caribe para 2028, reconocidos por nuestra infraestructura de punta y calidad pedagógica.
                 </p>
              </div>

              {/* Valores */}
              <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 transition-transform duration-300 group">
                 <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 text-2xl mb-6 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <FaHandHoldingHeart/>
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-3">Nuestros Valores</h3>
                 <ul className="space-y-2">
                    {["Responsabilidad", "Legalidad", "Compromiso", "Excelencia"].map((val) => (
                       <li key={val} className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div> {val}
                       </li>
                    ))}
                 </ul>
              </div>

           </div>
        </div>
      </section>


      {/* 3. POR QUÉ ELEGIRNOS (RELLENO VISUAL ÚTIL) */}
      <section className="py-20 px-6">
         <div className="max-w-7xl mx-auto bg-[#1e293b] rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden">
            
            {/* Fondo decorativo */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px] opacity-20 -mr-20 -mt-20"></div>

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
               <div>
                  <h2 className="text-3xl md:text-4xl font-black mb-6">¿Por qué entrenar con Alturas y Riesgos de la Costa?</h2>
                  <p className="text-slate-300 mb-8 leading-relaxed">
                     Sabemos que la seguridad no es un juego. Contamos con instalaciones diseñadas específicamente para simular escenarios reales de riesgo.
                  </p>
                  
                  <div className="space-y-4">
                     <div className="flex items-start gap-4">
                        <div className="bg-blue-600 p-3 rounded-xl shrink-0">
                           <FaHardHat size={20}/>
                        </div>
                        <div>
                           <h4 className="font-bold text-lg">Instructores Expertos</h4>
                           <p className="text-sm text-slate-400">Personal certificado y con experiencia real en campo.</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4">
                        <div className="bg-blue-600 p-3 rounded-xl shrink-0">
                           <FaCertificate size={20}/>
                        </div>
                        <div>
                           <h4 className="font-bold text-lg">Certificación Inmediata</h4>
                           <p className="text-sm text-slate-400">Sistema digital ágil. Descarga tu certificado apenas apruebes.</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-4">
                        <div className="bg-blue-600 p-3 rounded-xl shrink-0">
                           <FaUserShield size={20}/>
                        </div>
                        <div>
                           <h4 className="font-bold text-lg">Seguridad Total</h4>
                           <p className="text-sm text-slate-400">Pistas de entrenamiento homologadas y equipos certificados.</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Imagen secundaria */}
               <div className="relative h-full min-h-[300px] rounded-3xl overflow-hidden border border-slate-700">
                  <img 
                     src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1000&auto=format&fit=crop" 
                     alt="Ingeniero en obras" 
                     className="absolute inset-0 w-full h-full object-cover opacity-80 hover:scale-105 transition-transform duration-700"
                  />
               </div>
            </div>
         </div>
      </section>
{/* 3. SECCIÓN UBICACIÓN (CON GOOGLE MAPS) */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
            
            <div className="text-center mb-12">
                <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">Ubicación Estratégica</span>
                <h2 className="text-3xl font-black text-slate-900 mt-2">Visita Nuestra Sede</h2>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-stretch">
                
                {/* Info Lateral */}
                <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-slate-100 flex flex-col justify-center space-y-6">
                    <div>
                        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><FaMapMarkerAlt/></div>
                            Dirección
                        </h3>
                        <p className="text-slate-600 ml-11 mt-1 text-sm font-medium">
                           Cra. 17 #27-35 <br/> Sincelejo, Sucre
                        </p>
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><FaCertificate/></div>
                            Horario de Atención
                        </h3>
                        <p className="text-slate-600 ml-11 mt-1 text-sm font-medium">
                           Lunes a Viernes: 7:00 AM - 12:00 PM <br/>
                           y 2:00 PM - 6:00 PM <br/>
                           Sábados: 8:00 AM - 12:00 PM
                        </p>
                    </div>
                    
                    {/* Botón Waze / Google Maps Externo */}
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=Alturas+y+Riesgos+de+la+Costa+S.A.S+Sincelejo" 
                      target="_blank" 
                      className="mt-4 w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-center uppercase text-xs hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-lg hover:-translate-y-0.5"
                    >
                        <FaWaze size={16}/> Abrir GPS
                    </a>
                </div>

                {/* EL MAPA DE GOOGLE (Responsive) */}
                <div className="lg:col-span-2 h-[400px] lg:h-auto">
                    <GoogleMapsEmbed />
                </div>
            </div>
        </div>
      </section>
    </div>
  );
}