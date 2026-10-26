import re
from collections import Counter
from datetime import datetime, timezone
from ..catalog import SKILLS

DISCLAIMER = ("Facts come directly from public GitHub metadata. Scores, strengths and weaknesses are simple heuristics "
              "based on that metadata only (max 100 most recently pushed repos). They cannot measure code quality or hiring readiness.")

def _age_days(s):
    try:
        return (datetime.now(timezone.utc) - datetime.fromisoformat(s.replace("Z", "+00:00"))).days
    except Exception:
        return None

def _has(text, kw):
    return re.search(r"(?<![a-z0-9])" + re.escape(kw) + r"(?![a-z0-9])", text) is not None

def detect_skills(repos):
    found = {}
    for r in repos:
        text = " ".join([r["name"].replace("-", " ").replace("_", " "), r["description"], " ".join(r["topics"]), r["language"] or ""]).lower()
        for key, (label, kws) in SKILLS.items():
            if any(_has(text, k) for k in kws):
                found.setdefault(key, {"label": label, "repos": []})["repos"].append(r["name"])
    return found

def _pct(n, d):
    return round(100 * n / d) if d else 0

def analyze(data: dict) -> dict:
    p, repos = data["profile"], data["repos"]
    own = [r for r in repos if not r["fork"]]
    base = own or repos
    ages = [_age_days(r["updated_at"]) for r in base]
    ages = [a for a in ages if a is not None]
    r90, r365 = sum(a <= 90 for a in ages), sum(a <= 365 for a in ages)
    langs = Counter(r["language"] for r in base if r["language"])
    tl = sum(langs.values())
    languages = [{"name": n, "count": c, "percent": _pct(c, tl)} for n, c in langs.most_common(8)]
    years = Counter((r["updated_at"] or "")[:4] for r in base if r["updated_at"])
    n = len(base)
    doc = {"with_description": _pct(sum(bool(r["description"]) for r in base), n),
           "with_topics": _pct(sum(bool(r["topics"]) for r in base), n),
           "with_homepage": _pct(sum(bool(r["homepage"]) for r in base), n)}
    skills = detect_skills(base)
    facts = {"public_repos": p["public_repos"], "analyzed_repos": len(repos), "original_repos": len(own), "forked_repos": len(repos) - len(own),
             "total_stars": sum(r["stars"] for r in repos), "total_forks": sum(r["forks"] for r in repos),
             "followers": p["followers"], "following": p["following"], "updated_last_90_days": r90, "updated_last_365_days": r365}
    s, w, rec = [], [], []
    if not repos:
        w.append("No public repositories were found, so there is nothing to evaluate yet.")
        rec.append({"priority": "high", "title": "Publish your first project", "detail": "Add one well-documented public repository (README, setup steps, screenshot) so recruiters have something to review."})
    else:
        if n >= 5: s.append(f"{n} original public repositories give reviewers a reasonable amount to look at.")
        if len(langs) >= 3: s.append(f"Uses {len(langs)} different primary languages, showing some breadth.")
        if r90 >= 2: s.append(f"{r90} repositories were pushed in the last 90 days, signalling recent activity.")
        if facts["total_stars"] >= 10: s.append(f"Repositories have {facts['total_stars']} stars in total, a sign of outside interest.")
        if doc["with_description"] >= 80: s.append("Most repositories have descriptions.")
        if n < 3: w.append("Fewer than 3 original repositories; the portfolio may feel thin.")
        if doc["with_description"] < 70:
            w.append(f"Only {doc['with_description']}% of repositories have a description.")
            rec.append({"priority": "high", "title": "Add descriptions to every repository", "detail": "A one-line description makes each project understandable from your profile page."})
        if doc["with_topics"] < 50:
            w.append(f"Only {doc['with_topics']}% of repositories use topics.")
            rec.append({"priority": "medium", "title": "Add topics to repositories", "detail": "Topics (e.g. fastapi, react, machine-learning) improve discoverability and make your skills explicit."})
        if doc["with_homepage"] < 20:
            w.append("Few repositories link to a live demo or homepage.")
            rec.append({"priority": "medium", "title": "Add live demos or screenshots", "detail": "Link a deployed demo or add screenshots/GIFs to your README so projects can be judged in seconds."})
        if r90 == 0:
            w.append("No repositories were pushed in the last 90 days.")
            rec.append({"priority": "medium", "title": "Show recent activity", "detail": "Push an improvement or a new project to show you are actively building."})
        if len(repos) - len(own) > len(own):
            w.append("Most repositories are forks, which hides your own work.")
            rec.append({"priority": "medium", "title": "Highlight original work", "detail": "Pin your best original projects and consider archiving unused forks."})
        if "testing" not in skills:
            w.append("No testing signals in repository names, descriptions or topics.")
            rec.append({"priority": "medium", "title": "Add automated tests to a flagship project", "detail": "Tests (and a CI badge) show engineering discipline. This signal may be missing only from metadata."})
        rec.append({"priority": "high", "title": "Check README quality on your top projects", "detail": "README content is not analysed here. Make sure each pinned repo explains the problem, features, setup, usage and has a screenshot."})
    score = 0 if not repos else min(100, round(0.35 * doc["with_description"] + 0.2 * doc["with_topics"] + 0.15 * doc["with_homepage"] + 15 * min(r90, 2) / 2 * 1 + 15 * min(n, 6) / 6))
    return {"profile": p, "facts": facts, "empty": not repos, "languages": languages,
            "activity": {"updated_last_90_days": r90, "updated_last_365_days": r365, "by_year": [{"year": y, "count": c} for y, c in sorted(years.items())]},
            "documentation": doc, "skills": skills, "strengths": s, "weaknesses": w, "recommendations": rec,
            "documentation_signal_score": {"value": score, "label": "Heuristic metadata-completeness score (not a quality or hiring score)"},
            "repos": base[:30], "disclaimer": DISCLAIMER}
