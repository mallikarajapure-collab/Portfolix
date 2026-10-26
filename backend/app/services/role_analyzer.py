from ..catalog import ROLES, SKILLS
from .portfolio_analyzer import detect_skills, DISCLAIMER

APPROX = "Skill detection is approximate: it reads repository names, descriptions, topics and languages only. A missing signal does not mean you lack the skill."

def evaluate(detected: dict, weights: dict) -> dict:
    total = sum(weights.values()) or 1
    matched, missing = [], []
    for k, wt in sorted(weights.items(), key=lambda x: -x[1]):
        label = SKILLS[k][0]
        if k in detected:
            matched.append({"key": k, "label": label, "weight": wt, "evidence": detected[k]["repos"][:3]})
        else:
            missing.append({"key": k, "label": label, "weight": wt})
    score = round(100 * sum(m["weight"] for m in matched) / total)
    return {"score": score, "matched": matched, "missing": missing}

def analyze(data: dict, role: str) -> dict:
    cfg = ROLES[role]
    ev = evaluate(detect_skills([r for r in data["repos"] if not r["fork"]] or data["repos"]), cfg["skills"])
    steps = [f"Build or extend a project that clearly demonstrates {m['label']} and mention it in the README/topics." for m in ev["missing"][:3]]
    steps.append("Pin the 3–6 repositories most relevant to this role.")
    return {"role": role, "profile": data["profile"], "estimated_readiness": {"value": ev["score"], "label": "Estimated readiness (heuristic, not a hiring prediction)"},
            "matched_skills": ev["matched"], "missing_skills": ev["missing"], "suggested_projects": cfg["projects"], "next_steps": steps,
            "notes": [APPROX, DISCLAIMER]}
