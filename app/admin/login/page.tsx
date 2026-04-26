"use client";

import { useState, useEffect } from "react";
import { Turnstile } from '@marsidev/react-turnstile';
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { FaLock, FaEnvelope, FaShieldAlt, FaCheckCircle, FaTimesCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  // Estados para Recuperación y Cambio
  const [isResetting, setIsResetting] = useState(false);
  const [isUpdatingFromRecovery, setIsUpdatingFromRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsUpdatingFromRecovery(true);
        toast.success("Modo de recuperación activado. Ingresa tu nueva contraseña.");
      }
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  // Validación de Contraseña
  const checkStrength = (pass: string) => ({
    length: pass.length >= 8,
    upper: /[A-Z]/.test(pass),
    number: /[0-9]/.test(pass),
    special: /[^A-Za-z0-9]/.test(pass)
  });

  const strength = checkStrength(newPassword);
  const isSecure = strength.length && strength.upper && strength.number && strength.special;
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Ingresa tu correo para enviar el enlace.");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/admin/login'
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Enlace de recuperación enviado. Revisa tu correo.");
      setIsResetting(false);
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSecure || !passwordsMatch) return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("¡Contraseña actualizada con éxito! Ya puedes entrar.");
      setIsUpdatingFromRecovery(false);
      setPassword(newPassword);
    }
    setLoading(false);
  };
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
    <div className="min-h-screen w-full flex bg-slate-50 selection:bg-blue-500 selection:text-white font-sans">
      <Toaster position="top-right" toastOptions={{
        style: { background: '#fff', color: '#1e293b', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }
      }} />

      {/* LEFT PANEL - BRANDING (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-[#0F172A] relative overflow-hidden p-12 shadow-2xl z-10">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3 pointer-events-none" />

        {/* Logo & Header */}
        <div className="relative z-10 flex items-center gap-4">
          <img src="/LOGOSOLO.png" alt="ARC Logo" className="w-16 h-16 drop-shadow-2xl" />
          <div>
            <h2 className="text-white font-black text-2xl tracking-widest uppercase leading-none">
              <span className="text-slate-400">ARC</span> SYSTEM
            </h2>
            <p className="text-slate-400 font-bold text-[10px] tracking-[0.2em] uppercase mt-1">by Alturas y Riesgos de la Costa</p>
          </div>
        </div>

        {/* Main Copy */}
        <div className="relative z-10 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-6 border border-white/10">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Sistema de Información Interno
          </div>
          <h1 className="text-5xl 2xl:text-6xl font-black text-white leading-[1.1] tracking-tighter mb-6">
            Gestión <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-200 drop-shadow-sm">Inteligente</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-md font-medium leading-relaxed">
            Uso exclusivo para el personal autorizado de Alturas y Riesgos de la Costa S.A.S. Ingrese con sus credenciales institucionales para acceder a los módulos de gestión operativa y documental.
          </p>
        </div>

        {/* Footer Left */}
        <div className="relative z-10 flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          <FaShieldAlt className="text-slate-400" size={14} /> Protección de Datos y Privacidad.
        </div>
      </div>

      {/* RIGHT PANEL - FORM */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-500">

          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="bg-[#0F172A] p-4 rounded-3xl shadow-xl mb-4">
              <img src="/LOGOSOLO.png" alt="ARC Logo" className="w-14 h-14" />
            </div>
            <h2 className="text-slate-800 font-black text-2xl tracking-widest uppercase text-center">
              <span className="text-slate-400">ARC</span> SYSTEM
            </h2>
          </div>

          <div className="bg-white p-8 sm:p-10 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 relative z-10">

            {isUpdatingFromRecovery ? (
              // --- UI RECUPERAR CONTRASEÑA ---
              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div className="mb-8 text-center sm:text-left">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Nueva Clave</h3>
                  <p className="text-slate-500 text-xs mt-2 font-medium">Ingresa tu nueva contraseña corporativa segura.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Contraseña</label>
                  <div className="relative group">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type={showNew ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-mono text-slate-800 placeholder:text-slate-400 placeholder:font-sans"
                      placeholder="Escribe tu nueva clave"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showNew ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-bold p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className={`flex items-center gap-1.5 ${strength.length ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {strength.length ? <FaCheckCircle /> : <FaTimesCircle />} 8+ caracteres
                    </div>
                    <div className={`flex items-center gap-1.5 ${strength.upper ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {strength.upper ? <FaCheckCircle /> : <FaTimesCircle />} Mayúscula
                    </div>
                    <div className={`flex items-center gap-1.5 ${strength.number ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {strength.number ? <FaCheckCircle /> : <FaTimesCircle />} Número
                    </div>
                    <div className={`flex items-center gap-1.5 ${strength.special ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {strength.special ? <FaCheckCircle /> : <FaTimesCircle />} Símbolo (!@#$)
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Confirmar Contraseña</label>
                  <div className="relative group">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" />
                    <input
                      type={showNew ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border rounded-xl outline-none transition-all font-mono text-slate-800 placeholder:text-slate-400 placeholder:font-sans ${confirmPassword && newPassword !== confirmPassword ? 'border-red-400 focus:ring-4 focus:ring-red-500/10 focus:bg-white' :
                        confirmPassword && newPassword === confirmPassword ? 'border-emerald-400 focus:ring-4 focus:ring-emerald-500/10 focus:bg-white' : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white'
                        }`}
                      placeholder="Repite tu clave"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    disabled={loading || !isSecure || !passwordsMatch}
                    type="submit"
                    className="w-full py-4 bg-[#0F172A] hover:bg-emerald-600 text-white rounded-xl font-black text-[11px] uppercase tracking-[0.15em] transition-all shadow-lg hover:shadow-emerald-600/30 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                  >
                    {loading ? "Procesando..." : "Actualizar y Entrar"}
                  </button>
                </div>
              </form>

            ) : isResetting ? (
              // --- UI ENVIAR ENLACE RECUPERACIÓN ---
              <form onSubmit={handleSendResetLink} className="space-y-5">
                <div className="mb-8 text-center sm:text-left">
                  <button
                    type="button"
                    onClick={() => setIsResetting(false)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-800 mb-4 inline-flex items-center gap-1 transition-colors"
                  >
                    ← Volver
                  </button>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Recuperar Acceso</h3>
                  <p className="text-slate-500 text-xs mt-2 font-medium">Enviaremos un enlace encriptado a tu correo institucional.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Correo Institucional</label>
                  <div className="relative group">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400"
                      placeholder="usuario@arcosta.com"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-4 bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-xl font-black text-[11px] uppercase tracking-[0.15em] transition-all shadow-lg hover:shadow-amber-500/30 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                  >
                    {loading ? "Enviando..." : "Enviar Enlace Seguro"}
                  </button>
                </div>
              </form>

            ) : (
              // --- UI LOGIN NORMAL ---
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="mb-8 text-center sm:text-left">
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Acceso Corporativo</h3>
                  <p className="text-slate-500 text-xs mt-2 font-medium">Ingresa tus credenciales para continuar.</p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wider mb-2">Correo Institucional</label>
                  <div className="relative group">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400"
                      placeholder="usuario@arcosta.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Contraseña</label>
                    <button type="button" onClick={() => setIsResetting(true)} className="text-[10px] text-blue-600 hover:text-blue-800 font-bold transition-colors">¿Olvidaste tu clave?</button>
                  </div>
                  <div className="relative group">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-medium text-slate-800 placeholder:text-slate-400"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {/* --- SECCIÓN DEL CAPTCHA --- */}
                <div className="flex justify-center pt-2 pb-2">
                  <div className="rounded-xl overflow-hidden shadow-sm border border-slate-200">
                    <Turnstile
                      siteKey="0x4AAAAAACMwqMQ1LtNj0aIK"
                      onSuccess={(token) => setToken(token)}
                      options={{ theme: 'light' }}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    disabled={loading || !token}
                    type="submit"
                    className="w-full py-4 bg-[#0F172A] hover:bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-[0.15em] transition-all shadow-lg hover:shadow-blue-600/30 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                  >
                    {!token ? "Verificando Seguridad..." : loading ? "Autenticando..." : "Iniciar Sesión"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-8 text-center opacity-70">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              &copy; {new Date().getFullYear()} Alturas y Riesgos de la Costa
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}