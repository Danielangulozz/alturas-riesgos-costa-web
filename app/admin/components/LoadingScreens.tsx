// ============================================================
// Pantallas de carga para AYR Admin Dashboard
// Reemplaza el loading de page.tsx y el LoadingTab
// ============================================================

// ─────────────────────────────────────────────
// 1. PANTALLA COMPLETA — carga inicial de sesión
//    Reemplaza el bloque: if (loading) return (...)
// ─────────────────────────────────────────────
export function LoadingScreen() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">

      {/* Fondo con gradiente suave */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent opacity-60" />

      <div className="relative flex flex-col items-center z-10 animate-in fade-in duration-1000">

        {/* Contenedor del Logo con anillo elegante */}
        <div className="relative w-64 h-64 mb-10 flex items-center justify-center">
          {/* Anillo de progreso minimalista */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke="#2563eb"
              strokeWidth="2"
              strokeDasharray="40 300"
              strokeLinecap="round"
              className="animate-[spin_1.5s_linear_infinite]"
            />
          </svg>

          <div className="bg-white rounded-full shadow-sm border border-slate-100 flex items-center justify-center w-56 h-56 relative overflow-hidden">
            <img
              src="/logoarc.png"
              alt="ARC Logo"
              className="w-full h-full object-contain p-6 opacity-90 animate-pulse"
            />
          </div>
        </div>

        <div className="text-center space-y-4">
          <div className="space-y-1.5">
            <h2 className="text-2xl font-black text-slate-900 tracking-widest uppercase flex items-center justify-center gap-2">
              <span className="text-slate-400">ARC</span> SYSTEM
            </h2>
            <div className="h-1 w-12 bg-amber-400 mx-auto rounded-full" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">
              Acceso Seguro
            </p>
          </div>
        </div>
      </div>

      {/* Footer minimalista */}
      <div className="absolute bottom-10 left-0 w-full text-center">
        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
          ARC SYSTEM v2.4.1
        </p>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────
// 2. LOADING DE TAB — carga de imports dinámicos
//    Reemplaza el componente LoadingTab en page.tsx
// ─────────────────────────────────────────────
export function LoadingTab() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-5">

      {/* Esqueleto de tarjeta con shimmer (Tema claro corporativo) */}
      <div className="w-full max-w-3xl space-y-4 px-2">
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 space-y-4">
          {[100, 75, 90].map((w, i) => (
            <div
              key={i}
              className="h-3 rounded-full bg-slate-100 overflow-hidden"
              style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }}
            >
              <div
                className="h-full w-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(226, 232, 240, 0.8) 50%, transparent 100%)',
                  animation: `shimmer 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            </div>
          ))}

          {/* Fila de "cards" skeleton */}
          <div className="flex gap-4 mt-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex-1 h-24 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden relative"
              >
                <div
                  className="absolute inset-0 h-full w-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(226, 232, 240, 0.6) 50%, transparent 100%)',
                    animation: `shimmer 1.5s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Texto */}
      <div className="flex items-center gap-3">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Obteniendo datos...
        </p>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}