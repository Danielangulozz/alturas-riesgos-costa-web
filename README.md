# Alturas y Riesgos de la Costa S.A.S - Ecosistema Digital v2.0

Plataforma integral de gestión académica y presencia digital diseñada para **Alturas y Riesgos de la Costa S.A.S**. Este ecosistema no solo gestiona la cara pública de la empresa, sino que centraliza toda la operación administrativa, financiera y logística del centro de entrenamiento.

---

## Módulos y Capacidades

### Portal Público (Landing Page)
* **Experiencia de Usuario Premium:** Diseño moderno con animaciones dinámicas (framer-motion) y optimización móvil total.
* **Catálogo Inteligente:** Visualización de cursos con detalles técnicos, precios dinámicos y pre-inscripción integrada.
* **Módulo de Verificación:** Sistema público de validación de certificados mediante QR o Cédula, garantizando la autenticidad frente a empleadores.
* **SEO & Performance:** Optimización avanzada para motores de búsqueda (JSON-LD) y carga ultra-rápida.

### Dashboard Administrativo (Panel de Control)
* **Centro de Mando Analítico:** Gráficas interactivas (Recharts) de rendimiento operativo, distribución de cursos y seguimiento de matrículas.
* **Gestión de Agenda Realtime:** Calendario dinámico para programar bloques de clase con control de cupos y horarios.
* **Sistema de Auditoría (Logs):** Registro "infinito" de cada acción realizada por el equipo administrativo para máxima trazabilidad.
* **Control Financiero:** Gestión de precios maestros, descuentos personalizados por solicitud y seguimiento de estados de pago.
* **Gestión de Certificados:**
  * Generación masiva de PDFs con firmas digitales y sellos.
  * Generación de Listados de Asistencia automáticos por curso.
  * Sistema de revocación y anulación de registros.
* **Gestión de Equipo:** Control de perfiles (Admin, Director, Coordinador, Entrenador) con permisos granulares.
* **Session Tracking:** Monitoreo global de tiempo de sesión y actividad de colaboradores.

---

## Stack Tecnológico

Estructura robusta basada en las tecnologías líderes de la industria:

* **Framework:** [Next.js 14+](https://nextjs.org/) (App Router & Server Actions)
* **Frontend Core:** [React 18+](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
* **Diseño & Estilos:** [Tailwind CSS 4.0](https://tailwindcss.com/) (Modern design tokens)
* **Backend as a Service:** [Supabase](https://supabase.com/) (PostgreSQL + Realtime Subscriptions)
* **Visualización de Datos:** [Recharts](https://recharts.org/)
* **Documentación & PDF:** jspdf + html-to-image + qrcode
* **Animaciones:** framer-motion
* **UI Interaction:** react-icons + react-hot-toast + Custom Modals System

---

## Arquitectura de Archivos

```bash
├── app/
│   ├── admin/           # Ecosistema Administrativo (Protegido por Auth)
│   │   ├── components/  # Pestañas y módulos específicos del Dashboard
│   │   ├── hooks/       # Lógica compartida (useAuth, useData, useAdminActions)
│   │   └── login/       # Portal de acceso seguro
│   ├── verificar/       # Sistema público de validación de QRs
│   ├── page.tsx         # Portal Público Corporativo
│   └── layout.tsx       # Configuración global y SEO
├── lib/
│   ├── supabase.ts      # Cliente de comunicación con BD
│   └── certificadoLogic.ts # Motor de generación de certificados y QRs
├── public/              # Activos estáticos y plantillas legales
└── ...

```
## Seguridad y Privacidad
Autenticación robusta via Supabase Auth.

Cumplimiento de Habeas Data en la captura de datos sensibles.

Auditoría de actividad obligatoria para todos los roles administrativos.

Desarrollado para Alturas y Riesgos de la Costa S.A.S
```
