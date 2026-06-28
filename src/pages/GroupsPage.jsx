import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getGroups, getPhases } from '../api.js'
import { useTeamName } from '../teamNames.js'
import PhaseFilter from '../components/PhaseFilter.jsx'

function pct(p) { return p == null ? 0 : Math.round(p * 100) }

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
  const { t } = useTranslation()
  const tn = useTeamName()
  const navigate = useNavigate()
  return (
    <div className="group-card">
      <div className="group-head">{t('groupsPage.groupName', { name: group.group_name })}</div>
      <div className="group-teams">
        {group.teams.map((team) => (
          <div key={team.team_id} className="group-team" onClick={() => navigate(`/team/${team.team_id}`)}>
            <div className="gt-top">
              {team.team_flag && <img src={team.team_flag} alt="" />}
              <span className="gt-name">{tn(team.team_name)}</span>
              <span className="gt-win">{pct(team.prob_1st)}%</span>
            </div>
            <PositionBar t={team} />
          </div>
        ))}
      </div>
      <div className="group-legend">
        <span><i className="dot pos1" />{t('groupsPage.first')}</span>
        <span><i className="dot pos2" />{t('groupsPage.second')}</span>
        <span><i className="dot pos3" />{t('groupsPage.third')}</span>
        <span><i className="dot pos4" />{t('groupsPage.fourth')}</span>
      </div>
    </div>
  )
}

function gdLabel(v) { return v == null ? '' : (v > 0 ? `+${v}` : `${v}`) }

// Tabla final del grupo (foto "tras jornada 3"): posiciones reales + puntos.
function GroupTable({ group }) {
  const { t } = useTranslation()
  const tn = useTeamName()
  const navigate = useNavigate()
  const teams = [...group.teams].sort((a, b) => (a.position ?? 99) - (b.position ?? 99))
  return (
    <div className="group-card">
      <div className="group-head">{t('groupsPage.groupName', { name: group.group_name })}</div>
      <table className="group-table">
        <thead>
          <tr>
            <th className="gt-c">#</th>
            <th className="gt-l">{t('groupsPage.colTeam')}</th>
            <th className="gt-c">{t('groupsPage.colPlayed')}</th>
            <th className="gt-c">{t('groupsPage.colWon')}</th>
            <th className="gt-c">{t('groupsPage.colDrawn')}</th>
            <th className="gt-c">{t('groupsPage.colLost')}</th>
            <th className="gt-c">{t('groupsPage.colGF')}</th>
            <th className="gt-c">{t('groupsPage.colGA')}</th>
            <th className="gt-c">{t('groupsPage.colGD')}</th>
            <th className="gt-c gt-pts">{t('groupsPage.colPts')}</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.team_id} onClick={() => navigate(`/team/${team.team_id}`)}>
              <td className="gt-c gt-pos">{team.position}</td>
              <td className="gt-l">
                <span className="gt-team">
                  {team.team_flag && <img src={team.team_flag} alt="" />}
                  <span className="gt-name">{tn(team.team_name)}</span>
                  {team.qualified && <i className="dot qualified" title={t('groupsPage.qualified')} />}
                </span>
              </td>
              <td className="gt-c">{team.played}</td>
              <td className="gt-c">{team.won}</td>
              <td className="gt-c">{team.drawn}</td>
              <td className="gt-c">{team.lost}</td>
              <td className="gt-c">{team.gf}</td>
              <td className="gt-c">{team.ga}</td>
              <td className="gt-c">{gdLabel(team.gd)}</td>
              <td className="gt-c gt-pts">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function GroupsPage() {
  const { t } = useTranslation()
  const [groups, setGroups] = useState([])
  const [phases, setPhases] = useState([])
  const [phase, setPhase] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getPhases()
      .then((d) => { setPhases(d.phases || []); setPhase(d.default || 'inicio') })
      .catch(() => { setPhases([]); setPhase('inicio') })
  }, [])

  useEffect(() => {
    if (!phase) return
    setLoading(true)
    getGroups(phase)
      .then((d) => { setGroups(d); setError(null) })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [phase])

  const isFinal = phase === 'j3'

  return (
    <section>
      <h2 className="section-title">{t('groupsPage.title')}</h2>
      <p className="page-sub">{isFinal ? t('groupsPage.subtitleFinal') : t('groupsPage.subtitle')}</p>
      <PhaseFilter phases={phases} value={phase} onChange={setPhase} />
      {error && <div className="state">{t('groupsPage.error', { error })}</div>}
      {loading && <div className="state">{t('groupsPage.loading')}</div>}
      {!loading && !error && (
        <>
          <div className={`groups-grid${isFinal ? ' final' : ''}`}>
            {groups.map((g) => isFinal
              ? <GroupTable key={g.group_name} group={g} />
              : <GroupCard key={g.group_name} group={g} />)}
          </div>
          {isFinal && (
            <div className="groups-notation">
              <span><i className="dot qualified" />{t('groupsPage.qualified')}</span>
              <span className="gn-sep">{t('groupsPage.notation')}</span>
            </div>
          )}
        </>
      )}
    </section>
  )
}
