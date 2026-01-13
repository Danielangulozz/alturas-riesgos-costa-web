"use client";

import { useState } from "react"; 
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { FaLock, FaEnvelope, FaShieldAlt } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Credenciales incorrectas. Verifica e intenta de nuevo.");
      setLoading(false);
    } else {
      toast.success("¡Bienvenido al sistema!");
      router.push("/admin"); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] relative overflow-hidden px-6">
      <Toaster position="top-center" />
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 rounded-full blur-[120px]"></div>

      <div className="max-w-md w-full relative">
        <div className="bg-white rounded-[40px] shadow-2xl p-10 border border-slate-100">
          
          <div className="text-center mb-10">
            <div className="bg-[#FFD700] w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-xl shadow-amber-200">
              <FaShieldAlt className="text-[#0F172A] text-4xl" />
            </div>
            <h1 className="text-3xl font-black text-[#0F172A] tracking-tighter uppercase">Panel Admin</h1>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">AR COSTA - Gestión de Riesgos</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Correo Institucional</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-4 text-slate-300" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-[#FFD700] focus:bg-white transition-all font-bold text-slate-700"
                  placeholder="nombre@arcosta.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Contraseña</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-4 text-slate-300" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none focus:border-[#FFD700] focus:bg-white transition-all font-bold text-slate-700"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-5 bg-[#0F172A] text-white font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-800 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 mt-4 text-xs"
            >
              {loading ? "Verificando..." : "Ingresar al Sistema"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              &copy; 2024 AR COSTA | Seguridad Industrial
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}