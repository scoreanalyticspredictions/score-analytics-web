function resultLabel(m) {
  if (m.actual_home_score == null || m.actual_away_score == null) return '—'
  if (m.actual_home_score > m.actual_away_score) return `${m.home_team} win`
  if (m.actual_home_score < m.actual_away_score) return `${m.away_team} win`
  return 'Draw'
}

export default function PostMortemTable({ rows }) {
  if (!rows || rows.length === 0) return null
  return (
    <section>
      <h2 className="section-title">Post-Mortem — Played Matches</h2>
      <div className="pm-wrap">
        <table className="pm">
          <thead>
            <tr>
              <th>Match</th>
              <th>Predicted Score</th>
              <th>Actual Score</th>
              <th>Result</th>
              <th>Correct</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.fixture_id}>
                <td>{m.home_team} vs {m.away_team}</td>
                <td>{m.predicted_home_score} — {m.predicted_away_score}</td>
                <td>{m.actual_home_score} — {m.actual_away_score}</td>
                <td>{resultLabel(m)}</td>
                <td className={`correct ${m.prediction_correct ? 'yes' : 'no'}`}>
                  {m.prediction_correct ? '✓' : '✗'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
