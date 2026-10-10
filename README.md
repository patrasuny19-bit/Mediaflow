# MediaFlow

A mobile-first, permission-based media information and download/export web application.

> MediaFlow is designed for media that the user owns, is licensed to use, is public domain/Creative Commons, or is exposed through an authorized provider/API. It does not bypass DRM, authentication, CAPTCHAs, paywalls, private-content controls, or other technical restrictions.

## Stack

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript
- Security: Helmet, CORS allowlist, rate limiting, SSRF-safe URL validation
- Testing: Vitest
- Deployment: static frontend + Node-compatible backend

## Development

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` in frontend if the backend is not on the same origin.

## Demo mode

The backend includes a clearly labelled demo provider. It returns sample metadata and a local demo text file so the interface can be tested without connecting to a real media platform.

It does NOT pretend to download arbitrary social-media media.

## Production provider integration

Implement an authorized provider under:

`backend/src/integrations/`

Each provider should implement:

- `canHandle(url)`
- `getMetadata(url)`
- `getFormats(url)`
- `requestAuthorizedDownload(url, format)`
- `validateResponse()`
- `cleanup()`

Only register domains and APIs that you are authorized to use.

## Environment

See `backend/.env.example`.

Never commit real API keys.

## Security

The API rejects localhost/private/internal addresses and only permits explicitly registered provider domains. It does not expose an arbitrary URL proxy.

## Deployment

The frontend can be deployed to GitHub Pages, Cloudflare Pages, or Vercel. The backend requires Node-compatible hosting.

For GitHub Pages, configure the repository Pages source to the generated frontend build output or use the included GitHub Actions workflow.

## Legal

Users are responsible for having the necessary rights or permission to process/download content. The site operator should review applicable platform terms, copyright law, privacy law, and hosting-provider policies before production use.


## GitHub Pages frontend deployment

This repository includes a GitHub Actions workflow at `.github/workflows/frontend-pages.yml`.
After pushing to the `main` branch, GitHub Actions builds the Vite frontend and deploys it to GitHub Pages.

The frontend is a static UI/demo. The Node/Express backend must be deployed separately to a Node-compatible host before real server-side download processing can be enabled.
