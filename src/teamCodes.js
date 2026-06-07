// Códigos FIFA de 3 letras para mostrar en las barras de probabilidad
// (ej. "MEX – Draw – RSA" en vez de "H – D – A").
const CODES = {
  algeria: 'ALG', argentina: 'ARG', australia: 'AUS', austria: 'AUT', belgium: 'BEL',
  bosniaherzegovina: 'BIH', brazil: 'BRA', canada: 'CAN', capeverdeislands: 'CPV',
  capeverde: 'CPV', colombia: 'COL', congodr: 'COD', croatia: 'CRO', curacao: 'CUW',
  czechrepublic: 'CZE', ecuador: 'ECU', egypt: 'EGY', england: 'ENG', france: 'FRA',
  germany: 'GER', ghana: 'GHA', haiti: 'HAI', iran: 'IRN', iraq: 'IRQ', ivorycoast: 'CIV',
  japan: 'JPN', jordan: 'JOR', mexico: 'MEX', morocco: 'MAR', netherlands: 'NED',
  newzealand: 'NZL', norway: 'NOR', panama: 'PAN', paraguay: 'PAR', portugal: 'POR',
  qatar: 'QAT', saudiarabia: 'KSA', scotland: 'SCO', senegal: 'SEN', southafrica: 'RSA',
  southkorea: 'KOR', spain: 'ESP', sweden: 'SWE', switzerland: 'SUI', tunisia: 'TUN',
  turkiye: 'TUR', turkey: 'TUR', uruguay: 'URU', usa: 'USA', uzbekistan: 'UZB',
  nigeria: 'NGA', denmark: 'DEN', italy: 'ITA', honduras: 'HON',
}

const norm = (s) => (s || '')
  .normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z]/g, '')

// Devuelve el código de 3 letras; si no está en el mapa, usa las 3 primeras letras.
export function teamCode(name) {
  if (!name) return '—'
  return CODES[norm(name)] || name.slice(0, 3).toUpperCase()
}
