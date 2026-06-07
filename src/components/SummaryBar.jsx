import { useTranslation } from 'react-i18next'

export default function SummaryBar({ summary, currentStage }) {
  const { t } = useTranslation()
  const s = summary || {}
  const accuracy = s.model_accuracy == null ? '—' : `${s.model_accuracy}%`
  const stage = currentStage ? t(`stages.${currentStage}`, { defaultValue: currentStage }) : '—'
  const cards = [
    { label: t('summary.matchesPredicted'), value: s.total_predictions ?? '—' },
    { label: t('summary.completed'), value: s.completed_matches ?? '—' },
    { label: t('summary.modelAccuracy'), value: accuracy, accent: true },
    { label: t('summary.currentStage'), value: stage },
  ]
  return (
    <div className="summary">
      {cards.map((c) => (
        <div key={c.label} className={`summary-card${c.accent ? ' accent' : ''}`}>
          <div className="label">{c.label}</div>
          <div className="value">{c.value}</div>
        </div>
      ))}
    </div>
  )
}
