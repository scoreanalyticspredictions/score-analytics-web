import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTeam } from '../api.js'
import MatchCard from '../components/MatchCard.jsx'
import PostMortemTable from '../components/PostMortemTable.jsx'

function pct(p) { return p == null ? 0 : Math.round(p * 100) }

const PHASES = [
  { key: 'prob_round_of_32', label: 'Round of 32' },
  { key: 'prob_round_of_16', label: 'Round of 16' },
  { key: 'prob_quarters', label: 'Quarter-finals' },
  { key: 'prob_semis', label: 'Semi-finals' },
  { key: 'prob_final', label: 'Final' },
  { key: 'prob_champion', label: 'Champion' },
]

const POSITIONS = [
  { key: 'prob_1st', label: '1st place' },
  { key: 'prob_2nd', label: '2nd place' },
  { key: 'prob_3rd', label: '3rd place' },
  { key: 'prob_4th', label: '4th place' },
]

function HBar({ label, value, accent }) {
  return (
    <div className="hbar-row">
      <span className="hbar-label">{label}</span>
      <div className="hbar"><span className={accent ? 'accent' : ''} style={{ width: `${pct(value)}%` }} /></div>
      <span className="hbar-val">{value == null ? '—' : `${(value * 100).toFixed(1)}%`}</span>
    </div>
  )
}

export default function TeamPage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    getTeam(id)
      .then((d) => { setData(d); setError(null) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="state">Loading team…</div>
  if (error) return <div className="state">Could not load team: {error}</div>
  if (!data) return null

  const t = data.tournament || {}

  return (
    <div className="team-page">
      <Link to="/teams" className="back-link">← All teams</Link>

      <div className="team-hero">
        {data.team_flag && <img src={data.team_flag} alt={data.team_name} className="hero-flag" />}
        <div>
          <h1>{data.team_name}</h1>
          {data.group_name && <span className="badge-wc">Group {data.group_name}</span>}
        </div>
      </div>

      <section className="team-section">
        <h3>Tournament Outlook</h3>
        <div className="hbars">
          {PHASES.map((p) => (
            <HBar key={p.key} label={p.label} value={t[p.key]} accent={p.key === 'prob_champion'} />
          ))}
        </div>
      </section>

      <section className="team-section">
        <h3>Group Standing Odds</h3>
        <div className="hbars">
          {POSITIONS.map((p) => (
            <HBar key={p.key} label={p.label} value={t[p.key]} accent={p.key === 'prob_1st'} />
          ))}
        </div>
      </section>

      <section className="team-section">
        <h3>Upcoming Matches</h3>
        {data.upcoming && data.upcoming.length > 0 ? (
          <div className="matches">
            {data.upcoming.map((m) => <MatchCard key={m.fixture_id} m={m} compact />)}
          </div>
        ) : <div className="state">No upcoming matches.</div>}
      </section>

      {data.results && data.results.length > 0 && (
        <section className="team-section">
          <h3>Results</h3>
          <PostMortemTable rows={data.results} />
        </section>
      )}
    </div>
  )
}
