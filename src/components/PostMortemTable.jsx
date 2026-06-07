import { useTranslation } from 'react-i18next'

export default function PostMortemTable({ rows }) {
  const { t } = useTranslation()
  if (!rows || rows.length === 0) return null

  const resultLabel = (m) => {
    if (m.actual_home_score == null || m.actual_away_score == null) return t('postmortem.na')
    if (m.actual_home_score > m.actual_away_score) return t('postmortem.win', { team: m.home_team })
    if (m.actual_home_score < m.actual_away_score) return t('postmortem.win', { team: m.away_team })
    return t('postmortem.draw')
  }

  return (
    <section>
      <h2 className="section-title">{t('postmortem.title')}</h2>
      <div className="pm-wrap">
        <table className="pm">
          <thead>
            <tr>
              <th>{t('postmortem.match')}</th>
              <th>{t('postmortem.predictedScore')}</th>
              <th>{t('postmortem.actualScore')}</th>
              <th>{t('postmortem.result')}</th>
              <th>{t('postmortem.correct')}</th>
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
