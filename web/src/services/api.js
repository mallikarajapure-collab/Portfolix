const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

async function request(path, body) {
  let res
  try {
    res = await fetch(BASE + path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : undefined)
  } catch {
    throw new Error(`Cannot reach the Portfolix backend at ${BASE}. Is it running?`)
  }
  let data = null
  try { data = await res.json() } catch { /* non-JSON */ }
  if (!res.ok) throw new Error(data?.error?.message || `Request failed (HTTP ${res.status}).`)
  return data
}

export const api = {
  roles: () => request('/api/roles'),
  portfolio: (username) => request('/api/portfolio/analyze', { username }),
  role: (username, role) => request('/api/role/readiness', { username, role }),
  company: (username, company, role) => request('/api/company/analyze', { username, company, role }),
  roadmap: (username, role) => request('/api/roadmap', { username, role: role || null }),
}
export const USERNAME_RE = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/
export const validateUsername = (u) => !u.trim() ? 'Enter a GitHub username.' : !USERNAME_RE.test(u.trim()) || u.includes('--') ? 'Usernames use letters, numbers and single hyphens (max 39).' : ''
export const store = {
  get: (k, d = null) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v) } catch { return d } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* ignore */ } },
}
