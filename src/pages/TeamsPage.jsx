import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getTeams } from '../api.js'
import TournamentOddsTable from '../components/TournamentOddsTable.jsx'

export default function TeamsPage() {
  const { t } = useTranslation()
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
      <h2 className="section-title">{t('teamsPage.title')}</h2>
      <p className="page-sub">{t('teamsPage.subtitle')}</p>
      {error && <div className="state">{t('teamsPage.error', { error })}</div>}
      {loading && <div className="state">{t('teamsPage.loading')}</div>}
      {!loading && !error && teams.length > 0 && <TournamentOddsTable teams={teams} />}
    </section>
  )
}
