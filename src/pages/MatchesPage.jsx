import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getPredictions, getPostmortem } from '../api.js'
import SummaryBar from '../components/SummaryBar.jsx'
import FilterBar from '../components/FilterBar.jsx'
import MatchCard from '../components/MatchCard.jsx'
import PostMortemTable from '../components/PostMortemTable.jsx'
import TierStats from '../components/TierStats.jsx'

export default function MatchesPage({ summary }) {
  const { t } = useTranslation()
  const [postmortem, setPostmortem] = useState([])
  const [predictions, setPredictions] = useState([])
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
  }, [filters])

  const currentStage =
    predictions.find((m) => new Date(m.match_date) >= new Date())?.stage ||
    predictions[0]?.stage || 'Group Stage'

  const tierOptions = (summary?.by_tier || []).map((t) => t.tier)

  return (
    <>
      <SummaryBar summary={summary} currentStage={currentStage} />
      <FilterBar
        filters={filters}
        onChange={setFilters}
        tiers={tierOptions.length ? tierOptions : undefined}
      />

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

      <TierStats byTier={summary?.by_tier} />
      <PostMortemTable rows={postmortem} />
    </>
  )
}
