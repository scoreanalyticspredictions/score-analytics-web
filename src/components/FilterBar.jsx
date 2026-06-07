import { useTranslation } from 'react-i18next'

const STAGES = [
  'Group Stage', 'Round of 32', 'Round of 16',
  'Quarter-finals', 'Semi-finals', 'Final',
]
const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export default function FilterBar({ filters, onChange, tiers = ['A', 'B', 'C', 'D', 'E'] }) {
  const { t } = useTranslation()
  const set = (patch) => onChange({ ...filters, ...patch })

  return (
    <div className="filterbar">
      <div className="filter-group">
        <label htmlFor="f-stage">{t('filters.stage')}</label>
        <select id="f-stage" value={filters.stage} onChange={(e) => set({ stage: e.target.value })}>
          <option value="">{t('filters.allStages')}</option>
          {STAGES.map((s) => <option key={s} value={s}>{t(`stages.${s}`, { defaultValue: s })}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="f-group">{t('filters.group')}</label>
        <select id="f-group" value={filters.group} onChange={(e) => set({ group: e.target.value })}>
          <option value="">{t('filters.allGroups')}</option>
          {GROUPS.map((g) => <option key={g} value={g}>{t('filters.groupOption', { group: g })}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="f-tier">{t('filters.tier')}</label>
        <select id="f-tier" value={filters.tier} onChange={(e) => set({ tier: e.target.value })}>
          <option value="">{t('filters.allTiers')}</option>
          {tiers.map((tr) => (
            <option key={tr} value={tr}>
              {t('filters.tierOption', { tier: tr, desc: t(`tiers.${tr}`) })}
            </option>
          ))}
        </select>
      </div>

      <div
        className={`toggle${filters.upcoming ? ' on' : ''}`}
        onClick={() => set({ upcoming: !filters.upcoming })}
        role="switch"
        aria-checked={filters.upcoming}
      >
        <span>{t('filters.upcomingOnly')}</span>
        <div className="track"><div className="thumb" /></div>
      </div>
    </div>
  )
}
