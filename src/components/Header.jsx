import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import Logo from './Logo.jsx'
import { getTeams } from '../api.js'

function TeamSearch() {
  const [teams, setTeams] = useState([])
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const boxRef = useRef(null)

  useEffect(() => { getTeams().then(setTeams).catch(() => {}) }, [])
  useEffect(() => {
    const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const matches = q.trim()
    ? teams.filter((t) => (t.team_name || '').toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8)
    : []

  const go = (t) => { setQ(''); setOpen(false); navigate(`/team/${t.team_id}`) }

  const onKey = (e) => { if (e.key === 'Enter' && matches.length) go(matches[0]) }

  return (
    <div className="team-search" ref={boxRef}>
      <input
        type="text" placeholder="Search team…" value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)} onKeyDown={onKey}
      />
      {open && matches.length > 0 && (
        <ul className="search-results">
          {matches.map((t) => (
            <li key={t.team_id} onClick={() => go(t)}>
              {t.team_flag && <img src={t.team_flag} alt="" />}
              <span>{t.team_name}</span>
              {t.group_name && <span className="sr-group">Group {t.group_name}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function Header() {
  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`
  return (
    <header className="header">
      <div className="container">
        <div className="header-top">
          <Logo size="lg" />
          <span className="badge-wc">FIFA World Cup 2026</span>
        </div>
        <div className="header-nav">
          <nav className="nav-links">
            <NavLink to="/" className={linkClass} end>Matches</NavLink>
            <NavLink to="/groups" className={linkClass}>Groups</NavLink>
            <NavLink to="/teams" className={linkClass}>Teams</NavLink>
            <NavLink to="/about" className={linkClass}>About</NavLink>
          </nav>
          <TeamSearch />
        </div>
      </div>
    </header>
  )
}
