import re
import httpx
from .. import config

USERNAME_RE = re.compile(r"^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$")

class ApiError(Exception):
    def __init__(self, status: int, code: str, message: str):
        super().__init__(message)
        self.status, self.code, self.message = status, code, message

def valid_username(u: str) -> bool:
    return bool(u) and bool(USERNAME_RE.match(u)) and "--" not in u and not u.endswith("-")

def _check(r: httpx.Response, what: str):
    if r.status_code == 404:
        raise ApiError(404, "not_found", f"GitHub {what} not found.")
    if r.status_code in (403, 429):
        raise ApiError(429, "rate_limited", "GitHub API rate limit reached. Wait a while, or set GITHUB_TOKEN in backend/.env.")
    if r.status_code >= 400:
        raise ApiError(502, "github_error", f"GitHub returned HTTP {r.status_code}.")

def _repo(r: dict) -> dict:
    return {"name": r.get("name") or "", "description": r.get("description") or "", "language": r.get("language"),
            "stars": r.get("stargazers_count") or 0, "forks": r.get("forks_count") or 0,
            "updated_at": r.get("pushed_at") or r.get("updated_at"), "url": r.get("html_url") or "",
            "topics": r.get("topics") or [], "homepage": r.get("homepage") or "", "fork": bool(r.get("fork")),
            "archived": bool(r.get("archived"))}

async def fetch_portfolio(username: str, transport=None) -> dict:
    username = (username or "").strip()
    if not valid_username(username):
        raise ApiError(400, "invalid_username", "Invalid GitHub username. Use letters, numbers and single hyphens (max 39 chars).")
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "portfolix"}
    if config.GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {config.GITHUB_TOKEN}"
    try:
        async with httpx.AsyncClient(base_url=config.GITHUB_API, headers=headers, timeout=config.TIMEOUT, transport=transport) as c:
            pr = await c.get(f"/users/{username}")
            _check(pr, "user")
            rr = await c.get(f"/users/{username}/repos", params={"per_page": 100, "sort": "pushed", "type": "owner"})
            _check(rr, "repositories")
            p, repos = pr.json(), rr.json()
    except httpx.TimeoutException:
        raise ApiError(504, "timeout", "GitHub took too long to respond. Please try again.")
    except httpx.HTTPError:
        raise ApiError(502, "network_error", "Could not reach GitHub. Check your network connection.")
    except ValueError:
        raise ApiError(502, "bad_response", "GitHub returned an unreadable response.")
    profile = {"username": p.get("login") or username, "name": p.get("name") or "", "bio": p.get("bio") or "",
               "avatar_url": p.get("avatar_url") or "", "url": p.get("html_url") or f"https://github.com/{username}",
               "public_repos": p.get("public_repos") or 0, "followers": p.get("followers") or 0, "following": p.get("following") or 0}
    return {"profile": profile, "repos": [_repo(r) for r in (repos if isinstance(repos, list) else [])]}


async def fetch_readmes(username: str, repos: list, limit: int = 5, max_chars: int = 2500, transport=None) -> dict:
    """Best-effort README excerpts for the top original repos. Never raises."""
    picks = sorted([r for r in repos if not r["fork"]], key=lambda r: (r["stars"], r["updated_at"] or ""), reverse=True)[:limit]
    headers = {"Accept": "application/vnd.github.raw+json", "User-Agent": "portfolix"}
    if config.GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {config.GITHUB_TOKEN}"
    out = {}
    try:
        async with httpx.AsyncClient(base_url=config.GITHUB_API, headers=headers, timeout=config.TIMEOUT, transport=transport) as c:
            for r in picks:
                try:
                    resp = await c.get(f"/repos/{username}/{r['name']}/readme")
                    out[r["name"]] = resp.text[:max_chars] if resp.status_code == 200 else "(no README found)"
                except httpx.HTTPError:
                    out[r["name"]] = "(README could not be fetched)"
    except httpx.HTTPError:
        pass
    return out
