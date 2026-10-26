import asyncio, httpx, pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services import github_service as gh, llm_service as llm
from tests.test_api import FULL, patch

client = TestClient(app)
CALLS = [("/api/portfolio/analyze", {"username": "d"}), ("/api/role/readiness", {"username": "d", "role": "Backend Developer"}),
         ("/api/company/analyze", {"username": "d", "company": "Acme", "role": "Backend Developer"}), ("/api/roadmap", {"username": "d", "role": "Backend Developer"})]

def setup_ai(monkeypatch, result):
    patch(monkeypatch, FULL)
    monkeypatch.setattr(llm, "enabled", lambda: True)
    async def rm(*a, **k): return {"api-service": "# readme"}
    async def an(*a, **k):
        if isinstance(result, Exception): raise result
        return result
    monkeypatch.setattr(gh, "fetch_readmes", rm)
    monkeypatch.setattr(llm, "analyze", an)

def test_disabled_falls_back(monkeypatch):
    patch(monkeypatch, FULL)
    for path, body in CALLS:
        j = client.post(path, json=body).json()
        assert j["analysis_mode"] == "rule_based" and "ai" not in j and j["ai_note"]

def test_ai_success_all_features(monkeypatch):
    setup_ai(monkeypatch, {"summary": "ok", "items": [{"title": "Add CI badge", "priority": "high", "category": "project", "why": "w", "action": "a"}]})
    for path, body in CALLS:
        j = client.post(path, json=body).json()
        assert j["analysis_mode"] == "llm+rules" and j["ai"]["summary"] == "ok"
    assert any(i.get("source") == "ai" for i in j["items"])

def test_ai_failure_falls_back(monkeypatch):
    setup_ai(monkeypatch, llm.LlmError("boom"))
    j = client.post("/api/portfolio/analyze", json={"username": "d"}).json()
    assert j["analysis_mode"] == "rule_based" and "boom" in j["ai_error"] and j["facts"]

def test_parse_and_http(monkeypatch):
    monkeypatch.setattr(llm.config, "GEMINI_API_KEY", "test-key")
    monkeypatch.setattr(llm.config, "GEMINI_MODEL", "gemini-2.5-flash")
    assert llm.parse_json('```json\n{"a":1}\n```') == {"a": 1}
    assert llm.parse_json('Sure! {"a": 2} done') == {"a": 2}
    with pytest.raises(llm.LlmError):
        llm.parse_json("nope")

    run = lambda h: asyncio.run(
        llm.analyze("portfolio", FULL, {}, {},
                    transport=httpx.MockTransport(h))
    )
    with pytest.raises(llm.LlmError, match="rejected"):
        run(lambda r: httpx.Response(401))

    def gemini_response(r):
        assert r.url.path.endswith(":generateContent")
        assert r.headers["x-goog-api-key"] == "test-key"
        return httpx.Response(200, json={
            "candidates": [{
                "content": {
                    "parts": [{"text": '{"summary":"hi"}'}]
                }
            }]
        })

    assert run(gemini_response) == {"summary": "hi"}
