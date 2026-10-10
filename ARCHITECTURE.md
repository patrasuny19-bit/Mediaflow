# MediaFlow Architecture

Frontend:
React/Vite -> REST API

Backend:
Express -> validation -> provider registry -> authorized provider -> temporary response

Provider isolation:
Each integration implements `MediaProvider`. No generic remote proxy is exposed.

Security boundary:
- HTTP(S) only
- Explicit provider registration
- DNS/IP safety checks
- Rate limiting
- Helmet
- CORS allowlist
- Input validation
- Temporary files
