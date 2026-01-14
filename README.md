# 🏗️ Alturas y Riesgos de la Costa S.A.S - Plataforma Web

Plataforma web oficial y sistema de gestión académica para **Alturas y Riesgos de la Costa S.A.S**. Este proyecto gestiona la presencia digital de la empresa, el catálogo de cursos, pre-inscripciones en línea y el sistema de verificación y generación de certificados.

## 🚀 Características Principales

- **Landing Page Corporativa:** Información de servicios, cursos y contacto.
- **Catálogo de Cursos:** Visualización dinámica de cursos (Trabajo en Alturas, Espacios Confinados, etc.) con modales de detalle.
- **Sistema de Pre-inscripción:** Formulario con validación de datos y aceptación legal de tratamiento de datos (Habeas Data).
- **Generación de Certificados PDF:**
  - Formato A4 Optimizado.
  - Generación dinámica en el cliente usando `jsPDF`.
  - Inclusión de QR de verificación.
- **Módulo de Verificación:** Página pública para validar la autenticidad de los certificados mediante Cédula o Código Único.
- **SEO Optimizado:** Metadatos, JSON-LD para Google y Open Graph para redes sociales.

## 🛠️ Stack Tecnológico

Este proyecto está construido con las tecnologías más modernas del ecosistema React:

- **Framework:** [Next.js 14+](https://nextjs.org/) (App Router)
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
- **Base de Datos:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Generación PDF:** `jspdf` + `qrcode`
- **Iconos:** `react-icons`
- **Notificaciones:** `react-hot-toast`

## 📂 Estructura del Proyecto

```bash
├── app/
│   ├── layout.tsx       # Configuración global, SEO y fuentes
│   ├── page.tsx         # Home Page
│   ├── verificar/       # Página de verificación de certificados
│   ├── politica-privacidad/ # Páginas legales
│   └── ...
├── components/          # Componentes reutilizables (Modales, Navbar, Footer)
├── lib/
│   ├── supabase.ts      # Cliente de conexión a BD
│   └── certificadoLogic.ts # Lógica de generación de PDF y QRs
├── public/              # Imágenes estáticas (Logos, Plantillas de certificado)
└── ...
