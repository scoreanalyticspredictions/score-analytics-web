import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getPredictions, getPostmortem, getSummary } from '../api.js'
import SummaryBar from '../components/SummaryBar.jsx'
import FilterBar from '../components/FilterBar.jsx'
import MatchCard from '../components/MatchCard.jsx'
import PostMortemTable from '../components/PostMortemTable.jsx'
import TierStats from '../components/TierStats.jsx'

export default function MatchesPage({ summary }) {
  const { t } = useTranslation()
  const [postmortem, setPostmortem] = useState([])
  const [predictions, setPredictions] = useState([])
  const [filteredSummary, setFilteredSummary] = useState(null)
  const [filters, setFilters] = useState({ stage: '', group: '', tier: '', upcoming: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { getPostmortem().then(setPostmortem).catch(() => {}) }, [])

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

      {!loading && predictions.length > 0 && (
        <div className="matches">
          {predictions.map((m) => <MatchCard key={m.fixture_id} m={m} />)}
        </div>
      )}

      <PostMortemTable rows={postmortem} />
    </>
  )
}
