import asyncio, httpx, pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from app.main import app
from app.services import github_service as gh
from app.services.github_service import ApiError

client = TestClient(app)
NOW = datetime.now(timezone.utc).isoformat()
def repo(name, desc="", lang=None, topics=None, fork=False):
    return {"name": name, "description": desc, "language": lang, "stars": 3, "forks": 1, "updated_at": NOW, "url": "u", "topics": topics or [], "homepage": "", "fork": fork, "archived": False}
PROFILE = {"username": "demo", "name": "Demo", "bio": "", "avatar_url": "", "url": "u", "public_repos": 2, "followers": 1, "following": 1}
FULL = {"profile": PROFILE, "repos": [repo("api-service", "FastAPI REST api with pytest tests", "Python", ["fastapi"]), repo("ml-lab", "machine learning classification", "Jupyter Notebook")]}
EMPTY = {"profile": {**PROFILE, "public_repos": 0}, "repos": []}

def patch(monkeypatch, result):
    async def fake(username, transport=None):
        if isinstance(result, Exception): raise result
        return result
    monkeypatch.setattr(gh, "fetch_portfolio", fake)

def test_health():
    assert client.get("/api/health").json()["status"] == "ok"

def test_analyze_success(monkeypatch):
    patch(monkeypatch, FULL)
    j = client.post("/api/portfolio/analyze", json={"username": "demo"}).json()
    assert j["facts"]["original_repos"] == 2 and "python" in j["skills"] and "testing" in j["skills"] and j["languages"]

def test_analyze_empty(monkeypatch):
    patch(monkeypatch, EMPTY)
    j = client.post("/api/portfolio/analyze", json={"username": "demo"}).json()
    assert j["empty"] and j["weaknesses"] and j["documentation_signal_score"]["value"] == 0

@pytest.mark.parametrize("status,code", [(404, "not_found"), (429, "rate_limited"), (502, "network_error"), (400, "invalid_username")])
def test_error_mapping(monkeypatch, status, code):
    patch(monkeypatch, ApiError(status, code, "x"))
    r = client.post("/api/portfolio/analyze", json={"username": "demo"})
    assert r.status_code == status and r.json()["error"]["code"] == code

def test_invalid_username_real_validation():
    r = client.post("/api/portfolio/analyze", json={"username": "bad name!"})
    assert r.status_code == 400 and r.json()["error"]["code"] == "invalid_username"
    assert client.post("/api/portfolio/analyze", json={"username": ""}).status_code == 422

def test_role_company_roadmap(monkeypatch):
    patch(monkeypatch, FULL)
    r = client.post("/api/role/readiness", json={"username": "demo", "role": "AI/ML Engineer"}).json()
    assert 0 < r["estimated_readiness"]["value"] < 100 and r["missing_skills"]
    c = client.post("/api/company/analyze", json={"username": "demo", "company": "Google", "role": "Python Developer"}).json()
    assert "illustrative" in c["assumptions"][0]
    c2 = client.post("/api/company/analyze", json={"username": "demo", "company": "Acme", "role": "Python Developer"}).json()
    assert "No profile" in c2["assumptions"][0]
    rm = client.post("/api/roadmap", json={"username": "demo", "role": "Backend Developer"}).json()
    assert rm["items"] and len({i["id"] for i in rm["items"]}) == len(rm["items"])
    assert client.post("/api/role/readiness", json={"username": "demo", "role": "Wizard"}).status_code == 422

def _svc(handler):
    return asyncio.run(gh.fetch_portfolio("demo", transport=httpx.MockTransport(handler)))

def test_service_404_ratelimit_network_success():
    with pytest.raises(ApiError) as e: _svc(lambda r: httpx.Response(404))
    assert e.value.status == 404
    with pytest.raises(ApiError) as e: _svc(lambda r: httpx.Response(403, json={}))
    assert e.value.status == 429
    def boom(r): raise httpx.ConnectError("down")
    with pytest.raises(ApiError) as e: _svc(boom)
    assert e.value.status == 502
    def ok(r): return httpx.Response(200, json={"login": "demo"} if r.url.path == "/users/demo" else [{"name": "x", "language": None, "description": None}])
    d = _svc(ok)
    assert d["profile"]["username"] == "demo" and d["repos"][0]["description"] == ""
