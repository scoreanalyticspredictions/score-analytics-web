import { useEffect, useState } from 'react'
import { getSummary, getPredictions, getPostmortem } from './api.js'
import Header from './components/Header.jsx'
import SummaryBar from './components/SummaryBar.jsx'
import FilterBar from './components/FilterBar.jsx'
import MatchCard from './components/MatchCard.jsx'
import PostMortemTable from './components/PostMortemTable.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  const [summary, setSummary] = useState(null)
  const [postmortem, setPostmortem] = useState([])
  const [predictions, setPredictions] = useState([])
  const [filters, setFilters] = useState({ stage: '', group: '', upcoming: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // summary + post-mortem una sola vez
  useEffect(() => {
    getSummary().then(setSummary).catch((e) => setError(e.message))
    getPostmortem().then(setPostmortem).catch(() => {})
  }, [])

  // predicciones: se refetchean cada vez que cambia un filtro
  useEffect(() => {
    setLoading(true)
    getPredictions(filters)
      .then((data) => { setPredictions(data); setError(null) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [filters])

  // "Current Stage" = la fase del próximo partido por jugarse
  const currentStage =
    predictions.find((m) => new Date(m.match_date) >= new Date())?.stage ||
    predictions[0]?.stage ||
    'Group Stage'

  return (
    <>
      <Header lastUpdated={summary?.last_updated} />

      <main className="container">
        <SummaryBar summary={summary} currentStage={currentStage} />

        <FilterBar filters={filters} onChange={setFilters} />

        {error && <div className="state">Could not load data: {error}</div>}
        {loading && <div className="state">Loading predictions…</div>}
        {!loading && !error && predictions.length === 0 && (
          <div className="state">No matches for the selected filters.</div>
        )}

        {!loading && predictions.length > 0 && (
          <div className="matches">
            {predictions.map((m) => <MatchCard key={m.fixture_id} m={m} />)}
          </div>
        )}

        <PostMortemTable rows={postmortem} />
      </main>

      <Footer />
    </>
  )
}
