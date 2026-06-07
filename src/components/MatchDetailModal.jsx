import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { teamCode } from '../teamCodes.js'
import { teamIdByName } from '../teamLookup.js'
import { TierBadge } from './MatchCard.jsx'
import WeatherIcon from './WeatherIcon.jsx'

function pct(p) { return p == null ? 0 : Math.round(p * 100) }

function formatKickoff(ts) {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch { return ts }
}

function ProbRow({ label, value, type, onLabelClick }) {
  return (
    <div className="prob-row">
      {onLabelClick
        ? <button type="button" className="pk pk-link" onClick={onLabelClick} title={`View ${label}`}>{label}</button>
        : <span className="pk">{label}</span>}
      <div className={`bar ${type}`}><span style={{ width: `${pct(value)}%` }} /></div>
      <span className="pv">{pct(value)}%</span>
    </div>
  )
}

function TeamBlock({ name, flag, xg, onClick }) {
  return (
    <div
      className="team team-link" role="button" tabIndex={0}
      onClick={onClick} onKeyDown={(e) => { if (e.key === 'Enter') onClick() }}
      title={`View ${name}`}
    >
      {flag && <img src={flag} alt={name} />}
      <div className="name">{name}</div>
      <div className="xg">xG <b>{xg == null ? '—' : Number(xg).toFixed(2)}</b></div>
    </div>
  )
}

// Matriz de marcadores exactos: filas = goles local, columnas = goles visitante.
function ScoreMatrix({ m }) {
  const grid = m.exact_score_probs || {}
  const entries = Object.entries(grid)
  if (entries.length === 0) return null

  let maxH = 0, maxA = 0, maxP = 0
  for (const [k, v] of entries) {
    const [h, a] = k.split('-').map(Number)
    if (h > maxH) maxH = h
    if (a > maxA) maxA = a
    if (v > maxP) maxP = v
  }
  maxH = Math.min(maxH, 6); maxA = Math.min(maxA, 6)

  const cell = (h, a) => {
    const v = grid[`${h}-${a}`] || 0
    const alpha = maxP > 0 ? v / maxP : 0
    const isPred = h === m.predicted_home_score && a === m.predicted_away_score
    return (
      <td key={a} className={`mx-cell${isPred ? ' pred' : ''}`}
          style={{ background: `rgba(0,201,167,${(0.05 + 0.8 * alpha).toFixed(3)})` }}
          title={`${h}–${a}: ${(v * 100).toFixed(1)}%`}>
        {v >= 0.005 ? `${(v * 100).toFixed(0)}%` : ''}
      </td>
    )
  }

  return (
    <div className="matrix-wrap">
      <div className="mx-axis-away">{teamCode(m.away_team)} goals →</div>
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
      <div className="mx-axis-home"><span>{teamCode(m.home_team)} goals ↓</span></div>
    </div>
  )
}

export default function MatchDetailModal({ m, onClose }) {
  const navigate = useNavigate()

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  if (!m) return null
  const badge = m.group_name ? `${m.stage} · Group ${m.group_name}` : m.stage

  const goTeam = async (name) => {
    const id = await teamIdByName(name)
    if (id) { onClose(); navigate(`/team/${id}`) }
  }

  return (
    <div className="modal-overlay" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        <div className="modal-head">
          <span className="card-badge">{badge}</span>
          <div className="card-head-right">
            <TierBadge tier={m.tier} />
            <span className="muted">{formatKickoff(m.match_date)}</span>
          </div>
        </div>

        <div className="card-teams modal-teams">
          <TeamBlock name={m.home_team} flag={m.home_flag} xg={m.xg_home} onClick={() => goTeam(m.home_team)} />
          <div className="score">
            {m.predicted_home_score ?? '–'}<span className="dash">—</span>{m.predicted_away_score ?? '–'}
          </div>
          <TeamBlock name={m.away_team} flag={m.away_flag} xg={m.xg_away} onClick={() => goTeam(m.away_team)} />
        </div>

        {(m.venue || m.weather || m.temp_c != null) && (
          <div className="modal-venue">
            {m.weather && <WeatherIcon kind={m.weather} size={18} />}
            {m.temp_c != null && <span className="temp">{Math.round(m.temp_c)}°C</span>}
            {m.venue && <span className="venue">{m.venue}</span>}
          </div>
        )}

        <div className="probs modal-probs">
          <ProbRow label={teamCode(m.home_team)} value={m.prob_home} type="home" onLabelClick={() => goTeam(m.home_team)} />
          <ProbRow label="Draw" value={m.prob_draw} type="draw" />
          <ProbRow label={teamCode(m.away_team)} value={m.prob_away} type="away" onLabelClick={() => goTeam(m.away_team)} />
        </div>

        {m.btts_prob != null && (
          <div className="modal-section">
            <h4>Both Teams to Score</h4>
            <div className="btts">
              <div className="bar home"><span style={{ width: `${pct(m.btts_prob)}%` }} /></div>
              <span className="btts-val">{pct(m.btts_prob)}%</span>
            </div>
          </div>
        )}

        {Object.keys(m.exact_score_probs || {}).length > 0 && (
          <div className="modal-section">
            <h4>Exact Score Probabilities</h4>
            <ScoreMatrix m={m} />
          </div>
        )}
      </div>
    </div>
  )
}
