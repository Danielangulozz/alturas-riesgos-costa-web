import React, { useState, useEffect } from "react";
import { FaUserCog, FaShieldAlt, FaUser, FaEnvelope, FaClock, FaSignOutAlt, FaStopwatch, FaHistory, FaInfoCircle, FaLock, FaCheckCircle, FaTimesCircle, FaEye, FaEyeSlash } from "react-icons/fa";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface TabConfigProps {
  userName: string;
  userEmail: string;
  userRole: string;
  horaIngreso: string;
  cerrarSesion: () => void;
  currentSessionSeconds?: number;
  triggerConfirm: (title: string, message: string, onConfirm: () => void, type?: 'danger' | 'warning' | 'info' | 'success') => void;
  setActiveTab: (tab: string) => void;
}

export function TabConfig({ userName, userEmail, userRole, horaIngreso, cerrarSesion, currentSessionSeconds = 0, triggerConfirm, setActiveTab }: TabConfigProps) {
  const [totalSecondsToday, setTotalSecondsToday] = useState(0);
  const [lastSessionTime, setLastSessionTime] = useState<string | null>(null);

  // Estados para Cambio de Contraseña
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (!userEmail) return;

    const todayStr = new Date().toLocaleDateString('en-CA');
    const storageKey = `admin_session_${userEmail}`;
    const stored = localStorage.getItem(storageKey);
    let initialTotal = 0;
    let initialDisplayTime = "Primer ingreso al sistema";

    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.date === todayStr) {
          initialTotal = data.totalSeconds || 0;

          // Prioridad 1: Logout explícito
          // Prioridad 2: Última actividad registrada (si no es actual)
          const lastActivity = data.lastLogout ? new Date(data.lastLogout).getTime() : (data.lastTimestamp || 0);
          const timeSinceLast = Date.now() - lastActivity;

          if (timeSinceLast > 300000) { // Si fue hace más de 5 min
            const diffMins = Math.floor(timeSinceLast / 60000);
            if (diffMins < 60) {
              initialDisplayTime = `Última sesión hace ${diffMins} minutos`;
            } else {
              const diffHours = Math.floor(diffMins / 60);
              initialDisplayTime = `Última sesión hace ${diffHours} h y ${diffMins % 60} min`;
            }
          } else {
            initialDisplayTime = "Sesión en curso";
          }
        } else {
          initialDisplayTime = `Última sesión el ${data.date}`;
        }
      } catch (e) { }
    }

    setLastSessionTime(initialDisplayTime);
    setTotalSecondsToday(initialTotal);
  }, [userEmail]);

  // Funciones para validación de contraseña
  const checkStrength = (pass: string) => {
    return {
      length: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[^A-Za-z0-9]/.test(pass)
    };
  };

  const strength = checkStrength(newPassword);
  const isSecure = strength.length && strength.upper && strength.number && strength.special;
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleUpdatePassword = async () => {
    if (!isSecure || !passwordsMatch) return;
    setIsUpdatingPassword(true);

    // Verificar contraseña actual intentando iniciar sesión
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword
    });

    if (signInError) {
      toast.error("La contraseña actual es incorrecta.");
      setIsUpdatingPassword(false);
      return;
    }

    // Actualizar contraseña
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(`Error al actualizar: ${error.message}`);
    } else {
      toast.success("¡Contraseña actualizada correctamente!");
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setIsUpdatingPassword(false);
  };

  const totalTime = totalSecondsToday + currentSessionSeconds;
  const hours = Math.floor(totalTime / 3600);
  const minutes = Math.floor((totalTime % 3600) / 60);
  const seconds = totalTime % 60;

  const formatTime = (v: number) => v.toString().padStart(2, '0');

  return (
    <div className="max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden">

        {/* Header con Gradiente y Avatar */}
        <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] p-10 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <FaUserCog size={80} />
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="w-24 h-24 bg-[#FFD700] rounded-3xl flex items-center justify-center text-[#0F172A] text-4xl font-black shadow-2xl rotate-3">
              {userName?.charAt(0) || "?"}
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-black tracking-tighter uppercase">{userName}</h3>
              <div className="inline-block bg-blue-500/20 border border-blue-400/30 px-3 py-1 rounded-full mt-2">
                <p className="text-[10px] text-blue-300 uppercase font-black tracking-widest flex items-center gap-2">
                  <FaShieldAlt size={10} /> Sistema de Gestión de Riesgos
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-2 bg-white">


          {/* Rango con Estilo de Badge */}
          <div className={`group flex items-center gap-5 p-5 rounded-[24px] border transition-all ${userRole === 'admin_general' ? 'bg-red-50/50 border-red-100' :
              userRole === 'developer' ? 'bg-slate-900 border-slate-700 shadow-[0_0_15px_rgba(52,211,153,0.1)]' :
                userRole === 'director' ? 'bg-purple-50/50 border-purple-100' : 'bg-emerald-50/50 border-emerald-100'
            }`}>
            <div className={`p-4 rounded-2xl shadow-sm ${userRole === 'admin_general' ? 'bg-white text-red-500' :
                userRole === 'developer' ? 'bg-slate-800 text-emerald-400' :
                  userRole === 'director' ? 'bg-white text-purple-500' : 'bg-white text-emerald-500'
              }`}>
              <FaShieldAlt size={20} />
            </div>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest ${userRole === 'developer' ? 'text-emerald-500/50' : 'text-slate-400'
                }`}>Rango de Acceso</p>
              <p className={`text-lg font-black uppercase tracking-tight ${userRole === 'admin_general' ? 'text-red-700' :
                  userRole === 'developer' ? 'text-emerald-400 font-mono tracking-widest' :
                    userRole === 'director' ? 'text-purple-700' : 'text-emerald-700'
                }`}>
                {userRole === 'admin_general' ? 'Administrador General' :
                  userRole === 'developer' ? 'Developer' :
                    userRole === 'director' ? 'Director Estratégico' :
                      userRole === 'coordinator' ? 'Coordinador Académico' : 'Entrenador Especializado'}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-2 mt-2">
            {/* Correo */}
            <div className="group flex items-center gap-4 p-4 bg-slate-50 rounded-[20px] border border-transparent hover:border-slate-200 transition-all">
              <div className="p-3 bg-white text-slate-400 rounded-xl shadow-sm group-hover:text-blue-600 transition-colors">
                <FaEnvelope size={12} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Correo</p>
                <p className="text-xs font-bold text-slate-700 truncate">{userEmail}</p>
              </div>
            </div>

            {/* Ingreso */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[20px] border border-transparent hover:border-slate-200 transition-all">
              <div className="p-3 bg-white text-slate-400 rounded-xl shadow-sm">
                <FaClock size={12} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Ingreso Actual</p>
                <p className="text-xs font-mono text-slate-600 font-bold">{horaIngreso}</p>
              </div>
            </div>

            {/* Tiempo */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[20px] border border-transparent hover:border-slate-200 transition-all">
              <div className="p-3 bg-white text-slate-400 rounded-xl shadow-sm">
                <FaStopwatch size={12} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Tiempo Hoy</p>
                <p className="text-xs font-mono text-slate-600 font-bold">
                  {formatTime(hours)}h {formatTime(minutes)}m <span className="opacity-50">{formatTime(seconds)}s</span>
                </p>
              </div>
            </div>

            {/* Última Sesión */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-[20px] border border-transparent hover:border-slate-200 transition-all">
              <div className="p-3 bg-white text-slate-400 rounded-xl shadow-sm">
                <FaHistory size={12} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Última Conexión</p>
                <p className="text-xs font-mono text-slate-600 font-bold">{lastSessionTime}</p>
              </div>
            </div>
          </div>

          {/* Botón Salida */}
          <div className="pt-6 mt-4 border-t border-slate-100">
            <button
              onClick={() => triggerConfirm("Finalizar Sesión", "¿Estás seguro de que deseas salir del sistema?", cerrarSesion, "info")}
              className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs hover:bg-red-600 hover:text-white transition-all shadow-sm border border-red-100 active:scale-95"
            >
              <FaSignOutAlt size={18} /> Finalizar Sesión
            </button>
          </div>

          {/* NUEVOS BOTONES DE ACCIÓN (GUÍA Y CONTRASEÑA) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <button
              onClick={() => setActiveTab('guia')}
              className="w-full flex items-center justify-center gap-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold py-3 px-4 rounded-xl transition-all shadow-sm text-[11px] uppercase tracking-wider"
            >
              <FaInfoCircle size={14} />
              Guía / Ayuda
            </button>

            <button
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className={`flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-xl transition-all shadow-sm text-[11px] uppercase tracking-wider border ${isChangingPassword ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
            >
              <FaLock size={14} />
              {isChangingPassword ? "Ocultar Cambio" : "Cambiar Clave"}
            </button>
          </div>

        </div>

        {/* PANEL DE CAMBIO DE CONTRASEÑA */}
        {isChangingPassword && (
          <div className="bg-white border-t border-slate-100 p-8 animate-in slide-in-from-top-4 duration-300">
            <h4 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-6">
              <FaShieldAlt className="text-blue-500" /> Seguridad de la Cuenta
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Contraseña Actual</label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showCurrent ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Nueva Contraseña</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showNew ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {/* Medidor de Seguridad */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-bold">
                  <div className={`flex items-center gap-1 ${checkStrength(newPassword).length ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {checkStrength(newPassword).length ? <FaCheckCircle /> : <FaTimesCircle />} 8+ caracteres
                  </div>
                  <div className={`flex items-center gap-1 ${checkStrength(newPassword).upper ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {checkStrength(newPassword).upper ? <FaCheckCircle /> : <FaTimesCircle />} Mayúscula
                  </div>
                  <div className={`flex items-center gap-1 ${checkStrength(newPassword).number ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {checkStrength(newPassword).number ? <FaCheckCircle /> : <FaTimesCircle />} Número
                  </div>
                  <div className={`flex items-center gap-1 ${checkStrength(newPassword).special ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {checkStrength(newPassword).special ? <FaCheckCircle /> : <FaTimesCircle />} Símbolo (!@#$)
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Confirmar Contraseña</label>
                <input
                  type={showNew ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm focus:outline-none transition-all font-mono ${confirmPassword && newPassword !== confirmPassword ? 'border-red-400 focus:ring-red-500' :
                      confirmPassword && newPassword === confirmPassword ? 'border-emerald-400 focus:ring-emerald-500' : 'border-slate-200 focus:ring-blue-500'
                    }`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsChangingPassword(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdatePassword}
                disabled={!isSecure || !passwordsMatch || isUpdatingPassword || !currentPassword}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isUpdatingPassword ? "Actualizando..." : "Actualizar Clave"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}