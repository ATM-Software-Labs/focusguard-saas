# FocusGuard SaaS & AdShield — Zero-Trust DNS Protection Platform

[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-Deployed-F38020?logo=cloudflare&logoColor=white)](https://focusguard.trujillomingorance.com)
[![Status](https://img.shields.io/badge/Status-Live_Production-107c41)](#)
[![Security](https://img.shields.io/badge/Security-Zero--Trust_DNS-0078d4)](#)

> **Production Gateway:** [focusguard.trujillomingorance.com](https://focusguard.trujillomingorance.com)

Plataforma empresarial y doméstica de filtrado DNS seguro, bloqueo de publicidad invasiva (AdShield) y control parental Zero-Trust implementada sobre la red perimetral de Cloudflare.

---

## 🛡️ Capacidades & Arquitectura

1. **Filtrado DNS-over-HTTPS (DoH)**: Bloqueo en tiempo real de dominios maliciosos, publicidad, rastreadores y telemetría a nivel de resolución IP en menos de 5ms.
2. **Control Parental & Perfiles de Filtrado**: Restricción granular de categorías (adultos, apuestas, redes sociales, streaming) por dispositivo o red.
3. **Panel de Gestión Moderno**: Interfaz SPA reactiva en TypeScript con métricas de consultas, dominios bloqueados, auditoría de logs y configuración asistida con códigos QR para routers, móviles y sistemas de escritorio.
4. **Base de Datos & Estado Perimetral**: Integración nativa con Cloudflare D1 (SQL serverless) y Cloudflare Workers KV para validación ultrarrápida de sesiones y reglas.

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
