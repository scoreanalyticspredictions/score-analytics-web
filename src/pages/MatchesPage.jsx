import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getPredictions, getSummary } from '../api.js'
import SummaryBar from '../components/SummaryBar.jsx'
import FilterBar from '../components/FilterBar.jsx'
import MatchCard, { buildTeamMaxRank } from '../components/MatchCard.jsx'
import TierStats from '../components/TierStats.jsx'

export default function MatchesPage({ summary }) {
  const { t } = useTranslation()
  const [predictions, setPredictions] = useState([])
  const [filteredSummary, setFilteredSummary] = useState(null)
  const [filters, setFilters] = useState({ stage: '', group: '', tier: '', upcoming: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    getPredictions(filters)
      .then((data) => { setPredictions(data); setError(null) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
    // summary filtrado: los 4 recuadros + tabla de tiers responden a los filtros
    getSummary(filters).then(setFilteredSummary).catch(() => {})
  }, [filters])

  // opciones del dropdown de tiers desde el summary GLOBAL (no el filtrado),
  // para que el selector no se colapse al filtrar por un tier.
  const tierOptions = (summary?.by_tier || []).map((t) => t.tier)
  // mientras carga el filtrado, cae al global para no parpadear vacío
  const shownSummary = filteredSummary || summary
  // mapa equipo->ronda para resolver "quién avanzó" en empates por penales
  const teamMaxRank = buildTeamMaxRank(predictions)
  // separa por jugar / ya jugados (la API ya los entrega en ese orden)
  const upcomingMatches = predictions.filter((m) => m.actual_home_score == null)
  const completedMatches = predictions.filter((m) => m.actual_home_score != null)

  return (
    <>
      <FilterBar
        filters={filters}
        onChange={setFilters}
        tiers={tierOptions.length ? tierOptions : undefined}
      />
      <SummaryBar summary={shownSummary} />
      <TierStats byTier={shownSummary?.by_tier} />

      {error && <div className="state">{t('matchesPage.error', { error })}</div>}
      {loading && <div className="state">{t('matchesPage.loading')}</div>}
      {!loading && !error && predictions.length === 0 && (
        <div className="state">{t('matchesPage.noMatches')}</div>
      )}

      {!loading && upcomingMatches.length > 0 && (
        <>
          <h2 className="section-title">{t('matchesPage.upcomingTitle')}</h2>
          <div className="matches">
            {upcomingMatches.map((m) => <MatchCard key={m.fixture_id} m={m} teamMaxRank={teamMaxRank} />)}
          </div>
        </>
      )}

      {!loading && completedMatches.length > 0 && (
        <>
          <h2 className="section-title matches-divider">{t('matchesPage.completedTitle')}</h2>
          <div className="matches">
            {completedMatches.map((m) => <MatchCard key={m.fixture_id} m={m} teamMaxRank={teamMaxRank} />)}
          </div>
        </>
      )}
    </>
  )
}
