from ..catalog import ROLES, COMPANIES
from .portfolio_analyzer import detect_skills
from .role_analyzer import evaluate, APPROX

def analyze(data: dict, company: str, role: str) -> dict:
    name = company.strip()
    prof = next((v for k, v in COMPANIES.items() if k in name.lower()), None)
    weights = dict(ROLES[role]["skills"])
    if prof:
        for k, add in prof["emphasis"].items():
            weights[k] = weights.get(k, 0) + add
    ev = evaluate(detect_skills([r for r in data["repos"] if not r["fork"]] or data["repos"]), weights)
    if prof:
        basis = f"Used an illustrative, editable emphasis profile for {prof['label']} on top of the {role} role requirements (see backend/app/catalog.py)."
    else:
        basis = f"No profile exists for '{name}', so generic {role} expectations were used. Add the company to catalog.py to customise."
    return {"company": name, "role": role, "profile": data["profile"],
            "estimated_alignment": {"value": ev["score"], "label": "Estimated alignment with configurable profile (NOT an official company score)"},
            "matched_skills": ev["matched"], "skill_gaps": ev["missing"], "suggested_projects": ROLES[role]["projects"],
            "next_actions": [f"Strengthen evidence for {m['label']} in a public project." for m in ev["missing"][:3]] + [f"Read {name}'s official job postings and compare them with this profile."],
            "assumptions": [basis, "Companies' real hiring criteria are private and vary by team; this is not a prediction of any recruiting decision.", APPROX]}
