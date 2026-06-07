import { useEffect, useState } from 'react'
import { getTeams } from '../api.js'
import TournamentOddsTable from '../components/TournamentOddsTable.jsx'

export default function TeamsPage() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getTeams()
      .then((d) => { setTeams(d); setError(null) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section>
      <h2 className="section-title">Tournament Odds — All 48 Teams</h2>
      <p className="page-sub">Probability of reaching each stage. Click a team for its full outlook.</p>
      {error && <div className="state">Could not load teams: {error}</div>}
      {loading && <div className="state">Loading teams…</div>}
      {!loading && !error && teams.length > 0 && <TournamentOddsTable teams={teams} />}
    </section>
  )
}
