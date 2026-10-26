import { useState, useCallback } from 'react'
import { api } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { Form, Select, Status, Empty, Note } from '../components/ui'
import { Result } from './Role'

export default function Company({ username, setUsername, roles, rolesError }) {
  const [role, setRole] = useState(roles[0] || '')
  const [company, setCompany] = useState('')
  const [cErr, setCErr] = useState('')
  const fn = useCallback((u, c, r) => api.company(u, c, r), [])
  const a = useAsync(fn)
  const go = () => { if (!company.trim()) return setCErr('Enter a company name.'); setCErr(''); a.run(username.trim(), company.trim(), role || roles[0]) }
  return (<><h1>Company Analysis</h1><p className="lead">Compare your portfolio with a configurable company/role profile.</p>
    <Form username={username} setUsername={setUsername} loading={a.loading} onSubmit={go} cta="Compare">
      <label className="field"><span>Company</span><input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g. Google" maxLength={60} aria-invalid={!!cErr} /><small className="err-t">{cErr}</small></label>
      <Select label="Target role" value={role || roles[0] || ''} onChange={setRole} options={roles} /></Form>
    <Status loading={a.loading} error={a.error || rolesError} />
    {a.data && !a.loading ? <Result d={a.data} company /> : !a.loading && !a.error && <Empty title="No comparison yet" text="Enter a company and role to compare." />}
    <Note>Profiles are illustrative and editable (backend/app/catalog.py). They are not official company criteria or hiring scores.</Note></>)
}
