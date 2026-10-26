# Portfolix — GitHub Portfolio Intelligence Platform

React + Vite frontend, FastAPI backend, real public GitHub REST data. Scores are **deterministic heuristics** from public metadata — not hiring predictions.

## Setup (Windows PowerShell)
Requires Python 3.10+ and Node 18+.

**Terminal 1 — backend**
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env   # optional: set GITHUB_TOKEN (backend only)
uvicorn app.main:app --reload --port 8000
```
Swagger UI: http://localhost:8000/docs  (note: `.env` is not auto-loaded; to use a token run `$env:GITHUB_TOKEN="xxx"` before uvicorn).

**Terminal 2 — frontend**
```powershell
cd web
npm install
Copy-Item .env.example .env
npm run dev
```
Open http://localhost:5173.

## API
| Method | Path | Body |
|---|---|---|
| GET | /api/health | – |
| GET | /api/roles | – |
| GET | /api/github/{username} | – (normalized profile + repos) |
| POST | /api/portfolio/analyze | `{username}` |
| POST | /api/role/readiness | `{username, role}` |
| POST | /api/company/analyze | `{username, company, role}` |
| POST | /api/roadmap | `{username, role?}` |

Errors: `{"error":{"code","message"}}` — 400 invalid username, 404 not found, 422 validation/role, 429 rate limit, 502 network/GitHub, 504 timeout.

## Customising
Edit `backend/app/catalog.py` to add skills keywords, roles (weights, suggested projects) and company emphasis profiles.

## Tests
```powershell
cd backend; pytest        # API, error mapping, empty profile, analyzers
cd web; npm run build     # production build check
```

## Troubleshooting
- *"Cannot reach the Portfolix backend"* → backend not running or `VITE_API_URL` wrong; restart `npm run dev` after editing `.env`.
- *Rate limited (429)* → unauthenticated GitHub allows 60 req/hour; set `GITHUB_TOKEN` as an environment variable.
- *Activate.ps1 blocked* → `Set-ExecutionPolicy -Scope Process RemoteSigned`.
- *CORS error* → add your frontend origin to `CORS_ORIGINS`.
- Only the 100 most recently pushed repos are analysed.

## AI (LLM) analysis
All four features add an **AI analysis** (Anthropic Claude) on top of the rule-based baseline. The backend sends repo metadata + README excerpts of up to 5 top repos to the Anthropic API.
1. Get a key at console.anthropic.com (separate from a claude.ai subscription; usage is billed).
2. `Copy-Item backend\.env.example backend\.env` and set `ANTHROPIC_API_KEY=...` (the backend now auto-loads `backend/.env`). Optionally set `ANTHROPIC_MODEL`.
3. Restart uvicorn. `GET /api/health` shows `"llm_enabled": true`.

Without a key, or if the AI call fails, the app falls back to rule-based results and the UI says so (`analysis_mode`: `rule_based` | `llm+rules`). README text is treated as untrusted data in the prompt; AI output is an estimate, not a hiring prediction.
