"use client";

import { useState, useRef } from "react"; // 1. Agregado useRef aquí
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
  const [captchaToken, setCaptchaToken] = useState<string | null>(null); // Estado para el token
  
  const router = useRouter();
  const captchaRef = useRef<HCaptcha>(null); // Referencia corregida

  // ---------------------------------------------------------
  // 2. LÓGICA DE INICIO DE SESIÓN
  // ---------------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que el captcha se haya hecho
    if (!captchaToken) {
      alert("Por favor, completa el captcha de seguridad.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        captchaToken, // Enviamos el token a Supabase
      },
    });

    if (error) {
      alert("Error: Credenciales inválidas o fallo en seguridad");
      setLoading(false);
      // Reiniciamos el captcha si hay error para que lo vuelvan a hacer
      setCaptchaToken(null);
      captchaRef.current?.resetCaptcha();
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

          {/* WIDGET DE HCAPTCHA */}
          <div className="flex justify-center">
            <HCaptcha
              ref={captchaRef}
              sitekey="e36a67b8-85da-43b0-98e2-0b089902390e"
              onVerify={(token) => setCaptchaToken(token)}
              onExpire={() => setCaptchaToken(null)}
            />
          </div>
                
          <button
            disabled={loading}
            type="submit"
            className="w-full py-4 bg-[#8B2323] text-white font-bold rounded-xl hover:bg-red-700 transition duration-300 shadow-lg disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}