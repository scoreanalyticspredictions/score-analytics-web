import { useState } from 'react'
import { Link } from 'react-router-dom'
import MatchDetailModal from './MatchDetailModal.jsx'
import { teamCode } from '../teamCodes.js'
import WeatherIcon from './WeatherIcon.jsx'

const TIER_DESC = {
  A: 'Strong favorite', B: 'Clear favorite', C: 'Draw-leaning',
  D: 'Slight edge', E: 'Toss-up',
}

function pct(p) { return p == null ? 0 : Math.round(p * 100) }

function formatKickoff(ts) {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch { return ts }
}

// Pie de tarjeta: sede + clima/temperatura (si existen) a la izquierda, fecha a la derecha.
export function MatchFooter({ m }) {
  const hasEnv = m.venue || m.weather || m.temp_c != null
  return (
    <div className="card-foot">
      <div className="foot-venue">
        {m.weather && <WeatherIcon kind={m.weather} />}
        {m.temp_c != null && <span className="temp">{Math.round(m.temp_c)}°C</span>}
        {m.venue && <span className="venue" title={m.venue}>{m.venue}</span>}
        {!hasEnv && <span className="venue muted-cell">Venue TBD</span>}
      </div>
      <span className="foot-date">{formatKickoff(m.match_date)}</span>
    </div>
  )
}

function ProbRow({ label, value, type }) {
  return (
    <div className="prob-row">
      <span className="pk">{label}</span>
      <div className={`bar ${type}`}><span style={{ width: `${pct(value)}%` }} /></div>
      <span className="pv">{pct(value)}%</span>
    </div>
  )
}

function Team({ name, flag, xg }) {
  return (
    <div className="team">
      {flag ? <img src={flag} alt={name} loading="lazy" /> : <div style={{ width: 38, height: 26 }} />}
      <div className="name">{name}</div>
      <div className="xg">xG <b>{xg == null ? '—' : Number(xg).toFixed(2)}</b></div>
    </div>
  )
}

export function TierBadge({ tier }) {
  if (!tier) return null
  const desc = TIER_DESC[tier]
  return (
    <Link
      to="/about#tiers"
      className={`tier-badge tier-link tier-${tier}`}
      title={desc ? `${desc} — click to learn more` : 'Click to learn more'}
      onClick={(e) => e.stopPropagation()}
    >
      Tier {tier}
    </Link>
  )
}

export default function MatchCard({ m, compact = false }) {
  const [open, setOpen] = useState(false)
  const badge = m.group_name ? `${m.stage} · ${m.group_name}` : m.stage

  return (
    <>
      <div
        className={`card clickable${compact ? ' compact' : ''}`}
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
            {m.predicted_home_score ?? '–'}<span className="dash">—</span>{m.predicted_away_score ?? '–'}
          </div>
          <Team name={m.away_team} flag={m.away_flag} xg={m.xg_away} />
        </div>

        {!compact && (
          <div className="probs">
            <ProbRow label={teamCode(m.home_team)} value={m.prob_home} type="home" />
            <ProbRow label="Draw" value={m.prob_draw} type="draw" />
            <ProbRow label={teamCode(m.away_team)} value={m.prob_away} type="away" />
          </div>
        )}

        <MatchFooter m={m} />
      </div>

      {open && <MatchDetailModal m={m} onClose={() => setOpen(false)} />}
    </>
  )
}
