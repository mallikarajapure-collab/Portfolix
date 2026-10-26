import { Card, Stat, ProfileSummary, LangChart, YearChart, RepoCard, Rec, ModeBadge, AiPanel, Empty, Note, Form, Status, SkillList } from '../components/ui'
import { Package, Star, GitFork, Users, Activity } from 'lucide-react'

export function Report({ rep, full }) {
  if (rep.empty) return (<><ProfileSummary p={rep.profile} /><Empty title="No public repositories" text="This profile has no public repositories to analyze. Publish a project with a README to get a meaningful report." /></>)
  const f = rep.facts
  return (<>
    <ProfileSummary p={rep.profile} />
    <div className="stats"><Stat label="Public repos" value={f.public_repos} icon={Package} /><Stat label="Stars" value={f.total_stars} icon={Star} /><Stat label="Forks" value={f.total_forks} icon={GitFork} />
      <Stat label="Followers" value={f.followers} icon={Users} /><Stat label="Pushed in 90 days" value={f.updated_last_90_days} icon={Activity} /></div>
    <div className="grid2"><Card title="Language distribution (facts)"><LangChart data={rep.languages} /></Card>
      <Card title="Repository activity (facts)"><YearChart data={rep.activity.by_year} /><Note>Based on last-push year of {f.original_repos} original repositories.</Note></Card></div>
    {full && <>
      <ModeBadge d={rep} /><AiPanel d={rep} />
      <Card title="Documentation signals (heuristic)"><div className="bars">{[['Descriptions', rep.documentation.with_description], ['Topics', rep.documentation.with_topics], ['Live demo links', rep.documentation.with_homepage]].map(([l, v]) => (
        <div key={l}><span>{l} <b>{v}%</b></span><div className="bar"><i style={{ width: v + '%' }} /></div></div>))}</div>
        <Note>{rep.documentation_signal_score.label}: <b>{rep.documentation_signal_score.value}/100</b></Note></Card>
      <div className="grid2"><Card title="Identified strengths (heuristic)">{rep.strengths.length ? <ul className="list ok-l">{rep.strengths.map((s) => <li key={s}>{s}</li>)}</ul> : <p className="muted">No clear strengths detected from metadata alone.</p>}</Card>
        <Card title="Weaknesses & missing info (heuristic)">{rep.weaknesses.length ? <ul className="list warn-l">{rep.weaknesses.map((s) => <li key={s}>{s}</li>)}</ul> : <p className="muted">No obvious gaps found.</p>}</Card></div>
      <Card title="Skill signals from metadata"><SkillList matched={Object.entries(rep.skills).map(([key, v]) => ({ key, label: v.label, weight: '', evidence: v.repos.slice(0, 3) }))} /></Card>
      <Card title="Recommendations">{rep.recommendations.map((r) => <Rec key={r.title} r={r} />)}</Card>
      <h3 className="h-sec">Repositories</h3><div className="repos">{rep.repos.map((r) => <RepoCard key={r.name} r={r} />)}</div></>}
    <Note>{rep.disclaimer}</Note></>)
}

export default function Review({ username, setUsername, analysis }) {
  return (<><h1>GitHub Portfolio Review</h1><p className="lead">Analyze any public profile — no target role needed.</p>
    <Form username={username} setUsername={setUsername} loading={analysis.loading} onSubmit={() => analysis.run(username.trim())} cta="Analyze portfolio" />
    <Status loading={analysis.loading} error={analysis.error} />
    {!analysis.loading && analysis.data && <Report rep={analysis.data} full />}
    {!analysis.loading && !analysis.data && !analysis.error && <Empty title="No report yet" text="Enter a username above to generate a portfolio report." />}</>)
}
