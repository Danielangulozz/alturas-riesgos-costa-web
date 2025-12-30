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
        primary: "rgb(var(--color-primary))",
        primarySoft: "rgb(var(--color-primary-soft))",
        primaryStrong: "rgb(var(--color-primary-strong))",

        accent: "rgb(var(--color-accent))",
        accentSoft: "rgb(var(--color-accent-soft))",

        bgMain: "rgb(var(--bg-main))",
        bgSoft: "rgb(var(--bg-soft))",

        textMain: "rgb(var(--text-main))",
        textSoft: "rgb(var(--text-soft))",

        borderSoft: "rgb(var(--border-soft))",
      },
    },
  },
  plugins: [],
};
