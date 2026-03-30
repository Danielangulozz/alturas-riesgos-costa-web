/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Tokens de marca corporativa ──────────────────
        brand: {
          gold:  "#FFD700", // Dorado corporativo (reemplaza #FFD700 hardcodeado)
          navy:  "#0F172A", // Azul navy oscuro (reemplaza bg-[#0F172A] hardcodeado)
        },

        // ── Tokens de CSS variables (sistema de diseño) ──
        primary:       "rgb(var(--color-primary))",
        primarySoft:   "rgb(var(--color-primary-soft))",
        primaryStrong: "rgb(var(--color-primary-strong))",

        accent:        "rgb(var(--color-accent))",
        accentSoft:    "rgb(var(--color-accent-soft))",

        bgMain:        "rgb(var(--bg-main))",
        bgSoft:        "rgb(var(--bg-soft))",

        textMain:      "rgb(var(--text-main))",
        textSoft:      "rgb(var(--text-soft))",

        borderSoft:    "rgb(var(--border-soft))",
      },
    },
  },
  plugins: [],
};

