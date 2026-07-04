import { useTranslation } from 'react-i18next'

// Selector de "foto" de odds (inicio / tras jornada N). Solo se muestra cuando
// hay al menos dos fotos disponibles (p.ej. una vez publicadas las de la J1).
export default function PhaseFilter({ phases, value, onChange }) {
  const { t } = useTranslation()
  if (!phases || phases.length < 2) return null

  const label = (p) => {
    if (p === 'inicio') return t('phaseFilter.inicio')
    if (/^j\d+$/.test(p)) return t('phaseFilter.jornada', { n: String(p).slice(1) })
    // fotos de eliminatoria (r32 = tras 16avos, r16 = tras 8vos, qf, sf)
    return t(`phaseFilter.ko.${p}`, { defaultValue: String(p) })
  }

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
