import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getClubPredictions, getClubStandings, getClubProjection } from '../api.js'
import ClubMatchRow, { ClubRowHead } from '../components/ClubMatchRow.jsx'
import { localeOf } from '../components/MatchCard.jsx'
import { clubLeagueName } from '../clubLeagues.js'
import { countryMeta, LEAGUE_COUNTRY, flagUrl, pickLabel, langOf } from '../clubRegions.js'

const SEASON = 2026   // temporada actual
const pctTxt = (p) => (p == null ? '—' : p * 100 < 1 ? '<1%' : `${Math.round(p * 100)}%`)

// Clasificación en vivo (PJ·G·E·P·GF·GC·DG·Pts). P(campeón) llega en el Bloque 3 (simulación).
function StandingsTable({ rows, champ }) {
  const { t } = useTranslation()
  const n = rows.length
  const anyPlayed = rows.some((r) => r.played > 0)   // pretemporada: sin líder/descenso
  return (
    <div className="cl-stand-wrap">
      <table className="cl-stand">
        <thead>
          <tr>
            <th>#</th>
            <th className="l">{t('clubs.stTeam', { defaultValue: 'Equipo' })}</th>
            <th title={t('clubs.stPlayed', { defaultValue: 'Jugados' })}>{t('clubs.abPlayed', { defaultValue: 'PJ' })}</th>
            <th title={t('clubs.stWon', { defaultValue: 'Ganados' })}>{t('clubs.abWon', { defaultValue: 'G' })}</th>
            <th title={t('clubs.stDrawn', { defaultValue: 'Empatados' })}>{t('clubs.abDrawn', { defaultValue: 'E' })}</th>
            <th title={t('clubs.stLost', { defaultValue: 'Perdidos' })}>{t('clubs.abLost', { defaultValue: 'P' })}</th>
            <th title={t('clubs.stGF', { defaultValue: 'Goles a favor' })}>{t('clubs.abGF', { defaultValue: 'GF' })}</th>
            <th title={t('clubs.stGC', { defaultValue: 'Goles en contra' })}>{t('clubs.abGA', { defaultValue: 'GC' })}</th>
            <th title={t('clubs.stGD', { defaultValue: 'Diferencia de goles' })}>{t('clubs.abGD', { defaultValue: 'DG' })}</th>
            <th title={t('clubs.stPts', { defaultValue: 'Puntos' })}>{t('clubs.abPts', { defaultValue: 'Pts' })}</th>
            <th title={t('clubs.sosHelp')}>{t('clubs.sosShort')}</th>
            <th title={t('clubs.stChamp', { defaultValue: 'Probabilidad de ganar la liga' })}>{t('clubs.stChampShort', { defaultValue: 'P(campeón)' })}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const zone = !anyPlayed ? '' : r.position === 1 ? 'zone-top' : r.position > n - 3 ? 'zone-rel' : ''
            return (
              <tr key={r.team_id}>
                <td className={`pos ${zone}`}>{r.position}</td>
                <td className="l">
                  <div className="st-tm">
                    {r.crest && <img src={r.crest} alt="" loading="lazy" />}
                    <span>{r.team_name}</span>
                  </div>
                </td>
                <td>{r.played}</td><td>{r.won}</td><td>{r.drawn}</td><td>{r.lost}</td>
                <td>{r.goals_for}</td><td>{r.goals_against}</td>
                <td>{r.goal_diff > 0 ? '+' : ''}{r.goal_diff}</td>
                <td className="pts">{r.points}</td>
                <td className="sos-cell" title={r.sos_rank ? t('clubs.sosRankTip', { rank: r.sos_rank }) : ''}>
                  {r.sos == null ? '–' : r.sos.toFixed(2)}
                </td>
                <td className="champ-cell">{champ ? pctTxt(champ[r.team_id]) : '…'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Pestaña Proyección: odds de campeón + posición final más probable (Monte Carlo).
function ProjectionView({ proj }) {
  const { t } = useTranslation()
  const rows = proj?.rows || []
  if (rows.length < 2) {
    return (
      <div className="cl-soon">
        <div className="cl-soon-ic">🔮</div>
        <h3>{t('clubs.tabProjection', { defaultValue: 'Proyección' })}</h3>
        <p>{t('clubs.projEmpty', { defaultValue: 'La proyección arranca cuando la temporada tenga partidos jugados.' })}</p>
      </div>
    )
  }
  const N = rows.length
  const top = rows.slice(0, Math.min(10, N))          // API ya viene ordenada por P(campeón) desc
  const maxc = top[0].champion || 1
  const posRows = [...rows].sort((a, b) => a.modal_position - b.modal_position || b.champion - a.champion)
  const maxd = Math.max(...rows.flatMap((r) => r.positions), 0.0001)
  const isPlayoff = proj.format === 'playoff'
  const isSpecial = proj.format === 'special'
  const oddsTitle = isSpecial
    ? t('clubs.projTitleRegLeader', { defaultValue: 'Odds de liderar la fase regular' })
    : t('clubs.projTitleOdds', { defaultValue: 'Odds de ganar la liga' })
  return (
    <>
      {proj.note && <div className="cl-note-box">⚠ {proj.note}</div>}
      {isPlayoff && (
        <div className="cl-fmt-badge">🏆 {t('clubs.titleVia', {
          defaultValue: 'Título por {{fmt}} — P(campeón) incluye la post-temporada',
          fmt: proj.format_label })}</div>
      )}
      <h3 className="cl-sec-h">{oddsTitle}</h3>
      <div className="proj-odds">
        {top.map((r, k) => (
          <div className="po-row" key={r.team_id}>
            <span className="po-rk">{k + 1}</span>
            <span className="po-tm">
              {r.crest && <img src={r.crest} alt="" loading="lazy" />}
              <span>{r.team_name}
                {isPlayoff && r.qualify != null && (
                  <span className="po-sub">{t('clubs.projQualify', { defaultValue: 'clasifica' })} {pctTxt(r.qualify)}</span>
                )}
              </span>
            </span>
            <span className="po-bar"><i style={{ width: `${Math.max(3, r.champion / maxc * 100)}%` }} /></span>
            <span className="po-pc">{pctTxt(r.champion)}</span>
            <span className="po-cu">{r.champion > 0 ? (1 / r.champion).toFixed(1) : '—'}</span>
          </div>
        ))}
      </div>

      <h3 className="cl-sec-h">{t('clubs.projTitlePos', { defaultValue: 'Posición final más probable' })}</h3>
      <div className="proj-pos-wrap">
        <table className="proj-pos">
          <thead>
            <tr>
              <th>{t('clubs.projPos', { defaultValue: 'Pos.' })}</th>
              <th className="l">{t('clubs.stTeam', { defaultValue: 'Equipo' })}</th>
              <th>{t('clubs.projProb', { defaultValue: 'Prob.' })}</th>
              <th className="l">{t('clubs.projDist', { defaultValue: 'Distribución de posiciones (1º → último)' })}</th>
            </tr>
          </thead>
          <tbody>
            {posRows.map((r) => (
              <tr key={r.team_id}>
                <td className="pp-modal">{r.modal_position}º</td>
                <td className="l"><div className="pp-tm">{r.crest && <img src={r.crest} alt="" loading="lazy" />}<span>{r.team_name}</span></div></td>
                <td className="pp-prob">{pctTxt(r.prob_modal)}</td>
                <td><div className="pp-heat">
                  {r.positions.map((v, pos) => (
                    <i key={pos} className={pos + 1 === r.modal_position ? 't' : ''}
                       style={{ opacity: (0.1 + 0.9 * v / maxd).toFixed(2),
                                background: pos === 0 ? 'var(--accent)' : pos >= N - 3 ? 'var(--red-dim)' : 'var(--blue)' }}
                       title={`${pos + 1}º · ${Math.round(v * 100)}%`} />
                  ))}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="cl-stand-note">
        {t('clubs.projNote', {
          defaultValue: 'Proyección por simulación Monte Carlo ({{sims}} temporadas) sobre los {{rem}} partidos que faltan, usando la probabilidad del modelo en cada uno. Se actualiza con cada resultado.',
          sims: proj.sims.toLocaleString(), rem: proj.remaining,
        })}
        {isPlayoff && ' ' + t('clubs.projNotePlayoff', {
          defaultValue: 'Cada temporada simulada incluye la post-temporada ({{fmt}}) según las reglas de la liga; los partidos de playoff se resuelven con un modelo Poisson sobre la fuerza de cada equipo.',
          fmt: proj.format_label })}
      </p>
    </>
  )
}

function dayKey(ts) {
  // agrupa por fecha en horario de México (igual que el backend del tablero)
  try { return new Date(ts).toLocaleDateString('en-CA', { timeZone: 'America/Mexico_City' }) }
  catch { return '' }
}
function dayLabel(key, locale) {
  const d = new Date(key + 'T12:00:00Z')
  return d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short' })
}

export default function ClubLeaguePage() {
  const { leagueId } = useParams()
  const lid = Number(leagueId)
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const initialTab = ['partidos', 'clasif', 'proj'].includes(
    new URLSearchParams(window.location.search).get('tab')) ? new URLSearchParams(window.location.search).get('tab') : 'partidos'
  const [tab, setTab] = useState(initialTab)
  const [matches, setMatches] = useState(null)
  const [standings, setStandings] = useState(null)
  const [projection, setProjection] = useState(null)

  useEffect(() => {
    setMatches(null); setStandings(null); setProjection(null)
    getClubPredictions({ league: lid, season: SEASON }).then(setMatches).catch(() => setMatches([]))
    getClubStandings({ league: lid, season: SEASON }).then(setStandings).catch(() => setStandings([]))
    getClubProjection({ league: lid, season: SEASON }).then(setProjection).catch(() => setProjection({ rows: [] }))
  }, [lid])

  const champMap = useMemo(() => {
    if (!projection?.rows) return null
    const m = {}
    projection.rows.forEach((r) => { m[r.team_id] = r.champion })
    return m
  }, [projection])

  const locale = localeOf(i18n)
  const cm = countryMeta(LEAGUE_COUNTRY[lid])
  const cname = pickLabel(cm, langOf(i18n))
  const leagueName = clubLeagueName(lid, matches?.[0]?.league_name)

  const upcoming = useMemo(() => {
    if (!matches) return []
    return matches
      .filter((m) => m.actual_home_score == null)
      .sort((a, b) => (a.match_date || '').localeCompare(b.match_date || ''))
  }, [matches])

  const byDay = useMemo(() => {
    const g = {}
    upcoming.forEach((m) => { (g[dayKey(m.match_date)] ??= []).push(m) })
    return Object.entries(g)
  }, [upcoming])

  // Se prefiere el tamaño de la clasificación: en competición UEFA viene acotada
  // a la fase de liga (36), mientras que contar equipos sobre todos los partidos
  // incluiría los cientos de las rondas previas y no cuadraría con la tabla.
  const teamCount = useMemo(() => {
    if (standings && standings.length) return standings.length
    const s = new Set()
    ;(matches || []).forEach((m) => { s.add(m.home_team); s.add(m.away_team) })
    return s.size
  }, [matches, standings])

  return (
    <section className="clubs-page club-league">
      <div className="back-link cl-back" onClick={() => navigate('/competitions')} role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') navigate('/competitions') }}>
        ← {t('clubs.allLeaguesBack', { defaultValue: 'Todas las ligas' })}
      </div>

      <div className="cl-hero">
        {cm.c
          ? <img className="cl-flag-img" src={flagUrl(cm.c, 160)} alt={cname} />
          : <div className="cl-flag">🏳️</div>}
        <div className="cl-htx">
          <h1>{leagueName || '—'}</h1>
          <div className="cl-country"><b>{cname}</b> · {t('clubs.season', { defaultValue: 'Temporada' })} {SEASON} · Elo-AD</div>
        </div>
        <div className="cl-chips">
          <div className="cl-chip"><b>{teamCount || '—'}</b><span>{t('clubs.teams', { defaultValue: 'Equipos' })}</span></div>
          <div className="cl-chip"><b>{upcoming.length}</b><span>{t('clubs.upcomingShort', { defaultValue: 'Próximos' })}</span></div>
        </div>
      </div>

      <div className="cl-tabs">
        <button className={tab === 'partidos' ? 'on' : ''} onClick={() => setTab('partidos')}>
          {t('clubs.tabMatches', { defaultValue: 'Partidos' })}
        </button>
        <button className={tab === 'clasif' ? 'on' : ''} onClick={() => setTab('clasif')}>
          {t('clubs.tabStandings', { defaultValue: 'Clasificación' })}
        </button>
        <button className={tab === 'proj' ? 'on' : ''} onClick={() => setTab('proj')}>
          {t('clubs.tabProjection', { defaultValue: 'Proyección' })}
        </button>
      </div>

      {tab === 'partidos' && (
        matches == null ? <p className="muted-cell">{t('clubs.loading')}</p>
        : byDay.length === 0 ? <p className="muted-cell">{t('clubs.noUpcoming', { defaultValue: 'Sin próximos partidos.' })}</p>
        : (
          <div className="match-table"><div className="match-table-inner">
            <ClubRowHead />
            {byDay.map(([key, ms]) => (
              <div key={key}>
                <div className="cl-dayband">{dayLabel(key, locale)}</div>
                {ms.map((m) => <ClubMatchRow key={m.match_id} m={m} />)}
              </div>
            ))}
          </div></div>
        )
      )}

      {tab === 'clasif' && (
        standings == null ? <p className="muted-cell">{t('clubs.loading')}</p>
        : standings.length === 0 ? (
          <div className="cl-soon">
            <div className="cl-soon-ic">📊</div>
            <h3>{t('clubs.tabStandings', { defaultValue: 'Clasificación' })}</h3>
            <p>{t('clubs.standingsEmpty', { defaultValue: 'La temporada aún no tiene partidos jugados — la clasificación aparecerá al arrancar la jornada 1.' })}</p>
          </div>
        ) : (
          <>
            <StandingsTable rows={standings} champ={champMap} />
            <p className="cl-stand-note">{t('clubs.standingsNote', { defaultValue: 'Clasificación real de la temporada, actualizada con cada partido jugado. P(campeón) por simulación del modelo sobre los partidos que faltan.' })}</p>
          </>
        )
      )}

      {tab === 'proj' && (
        projection == null ? <p className="muted-cell">{t('clubs.loading')}</p>
        : <ProjectionView proj={projection} />
      )}
    </section>
  )
}
