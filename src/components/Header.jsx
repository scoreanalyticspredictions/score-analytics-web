import { useEffect, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Logo from './Logo.jsx'
import { getTeams } from '../api.js'
import { useTeamName } from '../teamNames.js'

function TeamSearch() {
  const { t } = useTranslation()
  const tn = useTeamName()
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

  const query = q.trim().toLowerCase()
  const matches = query
    ? teams.filter((team) => {
        const en = (team.team_name || '').toLowerCase()
        const loc = tn(team.team_name).toLowerCase()
        return en.includes(query) || loc.includes(query)
      }).slice(0, 8)
    : []

  const go = (team) => { setQ(''); setOpen(false); navigate(`/team/${team.team_id}`) }
  const onKey = (e) => { if (e.key === 'Enter' && matches.length) go(matches[0]) }

  return (
    <div className="team-search" ref={boxRef}>
      <input
        type="text" placeholder={t('header.searchPlaceholder')} value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)} onKeyDown={onKey}
      />
      {open && matches.length > 0 && (
        <ul className="search-results">
          {matches.map((team) => (
            <li key={team.team_id} onClick={() => go(team)}>
              {team.team_flag && <img src={team.team_flag} alt="" />}
              <span>{tn(team.team_name)}</span>
              {team.group_name && (
                <span className="sr-group">{t('header.groupShort', { group: team.group_name })}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function LangToggle() {
  const { i18n } = useTranslation()
  const lang = i18n.resolvedLanguage || i18n.language
  const set = (lng) => i18n.changeLanguage(lng)
  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      <button className={lang === 'en' ? 'active' : ''} onClick={() => set('en')}>EN</button>
      <span className="sep">|</span>
      <button className={lang === 'es' ? 'active' : ''} onClick={() => set('es')}>ES</button>
    </div>
  )
}

export default function Header() {
  const { t } = useTranslation()
  const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`
  return (
    <header className="header">
      <div className="container">
        <div className="header-top">
          <Logo size="lg" />
          <div className="header-right">
            <LangToggle />
            <span className="badge-wc">{t('header.badge')}</span>
          </div>
        </div>
        <div className="header-nav">
          <nav className="nav-links">
            <NavLink to="/" className={linkClass} end>{t('nav.matches')}</NavLink>
            <NavLink to="/groups" className={linkClass}>{t('nav.groups')}</NavLink>
            <NavLink to="/teams" className={linkClass}>{t('nav.teams')}</NavLink>
            <NavLink to="/about" className={linkClass}>{t('nav.about')}</NavLink>
          </nav>
          <TeamSearch />
        </div>
      </div>
    </header>
  )
}
