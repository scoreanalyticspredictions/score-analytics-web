function pct(p) { return p == null ? 0 : Math.round(p * 100) }

function formatKickoff(ts) {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch { return ts }
}

function ProbRow({ k, value, type }) {
  return (
    <div className="prob-row">
      <span className="pk">{k}</span>
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

export default function MatchCard({ m }) {
  const badge = m.group_name ? `${m.stage} · ${m.group_name}` : m.stage
  return (
    <div className="card">
      <div className="card-head">
        <span className="card-badge">{badge}</span>
        <span>{formatKickoff(m.match_date)}</span>
      </div>

      <div className="card-teams">
        <Team name={m.home_team} flag={m.home_flag} xg={m.xg_home} />
        <div className="score">
          {m.predicted_home_score ?? '–'}<span className="dash">—</span>{m.predicted_away_score ?? '–'}
        </div>
        <Team name={m.away_team} flag={m.away_flag} xg={m.xg_away} />
      </div>

      <div className="probs">
        <ProbRow k="H" value={m.prob_home} type="home" />
        <ProbRow k="D" value={m.prob_draw} type="draw" />
        <ProbRow k="A" value={m.prob_away} type="away" />
      </div>
    </div>
  )
}
