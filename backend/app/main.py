from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from . import config, schemas
from .catalog import ROLES
from .services import github_service as gh, portfolio_analyzer, role_analyzer, company_analyzer, roadmap_service, llm_service as llm
from .services.github_service import ApiError

app = FastAPI(title="Portfolix API", version="1.0.0", description="GitHub Portfolio Intelligence. Scores are heuristic estimates.")
app.add_middleware(CORSMiddleware, allow_origins=config.CORS_ORIGINS, allow_methods=["*"], allow_headers=["*"])

def _err(status, code, msg): return JSONResponse(status_code=status, content={"error": {"code": code, "message": msg}})

@app.exception_handler(ApiError)
async def _api_err(_: Request, e: ApiError): return _err(e.status, e.code, e.message)

@app.exception_handler(RequestValidationError)
async def _val_err(_: Request, e: RequestValidationError):
    first = e.errors()[0] if e.errors() else {}
    return _err(422, "validation_error", f"Invalid request: {'.'.join(str(x) for x in first.get('loc', [])[1:])} {first.get('msg', '')}".strip())

def _role(role):
    if role not in ROLES:
        raise ApiError(422, "invalid_role", f"Unknown role '{role}'. Valid roles: {', '.join(ROLES)}.")
    return role

async def _with_ai(kind, data, base, extra=None):
    """Adds LLM analysis on top of the rule-based result; falls back gracefully."""
    base["analysis_mode"] = "rule_based"
    if not llm.enabled():
        base["ai_note"] = "AI analysis is off (no ANTHROPIC_API_KEY in backend/.env). Showing rule-based results."
        return base
    try:
        readmes = await gh.fetch_readmes(data["profile"]["username"], data["repos"])
        base["ai"] = await llm.analyze(kind, data, base, readmes, extra)
        base["analysis_mode"] = "llm+rules"
    except llm.LlmError as e:
        base["ai_error"] = f"AI analysis failed: {e}. Showing rule-based results."
    return base

@app.get("/api/health", tags=["system"])
async def health(): return {"status": "ok", "service": "portfolix", "github_token_configured": bool(config.GITHUB_TOKEN), "llm_enabled": llm.enabled()}

@app.get("/api/roles", tags=["roles"])
async def roles(): return {"roles": list(ROLES)}

@app.get("/api/github/{username}", tags=["github"])
async def github_profile(username: str): return await gh.fetch_portfolio(username)

@app.post("/api/portfolio/analyze", tags=["analysis"])
async def portfolio(req: schemas.UsernameRequest):
    d = await gh.fetch_portfolio(req.username)
    return await _with_ai("portfolio", d, portfolio_analyzer.analyze(d)) if d["repos"] else portfolio_analyzer.analyze(d)

@app.post("/api/role/readiness", tags=["analysis"])
async def role_readiness(req: schemas.RoleRequest):
    _role(req.role); d = await gh.fetch_portfolio(req.username)
    return await _with_ai("role", d, role_analyzer.analyze(d, req.role), {"target_role": req.role})

@app.post("/api/company/analyze", tags=["analysis"])
async def company(req: schemas.CompanyRequest):
    _role(req.role); d = await gh.fetch_portfolio(req.username)
    return await _with_ai("company", d, company_analyzer.analyze(d, req.company, req.role), {"target_role": req.role, "company": req.company})

@app.post("/api/roadmap", tags=["analysis"])
async def roadmap(req: schemas.RoadmapRequest):
    if req.role: _role(req.role)
    d = await gh.fetch_portfolio(req.username)
    base = await _with_ai("roadmap", d, roadmap_service.build(d, req.role), {"target_role": req.role})
    return roadmap_service.merge_ai(base) if "ai" in base else base
