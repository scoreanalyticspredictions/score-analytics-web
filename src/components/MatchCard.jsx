import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import MatchDetailModal from './MatchDetailModal.jsx'
import { teamCode } from '../teamCodes.js'
import WeatherIcon from './WeatherIcon.jsx'

function pct(p) { return p == null ? 0 : Math.round(p * 100) }

export function localeOf(i18n) { return (i18n.resolvedLanguage || i18n.language) === 'es' ? 'es-ES' : 'en-US' }

export function formatKickoff(ts, locale) {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleString(locale, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch { return ts }
}

function ProbRow({ label, value, type }) {
  return (
    <div className="prob-row">
      <span className="pk">{label}</span>
      <div className={`bar ${type}`}><span style={{ width: `${pct(value)}%` }} /></div>
      <span className="pv">{pct(value)}%</span>
    </div>
  )
}

function Team({ name, flag, xg }) {
  const { t } = useTranslation()
  return (
    <div className="team">
      {flag ? <img src={flag} alt={name} loading="lazy" /> : <div style={{ width: 38, height: 26 }} />}
      <div className="name">{name}</div>
      <div className="xg">{t('match.xg')} <b>{xg == null ? '—' : Number(xg).toFixed(2)}</b></div>
    </div>
  )
}

export function TierBadge({ tier }) {
  const { t } = useTranslation()
  if (!tier) return null
  const desc = t(`tiers.${tier}`, { defaultValue: '' })
  return (
    <Link
      to="/about#tiers"
      className={`tier-badge tier-link tier-${tier}`}
      title={desc ? `${desc} — ${t('tiers.learnMore')}` : t('tiers.learnMore')}
      onClick={(e) => e.stopPropagation()}
    >
      {t('tiers.badge', { tier })}
    </Link>
  )
}

export function MatchFooter({ m }) {
  const { t, i18n } = useTranslation()
  const hasEnv = m.venue || m.weather || m.temp_c != null
  return (
    <div className="card-foot">
      <div className="foot-venue">
        {m.weather && <WeatherIcon kind={m.weather} />}
        {m.temp_c != null && <span className="temp">{Math.round(m.temp_c)}°C</span>}
        {m.venue && <span className="venue" title={m.venue}>{m.venue}</span>}
        {!hasEnv && <span className="venue muted-cell">{t('match.venueTBD')}</span>}
      </div>
      <span className="foot-date">{formatKickoff(m.match_date, localeOf(i18n))}</span>
    </div>
  )
}

export default function MatchCard({ m, compact = false }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const stageLabel = t(`stages.${m.stage}`, { defaultValue: m.stage })
  const badge = m.group_name ? `${stageLabel} · ${m.group_name}` : stageLabel

  return (
    <>
      <div
        className={`card clickable${compact ? ' compact' : ''}`}
        onClick={() => setOpen(true)}
        role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter') setOpen(true) }}
      >
        <div className="card-head">
          <span className="card-badge">{badge}</span>
          <TierBadge tier={m.tier} />
        </div>

        <div className="card-teams">
          <Team name={m.home_team} flag={m.home_flag} xg={m.xg_home} />
          <div className="score">
            {m.predicted_home_score ?? '–'}<span className="dash">—</span>{m.predicted_away_score ?? '–'}
          </div>
          <Team name={m.away_team} flag={m.away_flag} xg={m.xg_away} />
        </div>

        {!compact && (
          <div className="probs">
            <ProbRow label={teamCode(m.home_team)} value={m.prob_home} type="home" />
            <ProbRow label={t('match.draw')} value={m.prob_draw} type="draw" />
            <ProbRow label={teamCode(m.away_team)} value={m.prob_away} type="away" />
          </div>
        )}

        <MatchFooter m={m} />
      </div>

      {open && <MatchDetailModal m={m} onClose={() => setOpen(false)} />}
    </>
  )
}
