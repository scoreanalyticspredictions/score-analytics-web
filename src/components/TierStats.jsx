// Success rate del modelo por tier de apuesta (A..E).
// Los tiers ordenan los partidos por confianza: A = pick más fuerte.
const TIER_DESC = {
  A: 'Strong favorite', B: 'Clear favorite', C: 'Draw-leaning',
  D: 'Slight edge', E: 'Toss-up',
}

export default function TierStats({ byTier }) {
  if (!byTier || byTier.length === 0) return null
  const anyPlayed = byTier.some((t) => t.completed > 0)

  return (
    <section>
      <h2 className="section-title">Success Rate by Bet Tier</h2>
      <div className="tier-wrap">
        <table className="tier-table">
          <thead>
            <tr>
              <th>Tier</th><th>Profile</th><th>Matches</th><th>Played</th>
              <th>Correct</th><th>Success Rate</th>
            </tr>
          </thead>
          <tbody>
            {byTier.map((t) => (
              <tr key={t.tier}>
                <td><span className={`tier-badge tier-${t.tier}`}>Tier {t.tier}</span></td>
                <td className="muted-cell">{TIER_DESC[t.tier] || '—'}</td>
                <td className="num">{t.total}</td>
                <td className="num">{t.completed}</td>
                <td className="num">{t.completed ? t.correct : '—'}</td>
                <td className="num">
                  {t.accuracy == null
                    ? <span className="muted-cell">—</span>
                    : <b className="tier-acc">{t.accuracy}%</b>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!anyPlayed && (
        <p className="page-sub" style={{ marginTop: 10 }}>
          Success rates fill in as matches are played.
        </p>
      )}
    </section>
  )
}
