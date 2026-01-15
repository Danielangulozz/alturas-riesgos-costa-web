"use client";

import { useState } from "react";
import { Turnstile } from '@marsidev/react-turnstile';
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { FaLock, FaEnvelope, FaShieldAlt } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
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
      router.push("/admin"); // Asegúrate que esta ruta sea la correcta
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] relative overflow-hidden px-4 selection:bg-amber-500 selection:text-white">
      <Toaster position="top-center" toastOptions={{
        style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' }
      }}/>
      
      {/* --- FONDO ÉPICO --- */}
      
      {/* 1. Destellos de Luz (Atmósfera) */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[150px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-amber-600/10 rounded-full blur-[150px] animate-pulse delay-1000"></div>

      {/* 2. EL LOGO GIGANTE DE FONDO (Marca de Agua) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        {/* Asegúrate de tener logo-blanco.webp en tu carpeta public */}
        <img 
          src="/logo-blanco.webp" 
          alt="Fondo" 
          className="w-[180%] max-w-none md:w-[800px] opacity-[0.03] animate-pulse duration-[5000ms] blur-sm scale-150"
        />
      </div>

      {/* --- TARJETA DE CRISTAL (Glassmorphism) --- */}
      <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-500">
        
        {/* Borde brillante sutil */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-amber-500 rounded-[42px] opacity-30 blur group-hover:opacity-100 transition duration-1000"></div>
        
        <div className="relative bg-slate-900/60 backdrop-blur-xl rounded-[40px] shadow-2xl p-8 md:p-10 border border-white/10">
          
          <div className="flex items-center justify-center gap-4 mb-10">
            {/* Logo */}
            <img 
              src="/logo-blanco.webp" 
              alt="Logo" 
              className="w-16 h-16 opacity-70"
            />
            
            {/* Icono flotante con brillo */}
            <div className="relative w-16 h-16 group">
              <div className="absolute inset-0 bg-amber-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 w-full h-full rounded-3xl flex items-center justify-center rotate-3 shadow-2xl relative z-10">
                <FaShieldAlt className="text-[#FFD700] text-3xl drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
              </div>
            </div>
          </div>
          
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase drop-shadow-lg text-center mb-6">
            Panel Admin
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">Correo Institucional</label>
              <div className="relative group">
                <FaEnvelope className="absolute left-4 top-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-700/50 rounded-2xl outline-none focus:border-amber-400/50 focus:bg-slate-900/80 focus:ring-1 focus:ring-amber-400/20 transition-all font-medium text-slate-200 placeholder:text-slate-600"
                  placeholder="usuario@arcosta.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">Contraseña</label>
              <div className="relative group">
                <FaLock className="absolute left-4 top-4 text-slate-500 group-focus-within:text-amber-400 transition-colors" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-700/50 rounded-2xl outline-none focus:border-amber-400/50 focus:bg-slate-900/80 focus:ring-1 focus:ring-amber-400/20 transition-all font-medium text-slate-200 placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* --- SECCIÓN DEL CAPTCHA --- */}
            <div className="flex flex-col items-center justify-center space-y-2 py-2">
              <p className="text-[9px] font-black text-blue-400/60 uppercase tracking-widest">
                Validación de Seguridad Humana
              </p>
              <div className="rounded-xl overflow-hidden border border-white/5 shadow-inner">
                <Turnstile 
                  siteKey="0x4AAAAAACMwqMQ1LtNj0aIK" 
                  onSuccess={(token) => setToken(token)}
                  options={{
                    theme: 'dark',
                    size: 'flexible',
                  }}
                />
              </div>
            </div>

          <button
              disabled={loading || !token} // No deja entrar si no hay captcha
              type="submit"
              className="w-full  py-2 bg-gradient-to-r from-amber-500 to-yellow-600 border border-amber-400/50 rounded-xl ... disabled:grayscale disabled:opacity-30"
            >
              <span className="relative z-10">
                {!token ? "Esperando Verificación..." : loading ? "Accediendo..." : "Ingresar al Sistema"}
              </span>
            </button>
          </form>

          <div className="mt-2 text-center border-t border-white/5 pt-2">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest hover:text-slate-400 transition-colors cursor-default">
              &copy; 2026 Alturas y Riesgos de la Costa S.A.S.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}