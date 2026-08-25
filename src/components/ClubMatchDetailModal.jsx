import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TierBadge, localeOf, resultState, formatKickoff } from './MatchCard.jsx'
import { getClubForm, getClubStandings } from '../api.js'
import { clubLeagueName } from '../clubLeagues.js'

function pct(p) { return p == null ? 0 : Math.round(p * 100) }
function shortName(name) {
  if (!name) return ''
  return name.replace(/^(FC|CF|AFC|CD|SC|AC|SS|SV|VfL|VfB|1\.?)\s+/i, '').trim()
}

// rejilla de marcadores exactos por Poisson independiente sobre el xG del modelo
function scoreGrid(xh, xa) {
  if (xh == null || xa == null) return {}
  const fact = (n) => { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r }
  const pois = (k, l) => Math.exp(-l) * l ** k / fact(k)
  const N = 6
  const grid = {}; let s = 0
  for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) { const v = pois(i, xh) * pois(j, xa); grid[`${i}-${j}`] = v; s += v }
  for (const k in grid) grid[k] /= s
  return grid
}

function ProbRow({ label, value, type, hit }) {
  return (
    <div className={`prob-row${hit ? ' hit' : ''}`}>
      <span className="pk" title={label}>{label}</span>
      <div className={`bar ${type}`}><span style={{ width: `${pct(value)}%` }} /></div>
      <span className="pv">{pct(value)}%</span>
    </div>
  )
}

function TeamBlock({ name, crest, xg }) {
  const { t } = useTranslation()
  return (
    <div className="team">
      {crest ? <img className="crest" src={crest} alt={name} /> : <div className="crest crest-ph" />}
      <div className="name">{name}</div>
      <div className="xg">{t('match.xg')} <b>{xg == null ? '—' : Number(xg).toFixed(2)}</b></div>
    </div>
  )
}

function ScoreMatrix({ m }) {
  const { t } = useTranslation()
  const grid = scoreGrid(m.xg_home, m.xg_away)
  const entries = Object.entries(grid)
  if (entries.length === 0) return null

  const played = m.actual_home_score != null && m.actual_away_score != null
  const aH = m.actual_home_score, aA = m.actual_away_score

  // rango: hasta donde haya prob relevante (>=0.4%) + previsto + real, tope 6
  let maxH = m.predicted_home_score || 0, maxA = m.predicted_away_score || 0, maxP = 0
  for (const [k, v] of entries) {
    const [h, a] = k.split('-').map(Number)
    if (v >= 0.004) { if (h > maxH) maxH = h; if (a > maxA) maxA = a }
    if (v > maxP) maxP = v
  }
  if (played) { maxH = Math.max(maxH, aH); maxA = Math.max(maxA, aA) }
  maxH = Math.min(Math.max(maxH, 3), 6); maxA = Math.min(Math.max(maxA, 3), 6)

  const cell = (h, a) => {
    const v = grid[`${h}-${a}`] || 0
    const alpha = maxP > 0 ? v / maxP : 0
    const isPred = h === m.predicted_home_score && a === m.predicted_away_score
    const isActual = played && h === aH && a === aA
    return (
      <td key={a} className={`mx-cell${isPred ? ' pred' : ''}${isActual ? ' actual' : ''}`}
          style={{ background: `rgba(0,201,167,${(0.05 + 0.8 * alpha).toFixed(3)})` }}
          title={`${h}–${a}: ${(v * 100).toFixed(1)}%`}>
        {v >= 0.005 ? `${(v * 100).toFixed(0)}%` : ''}
      </td>
    )
  }

  return (
    <>
      <div className="matrix-wrap">
        <div className="mx-axis-away">{shortName(m.away_team)} {t('modal.goals')} →</div>
        <table className="score-matrix">
          <thead>
            <tr>
              <th className="mx-corner"></th>
              {Array.from({ length: maxA + 1 }, (_, a) => <th key={a} className="mx-head">{a}</th>)}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxH + 1 }, (_, h) => (
              <tr key={h}>
                <th className="mx-head">{h}</th>
                {Array.from({ length: maxA + 1 }, (_, a) => cell(h, a))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mx-axis-home"><span>{shortName(m.home_team)} {t('modal.goals')} ↓</span></div>
      </div>
      <div className="mx-legend">
        <span className="lg lg-pred">{t('modal.legendPredicted')}</span>
        {played && <span className="lg lg-actual">{t('modal.legendActual')}</span>}
      </div>
    </>
  )
}

function OverUnder({ m }) {
  const { t } = useTranslation()
  const grid = scoreGrid(m.xg_home, m.xg_away)
  if (Object.keys(grid).length === 0) return null
  const lines = [0.5, 1.5, 2.5, 3.5, 4.5, 5.5]
  const played = m.actual_home_score != null && m.actual_away_score != null
  const total = played ? m.actual_home_score + m.actual_away_score : null
  const rows = lines.map((L) => {
    let over = 0
    for (const [k, v] of Object.entries(grid)) {
      const [h, a] = k.split('-').map(Number)
      if (h + a > L) over += v
    }
    return { line: L, over, under: 1 - over }
  })
  return (
    <div className="modal-section">
      <h4>{t('clubs.goalLines')}</h4>
      <table className="ou-table">
        <thead>
          <tr><th>{t('clubs.colLine')}</th><th>{t('clubs.colOver')}</th><th>{t('clubs.colUnder')}</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const hit = played ? (total > r.line ? 'over' : 'under') : null
            return (
              <tr key={r.line}>
                <td className="ou-line">{r.line.toFixed(1)}</td>
                <td className={`${r.over > 0.5 ? 'ou-fav' : ''}${hit === 'over' ? ' ou-hit' : ''}`}>{pct(r.over)}%</td>
                <td className={`${r.under > 0.5 ? 'ou-fav' : ''}${hit === 'under' ? ' ou-hit' : ''}`}>{pct(r.under)}%</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function TeamForm({ teamId, before, name }) {
  const { t } = useTranslation()
  const [form, setForm] = useState(null)
  useEffect(() => {
    let alive = true
    if (teamId) getClubForm({ team: teamId, before, limit: 5 }).then((f) => { if (alive) setForm(f) }).catch(() => setForm([]))
    return () => { alive = false }
  }, [teamId, before])

  return (
    <div className="form-col">
      <div className="form-team">{name}</div>
      {form == null ? <div className="muted-cell">…</div>
        : form.length === 0 ? <div className="muted-cell">{t('clubs.noForm')}</div>
        : form.map((x) => (
          <div className="form-item" key={x.match_id}>
            <span className={`form-res r-${x.result}`}>{t(`clubs.form${x.result}`)}</span>
            <span className="form-score">{x.gf}<i>–</i>{x.ga}</span>
            {x.opponent_crest && <img className="form-crest" src={x.opponent_crest} alt="" loading="lazy" />}
            <span className="form-opp" title={x.opponent}>{shortName(x.opponent)}</span>
            <span className="form-ha">{x.is_home ? t('clubs.homeShort') : t('clubs.awayShort')}</span>
          </div>
        ))}
    </div>
  )
}

// Posición en la tabla de ambos equipos + goles y dificultad de calendario.
// Se nutre de /api/clubs/standings (misma fuente que la pestaña Clasificación).
// Valor de plantilla en millones de euros. Siempre en "M €" (no se usa "B"/"MM":
// billón es 10^12 en español y 10^9 en inglés, así que confundiría según el idioma).
function fmtValue(eur, locale) {
  if (eur == null) return '–'
  const m = eur / 1e6
  const dec = m >= 100 ? 0 : m >= 10 ? 1 : 2
  return `${m.toLocaleString(locale, { minimumFractionDigits: dec, maximumFractionDigits: dec })} M €`
}

// "3º" en español, "3rd" en inglés (i18next no trae ordinales sin plugin).
function ordinal(p, lang) {
  if (p == null) return '–'
  if (lang !== 'en') return `${p}º`
  const d = p % 10, c = p % 100
  if (d === 1 && c !== 11) return `${p}st`
  if (d === 2 && c !== 12) return `${p}nd`
  if (d === 3 && c !== 13) return `${p}rd`
  return `${p}th`
}

function TableSpot({ m }) {
  const { t, i18n } = useTranslation()
  const [rows, setRows] = useState(null)
  useEffect(() => {
    let alive = true
    if (m.league_id && m.season_year) {
      getClubStandings({ league: m.league_id, season: m.season_year })
        .then((r) => { if (alive) setRows(r) })
        .catch(() => setRows([]))
    }
    return () => { alive = false }
  }, [m.league_id, m.season_year])

  if (rows == null) return <div className="muted-cell">…</div>
  const h = rows.find((r) => r.team_id === m.home_team_id)
  const a = rows.find((r) => r.team_id === m.away_team_id)
  if (!h || !a || (h.played === 0 && a.played === 0)) {
    return <div className="muted-cell">{t('clubs.tableEmpty')}</div>
  }

  const lang = (i18n.language || 'es').slice(0, 2)
  const ord = (p) => ordinal(p, lang)
  const sos = (r) => (r.sos == null ? '–' : `${r.sos.toFixed(2)} (${ord(r.sos_rank)})`)

  const loc = localeOf(i18n)
  const filas = [
    [t('clubs.stPosition'), ord(h.position), ord(a.position)],
    [t('clubs.abPlayed'), h.played, a.played],
    [t('clubs.abPts'), h.points, a.points],
    [t('clubs.abGF'), h.goals_for, a.goals_for],
    [t('clubs.abGA'), h.goals_against, a.goals_against],
    [t('clubs.sosShort'), sos(h), sos(a)],
  ]
  if (m.home_value_eur != null || m.away_value_eur != null) {
    filas.push([t('clubs.squadValue'),
                fmtValue(m.home_value_eur, loc), fmtValue(m.away_value_eur, loc)])
  }

  return (
    <table className="tbl-spot">
      <thead>
        <tr>
          <th />
          <th>{shortName(m.home_team)}</th>
          <th>{shortName(m.away_team)}</th>
        </tr>
      </thead>
      <tbody>
        {filas.map(([lab, hv, av]) => (
          <tr key={lab}>
            <th scope="row">{lab}</th>
            <td>{hv}</td>
            <td>{av}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function BarStat({ label, value }) {
  return (
    <div className="modal-section">
      <h4>{label}</h4>
      <div className="btts">
        <div className="bar home"><span style={{ width: `${pct(value)}%` }} /></div>
        <span className="btts-val">{pct(value)}%</span>
      </div>
    </div>
  )
}

export default function ClubMatchDetailModal({ m, onClose }) {
  const { t, i18n } = useTranslation()

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  if (!m) return null
  const lgName = clubLeagueName(m.league_id, m.league_name)
  const badge = m.matchday ? `${lgName} · ${t('clubs.matchday')} ${m.matchday}` : lgName
  const { played } = resultState(m)

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label={t('modal.close')}>×</button>

        <div className="modal-head">
          <span className="card-badge">{badge}</span>
          <div className="card-head-right">
            <TierBadge tier={m.tier} />
            <span className="muted">{formatKickoff(m.match_date, localeOf(i18n))}</span>
          </div>
        </div>

        <div className="card-teams modal-teams">
          <TeamBlock name={m.home_team} crest={m.home_crest} xg={m.xg_home} />
          <div className="score">
            {played && <div className="score-cap">{t('match.predicted')}</div>}
            <div className="score-nums">
              {m.predicted_home_score ?? '–'}<span className="dash">—</span>{m.predicted_away_score ?? '–'}
            </div>
          </div>
          <TeamBlock name={m.away_team} crest={m.away_crest} xg={m.xg_away} />
        </div>

        {played && (
          <div className="result-strip">
            <span className="rs-label">{t('match.final')}</span>
            <span className="rs-score">
              {m.actual_home_score}<span className="dash">—</span>{m.actual_away_score}
            </span>
          </div>
        )}

        <div className="probs modal-probs">
          <ProbRow label={shortName(m.home_team)} value={m.prob_home} type="home" />
          <ProbRow label={t('match.draw')} value={m.prob_draw} type="draw" />
          <ProbRow label={shortName(m.away_team)} value={m.prob_away} type="away" />
        </div>

        {m.over25_prob != null && <BarStat label={t('clubs.over25')} value={m.over25_prob} />}
        {m.btts_prob != null && <BarStat label={t('modal.bothTeamsToScore')} value={m.btts_prob} />}

        {(m.xg_home != null && m.xg_away != null) && (
          <div className="modal-section">
            <h4>{t('modal.exactScores')}</h4>
            <ScoreMatrix m={m} />
          </div>
        )}

        {(m.xg_home != null && m.xg_away != null) && <OverUnder m={m} />}

        <div className="modal-section">
          <h4>{t('clubs.tablePosition')}</h4>
          <TableSpot m={m} />
          <p className="tbl-spot-note">{t('clubs.sosNote')}</p>
          {(m.home_value_eur != null || m.away_value_eur != null) && (
            <p className="tbl-spot-note">{t('clubs.squadValueNote')}</p>
          )}
        </div>

        <div className="modal-section">
          <h4>{t('clubs.recentForm')}</h4>
          <div className="form-cols">
            <TeamForm teamId={m.home_team_id} before={m.match_date} name={m.home_team} />
            <TeamForm teamId={m.away_team_id} before={m.match_date} name={m.away_team} />
          </div>
        </div>
      </div>
    </div>
  )
}
