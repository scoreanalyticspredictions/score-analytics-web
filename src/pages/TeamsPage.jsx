import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getTeams, getPhases } from '../api.js'
import TournamentOddsTable from '../components/TournamentOddsTable.jsx'
import PhaseFilter from '../components/PhaseFilter.jsx'

export default function TeamsPage() {
  const { t } = useTranslation()
  const [teams, setTeams] = useState([])
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
    getTeams(phase)
      .then((d) => { setTeams(d); setError(null) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [phase])

  return (
    <section>
      <h2 className="section-title">{t('teamsPage.title')}</h2>
      <p className="page-sub">{t('teamsPage.subtitle')}</p>
      <PhaseFilter phases={phases} value={phase} onChange={setPhase} />
      {error && <div className="state">{t('teamsPage.error', { error })}</div>}
      {loading && <div className="state">{t('teamsPage.loading')}</div>}
      {!loading && !error && teams.length > 0 && <TournamentOddsTable teams={teams} />}
    </section>
  )
}
