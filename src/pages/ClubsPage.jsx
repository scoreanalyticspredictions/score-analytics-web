import { useEffect, useMemo, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getClubDays, getClubPredictions, getClubLeagues } from '../api.js'
import ClubMatchRow, { ClubRowHead } from '../components/ClubMatchRow.jsx'
import { localeOf } from '../components/MatchCard.jsx'
import { clubLeagueName } from '../clubLeagues.js'
import { buildRegionTree, regionOf, countryOf, flagUrl, langOf } from '../clubRegions.js'

const todayUTC = () => new Date().toISOString().slice(0, 10)
const TIERS = ['A', 'B', 'C', 'D', 'E']
const WIN = 12   // días visibles en la tira

function fmtDay(dateStr, locale) {
  const d = new Date(dateStr + 'T12:00:00Z')
  return d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
}
const wd = (dateStr, locale) => {
  const d = new Date(dateStr + 'T12:00:00Z')
  return { w: d.toLocaleDateString(locale, { weekday: 'short' }), n: d.toLocaleDateString(locale, { day: 'numeric', month: 'short' }) }
}
// arranca en hoy o el próximo día con partidos
function startIdx(days) {
  if (!days.length) return 0
  const today = todayUTC()
  const next = days.findIndex((d) => d.date >= today)
  return next >= 0 ? next : days.length - 1
}

export default function ClubsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const locale = localeOf(i18n)

  const [days, setDays] = useState([])
  const [idx, setIdx] = useState(0)
  const [matches, setMatches] = useState([])
  const [leagues, setLeagues] = useState([])
  const [scope, setScope] = useState({ kind: 'all' })
  const [tierF, setTierF] = useState('all')
  const [openRegs, setOpenRegs] = useState(() => new Set(['europa']))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getClubDays().then((ds) => { setDays(ds); setIdx(startIdx(ds)) }).catch(() => {})
    getClubLeagues().then((ls) => {
      const seen = new Map()
      ls.forEach((l) => { if (!seen.has(l.league_id)) seen.set(l.league_id, { league_id: l.league_id, league_name: l.league_name }) })
      setLeagues([...seen.values()])
    }).catch(() => {})
  }, [])

  const day = days[idx]
  useEffect(() => {
    if (!day) return
    setLoading(true); setTierF('all')
    getClubPredictions({ date: day.date }).then(setMatches).catch(() => setMatches([])).finally(() => setLoading(false))
  }, [day?.date])

  const lang = langOf(i18n)
  const tree = useMemo(() => buildRegionTree(leagues, lang), [leagues, lang])

  const filtered = useMemo(() => matches.filter((m) => {
    if (scope.kind === 'region' && regionOf(m.league_id) !== scope.id) return false
    if (scope.kind === 'country' && countryOf(m.league_id) !== scope.id) return false
    if (tierF !== 'all' && m.tier !== tierF) return false
    return true
  }), [matches, scope, tierF])

  const shownLeagues = new Set(filtered.map((m) => m.league_id))

  // ventana de días para la tira (mantiene el activo visible)
  const winStart = Math.max(0, Math.min(idx - 2, Math.max(0, days.length - WIN)))
  const winDays = days.slice(winStart, winStart + WIN)

  const toggleReg = (key) => setOpenRegs((s) => {
    const n = new Set(s); n.has(key) ? n.delete(key) : n.add(key); return n
  })
  const clickReg = (key) => {
    setOpenRegs((s) => new Set(s).add(key))
    setScope((sc) => (sc.kind === 'region' && sc.id === key ? { kind: 'all' } : { kind: 'region', id: key }))
  }
  const clickCountry = (country) =>
    setScope((sc) => (sc.kind === 'country' && sc.id === country ? { kind: 'all' } : { kind: 'country', id: country }))

  const scopeLabel = scope.kind === 'region'
    ? tree.find((r) => r.key === scope.id)?.label
    : scope.kind === 'country'
      ? tree.flatMap((r) => r.countries).find((c) => c.country === scope.id)?.label
      : null

  return (
    <section className="clubs-page">
      <div className="clubs-layout">
        {/* ---------- SIDEBAR ---------- */}
        <aside className="clubs-side">
          <div className="cs-title">{t('clubs.byRegion', { defaultValue: 'Clubes por región' })}</div>
          <div className={`cs-item${scope.kind === 'all' ? ' sel' : ''}`} onClick={() => setScope({ kind: 'all' })}>
            <span className="ic">🌐</span><span className="nm">{t('clubs.allLeagues')}</span>
          </div>

          {tree.map((r) => {
            const open = openRegs.has(r.key)
            const selReg = scope.kind === 'region' && scope.id === r.key
            return (
              <div className={`cs-reg${open ? ' open' : ''}`} key={r.key}>
                <div className={`cs-reghd${selReg ? ' sel' : ''}`}>
                  <span className="chev" onClick={(e) => { e.stopPropagation(); toggleReg(r.key) }}>▶</span>
                  <span className="ic">{r.ic}</span>
                  <span className="nm" onClick={() => clickReg(r.key)}>{r.label}</span>
                </div>
                <div className="cs-body">
                  {r.countries.map((c) => {
                    const selC = scope.kind === 'country' && scope.id === c.country
                    return (
                      <div key={c.country}>
                        <div className={`cs-ctry${selC ? ' sel' : ''}`} onClick={() => clickCountry(c.country)}>
                          {c.code
                            ? <img className="cs-fl" src={flagUrl(c.code)} alt="" loading="lazy" />
                            : <span className="cs-fl cs-fl-ph" />}
                          <span className="cn">{c.label}</span>
                        </div>
                        {c.leagues.map((l) => (
                          <div className="cs-lg" key={l.league_id} onClick={() => navigate(`/clubs/liga/${l.league_id}`)}>
                            {clubLeagueName(l.league_id, l.league_name)}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </aside>

        {/* ---------- BOARD ---------- */}
        <div className="clubs-board">
          {/* slicer: tira de días */}
          <div className="dayslicer">
            <button className="ds-arw" disabled={idx <= 0} onClick={() => setIdx((i) => Math.max(0, i - 1))} aria-label={t('clubs.prevDay')}>◀</button>
            <div className="ds-days">
              {winDays.map((d) => {
                const gi = winStart + winDays.indexOf(d)
                const parts = wd(d.date, locale)
                return (
                  <button key={d.date} className={`daypill${gi === idx ? ' on' : ''}`} onClick={() => setIdx(gi)}>
                    <span className="dw">{parts.w}</span><span className="dn">{parts.n}</span><span className="dct">{d.matches}</span>
                  </button>
                )
              })}
            </div>
            <button className="ds-arw" disabled={idx >= days.length - 1} onClick={() => setIdx((i) => Math.min(days.length - 1, i + 1))} aria-label={t('clubs.nextDay')}>▶</button>
          </div>

          <div className="board-daylabel">{day ? fmtDay(day.date, locale) : '—'}</div>

          {/* slicer: tier + scope */}
          <div className="board-controls">
            <div className="tierseg">
              <span className="seg-label">{t('filters.tier')}</span>
              <button className={tierF === 'all' ? 'on' : ''} onClick={() => setTierF('all')}>{t('filters.allTiers')}</button>
              {TIERS.map((tr) => (
                <button key={tr} className={`k-${tr}${tierF === tr ? ' on' : ''}`} onClick={() => setTierF(tr)}>{tr}</button>
              ))}
            </div>
            {scopeLabel
              ? <span className="scope-chip">{scopeLabel}<button onClick={() => setScope({ kind: 'all' })} aria-label="✕">✕</button></span>
              : <span className="board-count">{filtered.length} {t('clubs.matchesWord', { defaultValue: 'partidos' })} · {shownLeagues.size} {shownLeagues.size === 1 ? t('clubs.leagueWord', { defaultValue: 'liga' }) : t('clubs.leaguesWord', { defaultValue: 'ligas' })}</span>}
          </div>

          {loading ? <p className="muted-cell">{t('clubs.loading')}</p>
            : filtered.length === 0 ? <p className="muted-cell">{t('clubs.noMatchesFilter')}</p>
            : (
              <div className="match-table"><div className="match-table-inner">
                <ClubRowHead />
                {filtered.map((m) => <ClubMatchRow key={m.match_id} m={m} />)}
              </div></div>
            )}
        </div>
      </div>
    </section>
  )
}
