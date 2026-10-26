import { useState, useCallback } from 'react'
import { api } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { Card, ModeBadge, AiPanel, Score, SkillRadar, SkillList, ProjectList, Form, Select, Status, Note, ProfileSummary, Empty } from '../components/ui'

export function Result({ d, company }) {
  const sc = d.estimated_readiness || d.estimated_alignment
  return (<><ProfileSummary p={d.profile} /><ModeBadge d={d} /><Card><Score value={sc.value} label={sc.label} /></Card><AiPanel d={d} />
    <SkillRadar matched={d.matched_skills} missing={d.missing_skills || d.skill_gaps} />
    <Card title={company ? 'Skill comparison' : 'Skills & evidence'}><SkillList matched={d.matched_skills} missing={d.missing_skills || d.skill_gaps} /></Card>
    <ProjectList items={d.suggested_projects} />
    <Card title="Recommended next steps"><ol className="list">{(d.next_steps || d.next_actions).map((s) => <li key={s}>{s}</li>)}</ol></Card>
    <Card title={company ? 'Assumptions & evidence' : 'Notes'}><ul className="list">{(d.notes || d.assumptions).map((s) => <li key={s}>{s}</li>)}</ul></Card></>)
}

export default function Role({ username, setUsername, roles, rolesError }) {
  const [role, setRole] = useState(roles[0] || '')
  const fn = useCallback((u, r) => api.role(u, r), [])
  const a = useAsync(fn)
  return (<><h1>Role Readiness</h1><p className="lead">Estimate how visible role-relevant skills are in your public repositories.</p>
    <Form username={username} setUsername={setUsername} loading={a.loading} onSubmit={() => a.run(username.trim(), role || roles[0])} cta="Check readiness">
      <Select label="Target role" value={role || roles[0] || ''} onChange={setRole} options={roles} /></Form>
    <Status loading={a.loading} error={a.error || rolesError} />
    {a.data && !a.loading ? <Result d={a.data} /> : !a.loading && !a.error && <Empty title="No result yet" text="Pick a role and run the check." />}
    <Note>Estimates only — repository metadata cannot prove or disprove a skill.</Note></>)
}
