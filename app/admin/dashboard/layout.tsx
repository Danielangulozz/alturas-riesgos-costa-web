"use client";
import React, { useState, useEffect } from "react";
import { FaBars, FaTimes, FaSignOutAlt, FaClipboardList, FaCalendarAlt, FaUserPlus, FaUsers, FaUserCheck, FaMoneyBillWave, FaUserCog } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | undefined>("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.push("/admin/login");
      else setUserEmail(session.user.email);
    };
    checkUser();
  }, [router]);

  return (
    <div className="flex h-screen bg-[#f1f5f9] text-[#334155] overflow-hidden">
      <Toaster position="bottom-right" />
      
      {/* Botón Móvil */}
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-[#1e293b] text-white rounded-xl shadow-lg">
        {isSidebarOpen ? <FaTimes size={20}/> : <FaBars size={20}/>}
      </button>

      {/* SIDEBAR COMPONENT */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1e293b] text-slate-300 transform transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex lg:flex-col shadow-xl flex-shrink-0`}>
        <div className="p-6 text-xl font-bold border-b border-slate-700 text-white tracking-tight">AR Costa <span className="text-blue-400">Admin</span></div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Aquí los botones del menú que ya tenías... */}
          <SidebarLinks /> 
        </nav>
        <button onClick={() => supabase.auth.signOut().then(() => router.push("/admin/login"))} className="m-4 flex items-center gap-3 px-4 py-3 bg-red-900/30 hover:bg-red-800 text-red-200 rounded-lg transition"><FaSignOutAlt /> Salir</button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 h-screen overflow-y-auto relative pt-16 lg:pt-0">
        <div className="p-4 md:p-10 max-w-7xl mx-auto">
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <h2 className="text-2xl font-bold text-[#1e293b] capitalize">Panel Administrativo</h2>
            <div className="flex items-center gap-3 bg-white p-2 pr-5 rounded-full border border-slate-200 shadow-sm">
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white uppercase">{userEmail?.charAt(0)}</div>
              <div className="flex flex-col"><span className="text-xs font-bold text-slate-700">{userEmail}</span><span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">🟢 Conectado</span></div>
            </div>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}