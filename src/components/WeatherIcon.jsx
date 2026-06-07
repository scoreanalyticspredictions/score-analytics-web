// Icono de clima: soleado / nublado / lluvioso / con domo (techo cerrado).
// El clima de cancha abierta es el TÍPICO de junio en la sede (no un pronóstico
// en vivo); 'domed' sí es real (estadio techado/clima controlado).
import { useTranslation } from 'react-i18next'

export default function WeatherIcon({ kind, size = 16 }) {
  const { t } = useTranslation()
  const s = { width: size, height: size, display: 'block' }
  const label = t(`weather.${kind}`, { defaultValue: '' })
  switch (kind) {
    case 'sunny':
      return (
        <svg viewBox="0 0 24 24" style={s} aria-label={label}>
          <circle cx="12" cy="12" r="5" fill="#f5b13d" />
          <g stroke="#f5b13d" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="1" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="23" />
            <line x1="1" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="23" y2="12" />
            <line x1="4" y1="4" x2="6" y2="6" /><line x1="18" y1="18" x2="20" y2="20" />
            <line x1="20" y1="4" x2="18" y2="6" /><line x1="6" y1="18" x2="4" y2="20" />
          </g>
        </svg>
      )
    case 'cloudy':
      return (
        <svg viewBox="0 0 24 24" style={s} aria-label={label}>
          <path d="M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6 1.3A3.5 3.5 0 0 1 17 18z" fill="#9aa6b2" />
        </svg>
      )
    case 'rainy':
      return (
        <svg viewBox="0 0 24 24" style={s} aria-label={label}>
          <path d="M7 15a4 4 0 0 1 0-8 5 5 0 0 1 9.6 1.3A3.5 3.5 0 0 1 17 15z" fill="#7e8a97" />
          <g stroke="#539bf5" strokeWidth="2" strokeLinecap="round">
            <line x1="8" y1="18" x2="7" y2="21" /><line x1="12" y1="18" x2="11" y2="21" />
            <line x1="16" y1="18" x2="15" y2="21" />
          </g>
        </svg>
      )
    case 'domed':
      return (
        <svg viewBox="0 0 24 24" style={s} aria-label={label}>
          <path d="M3 13a9 9 0 0 1 18 0z" fill="#00c9a7" />
          <line x1="2" y1="13" x2="22" y2="13" stroke="#00c9a7" strokeWidth="2" strokeLinecap="round" />
          <line x1="4" y1="17" x2="20" y2="17" stroke="#5b6776" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}
