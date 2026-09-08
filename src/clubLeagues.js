// Nombres de liga a mostrar, override por api-football league_id.
// Necesario porque en la BD varias ligas comparten nombre (p.ej. "Serie A"
// = Brasil 71 e Italia 135). El override desambigua solo lo necesario.
const OVERRIDES = {
  71: 'Brasileirão Serie A',
  72: 'Brasileirão Serie B',
  // en la BD llegan como "UEFA Champions League"; el prefijo sobra porque ya
  // van agrupadas bajo "Competiciones UEFA" en el sidebar
  2: 'Champions League',
  3: 'Europa League',
  848: 'Conference League',
}

export function clubLeagueName(leagueId, fallback) {
  return OVERRIDES[leagueId] || fallback || ''
}
