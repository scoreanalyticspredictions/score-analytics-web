const STAGES = [
  'Group Stage', 'Round of 32', 'Round of 16',
  'Quarter-finals', 'Semi-finals', 'Final',
]
const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export default function FilterBar({ filters, onChange }) {
  const set = (patch) => onChange({ ...filters, ...patch })

  return (
    <div className="filterbar">
      <div className="filter-group">
        <label htmlFor="f-stage">Stage</label>
        <select id="f-stage" value={filters.stage} onChange={(e) => set({ stage: e.target.value })}>
          <option value="">All stages</option>
          {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="f-group">Group</label>
        <select id="f-group" value={filters.group} onChange={(e) => set({ group: e.target.value })}>
          <option value="">All groups</option>
          {GROUPS.map((g) => <option key={g} value={g}>Group {g}</option>)}
        </select>
      </div>

      <div
        className={`toggle${filters.upcoming ? ' on' : ''}`}
        onClick={() => set({ upcoming: !filters.upcoming })}
        role="switch"
        aria-checked={filters.upcoming}
      >
        <span>Upcoming only</span>
        <div className="track"><div className="thumb" /></div>
      </div>
    </div>
  )
}
