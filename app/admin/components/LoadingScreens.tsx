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
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0F172A] relative overflow-hidden">

      {/* Fondo: rejilla con perspectiva */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,215,0,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,215,0,0.8) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: 'perspective(500px) rotateX(20deg)',
          transformOrigin: 'center bottom',
        }}
      />

      {/* Anillo exterior giratorio */}
      <div className="relative w-40 h-40 mb-8">

        {/* Anillo 1 — gira lento */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent"
          style={{
            borderTopColor: '#FFD700',
            borderRightColor: 'rgba(255,215,0,0.3)',
            animation: 'spin 2.4s linear infinite',
          }}
        />

        {/* Anillo 2 — gira al revés, más rápido */}
        <div className="absolute inset-3 rounded-full border-2 border-transparent"
          style={{
            borderBottomColor: '#00558A',
            borderLeftColor: 'rgba(0,85,138,0.3)',
            animation: 'spin 1.6s linear infinite reverse',
          }}
        />

        {/* Anillo 3 — pulsa */}
        <div className="absolute inset-6 rounded-full border border-[#C41E3A]/40"
          style={{ animation: 'pulse 2s ease-in-out infinite' }}
        />

        {/* Logo central */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-3xl font-black tracking-tighter leading-none"
              style={{ fontFamily: 'system-ui, sans-serif' }}
            >
              <span style={{ color: '#FFD700' }}>A</span>
              <span style={{ color: '#00558A' }}>Y</span>
              <span style={{ color: '#C41E3A' }}>R</span>
            </span>
            {/* Barra tricolor */}
            <div className="flex w-full h-[2px] mt-1">
              <div className="flex-1 bg-[#FFD700]" />
              <div className="flex-1 bg-[#00558A]" />
              <div className="flex-1 bg-[#C41E3A]" />
            </div>
          </div>
        </div>
      </div>

      {/* Texto con puntos animados */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 animate-pulse">
          Verificando acceso
        </p>

        {/* Barra de progreso indeterminada */}
        <div className="w-48 h-[2px] bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #FFD700, #00558A, #C41E3A)',
              animation: 'slide 1.8s ease-in-out infinite',
              width: '40%',
            }}
          />
        </div>

        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
          Alturas y Riesgos de la Costa S.A.S
        </p>
      </div>

      {/* Partículas de fondo */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: ['#FFD700', '#00558A', '#C41E3A'][i % 3],
            opacity: 0.4,
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 20}%`,
            animation: `float ${2 + i * 0.4}s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }}
        />
      ))}

      {/* Keyframes inyectados inline */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes slide {
          0%   { transform: translateX(-150%); }
          50%  { transform: translateX(0%); }
          100% { transform: translateX(350%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-12px) scale(1.4); }
        }
      `}</style>
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

      {/* Esqueleto de tarjeta con shimmer */}
      <div className="w-full max-w-2xl space-y-3 px-2">
        {[100, 75, 90, 60].map((w, i) => (
          <div
            key={i}
            className="h-3 rounded-full bg-slate-200 overflow-hidden"
            style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }}
          >
            <div
              className="h-full w-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.4) 50%, transparent 100%)',
                animation: `shimmer 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          </div>
        ))}

        {/* Fila de "cards" skeleton */}
        <div className="flex gap-3 mt-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-1 h-20 rounded-2xl bg-slate-100 overflow-hidden"
            >
              <div
                className="h-full w-full"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(148,163,184,0.3) 50%, transparent 100%)',
                  animation: `shimmer 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Texto */}
      <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300">
        Cargando módulo
      </p>

      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}