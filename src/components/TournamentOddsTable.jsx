import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const COLS = [
  { key: 'prob_round_of_32', label: 'r32' },
  { key: 'prob_round_of_16', label: 'r16' },
  { key: 'prob_quarters', label: 'qf' },
  { key: 'prob_semis', label: 'sf' },
  { key: 'prob_final', label: 'final' },
  { key: 'prob_champion', label: 'champion' },
]

// color de celda: más verde = más probable (normalizado por columna)
function cellStyle(v, max) {
  if (v == null) return {}
  const a = max > 0 ? 0.08 + 0.62 * (v / max) : 0
  return { background: `rgba(0, 201, 167, ${a.toFixed(3)})` }
}

function fmt(v) { return v == null ? '—' : `${(v * 100).toFixed(1)}%` }

export default function TournamentOddsTable({ teams }) {
  const { t } = useTranslation()
  const [sort, setSort] = useState({ key: 'prob_champion', dir: 'desc' })
  const navigate = useNavigate()

  const maxByCol = useMemo(() => {
    const m = {}
    COLS.forEach((c) => { m[c.key] = Math.max(...teams.map((t) => t[c.key] || 0), 0) })
    return m
  }, [teams])

  const sorted = useMemo(() => {
    const arr = [...teams]
    const { key, dir } = sort
    arr.sort((a, b) => {
      let va = a[key], vb = b[key]
      if (typeof va === 'string' || typeof vb === 'string') {
        va = (va || '').toString(); vb = (vb || '').toString()
        return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      }
      va = va ?? -1; vb = vb ?? -1
      return dir === 'asc' ? va - vb : vb - va
    })
    return arr
  }, [teams, sort])

  const onSort = (key) => setSort((s) =>
    s.key === key ? { key, dir: s.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' })

  const arrow = (key) => (sort.key === key ? (sort.dir === 'desc' ? ' ▼' : ' ▲') : '')

  return (
    <div className="odds-wrap">
      <table className="odds-table">
        <thead>
          <tr>
            <th className="th-sort" onClick={() => onSort('team_name')}>{t('teamsPage.team')}{arrow('team_name')}</th>
            <th className="th-sort" onClick={() => onSort('group_name')}>{t('teamsPage.group')}{arrow('group_name')}</th>
            {COLS.map((c) => (
              <th key={c.key} className="th-sort num" onClick={() => onSort(c.key)}>
                {t(`oddsTable.${c.label}`)}{arrow(c.key)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((t) => (
            <tr key={t.team_id} className="odds-row" onClick={() => navigate(`/team/${t.team_id}`)}>
              <td className="team-cell">
                {t.team_flag && <img src={t.team_flag} alt="" />}
                <span>{t.team_name}</span>
              </td>
              <td className="num">{t.group_name || '—'}</td>
              {COLS.map((c) => (
                <td key={c.key} className="num" style={cellStyle(t[c.key], maxByCol[c.key])}>
                  {fmt(t[c.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
