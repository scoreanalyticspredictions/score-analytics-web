// Botón de Ko-fi. El link real se inyecta por variable de entorno VITE_KOFI_URL
// (lo pone el usuario en .env / Vercel). Variantes: inline (al pie de About) y
// floating (FAB fijo en la esquina inferior derecha de toda la app).
import { useTranslation } from 'react-i18next'

const KOFI_URL = import.meta.env.VITE_KOFI_URL || 'https://ko-fi.com'

function CupIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true">
      <path d="M4 8h13v5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" fill="#fff" />
      <path d="M17 9h2.2a2.3 2.3 0 0 1 0 4.6H17" stroke="#fff" strokeWidth="1.8" fill="none" />
      <path d="M8 3c-.6.8-.6 1.6 0 2.4M12 3c-.6.8-.6 1.6 0 2.4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

export default function KofiButton({ floating = false }) {
  const { t } = useTranslation()
  return (
    <a
      className={floating ? 'kofi-fab' : 'kofi-btn'}
      href={KOFI_URL} target="_blank" rel="noreferrer"
      aria-label={t('kofi.inline')}
    >
      <CupIcon size={floating ? 20 : 18} />
      <span>{floating ? t('kofi.floating') : t('kofi.inline')}</span>
    </a>
  )
}
