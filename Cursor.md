# FreightAI — AI Sales Employee Dashboard

## Project Overview

FreightAI is an AI-powered sales assistant built for **freight forwarders' sales teams**. It streamlines the lead-to-outreach workflow: capture prospect details (client, company, shipment requirements, country), generate tailored **follow-up email** and **LinkedIn messages** via an n8n webhook, and track follow-up status locally.

The UI follows a **Precision Logistics Intelligence** design language — deep navy surfaces, electric cyan/blue accents, layered cards, and purposeful motion.

## Architecture

Component-based **React (Vite)** SPA with clear separation of concerns:

| Layer | Location | Responsibility |
|--------|----------|----------------|
| Pages | `src/pages/` | Screen composition |
| Components | `src/components/` | Reusable UI (form fields, cards, layout) |
| UI primitives | `src/components/ui/` | Customized shadcn/ui (Button, Select, Toast) |
| Hooks | `src/hooks/` | Business logic (`useGenerateMessages`) |
| Services | `src/services/api.js` | Axios HTTP to n8n webhooks |
| Utils | `src/utils/helpers.js` | Validation, clipboard, normalization |

## API Flow

```
Lead Form (controlled state)
    → validateLeadForm()
    → useGenerateMessages.generate()
    → api.js POST ${VITE_API_URL}${VITE_API_WEBHOOK_PROD}
    → n8n workflow processes lead
    → Response { email, linkedinMessage }
    → normalizeApiResponse()
    → OutputCard components render + copy actions
```

- **Production webhook** is used by default; test webhook is used as fallback on 404/5xx/timeout.
- **Single request per submission** with in-flight guard, submit debounce, and cache for identical payloads.

## Setup Instructions

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables** — create or verify `.env`:
   ```
   VITE_API_URL=https://gaurav-n8nspace.duckdns.org
   VITE_API_WEBHOOK_TEST=/webhook-test/8240f0f7-e21d-4132-96f6-5a959a7a1a1f
   VITE_API_WEBHOOK_PROD=/webhook/8240f0f7-e21d-4132-96f6-5a959a7a1a1f
   ```

   **Local dev CORS:** `.env.development` sets `VITE_API_URL=/api` so requests go through the Vite proxy (`vite.config.js` → `gaurav-n8nspace.duckdns.org`). Restart `npm run dev` after changing proxy config.

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Production build**
   ```bash
   npm run build
   npm run preview
   ```

## Key Features

- Lead input form with validation
- AI message generation (email + LinkedIn)
- Loading states and error toasts
- Follow-up status dropdown + reminder date
- Collapsible sidebar + responsive mobile drawer
- Copy-to-clipboard on output cards

## Future Improvements

- CRM integration (Salesforce, HubSpot)
- Multi-language outreach templates
- Analytics dashboard (conversion, response rates)
- Authentication and team workspaces
- Lead history persistence (database / local storage sync)
