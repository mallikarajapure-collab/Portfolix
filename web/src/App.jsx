import { useState, useEffect, useCallback } from 'react'
import { LayoutDashboard, Github, Target, Building2, ListChecks, Sparkles } from 'lucide-react'
import { api, store } from './services/api'
import { useAsync } from './hooks/useAsync'
import Dashboard from './pages/Dashboard'
import Review from './pages/Review'
import Role from './pages/Role'
import Company from './pages/Company'
import Roadmap from './pages/Roadmap'

const NAV = [['dashboard', 'Dashboard', LayoutDashboard], ['review', 'Review', Github], ['role', 'Role Readiness', Target], ['company', 'Company', Building2], ['roadmap', 'Roadmap', ListChecks]]

export default function App() {
  const [page, setPage] = useState(() => (NAV.find((n) => n[0] === location.hash.slice(1)) ? location.hash.slice(1) : 'dashboard'))
  const [username, setUsername] = useState(() => store.get('portfolix.username', ''))
  const [roles, setRoles] = useState([])
  const [rolesError, setRolesError] = useState('')
  const analysis = useAsync(useCallback((u) => api.portfolio(u), []))
  const go = (p) => { location.hash = p; setPage(p); window.scrollTo(0, 0) }
  useEffect(() => { const h = () => NAV.some((n) => n[0] === location.hash.slice(1)) && setPage(location.hash.slice(1)); addEventListener('hashchange', h); return () => removeEventListener('hashchange', h) }, [])
  useEffect(() => { store.set('portfolix.username', username) }, [username])
  useEffect(() => { api.roles().then((r) => setRoles(r.roles)).catch((e) => setRolesError(e.message)) }, [])
  const shared = { username, setUsername, roles, rolesError }
  return (<div className="shell">
    <nav className="side" aria-label="Main navigation"><div className="logo"><Sparkles size={20} /> <span>Portfolix</span></div>
      {NAV.map(([k, l, I]) => (<button key={k} className={`nav ${page === k ? 'active' : ''}`} aria-current={page === k ? 'page' : undefined} onClick={() => go(k)}><I size={18} /><span>{l}</span></button>))}</nav>
    <main className="main"><div className="wrap" key={roles.length ? page : page}>
      {page === 'dashboard' && <Dashboard {...shared} analysis={analysis} go={go} />}
      {page === 'review' && <Review {...shared} analysis={analysis} />}
      {page === 'role' && (roles.length || rolesError ? <Role {...shared} /> : <p className="muted">Loading roles…</p>)}
      {page === 'company' && (roles.length || rolesError ? <Company {...shared} /> : <p className="muted">Loading roles…</p>)}
      {page === 'roadmap' && <Roadmap {...shared} />}</div></main></div>)
}
