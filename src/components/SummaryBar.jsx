export default function SummaryBar({ summary, currentStage }) {
  const s = summary || {}
  const accuracy = s.model_accuracy == null ? '—' : `${s.model_accuracy}%`
  const cards = [
    { label: 'Matches Predicted', value: s.total_predictions ?? '—' },
    { label: 'Completed', value: s.completed_matches ?? '—' },
    { label: 'Model Accuracy', value: accuracy, accent: true },
    { label: 'Current Stage', value: currentStage || '—' },
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
