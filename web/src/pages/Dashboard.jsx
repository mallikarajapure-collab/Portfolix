import { Form, Status, Empty, Card } from '../components/ui'
import { Report } from './Review'
import { Github, Target, Building2, ListChecks } from 'lucide-react'

export default function Dashboard({ username, setUsername, analysis, go }) {
  const tiles = [['review', Github, 'Portfolio Review', 'Full report on repositories, languages and activity.'], ['role', Target, 'Role Readiness', 'Estimate fit for a target role.'],
    ['company', Building2, 'Company Analysis', 'Compare against configurable company profiles.'], ['roadmap', ListChecks, 'Improvement Roadmap', 'Prioritised, trackable checklist.']]
  return (<><div className="hero"><span className="badge">GitHub Portfolio Intelligence</span><h1>Turn your GitHub into a career-ready portfolio.</h1><p className="lead">Analyze real public data, estimate role readiness and get a prioritised improvement plan.</p></div>
    <Form username={username} setUsername={setUsername} loading={analysis.loading} onSubmit={() => analysis.run(username.trim())} cta="Quick analyze" />
    <Status loading={analysis.loading} error={analysis.error} />
    {!analysis.loading && analysis.data ? <><Report rep={analysis.data} full={false} /><button className="btn ghost" onClick={() => go('review')}>See full review →</button></>
      : !analysis.loading && !analysis.error && <Empty title="Start with a username" text="Run a quick analysis to see your overview here." />}
    <Card title="Explore"><div className="tiles">{tiles.map(([k, I, t, d]) => (<button key={k} className="tile" onClick={() => go(k)}><I size={20} /><b>{t}</b><span>{d}</span></button>))}</div></Card></>)
}
