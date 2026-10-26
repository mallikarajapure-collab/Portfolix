import re
from ..catalog import ROLES
from . import portfolio_analyzer, role_analyzer

def _slug(s): return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
ORDER = {"high": 0, "medium": 1, "low": 2}

def build(data: dict, role: str | None) -> dict:
    rep = portfolio_analyzer.analyze(data)
    items = []
    for r in rep["recommendations"]:
        cat = "documentation" if any(w in r["title"].lower() for w in ("readme", "description", "topic", "demo")) else "portfolio"
        items.append({"priority": r["priority"], "category": cat, "title": r["title"], "why": r["detail"], "action": r["detail"]})
    projects, practise = [], []
    if role:
        ra = role_analyzer.analyze(data, role)
        for m in ra["missing_skills"][:4]:
            items.append({"priority": "high" if m["weight"] >= 2 else "medium", "category": "skills", "title": f"Demonstrate {m['label']}",
                          "why": f"{m['label']} is weighted {m['weight']} for {role} and no signal was found in repository metadata.",
                          "action": f"Add or extend a project using {m['label']}, then name it in the description/topics."})
            practise.append(m["label"])
        projects = ra["suggested_projects"]
    if rep["facts"]["original_repos"] and "docker" not in rep["skills"]:
        items.append({"priority": "low", "category": "project", "title": "Containerise a flagship project", "why": "Docker shows you can package software to run anywhere.", "action": "Add a Dockerfile and one-command run instructions."})
    items.append({"priority": "low", "category": "documentation", "title": "Write setup instructions and add screenshots", "why": "Reviewers rarely run code; clear setup and visuals make projects approachable.", "action": "For each pinned repo add: install steps, usage example, screenshot/GIF, demo link."})
    seen, out = set(), []
    for i in sorted(items, key=lambda x: ORDER[x["priority"]]):
        i["id"] = _slug(i["title"])
        if i["id"] not in seen:
            seen.add(i["id"]); out.append(i)
    return {"profile": data["profile"], "role": role, "items": out, "suggested_projects": projects, "skills_to_practise": practise,
            "note": "Order is: high → medium → low priority. Based on public metadata heuristics only."}


def merge_ai(base: dict) -> dict:
    ids = {i["id"] for i in base["items"]}
    for it in (base.get("ai") or {}).get("items", []):
        if not isinstance(it, dict) or not isinstance(it.get("title"), str):
            continue
        pr = it.get("priority") if it.get("priority") in ORDER else "medium"
        item = {"id": _slug(it["title"]), "priority": pr, "category": str(it.get("category") or "portfolio"), "title": it["title"],
                "why": str(it.get("why") or ""), "action": str(it.get("action") or ""), "source": "ai"}
        if item["id"] and item["id"] not in ids:
            ids.add(item["id"]); base["items"].append(item)
    base["items"].sort(key=lambda x: ORDER[x["priority"]])
    ai_p = (base.get("ai") or {}).get("suggested_projects")
    if isinstance(ai_p, list) and ai_p:
        base["suggested_projects"] = [str(p) for p in ai_p] + [p for p in base["suggested_projects"] if p not in ai_p]
    return base
