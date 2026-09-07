# FocusGuard SaaS and AdShield - Zero-Trust DNS Protection Platform

[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-Deployed-F38020?style=flat-square&logo=cloudflare&logoColor=white)](https://focusguard.trujillomingorance.com)
[![Status](https://img.shields.io/badge/Status-Live_Production-107c41?style=flat-square)](#)
[![Security](https://img.shields.io/badge/Security-Zero--Trust_DNS-0078d4?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-Proprietary-blue?style=flat-square)](#)

Production Gateway: [focusguard.trujillomingorance.com](https://focusguard.trujillomingorance.com)

A high-performance DNS security platform offering DNS-over-HTTPS (DoH) filtering, AdShield advertisement and tracker blocking, and granular parental controls deployed on Cloudflare's global edge network.

---

## Core Capabilities and Architecture

1. DNS-over-HTTPS (DoH) Filtering: Real-time blocking of malicious domains, advertising networks, telemetry trackers, and phishing origins directly at resolution time with sub-5ms latency.
2. Parental Controls and Profiles: Granular category restriction (adult content, gambling, social networks, gaming, video streaming) applied per device or network profile.
3. Interactive Management Console: A responsive single-page application built in TypeScript offering real-time query counters, blocked domain telemetry, access log audits, and guided setup with dynamic QR codes for mobile devices, home routers, and operating systems.
4. Edge Database and Session State: Serverless persistence powered by Cloudflare D1 SQL database (`focusguard_db`) and Cloudflare Workers KV for ultra-fast session validation and blocklist lookups.
5. Subscription Billing: Commercial tier monetization integrated with Stripe Checkout and Customer Portal webhooks.

---

## Enterprise Branching Model

| Branch | Purpose | Deployment Target |
| :--- | :--- | :--- |
| `main` | Production Release | Deployed live to `focusguard.trujillomingorance.com` |
| `develop` | Staging & Integration | DNS filter list rule testing, Stripe integration QA, and feature PR merges |

---

## Repository Structure

```
focusguard-saas/
├── public/                  # Static assets, Web App Manifest, service worker, favicons
├── src/                     # Frontend SPA source code (TypeScript)
│   ├── core/                # System configuration, internationalization (i18n), UI utilities
│   ├── features/            # Business feature modules (AdShield, Auth, Dashboard, Stripe, Settings)
│   ├── types/               # TypeScript interfaces, domain models, and API schemas
│   ├── main.ts              # Single-page application bootstrap
│   └── style.css            # Corporate slate-navy glassmorphism design tokens
├── worker/                  # Edge DNS filtering and DoH proxy worker
│   ├── src/                 # Edge router, blocklist evaluator, and analytics reporter
│   └── wrangler.toml        # Worker configuration and KV bindings
├── schema.sql               # Cloudflare D1 relational database schema
├── vite.config.ts           # Bundler build configuration
└── wrangler.toml            # Pages deployment configuration
```

---

## Technical Stack

- Frontend: TypeScript, Vite 8, Semantic CSS3 (Unified corporate dark slate palette)
- Edge Backend: Cloudflare Pages Functions and Cloudflare Workers (ES Modules)
- Data Persistence: Cloudflare D1 Database (`focusguard_db`), Cloudflare KV (`SESSIONS_KV`)
- Authentication: Google Identity Services (GSI) and JWT edge verification
- Payment Processing: Stripe API (Checkout Sessions & Webhooks)

---

## Local Development and Build

```bash
# Install dependencies
npm install

# Run TypeScript compilation and Vite dev server
npm run dev

# Build production assets (Frontend + Worker bundle)
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name focusguard --commit-dirty=true
```

---

## Maintainer and Ownership

Alberto Trujillo Mingorance  
- Website: [alberto.trujillomingorance.com](https://alberto.trujillomingorance.com)  
- GitHub: [@atrumin16](https://github.com/atrumin16)

---

## License and Confidentiality

Copyright (c) 2026 Alberto Trujillo Mingorance. All rights reserved. Private and confidential proprietary software.
