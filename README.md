
<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:10002B,45:5B21B6,100:2563EB&height=220&section=header&text=PORTFOLIX&fontSize=52&fontColor=FFFFFF&fontAlignY=38&desc=GitHub%20Portfolio%20Intelligence%20Platform&descAlignY=60&descSize=17" width="100%" />

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=500&size=17&pause=1200&color=A78BFA&center=true&vCenter=true&width=650&lines=Analyze+your+developer+portfolio;Explore+role+readiness;Understand+company+fit;Build+a+smarter+learning+roadmap" alt="Portfolix typing animation" />

<p>
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" />
</p>

**Turn your GitHub profile into actionable developer insights.**

[Features](#-key-features) •
[Architecture](#-system-architecture) •
[Setup](#-getting-started) •
[API](#-api-endpoints) •
[Testing](#-testing)

</div>

---

## 🌌 Overview

**Portfolix — GitHub Portfolio Intelligence Platform** is a full-stack application designed to help developers understand their GitHub portfolios, explore career-role readiness, evaluate alignment with company expectations, and identify areas for improvement.

By combining GitHub repository data, configurable skill and role profiles, analysis services, and AI-assisted insights, Portfolix aims to make portfolio evaluation more structured and actionable.

### 🎯 The Problem

Developers often have difficulty understanding:
- Whether their GitHub portfolio communicates their skills effectively.
- Which technical skills may be missing for a target role.
- How their portfolio aligns with a company's expectations.
- What they should focus on learning next.

### 💡 The Solution

Portfolix brings portfolio analysis, role readiness, company analysis, and learning-roadmap generation together in one application.

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🔍 GitHub Portfolio Analysis
Analyze public GitHub profile and repository information to generate structured portfolio insights.

</td>
<td width="50%">

### 🎯 Role Readiness
Compare developer skills with configurable role requirements and identify potential skill gaps.

</td>
</tr>
<tr>
<td width="50%">

### 🏢 Company Analysis
Explore portfolio alignment with configurable company profiles and technical expectations.

</td>
<td width="50%">

### 🗺️ Learning Roadmaps
Generate structured improvement roadmaps based on identified development areas.

</td>
</tr>
<tr>
<td width="50%">

### 🧠 AI-Assisted Insights
Use the configured Gemini integration for AI-assisted analysis, with fallback behavior supported by the backend.

</td>
<td width="50%">

### ⚡ Full-Stack Architecture
Connect a React + Vite frontend to a Python FastAPI backend through REST API endpoints.

</td>
</tr>
</table>

---

## 🏗️ System Architecture

<div align="center">

<img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-646CFF?style=for-the-badge" />

⬇️ REST API

<img src="https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge" />

⬇️

<img src="https://img.shields.io/badge/Data%20Source-GitHub%20REST%20API-181717?style=for-the-badge&logo=github" />

<img src="https://img.shields.io/badge/Analysis-Portfolio%20%7C%20Roles%20%7C%20Companies-7C3AED?style=for-the-badge" />

<img src="https://img.shields.io/badge/AI%20Integration-Gemini-4285F4?style=for-the-badge" />

</div>

### 🔄 Application Workflow

1. The user provides a GitHub profile or selects an analysis workflow.
2. The frontend sends a request to the FastAPI backend.
3. Backend services retrieve and process the relevant data.
4. Analysis services evaluate portfolio information, role requirements, or company profiles.
5. AI-assisted analysis is used where configured and available.
6. The application returns structured results or a learning roadmap to the frontend.

---

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript |
| Backend | Python, FastAPI, Pydantic |
| HTTP Requests | HTTPX |
| External Data | GitHub REST API |
| AI Integration | Google Gemini API |
| Testing | Pytest |
| Configuration | Environment variables, `.env` |
| Version Control | Git, GitHub |

---

## 📁 Project Structure

```text
portfolix/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── schemas.py
│   │   ├── catalog.py
│   │   └── services/
│   │       ├── github_service.py
│   │       ├── portfolio_analyzer.py
│   │       ├── role_analyzer.py
│   │       ├── company_analyzer.py
│   │       ├── roadmap_service.py
│   │       └── llm_service.py
│   ├── tests/
│   ├── requirements.txt
│   └── .env
│
└── web/
    ├── src/
    │   └── services/
    │       └── api.js
    └── package.json
```

*The tree highlights the main application modules; other files may exist in the repository.*

---

## ⚙️ Getting Started

### 📋 Prerequisites

Install the following before running the application:

- Python 3.10 or later
- Node.js 18 or later
- npm
- Git

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd portfolix
```

Replace `YOUR_REPOSITORY_URL` with the HTTPS clone URL of your actual Portfolix repository.

### 2. Set Up the Backend

Open PowerShell in the project root:

```powershell
cd backend

python -m venv .venv

.\.venv\Scripts\Activate.ps1

python -m pip install -r requirements.txt
```

If PowerShell blocks virtual-environment activation, use Command Prompt or configure your PowerShell execution policy appropriately.

### 3. Configure Environment Variables

Create or update `backend/.env` using the variable names supported by `backend/app/config.py`.

Example configuration:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GITHUB_TOKEN=your_github_token
```

- `GEMINI_API_KEY` enables the configured Gemini integration.
- `GEMINI_MODEL` selects the Gemini model.
- `GITHUB_TOKEN` is optional for public GitHub data, but may help with API rate limits.

**Security:** Never commit your real API keys or tokens. Keep `.env` out of Git and use a safe placeholder in `.env.example`.

### 4. Start the Backend

From the `backend` directory, with the virtual environment activated:

```powershell
uvicorn app.main:app --reload --port 8000
```

Backend URL:

`http://127.0.0.1:8000`

Interactive API documentation:

`http://127.0.0.1:8000/docs`

Health check:

`http://127.0.0.1:8000/api/health`

### 5. Start the Frontend

Open a second PowerShell terminal:

```powershell
cd C:\Users\Malli\Downloads\portfolix\web

npm install

npm run dev
```

Open the local URL printed by Vite in your terminal.

The frontend uses `VITE_API_URL` when configured and otherwise defaults to `http://localhost:8000`.

If needed, configure the frontend's API URL in `web/.env`:

```env
VITE_API_URL=http://localhost:8000
```

Restart the Vite development server after changing environment variables.

---

## 🔌 API Endpoints

The backend provides the following application endpoints:

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Check backend health and configuration status |
| `POST /api/portfolio/analyze` | Analyze a GitHub portfolio |
| `POST /api/role/readiness` | Evaluate readiness for a target role |
| `POST /api/company/analyze` | Analyze alignment with a company profile |
| `POST /api/roadmap` | Generate a learning roadmap |

For exact request schemas, required fields, and response formats, run the backend and open `/docs`.

---

## 🧪 Testing

Run the backend test suite from the `backend` directory:

```powershell
python -m pytest -q
```

Tests cover backend API behavior and relevant success, error, empty-profile, and AI fallback scenarios.

---

## 🔐 Security & Reliability

- Store API keys in environment variables, never in source code.
- Keep secrets out of commits and public repository history.
- Validate API requests using backend schemas.
- Handle external API failures gracefully.
- Use fallback behavior when AI-assisted analysis is unavailable.
- Avoid exposing private tokens, personal data, or sensitive logs.

---

## 🗺️ Project Roadmap

- [x] FastAPI backend foundation
- [x] GitHub portfolio analysis service
- [x] Role readiness analysis
- [x] Company analysis service
- [x] Learning roadmap service
- [x] Gemini integration with fallback behavior
- [ ] Add verified application screenshots and demo
- [ ] Expand test coverage and integration checks
- [ ] Further improve analysis quality and user experience

*Roadmap items should be updated as implementation progresses.*

---

## 👩‍💻 About the Developer

**Mallika Rajapure**

MCA student specializing in Artificial Intelligence and Machine Learning, interested in Python development, AI/ML, and software engineering.

Portfolix is part of my journey toward building practical, well-structured software applications.

<div align="center">

<a href="https://github.com/mallikarajapure-collab">
  <img src="https://img.shields.io/badge/GitHub-Explore%20My%20Work-181717?style=for-the-badge&logo=github" />
</a>

<br/><br/>

*Built with curiosity, code, and a vision for smarter developer growth. 💜*

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:2563EB,50:5B21B6,100:10002B&height=110&section=footer" width="100%" />

</div>
