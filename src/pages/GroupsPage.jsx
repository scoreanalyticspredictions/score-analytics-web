import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getGroups } from '../api.js'

function pct(p) { return p == null ? 0 : Math.round(p * 100) }

// barra apilada con las 4 posiciones (1°/2°/3°/4°)
function PositionBar({ t }) {
  const segs = [
    { k: '1', v: t.prob_1st, cls: 'pos1' },
    { k: '2', v: t.prob_2nd, cls: 'pos2' },
    { k: '3', v: t.prob_3rd, cls: 'pos3' },
    { k: '4', v: t.prob_4th, cls: 'pos4' },
  ]
  return (
    <div className="pos-bar" title={segs.map((s) => `${s.k}°: ${pct(s.v)}%`).join('  ')}>
      {segs.map((s) => (
        <span key={s.k} className={`seg ${s.cls}`} style={{ width: `${pct(s.v)}%` }} />
      ))}
    </div>
  )
}

function GroupCard({ group }) {
  const navigate = useNavigate()
  return (
    <div className="group-card">
      <div className="group-head">Group {group.group_name}</div>
      <div className="group-teams">
        {group.teams.map((t) => (
          <div key={t.team_id} className="group-team" onClick={() => navigate(`/team/${t.team_id}`)}>
            <div className="gt-top">
              {t.team_flag && <img src={t.team_flag} alt="" />}
              <span className="gt-name">{t.team_name}</span>
              <span className="gt-win">{pct(t.prob_1st)}%</span>
            </div>
            <PositionBar t={t} />
          </div>
        ))}
      </div>
      <div className="group-legend">
        <span><i className="dot pos1" />1st</span>
        <span><i className="dot pos2" />2nd</span>
        <span><i className="dot pos3" />3rd</span>
        <span><i className="dot pos4" />4th</span>
      </div>
    </div>
  )
}

export default function GroupsPage() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getGroups()
      .then((d) => { setGroups(d); setError(null) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section>
      <h2 className="section-title">Groups — Final Position Probabilities</h2>
      <p className="page-sub">Each team's chance of finishing 1st / 2nd / 3rd / 4th in its group.</p>
      {error && <div className="state">Could not load groups: {error}</div>}
      {loading && <div className="state">Loading groups…</div>}
      {!loading && !error && (
        <div className="groups-grid">
          {groups.map((g) => <GroupCard key={g.group_name} group={g} />)}
        </div>
      )}
    </section>
  )
}
