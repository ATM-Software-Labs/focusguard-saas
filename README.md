# FocusGuard SaaS & AdShield — Zero-Trust DNS Protection Platform

[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-Deployed-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://focusguard.trujillomingorance.com)
[![Status](https://img.shields.io/badge/Status-Live_Production-107c41?style=flat-square)](#)
[![Security](https://img.shields.io/badge/Security-Zero--Trust_DNS-0078d4?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-Proprietary-blue?style=flat-square)](#)

> **Production Gateway:** [focusguard.trujillomingorance.com](https://focusguard.trujillomingorance.com)  
> Plataforma empresarial y doméstica de filtrado DNS seguro, bloqueo de publicidad invasiva (AdShield) y control parental Zero-Trust implementada sobre la red perimetral de Cloudflare.

---

## 🛡️ Capacidades & Arquitectura

1. **Filtrado DNS-over-HTTPS (DoH)**: Bloqueo en tiempo real de dominios maliciosos, publicidad, rastreadores y telemetría a nivel de resolución IP en menos de 5ms.
2. **Control Parental & Perfiles de Filtrado**: Restricción granular de categorías (adultos, apuestas, redes sociales, streaming) por dispositivo o red.
3. **Panel de Gestión Moderno**: Interfaz SPA reactiva en TypeScript con métricas de consultas, dominios bloqueados, auditoría de logs y configuración asistida con códigos QR para routers, móviles y sistemas de escritorio.
4. **Base de Datos & Estado Perimetral**: Integración nativa con Cloudflare D1 (SQL serverless) y Cloudflare Workers KV para validación ultrarrápida de sesiones y reglas.

---

## 🌿 Enterprise Branching Model

| Branch | Purpose | Deployment Target |
| :--- | :--- | :--- |
| `main` | **Production Release** | Deployed live to `focusguard.trujillomingorance.com` |
| `develop` | **Staging & Integration** | DNS filter list rule testing, Stripe integration QA & feature PR merges |

---

## 📁 Repository Structure

```
focusguard-saas/
├── public/                  # Static assets, Web App Manifest & service worker
├── src/                     # Frontend SPA source code (TypeScript)
│   ├── core/                # Config, internationalization (i18n), UI utilities
│   ├── features/            # Feature modules (AdShield, Auth, Dashboard, Stripe, Settings)
│   ├── types/               # TypeScript data definitions & domain interfaces
│   ├── main.ts              # Application bootstrap
│   └── style.css            # Corporate slate-navy glassmorphism design tokens
├── worker/                  # Edge DNS filtering & DoH proxy worker
│   ├── src/                 # Edge router, adblock engine, and telemetry
│   └── wrangler.toml        # Worker configuration
├── schema.sql               # Cloudflare D1 relational database schema
├── vite.config.ts           # Bundler build configuration
└── wrangler.toml            # Pages deployment configuration
```

---

## 🛠️ Stack Tecnológico

- **Frontend:** TypeScript, Vite, Modern CSS (Design System corporativo unificado)
- **Backend Edge:** Cloudflare Pages Functions + Cloudflare Workers
- **Almacenamiento:** Cloudflare D1 Database (`focusguard_db`), Cloudflare KV (`SESSIONS_KV`)
- **Autenticación:** Google Identity Services (GSI) + JWT perimetral

---

## 🚀 Despliegue en Cloudflare Pages

```bash
# Compilar frontend
npm run build

# Desplegar en Cloudflare Pages
npx wrangler pages deploy dist --project-name focusguard --commit-dirty=true
```

---

## 👤 Autor

**Alberto Trujillo Mingorance**  
- Portfolio: [alberto.trujillomingorance.com](https://alberto.trujillomingorance.com)  
- GitHub: [@atrumin16](https://github.com/atrumin16)
