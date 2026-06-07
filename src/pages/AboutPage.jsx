import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import KofiButton from '../components/KofiButton.jsx'

export default function AboutPage() {
  const { t } = useTranslation()
  const { hash } = useLocation()

  // React Router no hace scroll al ancla solo: lo hacemos al montar / cambiar hash.
  useEffect(() => {
    if (!hash) return
    const el = document.querySelector(hash)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  const tierItem = (tier) => (
    <li key={tier}>
      <span className={`tier-badge tier-${tier}`}>{t('tiers.badge', { tier })}</span>
      <span><b>{t(`tiers.${tier}`)}</b> — {t(`about.htr.tiers${tier}`)}</span>
    </li>
  )

  return (
    <div className="about">
      <h1 className="about-title">{t('about.title')}</h1>
      <p className="about-lead">{t('about.lead')}</p>

      <nav className="about-nav">
        <a href="#how-to-read">{t('about.navHowTo')}</a>
        <a href="#about-model">{t('about.navModel')}</a>
      </nav>

      {/* ---------- Sección 1 ---------- */}
      <section id="how-to-read" className="about-section">
        <h2>{t('about.htr.title')}</h2>
        <p>{t('about.htr.intro')}</p>

        <h3>{t('about.htr.wdlTitle')}</h3>
        <p>{t('about.htr.wdlBody')}</p>

        <h3>{t('about.htr.xgTitle')}</h3>
        <p>{t('about.htr.xgBody')}</p>

        <h3>{t('about.htr.scoreTitle')}</h3>
        <p>{t('about.htr.scoreBody')}</p>

        <h3>{t('about.htr.bttsTitle')}</h3>
        <p>{t('about.htr.bttsBody')}</p>

        <h3>{t('about.htr.exactTitle')}</h3>
        <p>{t('about.htr.exactBody')}</p>

        <h3>{t('about.htr.progTitle')}</h3>
        <p>{t('about.htr.progBody')}</p>

        <h3>{t('about.htr.groupTitle')}</h3>
        <p>{t('about.htr.groupBody')}</p>

        <h3 id="tiers">{t('about.htr.tiersTitle')}</h3>
        <p>{t('about.htr.tiersIntro')}</p>
        <ul className="tier-legend">
          {['A', 'B', 'C', 'D', 'E'].map((tier) => tierItem(tier))}
        </ul>
        <p>{t('about.htr.tiersGroupNote')}</p>
        <p>{t('about.htr.tiersTrackNote')}</p>
      </section>

      {/* ---------- Sección 2 ---------- */}
      <section id="about-model" className="about-section">
        <h2>{t('about.model.title')}</h2>

        <h3>{t('about.model.approachTitle')}</h3>
        <p>{t('about.model.approachBody1')}</p>
        <p>{t('about.model.approachBody2')}</p>

        <h3>{t('about.model.dataTitle')}</h3>
        <p>{t('about.model.dataBody')}</p>

        <h3>{t('about.model.updateTitle')}</h3>
        <p>{t('about.model.updateBody')}</p>

        <h3>{t('about.model.limitsTitle')}</h3>
        <p>{t('about.model.limitsBody')}</p>

        <h3>{t('about.model.versionTitle')}</h3>
        <p>{t('about.model.versionBody')}</p>
      </section>

      <div className="about-support">
        <p>{t('about.supportBody')}</p>
        <KofiButton />
      </div>

      <section className="about-contact">
        <h2>{t('about.contactTitle')}</h2>
        <p>{t('about.contactBody')}</p>
        <a href="mailto:contact@scoreanalyticspredictions.com">contact@scoreanalyticspredictions.com</a>
      </section>
    </div>
  )
}
