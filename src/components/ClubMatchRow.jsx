import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { resultState, localeOf } from './MatchCard.jsx'
import ClubMatchDetailModal from './ClubMatchDetailModal.jsx'
import { clubLeagueName } from '../clubLeagues.js'
import { countryOf, countryMeta, flagUrl, pickLabel, langOf } from '../clubRegions.js'

function pct(p) { return p == null ? 0 : Math.round(p * 100) }
function xgTxt(x) { return x == null ? '—' : Number(x).toFixed(2) }
function whenOf(ts, locale) {
  if (!ts) return { date: '—', time: '' }
  try {
    const d = new Date(ts)
    return {
      date: d.toLocaleDateString(locale, { day: 'numeric', month: 'short' }),
      time: d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
    }
  } catch { return { date: '', time: '' } }
}

// Encabezado de columnas (mismo grid que las filas → columnas alineadas)
export function ClubRowHead() {
  const { t } = useTranslation()
  return (
    <div className="mrow-head">
      <span>{t('clubs.colCountry', { defaultValue: 'País' })}</span>
      <span>{t('clubs.league')}</span>
      <span>{t('clubs.colWhen')}</span>
      <span>{t('filters.tier')}</span>
      <span className="h-r">{t('clubs.colHome')}</span>
      <span className="h-c">{t('clubs.colPred')}</span>
      <span>{t('clubs.colAway')}</span>
      <span className="h-r">{t('clubs.colProbs')}</span>
      <span className="h-r">{t('clubs.colO25')}</span>
      <span className="h-r">{t('clubs.colBtts')}</span>
    </div>
  )
}

function TeamCell({ side, name, crest }) {
  const img = crest ? <img src={crest} alt="" loading="lazy" /> : <span className="mr-ph" />
  const txt = <div className="mr-team-txt"><span className="mr-name">{name}</span></div>
  return side === 'home'
    ? <div className="mr-team home">{txt}{img}</div>
    : <div className="mr-team away">{img}{txt}</div>
}

export default function ClubMatchRow({ m }) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const { played } = resultState(m)
  const locale = localeOf(i18n)
  const when = whenOf(m.match_date, locale)
  const cm = countryMeta(countryOf(m.league_id))
  const cname = pickLabel(cm, langOf(i18n))

  return (
    <>
    <div className="mrow clickable" role="button" tabIndex={0}
      onClick={() => setOpen(true)} onKeyDown={(e) => { if (e.key === 'Enter') setOpen(true) }}>
      <span className="mr-country" title={cname}>
        {cm.c && <img className="mr-fl" src={flagUrl(cm.c)} alt="" loading="lazy" />}
        <span className="mr-cn">{cname}</span>
      </span>

      <span className="mr-league" title={clubLeagueName(m.league_id, m.league_name)}>{clubLeagueName(m.league_id, m.league_name)}</span>

      <div className="mr-when">
        <span className="mr-date">{when.date}</span>
        <span className="mr-time">{when.time}</span>
      </div>

      <span className="mr-tier-cell">
        {m.tier && (
          <span className={`mr-tier tier-${m.tier}`} title={t(`tiers.${m.tier}`, { defaultValue: '' })}>
            {t('tiers.badge', { tier: m.tier })}
          </span>
        )}
      </span>

      <TeamCell side="home" name={m.home_team} crest={m.home_crest} />

      <div className="mr-score">
        <span className="mr-xg"><span className="mr-xg-lab">{t('match.xg')}</span><span className="mr-xg-val">{xgTxt(m.xg_home)}</span></span>
        <span className="mr-mid">
          <span className="mr-pred">{m.predicted_home_score ?? '–'}<i>–</i>{m.predicted_away_score ?? '–'}</span>
          {played && (
            <span className="mr-actual">{m.actual_home_score}<i>–</i>{m.actual_away_score}</span>
          )}
        </span>
        <span className="mr-xg"><span className="mr-xg-lab">{t('match.xg')}</span><span className="mr-xg-val">{xgTxt(m.xg_away)}</span></span>
      </div>

      <TeamCell side="away" name={m.away_team} crest={m.away_crest} />

      <span className="mr-probs">
        <span className="mr-po"><b className="ph">{pct(m.prob_home)}</b></span>
        <span className="mr-po"><b className="pd">{pct(m.prob_draw)}</b></span>
        <span className="mr-po"><b className="pa">{pct(m.prob_away)}</b></span>
      </span>
      <span className="mr-mkt">
        <b>{m.over25_prob == null ? '—' : `${pct(m.over25_prob)}%`}</b>
      </span>
      <span className="mr-mkt">
        <b>{m.btts_prob == null ? '—' : `${pct(m.btts_prob)}%`}</b>
      </span>
    </div>
    {open && <ClubMatchDetailModal m={m} onClose={() => setOpen(false)} />}
    </>
  )
}
