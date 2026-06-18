import { useTranslation } from 'react-i18next'

// Selector de "foto" de odds (inicio / tras jornada N). Solo se muestra cuando
// hay al menos dos fotos disponibles (p.ej. una vez publicadas las de la J1).
export default function PhaseFilter({ phases, value, onChange }) {
  const { t } = useTranslation()
  if (!phases || phases.length < 2) return null

  const label = (p) =>
    p === 'inicio'
      ? t('phaseFilter.inicio')
      : t('phaseFilter.jornada', { n: String(p).replace(/^j/, '') })

  return (
    <div className="phase-filter">
      <span className="phase-filter-label">{t('phaseFilter.label')}</span>
      <div className="phase-seg">
        {phases.map((p) => (
          <button
            key={p}
            type="button"
            className={`phase-opt${p === value ? ' active' : ''}`}
            onClick={() => onChange(p)}
          >
            {label(p)}
          </button>
        ))}
      </div>
    </div>
  )
}
