import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend } from 'recharts'
import { Star, GitFork, AlertTriangle, Inbox, Loader2, Check, X, Search } from 'lucide-react'
import { validateUsername, store } from '../services/api'

export const Card = ({ title, children, className = '' }) => (
  <section className={`card ${className}`}>{title && <h3 className="card-title">{title}</h3>}{children}</section>)
export const Stat = ({ label, value, icon: Icon }) => (
  <div className="card stat">{Icon && <Icon size={18} className="muted" />}<div className="stat-v">{value}</div><div className="stat-l">{label}</div></div>)
export const ErrorBox = ({ message }) => message ? <div className="error" role="alert"><AlertTriangle size={18} /> <span>{message}</span></div> : null
export const Empty = ({ title, text }) => (<div className="empty"><Inbox size={30} /><h3>{title}</h3><p>{text}</p></div>)
export const Skeleton = () => (<div aria-busy="true" aria-label="Loading"><div className="skel" style={{ height: 90 }} /><div className="skel" style={{ height: 220, marginTop: 14 }} /><div className="skel" style={{ height: 140, marginTop: 14 }} /></div>)
export const Note = ({ children }) => <p className="note">{children}</p>

export function Score({ value, label }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let raf, t0
    const step = (t) => { t0 = t0 ?? t; const p = Math.min((t - t0) / 900, 1); setV(Math.round(value * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf = requestAnimationFrame(step) }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value])
  const r = 70, c = 2 * Math.PI * r
  const col = value >= 70 ? '#34d399' : value >= 40 ? '#a855f7' : '#fbbf24'
  return (<div className="score"><svg width="180" height="180" viewBox="0 0 180 180" role="img" aria-label={`${label}: ${value} out of 100`}>
    <circle cx="90" cy="90" r={r} className="ring-bg" /><circle cx="90" cy="90" r={r} className="ring" stroke={col} strokeDasharray={c} strokeDashoffset={c * (1 - v / 100)} transform="rotate(-90 90 90)" />
    <text x="90" y="102" textAnchor="middle" className="ring-t">{v}</text></svg><p className="note">{label}</p></div>)
}

export function SkillRadar({ matched = [], missing = [] }) {
  const data = [...matched, ...missing].map((s) => ({ skill: s.label.split(/[ /]/)[0], expected: s.weight, detected: matched.some((m) => m.key === s.key) ? s.weight : 0 }))
  if (data.length < 3) return null
  return (<Card title="Skill coverage radar"><div style={{ height: 300 }}><ResponsiveContainer><RadarChart data={data}><PolarGrid stroke="#3b2a6b" /><PolarAngleAxis dataKey="skill" tick={{ fill: '#c4b5fd', fontSize: 11 }} />
    <Radar name="Expected" dataKey="expected" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.12} /><Radar name="Detected" dataKey="detected" stroke="#a855f7" fill="#a855f7" fillOpacity={0.45} />
    <Tooltip contentStyle={TT} /><Legend /></RadarChart></ResponsiveContainer></div></Card>)
}

export function SkillList({ matched = [], missing = [] }) {
  return (<div className="grid2">
    <div><h4 className="ok"><Check size={15} /> Signals found</h4>{matched.length ? matched.map((m) => (
      <div key={m.key} className="skill ok-b"><b>{m.label}</b><span className="muted">{m.evidence.join(', ')}</span></div>)) : <p className="muted">None detected.</p>}</div>
    <div><h4 className="warn"><X size={15} /> Not demonstrated in metadata</h4>{missing.length ? missing.map((m) => (
      <div key={m.key} className="skill miss-b"><b>{m.label}</b><span className="muted">weight {m.weight}</span></div>)) : <p className="muted">All expected signals found.</p>}</div></div>)
}

export const Rec = ({ r }) => (<div className={`rec p-${r.priority}`}><span className="badge">{r.priority}</span><div><b>{r.title}</b><p>{r.detail || r.why}</p></div></div>)
export const ProjectList = ({ items, title = 'Suggested portfolio projects' }) => items?.length ? (<Card title={title}><ul className="list">{items.map((p) => <li key={p}>{p}</li>)}</ul></Card>) : null

export const RepoCard = ({ r }) => (
  <a className="card repo" href={r.url} target="_blank" rel="noreferrer">
    <b>{r.name}</b><p>{r.description || <i className="muted">No description</i>}</p>
    <div className="meta">{r.language && <span className="badge">{r.language}</span>}<span><Star size={13} /> {r.stars}</span><span><GitFork size={13} /> {r.forks}</span>
      {r.updated_at && <span className="muted">{r.updated_at.slice(0, 10)}</span>}</div></a>)

const COLORS = ['#a855f7', '#7c3aed', '#c4b5fd', '#22d3ee', '#6d28d9', '#8b5cf6', '#ddd6fe', '#4c1d95']
const TT = { background: '#150f2a', border: '1px solid #3b2a6b', borderRadius: 10 }
export function LangChart({ data }) {
  if (!data?.length) return <p className="muted">No language data available.</p>
  return (<div className="lang"><div style={{ width: 160, height: 160 }}><ResponsiveContainer><PieChart><Pie data={data} dataKey="count" nameKey="name" innerRadius={45} outerRadius={75} stroke="none">
    {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={TT} /></PieChart></ResponsiveContainer></div>
    <ul className="legend">{data.map((d, i) => <li key={d.name}><i style={{ background: COLORS[i % COLORS.length] }} />{d.name} <span className="muted">{d.percent}%</span></li>)}</ul></div>)
}
export const YearChart = ({ data }) => data?.length ? (<div style={{ height: 160 }}><ResponsiveContainer><BarChart data={data}><XAxis dataKey="year" stroke="#8b86a8" fontSize={12} /><YAxis allowDecimals={false} stroke="#8b86a8" fontSize={12} width={28} />
  <Tooltip cursor={{ fill: '#ffffff10' }} contentStyle={TT} /><Bar dataKey="count" name="Repos last pushed" fill="#a855f7" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>) : null

export function ProfileSummary({ p }) {
  return (<Card className="profile">{p.avatar_url && <img src={p.avatar_url} alt={`${p.username} avatar`} width="72" height="72" />}
    <div><h2>{p.name || p.username}</h2><a href={p.url} target="_blank" rel="noreferrer">@{p.username}</a><p className="muted">{p.bio || 'No bio provided.'}</p></div></Card>)
}

export function Form({ username, setUsername, loading, onSubmit, children, cta = 'Analyze' }) {
  const [err, setErr] = useState('')
  const [recent, setRecent] = useState(() => store.get('portfolix.recent', []))
  const submit = (e) => { e.preventDefault(); const m = validateUsername(username); setErr(m); if (m) return; const n = [username.trim(), ...recent.filter((x) => x.toLowerCase() !== username.trim().toLowerCase())].slice(0, 6); setRecent(n); store.set('portfolix.recent', n); onSubmit() }
  return (<form className="card form" onSubmit={submit} noValidate>
    <label className="field"><span>GitHub username</span><input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. torvalds" autoComplete="off" list="recent-users" aria-invalid={!!err} aria-describedby="u-err" />
      <small id="u-err" className="err-t">{err}</small><datalist id="recent-users">{recent.map((r) => <option key={r} value={r} />)}</datalist></label>
    {children}
    <button className="btn" disabled={loading}>{loading ? <Loader2 size={16} className="spin" /> : <Search size={16} />} {loading ? 'Analyzing…' : cta}</button></form>)
}
export const Select = ({ label, value, onChange, options }) => (
  <label className="field"><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o}>{o}</option>)}</select></label>)
export const Status = ({ loading, error }) => (<>{loading && <Skeleton />}<ErrorBox message={error} /></>)

export const ModeBadge = ({ d }) => (<div className="mode">
  <span className={`badge ${d.ai ? 'ai' : 'alt'}`}>{d.ai ? '✦ AI-generated + rule-based' : 'Rule-based analysis'}</span>
  {d.ai_note && <Note>{d.ai_note}</Note>}<ErrorBox message={d.ai_error} /></div>)

export function AiPanel({ d, skip = [] }) {
  if (!d.ai) return null
  const nice = (k) => k.replace(/_0_100|_0_10/g, '').replace(/_/g, ' ')
  const fmt = (x) => (x && typeof x === 'object' ? Object.values(x).filter((y) => y !== '' && y != null).map(String).join(' — ') : String(x))
  return (<Card title="✦ AI analysis" className="ai-card">{d.ai.summary && <p>{String(d.ai.summary)}</p>}
    {Object.entries(d.ai).filter(([k, v]) => k !== 'summary' && !skip.includes(k) && v != null).map(([k, v]) => (
      <div key={k} className="ai-sec"><h4>{nice(k)}</h4>{Array.isArray(v) ? <ul className="list">{v.map((x, i) => <li key={i}>{fmt(x)}</li>)}</ul> : <p><b>{fmt(v)}</b></p>}</div>))}
    <Note>AI output is an estimate from public metadata and README excerpts. It can be wrong and cannot predict hiring decisions.</Note></Card>)
}
