import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTeamName } from '../teamNames.js'

const COLS = [
  { key: 'prob_round_of_32', label: 'r32' },
  { key: 'prob_round_of_16', label: 'r16' },
  { key: 'prob_quarters', label: 'qf' },
  { key: 'prob_semis', label: 'sf' },
  { key: 'prob_final', label: 'final' },
  { key: 'prob_champion', label: 'champion' },
]

// orden de profundidad para el desempato en cascada (de la ronda más profunda
// a la menos): así los eliminados (0% en todas) quedan siempre al final.
const DEPTH = ['prob_champion', 'prob_final', 'prob_semis', 'prob_quarters', 'prob_round_of_16', 'prob_round_of_32']

// color de celda: más verde = más probable (normalizado por columna)
function cellStyle(v, max) {
  if (v == null) return {}
  const a = max > 0 ? 0.08 + 0.62 * (v / max) : 0
  return { background: `rgba(0, 201, 167, ${a.toFixed(3)})` }
}

function fmt(v) { return v == null ? '—' : `${(v * 100).toFixed(1)}%` }

export default function TournamentOddsTable({ teams }) {
  const { t } = useTranslation()
  const tn = useTeamName()
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
    if (key === 'team_name' || key === 'group_name') {
      arr.sort((a, b) => {
        const va = (a[key] || '').toString(), vb = (b[key] || '').toString()
        return dir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
      })
    } else {
      // cascada: la columna elegida primero y, como desempate, las demás rondas
      // en orden de profundidad (campeón → final → semis → … → R32).
      const order = [key, ...DEPTH.filter((k) => k !== key)]
      const mult = dir === 'asc' ? 1 : -1
      arr.sort((a, b) => {
        for (const k of order) {
          const va = a[k] ?? -1, vb = b[k] ?? -1
          if (va !== vb) return mult * (va - vb)
        }
        return 0
      })
    }
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
          {sorted.map((team) => (
            <tr key={team.team_id} className="odds-row" onClick={() => navigate(`/team/${team.team_id}`)}>
              <td className="team-cell">
                {team.team_flag && <img src={team.team_flag} alt="" />}
                <span>{tn(team.team_name)}</span>
              </td>
              <td className="num">{team.group_name || '—'}</td>
              {COLS.map((c) => (
                <td key={c.key} className="num" style={cellStyle(team[c.key], maxByCol[c.key])}>
                  {fmt(team[c.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
