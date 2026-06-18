import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getTeam, getPhases } from '../api.js'
import MatchCard from '../components/MatchCard.jsx'
import PostMortemTable from '../components/PostMortemTable.jsx'
import PhaseFilter from '../components/PhaseFilter.jsx'
import { useTeamName } from '../teamNames.js'

function pct(p) { return p == null ? 0 : Math.round(p * 100) }

const PHASES = [
  { key: 'prob_round_of_32', label: 'round_of_32' },
  { key: 'prob_round_of_16', label: 'round_of_16' },
  { key: 'prob_quarters', label: 'quarters' },
  { key: 'prob_semis', label: 'semis' },
  { key: 'prob_final', label: 'final' },
  { key: 'prob_champion', label: 'champion' },
]

const POSITIONS = [
  { key: 'prob_1st', label: 'first' },
  { key: 'prob_2nd', label: 'second' },
  { key: 'prob_3rd', label: 'third' },
  { key: 'prob_4th', label: 'fourth' },
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
  const { t } = useTranslation()
  const tn = useTeamName()
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [phases, setPhases] = useState([])
  const [phase, setPhase] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getPhases()
      .then((d) => { setPhases(d.phases || []); setPhase(d.default || 'inicio') })
      .catch(() => { setPhases([]); setPhase('inicio') })
  }, [])

  useEffect(() => {
    if (!phase) return
    setLoading(true)
    getTeam(id, phase)
      .then((d) => { setData(d); setError(null) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, phase])

  if (loading) return <div className="state">{t('teamPage.loading')}</div>
  if (error) return <div className="state">{t('teamPage.error', { error })}</div>
  if (!data) return null

  const team = data.tournament || {}

  return (
    <div className="team-page">
      <Link to="/teams" className="back-link">{t('teamPage.allTeams')}</Link>

      <div className="team-hero">
        {data.team_flag && <img src={data.team_flag} alt={data.team_name} className="hero-flag" />}
        <div>
          <h1>{tn(data.team_name)}</h1>
          {data.group_name && <span className="badge-wc">{t('teamPage.groupBadge', { name: data.group_name })}</span>}
        </div>
      </div>

      <PhaseFilter phases={phases} value={phase} onChange={setPhase} />

      <section className="team-section">
        <h3>{t('teamPage.tournamentOutlook')}</h3>
        <div className="hbars">
          {PHASES.map((p) => (
            <HBar key={p.key} label={t(`phases.${p.label}`)} value={team[p.key]} accent={p.key === 'prob_champion'} />
          ))}
        </div>
      </section>

      <section className="team-section">
        <h3>{t('teamPage.groupStandingOdds')}</h3>
        <div className="hbars">
          {POSITIONS.map((p) => (
            <HBar key={p.key} label={t(`positions.${p.label}`)} value={team[p.key]} accent={p.key === 'prob_1st'} />
          ))}
        </div>
      </section>

      <section className="team-section">
        <h3>{t('teamPage.upcomingMatches')}</h3>
        {data.upcoming && data.upcoming.length > 0 ? (
          <div className="matches">
            {data.upcoming.map((m) => <MatchCard key={m.fixture_id} m={m} compact />)}
          </div>
        ) : <div className="state">{t('teamPage.noUpcoming')}</div>}
      </section>

      {data.results && data.results.length > 0 && (
        <section className="team-section">
          <h3>{t('teamPage.results')}</h3>
          <PostMortemTable rows={data.results} />
        </section>
      )}
    </div>
  )
}
