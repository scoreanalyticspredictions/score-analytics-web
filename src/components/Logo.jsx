export default function Logo() {
  return (
    <svg className="logo" viewBox="0 0 300 56" role="img" aria-label="Score Analytics Predictions">
      {/* tres barras teal descendentes con etiquetas S / A / P */}
      <g>
        <rect x="2"  y="6"  width="15" height="44" rx="2" fill="#00c9a7" />
        <rect x="21" y="16" width="15" height="34" rx="2" fill="#00c9a7" />
        <rect x="40" y="26" width="15" height="24" rx="2" fill="#00c9a7" />
        <text x="9.5"  y="46" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="800" fill="#0d1117">S</text>
        <text x="28.5" y="46" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="800" fill="#0d1117">A</text>
        <text x="47.5" y="46" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="13" fontWeight="800" fill="#0d1117">P</text>
      </g>
      {/* wordmark */}
      <text x="66" y="25" fontFamily="Inter, sans-serif" fontSize="19" fontWeight="800" fill="#e6edf3">Score Analytics</text>
      <text x="67" y="44" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="600" letterSpacing="5" fill="#00c9a7">PREDICTIONS</text>
    </svg>
  )
}
