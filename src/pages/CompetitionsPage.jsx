import { useEffect, useMemo, useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getClubLeagues } from '../api.js'
import { clubLeagueName } from '../clubLeagues.js'
import { buildRegionTree, flagUrl, langOf } from '../clubRegions.js'

// Directorio de competiciones: el Mundial como una "liga" más (destacado) + todas
// las ligas de clubes agrupadas por región → país. Al entrar a una liga se abre su
// página; al entrar al Mundial se abre su tablero (/mundial).
export default function CompetitionsPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const lang = langOf(i18n)
  const [leagues, setLeagues] = useState([])

  useEffect(() => {
    getClubLeagues().then((ls) => {
      const seen = new Map()
      ls.forEach((l) => { if (!seen.has(l.league_id)) seen.set(l.league_id, { league_id: l.league_id, league_name: l.league_name }) })
      setLeagues([...seen.values()])
    }).catch(() => {})
  }, [])

  const tree = useMemo(() => buildRegionTree(leagues, lang), [leagues, lang])
  const total = leagues.length

  return (
    <section className="competitions-page">
      <div className="cmp-head">
        <h1>{t('nav.competitions')}</h1>
        <p>{t('competitions.subtitle')}</p>
      </div>

      {/* Mundial destacado (una "liga" más, pero abre su tablero) */}
      <NavLink to="/mundial" className="cmp-feature">
        <span className="cmp-feat-ic">🏆</span>
        <span className="cmp-feat-tx">
          <b>{t('clubs.worldCup', { defaultValue: 'Mundial FIFA 2026' })}</b>
          <span>{t('competitions.worldCupTag')} · {t('clubs.nationalTeams', { defaultValue: 'Selecciones' })}</span>
        </span>
        <span className="cmp-feat-go">→</span>
      </NavLink>

      {/* Ligas de clubes por región → país */}
      {tree.map((r) => (
        <div className="cmp-region" key={r.key}>
          <h2 className="cmp-region-h"><span className="ic">{r.ic}</span>{r.label}</h2>
          <div className="cmp-grid">
            {r.countries.flatMap((c) => c.leagues.map((l) => (
              <button className="cmp-card" key={l.league_id} onClick={() => navigate(`/clubs/liga/${l.league_id}`)}>
                {c.code
                  ? <img className="cmp-fl" src={flagUrl(c.code)} alt="" loading="lazy" />
                  : <span className="cmp-fl cmp-fl-ph" />}
                <span className="cmp-card-tx">
                  <b>{clubLeagueName(l.league_id, l.league_name)}</b>
                  <span>{c.label}</span>
                </span>
              </button>
            )))}
          </div>
        </div>
      ))}

      {total > 0 && <p className="cmp-foot">{total} {t('competitions.leaguesIn')} · {tree.length} {tree.length === 1 ? t('clubs.regionWord', { defaultValue: 'región' }) : t('clubs.regionsWord', { defaultValue: 'regiones' })}</p>}
    </section>
  )
}
