import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MatchDetailModal from './MatchDetailModal.jsx'
import { teamCode } from '../teamCodes.js'
import { useTeamName } from '../teamNames.js'
import WeatherIcon from './WeatherIcon.jsx'

function pct(p) { return p == null ? 0 : Math.round(p * 100) }

export function localeOf(i18n) { return (i18n.resolvedLanguage || i18n.language) === 'es' ? 'es-ES' : 'en-US' }

export function formatKickoff(ts, locale) {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleString(locale, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch { return ts }
}

function ProbRow({ label, value, type, hit }) {
  return (
    <div className={`prob-row${hit ? ' hit' : ''}`}>
      <span className="pk">{label}</span>
      <div className={`bar ${type}`}><span style={{ width: `${pct(value)}%` }} /></div>
      <span className="pv">{pct(value)}%</span>
    </div>
  )
}

function Team({ name, flag, xg }) {
  const { t } = useTranslation()
  const tn = useTeamName()
  return (
    <div className="team">
      {flag ? <img src={flag} alt={name} loading="lazy" /> : <div style={{ width: 38, height: 26 }} />}
      <div className="name">{tn(name)}</div>
      <div className="xg">{t('match.xg')} <b>{xg == null ? '—' : Number(xg).toFixed(2)}</b></div>
    </div>
  )
}

// Barra "to qualify" (quién avanza) para partidos de eliminación directa: una sola
// vía azul del lado del favorito (>50%); el otro lado queda como track vacío.
// Incluye prórroga + penales. Solo si hay datos de qualify.
export function QualifyBar({ m }) {
  const { t } = useTranslation()
  if (m.prob_home_qualify == null || m.prob_away_qualify == null) return null
  const h = pct(m.prob_home_qualify), a = pct(m.prob_away_qualify)
  const homeFav = h >= a
  const fav = homeFav ? h : a
  return (
    <div className="qualify">
      <div className="qualify-head" title={t('match.toQualifyHint')}>{t('match.toQualify')}</div>
      <div className="qualify-bar">
        <span className="q-fill" style={{ width: `${fav}%`, marginLeft: homeFav ? 0 : 'auto' }} />
      </div>
      <div className="qualify-labs">
        <span className="q-l"><b>{teamCode(m.home_team)}</b> {h}%</span>
        <span className="q-l">{a}% <b>{teamCode(m.away_team)}</b></span>
      </div>
    </div>
  )
}

export function TierBadge({ tier }) {
  const { t } = useTranslation()
  if (!tier) return null
  const desc = t(`tiers.${tier}`, { defaultValue: '' })
  return (
    <Link
      to="/about#tiers"
      className={`tier-badge tier-link tier-${tier}`}
      title={desc ? `${desc} — ${t('tiers.learnMore')}` : t('tiers.learnMore')}
      onClick={(e) => e.stopPropagation()}
    >
      {t('tiers.badge', { tier })}
    </Link>
  )
}

export function MatchFooter({ m }) {
  const { t, i18n } = useTranslation()
  const hasEnv = m.venue || m.weather || m.temp_c != null
  return (
    <div className="card-foot">
      <div className="foot-venue">
        {m.weather && <WeatherIcon kind={m.weather} />}
        {m.temp_c != null && <span className="temp">{Math.round(m.temp_c)}°C</span>}
        {m.venue && <span className="venue" title={m.venue}>{m.venue}</span>}
        {!hasEnv && <span className="venue muted-cell">{t('match.venueTBD')}</span>}
      </div>
      <span className="foot-date">{formatKickoff(m.match_date, localeOf(i18n))}</span>
    </div>
  )
}

// outcome real / pronosticado de un partido (cuando ya hay marcador real)
export function outcomeOf(h, a) {
  if (h == null || a == null) return null
  return h > a ? 'home' : h < a ? 'away' : 'draw'
}
// desenlace pronosticado = el del MARCADOR predicho (si el marcador es empate,
// el acierto es el empate). Cae al 1X2 más probable si no hay marcador predicho.
export function predictedOutcome(m) {
  const h = m.predicted_home_score, a = m.predicted_away_score
  if (h != null && a != null) return h > a ? 'home' : h < a ? 'away' : 'draw'
  const o = { home: m.prob_home || 0, draw: m.prob_draw || 0, away: m.prob_away || 0 }
  return Object.keys(o).reduce((b, k) => (o[k] > o[b] ? k : b), 'home')
}
// orden de las rondas de eliminación directa (para saber quién avanzó por penales)
const STAGE_RANK = { 'Round of 32': 1, 'Round of 16': 2, 'Quarter-finals': 3, 'Semi-finals': 4, 'Final': 5 }
export function stageRank(s) { return STAGE_RANK[s] || 0 }
// mapa equipo -> ronda más profunda en la que aparece (un equipo que llega a una
// ronda posterior es el que avanzó de la anterior). Útil para resolver penales.
export function buildTeamMaxRank(matches) {
  const out = {}
  for (const m of matches || []) {
    if (m.group_name) continue
    const r = stageRank(m.stage)
    if (!r) continue
    out[m.home_team] = Math.max(out[m.home_team] || 0, r)
    out[m.away_team] = Math.max(out[m.away_team] || 0, r)
  }
  return out
}
// estado de resultado de un partido -> clases/flags reutilizables (tarjeta y modal)
export function resultState(m, teamMaxRank = null) {
  const played = m.actual_home_score != null && m.actual_away_score != null
  const actualOutcome = played ? outcomeOf(m.actual_home_score, m.actual_away_score) : null
  const correct = played && actualOutcome === predictedOutcome(m)
  const spotOn = played
    && m.predicted_home_score === m.actual_home_score
    && m.predicted_away_score === m.actual_away_score
  // azul: falló el 1X2 a 90' pero acertó quién avanza (solo eliminatoria directa).
  // Se conserva el estilo azul + texto "correct to advance", PERO la marca es ✗
  // (el resultado del partido a 90' fue incorrecto).
  let advance = false
  const hasQual = m.prob_home_qualify != null && m.prob_away_qualify != null
  if (played && !correct && !spotOn && hasQual) {
    const predAdv = m.prob_home_qualify >= m.prob_away_qualify ? 'home' : 'away'
    let actualAdv = null
    if (m.actual_home_score > m.actual_away_score) actualAdv = 'home'
    else if (m.actual_away_score > m.actual_home_score) actualAdv = 'away'
    else if (teamMaxRank) { // empate (penales): quien aparece en ronda posterior
      const r = stageRank(m.stage)
      if ((teamMaxRank[m.home_team] || 0) > r) actualAdv = 'home'
      else if ((teamMaxRank[m.away_team] || 0) > r) actualAdv = 'away'
    }
    advance = actualAdv != null && actualAdv === predAdv
  }
  const cls = spotOn ? 'result-spoton' : correct ? 'result-correct'
    : advance ? 'result-advance' : played ? 'result-wrong' : ''
  return { played, actualOutcome, correct, spotOn, advance, cls }
}

export default function MatchCard({ m, compact = false, teamMaxRank = null }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const stageLabel = t(`stages.${m.stage}`, { defaultValue: m.stage })
  const badge = m.group_name ? `${stageLabel} · ${m.group_name}` : stageLabel

  // estado del resultado real (si el partido ya se jugó)
  const { played, actualOutcome, correct, spotOn, advance, cls } = resultState(m, teamMaxRank)

  return (
    <>
      <div
        className={`card clickable${compact ? ' compact' : ''}${cls ? ' ' + cls : ''}`}
        onClick={() => setOpen(true)}
        role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') setOpen(true) }}
      >
        <div className="card-head">
          <span className="card-badge">{badge}</span>
          <TierBadge tier={m.tier} />
        </div>

        <div className="card-teams">
          <Team name={m.home_team} flag={m.home_flag} xg={m.xg_home} />
          <div className="score">
            {played && <div className="score-cap">{t('match.predicted')}</div>}
            <div className="score-nums">
              {m.predicted_home_score ?? '–'}<span className="dash">—</span>{m.predicted_away_score ?? '–'}
            </div>
          </div>
          <Team name={m.away_team} flag={m.away_flag} xg={m.xg_away} />
        </div>

        {played && (
          <div className={`result-strip ${spotOn ? 'spoton' : correct ? 'ok' : advance ? 'advance' : 'bad'}`}>
            <span className="rs-label">{t('match.final')}</span>
            <span className="rs-score">
              {m.actual_home_score}<span className="dash">—</span>{m.actual_away_score}
            </span>
            <span className="rs-mark">{spotOn ? '★' : correct ? '✓' : '✗'}</span>
            {spotOn && <span className="rs-tag">{t('match.spotOn')}</span>}
            {advance && <span className="rs-tag">{t('match.advanceCorrect')}</span>}
          </div>
        )}

        {!compact && (
          <div className="probs">
            <ProbRow label={teamCode(m.home_team)} value={m.prob_home} type="home" hit={actualOutcome === 'home'} />
            <ProbRow label={t('match.draw')} value={m.prob_draw} type="draw" hit={actualOutcome === 'draw'} />
            <ProbRow label={teamCode(m.away_team)} value={m.prob_away} type="away" hit={actualOutcome === 'away'} />
          </div>
        )}

        {!compact && <QualifyBar m={m} />}

        <MatchFooter m={m} />
      </div>

      {open && <MatchDetailModal m={m} teamMaxRank={teamMaxRank} onClose={() => setOpen(false)} />}
    </>
  )
}
