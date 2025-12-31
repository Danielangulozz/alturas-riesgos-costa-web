"use client";

import { useState, useRef } from "react"; 
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import HCaptcha from '@hcaptcha/react-hcaptcha';

export default function AdminLogin() {
  // ---------------------------------------------------------
  // 1. ESTADOS Y REFERENCIAS
  // ---------------------------------------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // Inicializamos con un valor ficticio para evitar bloqueos de lógica
  const [captchaToken, setCaptchaToken] = useState<string | null>("bypass"); 
  
  const router = useRouter();
  const captchaRef = useRef<HCaptcha>(null);

  // ---------------------------------------------------------
  // 2. LÓGICA DE INICIO DE SESIÓN
  // ---------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    /* --- CAPTCHA DESHABILITADO TEMPORALMENTE ---
    if (!captchaToken) {
      alert("Por favor, completa el captcha de seguridad.");
      return;
    }
    ------------------------------------------- */

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      // Se comenta la opción de captcha para que Supabase no lo exija
      // options: {
      //   captchaToken, 
      // },
    });

    if (error) {
      alert("Error: Credenciales inválidas");
      setLoading(false);
      /* setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
      */
    } else {
      router.push("/admin"); 
    }
  };

  // ---------------------------------------------------------
  // 3. RENDERIZADO (VISTA)
  // ---------------------------------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00558A] px-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-800">Panel Administrativo</h1>
          <p className="text-gray-500 text-sm">Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-black w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FFD700] outline-none"
              placeholder="admin@arcosta.com"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 block mb-2">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-black w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#FFD700] outline-none"
              placeholder="••••••••"
            />
          </div>

          {/* WIDGET DE HCAPTCHA - DESHABILITADO VISUALMENTE
          <div className="flex justify-center">
            <HCaptcha
              ref={captchaRef}
              sitekey="e36a67b8-85da-43b0-98e2-0b089902390e"
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
            />
          </div>
          */}
                
          <button
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-[#8B2323] text-white font-bold rounded-xl hover:bg-red-700 transition duration-300 shadow-lg disabled:opacity-50"
          >
            {loading ? "Iniciando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}