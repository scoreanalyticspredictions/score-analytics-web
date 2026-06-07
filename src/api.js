// Base URL desde variable de entorno: localhost en dev, Render en prod.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Datos mock para desarrollo sin backend. Se controla por variable de entorno:
//   VITE_USE_MOCK=true  -> usa mock (local sin API)
//   sin definir / false -> usa la API real de VITE_API_URL (producción en Vercel)
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const flag = (code) => `https://flagcdn.com/w80/${code}.png`

// ---------- helpers para enriquecer mocks (BTTS + marcadores exactos) ----------
function factorial(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r }
function pois(k, l) { return Math.exp(-l) * l ** k / factorial(k) }
function scoreProbs(xh, xa) {
  const ph = [], pa = []
  for (let k = 0; k < 8; k++) { ph.push(pois(k, xh)); pa.push(pois(k, xa)) }
  const grid = {}
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) grid[`${i}-${j}`] = +(ph[i] * pa[j]).toFixed(4)
  // rejilla para la matriz: >= 0.4%, mínimo top-10 (igual que populate_team_odds.py)
  let keep = Object.entries(grid).filter(([, v]) => v >= 0.004)
  if (keep.length < 10) keep = Object.entries(grid).sort((a, b) => b[1] - a[1]).slice(0, 10)
  return Object.fromEntries(keep)
}
function bttsProb(xh, xa) { return +((1 - Math.exp(-xh)) * (1 - Math.exp(-xa))).toFixed(4) }
function tierOf(ph, pd, pa) {
  const s = [ph, pd, pa].sort((a, b) => b - a)
  const top = s[0], gap = s[0] - s[1]
  if (top >= 0.60 && gap >= 0.15) return 'A'
  if (top >= 0.50 && gap >= 0.10) return 'B'
  if (pd >= 0.27 && top < 0.50) return 'C'
  if (top >= 0.45 && gap >= 0.05) return 'D'
  return 'E'
}
function enrich(m) {
  return {
    ...m,
    btts_prob: bttsProb(m.xg_home, m.xg_away),
    exact_score_probs: scoreProbs(m.xg_home, m.xg_away),
    tier: tierOf(m.prob_home, m.prob_draw, m.prob_away),
  }
}

const MOCK_PREDICTIONS = [
  {
    fixture_id: 1489369, match_date: '2026-06-11T19:00:00Z', stage: 'Group Stage', group_name: 'A',
    home_team: 'Mexico', away_team: 'South Africa', home_flag: flag('mx'), away_flag: flag('za'),
    prob_home: 0.677, prob_draw: 0.220, prob_away: 0.103, xg_home: 1.88, xg_away: 0.68,
    predicted_home_score: 1, predicted_away_score: 0,
    actual_home_score: null, actual_away_score: null, model_version: '1.0.0',
    venue: 'Estadio Azteca, Mexico City', temp_c: 23, weather: 'sunny',
  },
  {
    fixture_id: 1489372, match_date: '2026-06-13T22:00:00Z', stage: 'Group Stage', group_name: 'C',
    home_team: 'Brazil', away_team: 'Morocco', home_flag: flag('br'), away_flag: flag('ma'),
    prob_home: 0.390, prob_draw: 0.300, prob_away: 0.310, xg_home: 1.42, xg_away: 1.18,
    predicted_home_score: 1, predicted_away_score: 1,
    actual_home_score: null, actual_away_score: null, model_version: '1.0.0',
    venue: 'MetLife Stadium, New York New Jersey', temp_c: 27, weather: 'cloudy',
  },
  {
    fixture_id: 1489371, match_date: '2026-06-13T01:00:00Z', stage: 'Group Stage', group_name: 'D',
    home_team: 'USA', away_team: 'Paraguay', home_flag: flag('us'), away_flag: flag('py'),
    prob_home: 0.466, prob_draw: 0.287, prob_away: 0.247, xg_home: 1.34, xg_away: 0.95,
    predicted_home_score: 1, predicted_away_score: 1,
    actual_home_score: null, actual_away_score: null, model_version: '1.0.0',
    venue: 'SoFi Stadium, Los Angeles', temp_c: 25, weather: 'domed',
  },
  {
    fixture_id: 1489370, match_date: '2026-06-12T19:00:00Z', stage: 'Group Stage', group_name: 'B',
    home_team: 'Canada', away_team: 'Bosnia & Herzegovina', home_flag: flag('ca'), away_flag: flag('ba'),
    prob_home: 0.643, prob_draw: 0.235, prob_away: 0.122, xg_home: 1.70, xg_away: 0.71,
    predicted_home_score: 1, predicted_away_score: 0,
    actual_home_score: null, actual_away_score: null, model_version: '1.0.0',
    venue: 'BMO Field, Toronto', temp_c: 26, weather: 'cloudy',
  },
  {
    fixture_id: 1489380, match_date: '2026-06-14T20:00:00Z', stage: 'Group Stage', group_name: 'J',
    home_team: 'Argentina', away_team: 'Algeria', home_flag: flag('ar'), away_flag: flag('dz'),
    prob_home: 0.640, prob_draw: 0.240, prob_away: 0.130, xg_home: 1.80, xg_away: 0.70,
    predicted_home_score: 2, predicted_away_score: 0,
    actual_home_score: null, actual_away_score: null, model_version: '1.0.0',
    venue: 'Hard Rock Stadium, Miami', temp_c: 30, weather: 'rainy',
  },
  {
    fixture_id: 1489376, match_date: '2026-06-14T01:00:00Z', stage: 'Group Stage', group_name: 'C',
    home_team: 'Haiti', away_team: 'Scotland', home_flag: flag('ht'), away_flag: flag('gb-sct'),
    prob_home: 0.244, prob_draw: 0.286, prob_away: 0.470, xg_home: 0.92, xg_away: 1.36,
    predicted_home_score: 1, predicted_away_score: 1,
    actual_home_score: null, actual_away_score: null, model_version: '1.0.0',
    venue: 'AT&T Stadium, Dallas', temp_c: 33, weather: 'domed',
  },
].map(enrich)

const MOCK_POSTMORTEM = [
  {
    fixture_id: 1489901, match_date: '2026-06-10T18:00:00Z', stage: 'Group Stage', group_name: 'A',
    home_team: 'Mexico', away_team: 'South Africa', home_flag: flag('mx'), away_flag: flag('za'),
    prob_home: 0.677, prob_draw: 0.220, prob_away: 0.103, xg_home: 1.88, xg_away: 0.68,
    predicted_home_score: 1, predicted_away_score: 0,
    actual_home_score: 2, actual_away_score: 0, model_version: '1.0.0', prediction_correct: true,
  },
  {
    fixture_id: 1489902, match_date: '2026-06-10T21:00:00Z', stage: 'Group Stage', group_name: 'B',
    home_team: 'Canada', away_team: 'Bosnia & Herzegovina', home_flag: flag('ca'), away_flag: flag('ba'),
    prob_home: 0.643, prob_draw: 0.235, prob_away: 0.122, xg_home: 1.70, xg_away: 0.71,
    predicted_home_score: 1, predicted_away_score: 0,
    actual_home_score: 1, actual_away_score: 1, model_version: '1.0.0', prediction_correct: false,
  },
  {
    fixture_id: 1489903, match_date: '2026-06-09T19:00:00Z', stage: 'Group Stage', group_name: 'J',
    home_team: 'Argentina', away_team: 'Algeria', home_flag: flag('ar'), away_flag: flag('dz'),
    prob_home: 0.640, prob_draw: 0.240, prob_away: 0.130, xg_home: 1.80, xg_away: 0.70,
    predicted_home_score: 2, predicted_away_score: 0,
    actual_home_score: 3, actual_away_score: 1, model_version: '1.0.0', prediction_correct: true,
  },
].map((m) => ({ ...enrich(m), prediction_correct: m.prediction_correct }))

const MOCK_SUMMARY = {
  total_predictions: 72,
  completed_matches: 3,
  model_accuracy: 66.7,
  last_updated: new Date().toISOString(),
  by_tier: [
    { tier: 'A', total: 28, completed: 2, correct: 2, accuracy: 100.0 },
    { tier: 'B', total: 19, completed: 1, correct: 0, accuracy: 0.0 },
    { tier: 'C', total: 25, completed: 0, correct: 0, accuracy: null },
  ],
}

// ---------- mock de los 48 equipos (12 grupos) con odds derivadas de "fuerza" ----------
// [team_id, name, flag-code, group, strength(1-10)]
const TEAM_SEED = [
  [1, 'Mexico', 'mx', 'A', 6.4], [2, 'South Korea', 'kr', 'A', 5.8], [3, 'Czech Republic', 'cz', 'A', 5.2], [4, 'South Africa', 'za', 'A', 3.6],
  [5, 'Canada', 'ca', 'B', 6.0], [6, 'Belgium', 'be', 'B', 7.8], [7, 'Bosnia & Herzegovina', 'ba', 'B', 4.6], [8, 'Ivory Coast', 'ci', 'B', 5.0],
  [9, 'Brazil', 'br', 'C', 8.6], [10, 'Morocco', 'ma', 'C', 6.6], [11, 'Scotland', 'gb-sct', 'C', 4.8], [12, 'Haiti', 'ht', 'C', 2.8],
  [13, 'USA', 'us', 'D', 6.2], [14, 'Uruguay', 'uy', 'D', 7.0], [15, 'Paraguay', 'py', 'D', 4.9], [16, 'Qatar', 'qa', 'D', 3.4],
  [17, 'Germany', 'de', 'E', 8.0], [18, 'Switzerland', 'ch', 'E', 5.6], [19, 'Ecuador', 'ec', 'E', 5.4], [20, 'Curaçao', 'cw', 'E', 2.6],
  [21, 'Netherlands', 'nl', 'F', 7.9], [22, 'Japan', 'jp', 'F', 5.9], [23, 'Egypt', 'eg', 'F', 4.7], [24, 'New Zealand', 'nz', 'F', 3.0],
  [25, 'Portugal', 'pt', 'G', 8.2], [26, 'Colombia', 'co', 'G', 6.8], [27, 'Norway', 'no', 'G', 5.5], [28, 'Jordan', 'jo', 'G', 3.2],
  [29, 'Spain', 'es', 'H', 9.0], [30, 'Senegal', 'sn', 'H', 6.3], [31, 'Australia', 'au', 'H', 4.4], [32, 'Panama', 'pa', 'H', 3.5],
  [33, 'France', 'fr', 'I', 8.8], [34, 'Croatia', 'hr', 'I', 6.7], [35, 'Iran', 'ir', 'I', 4.5], [36, 'Saudi Arabia', 'sa', 'I', 3.3],
  [37, 'Argentina', 'ar', 'J', 8.9], [38, 'Nigeria', 'ng', 'J', 5.7], [39, 'Algeria', 'dz', 'J', 4.6], [40, 'Uzbekistan', 'uz', 'J', 3.8],
  [41, 'England', 'gb-eng', 'K', 8.4], [42, 'Denmark', 'dk', 'K', 6.1], [43, 'Ghana', 'gh', 'K', 4.8], [44, 'Cape Verde', 'cv', 'K', 3.1],
  [45, 'Italy', 'it', 'L', 7.7], [46, 'Mexico B', 'mx', 'L', 5.3], [47, 'Tunisia', 'tn', 'L', 4.3], [48, 'Honduras', 'hn', 'L', 3.7],
]

function logistic(d) { return 1 / (1 + Math.exp(-d)) }

// Monte-Carlo de posiciones de grupo a partir de la "fuerza" relativa.
function buildTeamMocks() {
  const groups = {}
  TEAM_SEED.forEach(([id, name, code, g, s]) =>
    (groups[g] = groups[g] || []).push({ id, name, code, g, s }))

  const teams = {}
  Object.values(groups).forEach((gt) => {
    const n = gt.length
    const N = 4000
    const posCount = gt.map(() => [0, 0, 0, 0])
    for (let sim = 0; sim < N; sim++) {
      const pts = gt.map(() => 0), gd = gt.map(() => 0)
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        const ph = logistic(0.55 * (gt[i].s - gt[j].s)) * 0.82 + 0.06 // margen para empate
        const r = Math.random()
        if (r < ph) { pts[i] += 3; gd[i] += 1; gd[j] -= 1 }
        else if (r < ph + 0.24) { pts[i] += 1; pts[j] += 1 }
        else { pts[j] += 3; gd[j] += 1; gd[i] -= 1 }
      }
      const ord = gt.map((_, i) => i).sort((a, b) =>
        (pts[b] - pts[a]) || (gd[b] - gd[a]) || (Math.random() - 0.5))
      ord.forEach((teamIdx, pos) => posCount[teamIdx][pos]++)
    }
    gt.forEach((t, i) => {
      const p = posCount[i].map((c) => +(c / N).toFixed(4))
      teams[t.id] = {
        team_id: t.id, team_name: t.name, team_flag: flag(t.code), group_name: t.g,
        prob_1st: p[0], prob_2nd: p[1], prob_3rd: p[2], prob_4th: p[3],
        _strength: t.s,
      }
    })
  })

  // odds de torneo desde la fuerza (campeón ∝ fuerza^3, normalizado)
  const ids = Object.keys(teams)
  const w = ids.map((id) => teams[id]._strength ** 3)
  const W = w.reduce((a, b) => a + b, 0)
  ids.forEach((id, k) => {
    const t = teams[id]
    const champ = +(w[k] / W).toFixed(4)
    const r32 = Math.min(0.999, +(t.prob_1st + t.prob_2nd + 0.67 * t.prob_3rd).toFixed(4))
    const r16 = Math.min(r32, +(t.prob_1st + t.prob_2nd + 0.4 * t.prob_3rd).toFixed(4))
    const qf = +Math.min(r16, champ * 5.2).toFixed(4)
    const sf = +Math.min(qf, champ * 3.2).toFixed(4)
    const fin = +Math.min(sf, champ * 1.9).toFixed(4)
    Object.assign(t, {
      prob_round_of_32: r32, prob_round_of_16: r16, prob_quarters: qf, prob_semis: sf,
      prob_final: fin, prob_champion: Math.min(fin, champ),
    })
    delete t._strength
  })
  return teams
}

const MOCK_TEAMS_BY_ID = buildTeamMocks()
const MOCK_TEAMS = Object.values(MOCK_TEAMS_BY_ID)
  .sort((a, b) => b.prob_champion - a.prob_champion)

function mockGroups() {
  const byG = {}
  MOCK_TEAMS.forEach((t) => (byG[t.group_name] = byG[t.group_name] || []).push({
    team_id: t.team_id, team_name: t.team_name, team_flag: t.team_flag,
    prob_1st: t.prob_1st, prob_2nd: t.prob_2nd, prob_3rd: t.prob_3rd, prob_4th: t.prob_4th,
    prob_champion: t.prob_champion,
  }))
  return Object.keys(byG).sort().map((g) => ({
    group_name: g,
    teams: byG[g].sort((a, b) => b.prob_1st - a.prob_1st),
  }))
}

function mockTeamDetail(id) {
  const t = MOCK_TEAMS_BY_ID[id]
  if (!t) return null
  const upcoming = MOCK_PREDICTIONS.filter(
    (m) => m.home_team === t.team_name || m.away_team === t.team_name)
  const results = MOCK_POSTMORTEM.filter(
    (m) => m.home_team === t.team_name || m.away_team === t.team_name)
  return {
    team_id: t.team_id, team_name: t.team_name, team_flag: t.team_flag, group_name: t.group_name,
    tournament: t, upcoming, results,
  }
}

async function http(path) {
  const res = await fetch(`${API_URL}${path}`)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export async function getSummary() {
  if (USE_MOCK) return MOCK_SUMMARY
  return http('/api/summary')
}

export async function getPredictions({ stage, group, tier, upcoming } = {}) {
  if (USE_MOCK) {
    let r = MOCK_PREDICTIONS
    if (stage) r = r.filter((m) => m.stage === stage)
    if (group) r = r.filter((m) => m.group_name === group)
    if (tier) r = r.filter((m) => m.tier === tier)
    if (upcoming) r = r.filter((m) => new Date(m.match_date) >= new Date())
    return [...r].sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
  }
  const qs = new URLSearchParams()
  if (stage) qs.set('stage', stage)
  if (group) qs.set('group', group)
  if (tier) qs.set('tier', tier)
  if (upcoming) qs.set('upcoming', 'true')
  const q = qs.toString()
  return http(`/api/predictions${q ? `?${q}` : ''}`)
}

export async function getPostmortem() {
  if (USE_MOCK) return MOCK_POSTMORTEM
  return http('/api/predictions/postmortem')
}

export async function getTeams() {
  if (USE_MOCK) return MOCK_TEAMS
  return http('/api/teams')
}

export async function getTeam(id) {
  if (USE_MOCK) {
    const d = mockTeamDetail(Number(id))
    if (!d) throw new Error('Team not found')
    return d
  }
  return http(`/api/teams/${id}`)
}

export async function getGroups() {
  if (USE_MOCK) return mockGroups()
  return http('/api/groups')
}
