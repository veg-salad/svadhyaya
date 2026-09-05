# Svadhyaya — Bodha Research Assistant (MVP)

A single-page MVP for Bodha Research (an Indic think tank). The user pastes a
draft research passage or raw field notes, and the app returns:

1. **Emic Alignment Scan (Drishti-Shuddhi)** — flags orientalist / colonized
   terminology and suggests indigenous alternatives with rationale.
2. **Scholar Research Brief (Shodharthi)** — executive synthesis, key
   civilizational themes, and suggested follow-up research angles.

## Stack

- **Backend:** NestJS (TypeScript) exposing `POST /api/analyze`. Uses the
  `openai` SDK (JSON mode) against any OpenAI-compatible endpoint.
- **Frontend:** React + TypeScript + Vite + Tailwind CSS + Lucide icons.

## Layout

```
Svadhyaya/
  backend/    NestJS API
  frontend/   React SPA
  eslint.config.mjs
```

All Node tooling installs stay inside this workspace (see `.npmrc`).

## Prerequisites

Portable Node (v20+) is expected on PATH. In this repo we use the copy under
`..\Product\.tools\node\`.

## Setup

From the workspace root:

```powershell
# Backend
cd backend
npm install
copy .env.example .env   # then set OPENAI_API_KEY
npm run start:dev

# Frontend (in a second terminal)
cd frontend
npm install
npm run dev
```

Frontend dev server proxies `/api/*` to the backend on `http://localhost:3001`.

## Environment

Backend reads:

- `OPENAI_API_KEY` — required
- `OPENAI_BASE_URL` — optional; defaults to `https://api.openai.com/v1`
- `OPENAI_MODEL` — optional; defaults to `gpt-4o-mini`
- `PORT` — optional; defaults to `3001`

## Design constraints

No pictures, icons, or illustrations of deities. UI is typography-driven,
minimalist, and structural. Palette: warm parchment, terracotta, deep crimson,
muted saffron.
