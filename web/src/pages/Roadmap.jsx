import { useState, useCallback, useEffect } from 'react'
import { api, store } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { Card, ModeBadge, AiPanel, Form, Select, Status, Empty, Note, ProjectList } from '../components/ui'

const NONE = 'No target role'
export default function Roadmap({ username, setUsername, roles, rolesError }) {
  const [role, setRole] = useState(NONE)
  const fn = useCallback((u, r) => api.roadmap(u, r === NONE ? null : r), [])
  const a = useAsync(fn)
  const key = `portfolix.roadmap.${(a.data?.profile.username || '').toLowerCase()}`
  const [done, setDone] = useState([])
  useEffect(() => { if (a.data) setDone(store.get(key, [])) }, [a.data, key])
  const toggle = (id) => { const n = done.includes(id) ? done.filter((x) => x !== id) : [...done, id]; setDone(n); store.set(key, n) }
  const d = a.data
  const count = d ? d.items.filter((x) => done.includes(x.id)).length : 0
  return (<><h1>Improvement Roadmap</h1><p className="lead">A prioritised checklist generated from your portfolio findings. Progress is saved in this browser only.</p>
    <Form username={username} setUsername={setUsername} loading={a.loading} onSubmit={() => a.run(username.trim(), role)} cta="Generate roadmap">
      <Select label="Target role (optional)" value={role} onChange={setRole} options={[NONE, ...roles]} /></Form>
    <Status loading={a.loading} error={a.error || rolesError} />
    {d && !a.loading ? <>
      <ModeBadge d={d} /><AiPanel d={d} skip={['items']} />
      <Card title={`Checklist — ${count}/${d.items.length} done`}>
        <div className="bar"><i style={{ width: `${(100 * count) / d.items.length}%` }} /></div>
        {d.items.map((it, n) => (<label key={it.id} className={`task p-${it.priority} ${done.includes(it.id) ? 'done' : ''}`}>
          <input type="checkbox" checked={done.includes(it.id)} onChange={() => toggle(it.id)} />
          <div><b>{n + 1}. {it.title}</b> <span className="badge">{it.priority}</span> <span className="badge alt">{it.category}</span> {it.source === 'ai' && <span className="badge ai">✦ AI</span>}
            <p><b>Why:</b> {it.why}</p><p className="muted"><b>Do:</b> {it.action}</p></div></label>))}</Card>
      <ProjectList items={d.suggested_projects} />
      {d.skills_to_practise.length > 0 && <Card title="Skills to practise"><div className="chips">{d.skills_to_practise.map((s) => <span key={s} className="badge">{s}</span>)}</div></Card>}
      <Note>{d.note}</Note></> : !a.loading && !a.error && <Empty title="No roadmap yet" text="Generate a roadmap to get your ordered checklist." />}</>)
}
