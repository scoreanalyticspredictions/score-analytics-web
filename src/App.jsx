import { useEffect, useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import ReactGA from 'react-ga4'
import { getSummary } from './api.js'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import KofiButton from './components/KofiButton.jsx'
import MatchesPage from './pages/MatchesPage.jsx'
import GroupsPage from './pages/GroupsPage.jsx'
import TeamsPage from './pages/TeamsPage.jsx'
import TeamPage from './pages/TeamPage.jsx'
import AboutPage from './pages/AboutPage.jsx'

export default function App() {
  const [summary, setSummary] = useState(null)
  const location = useLocation()

  // summary se usa en la home (SummaryBar)
  useEffect(() => { getSummary().then(setSummary).catch(() => {}) }, [])

  // GA4: page view en cada cambio de ruta (solo si GA está inicializado)
  useEffect(() => {
    if (import.meta.env.VITE_GA_ID) {
      ReactGA.send({ hitType: 'pageview', page: location.pathname + location.search })
    }
  }, [location])

  return (
    <>
      <Header lastUpdated={summary?.last_updated} />
      <main className="container">
        <Routes>
          <Route path="/" element={<MatchesPage summary={summary} />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/team/:id" element={<TeamPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
      <Footer />
      <KofiButton floating />
    </>
  )
}
