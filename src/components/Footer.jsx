import { useTranslation } from 'react-i18next'
import Logo from './Logo.jsx'

export default function Footer() {
  const { t } = useTranslation()
  return (
    <footer className="footer">
      <div className="container">
        <Logo size="sm" />
        <div className="footer-text">
          {t('footer.disclaimer')}
          <br />
          <a href="https://scoreanalyticspredictions.com" target="_blank" rel="noreferrer">
            scoreanalyticspredictions.com
          </a>
        </div>
      </div>
    </footer>
  )
}
