import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
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

  // summary se usa en el Header (last updated) y en la home (SummaryBar)
  useEffect(() => { getSummary().then(setSummary).catch(() => {}) }, [])

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
