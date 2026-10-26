# ✦ Portfolix — GitHub Portfolio Intelligence

**Turn your GitHub activity into actionable career insights.**

Portfolix is a developer-focused platform that analyzes public GitHub profiles and repositories to help developers understand their strengths, evaluate role readiness, identify skill gaps, and discover practical ways to improve their portfolios.

> 🚧 **Project Status: Work in Progress** — Core functionality is implemented, initial tests have passed, and further improvements are ongoing.

## ✨ Features

- **GitHub Profile Analysis** — Analyze public profile information and repository metadata.
- **Portfolio Insights** — Explore development activity, repository signals, and technology usage.
- **Role Readiness** — Assess portfolio alignment with roles such as Python Developer, Software Engineer, AI/ML Engineer, and Frontend Developer.
- **Skill Gap Detection** — Identify areas where your portfolio could better demonstrate relevant skills.
- **Company-Specific Analysis** — Compare portfolio signals against configurable company and role expectations.
- **Personalized Roadmaps** — Get actionable suggestions for improving your GitHub portfolio.
- **Gemini-Powered Insights** — Add AI-generated analysis using Google's Gemini API, with rule-based fallback support.
- **Responsive Interface** — A modern React interface backed by a FastAPI service.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript, CSS |
| Backend | Python, FastAPI |
| GitHub Data | GitHub REST API |
| AI Analysis | Google Gemini API |
| Testing | Pytest |

## 🧠 How It Works

1. Enter a public GitHub username.
2. Portfolix retrieves available profile and repository information.
3. The analysis engine evaluates repository metadata using configurable, rule-based heuristics.
4. When Gemini is configured, AI-generated insights can supplement the baseline analysis.
5. Review role readiness, potential skill gaps, and suggested next steps.

**Important:** Scores are heuristic estimates based on available public metadata. They are not measures of a developer's full ability, and they do not predict hiring outcomes.

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Git

### 1. Clone the repository

```powershell
git clone https://github.com/mallikarajapure-collab/Portfolix.git
cd Portfolix
```

### 2. Set up the backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Configure your environment variables in `backend/.env` as needed:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GITHUB_TOKEN=your_github_token
```

The Gemini key is optional if you want to use the rule-based fallback. A GitHub token can help with API rate limits. Keep all real credentials private and never commit `.env`.

Start the backend from the `backend` directory:

```powershell
uvicorn app.main:app --reload --port 8000
```

API documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Set up the frontend

Open a second terminal:

```powershell
cd web
npm install
Copy-Item .env.example .env
npm run dev
```

Open the local URL printed by Vite, typically [http://localhost:5173](http://localhost:5173).

If Vite chooses another port, ensure that port is allowed in the backend's `CORS_ORIGINS` configuration.

## 🔌 API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Check backend health |
| `GET` | `/api/roles` | List supported roles |
| `GET` | `/api/github/{username}` | Retrieve normalized GitHub profile data |
| `POST` | `/api/portfolio/analyze` | Analyze a developer portfolio |
| `POST` | `/api/role/readiness` | Evaluate alignment with a target role |
| `POST` | `/api/company/analyze` | Analyze portfolio alignment with company expectations |
| `POST` | `/api/roadmap` | Generate improvement recommendations |

## 🧪 Testing

Run backend tests from the `backend` directory:

```powershell
.\.venv\Scripts\python.exe -m pytest -q
```

Run a frontend production build from the `web` directory:

```powershell
npm run build
```

## 🔐 Security & Privacy

- Store API keys in local environment files.
- Never commit `.env` files, API credentials, or other secrets.
- Use public GitHub data only as intended by the GitHub API and its applicable limits.
- Treat AI-generated output as advisory and verify important recommendations independently.

## 🗺️ Roadmap

- [x] Core frontend and backend integration
- [x] GitHub profile and repository analysis
- [x] Role readiness and portfolio recommendations
- [x] Gemini integration with rule-based fallback
- [x] Initial backend testing
- [ ] Expand testing across more GitHub profiles and edge cases
- [ ] Refine UI and improve error handling
- [ ] Explore deployment options

## 🤝 Contributions

Suggestions, bug reports, and ideas for improvement are welcome. This project is actively evolving, so feedback is appreciated.

## 👩‍💻 Author

**Mallika**  
GitHub: [@mallikarajapure-collab](https://github.com/mallikarajapure-collab)

---

*Built to help developers turn their GitHub portfolios into clearer, more actionable growth plans.*
