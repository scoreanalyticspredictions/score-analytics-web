// Logo Score Analytics Predictions.
// Ícono: 3 barras verticales redondeadas que crecen de izq. a der.
// (opacidad 0.35 / 0.65 / 1.0) + línea base (opacidad 0.4), color #00C9A7.
// Variantes: lg (header), sm (footer/mobile), icon (solo ícono).
const C = '#00c9a7'

function IconBars() {
  return (
    <g>
      <rect x="6"    y="26" width="11" height="18" rx="2.5" fill={C} opacity="0.35" />
      <rect x="22.5" y="17" width="11" height="27" rx="2.5" fill={C} opacity="0.65" />
      <rect x="39"   y="7"  width="11" height="37" rx="2.5" fill={C} opacity="1" />
      <rect x="6"    y="47" width="44" height="2.5" rx="1.25" fill={C} opacity="0.4" />
    </g>
  )
}

export default function Logo({ size = 'lg' }) {
  if (size === 'icon') {
    return (
      <svg className="logo logo-icon" viewBox="0 0 56 56" role="img" aria-label="Score Analytics Predictions">
        <IconBars />
      </svg>
    )
  }
  return (
    <svg className={`logo logo-${size}`} viewBox="0 0 300 56" role="img" aria-label="Score Analytics Predictions">
      <IconBars />
      <text x="66" y="26" fontFamily="Inter, sans-serif" fontSize="19" fontWeight="500" fill="#e6edf3">Score Analytics</text>
      <text x="67" y="44" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="600" letterSpacing="5" fill={C}>PREDICTIONS</text>
    </svg>
  )
}
