import { useTranslation } from 'react-i18next'

export default function TierStats({ byTier }) {
  const { t } = useTranslation()
  if (!byTier || byTier.length === 0) return null
  const anyPlayed = byTier.some((x) => x.completed > 0)

  return (
    <section>
      <h2 className="section-title">{t('tierStats.title')}</h2>
      <div className="tier-wrap">
        <table className="tier-table">
          <thead>
            <tr>
              <th>{t('tierStats.tier')}</th>
              <th>{t('tierStats.profile')}</th>
              <th>{t('tierStats.matches')}</th>
              <th>{t('tierStats.played')}</th>
              <th>{t('tierStats.correct')}</th>
              <th>{t('tierStats.successRate')}</th>
            </tr>
          </thead>
          <tbody>
            {byTier.map((x) => (
              <tr key={x.tier}>
                <td><span className={`tier-badge tier-${x.tier}`}>{t('tiers.badge', { tier: x.tier })}</span></td>
                <td className="muted-cell">{t(`tiers.${x.tier}`, { defaultValue: '—' })}</td>
                <td className="num">{x.total}</td>
                <td className="num">{x.completed}</td>
                <td className="num">{x.completed ? x.correct : '—'}</td>
                <td className="num">
                  {x.accuracy == null
                    ? <span className="muted-cell">—</span>
                    : <b className="tier-acc">{x.accuracy}%</b>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!anyPlayed && (
        <p className="page-sub" style={{ marginTop: 10 }}>{t('tierStats.fillNote')}</p>
      )}
    </section>
  )
}
