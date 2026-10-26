import pytest
from app.services import llm_service as llm

@pytest.fixture(autouse=True)
def _no_llm(monkeypatch):
    monkeypatch.setattr(llm, "enabled", lambda: False)
