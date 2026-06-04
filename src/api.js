// Base URL desde variable de entorno: localhost en dev, Render en prod.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Datos mock para desarrollo sin backend. Se controla por variable de entorno:
//   VITE_USE_MOCK=true  -> usa mock (local sin API)
//   sin definir / false -> usa la API real de VITE_API_URL (producción en Vercel)
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const flag = (code) => `https://flagcdn.com/w80/${code}.png`

const MOCK_PREDICTIONS = [
  {
    fixture_id: 1489369, match_date: '2026-06-11T19:00:00Z', stage: 'Group Stage', group_name: 'A',
    home_team: 'Mexico', away_team: 'South Africa', home_flag: flag('mx'), away_flag: flag('za'),
    prob_home: 0.677, prob_draw: 0.220, prob_away: 0.103, xg_home: 1.88, xg_away: 0.68,
    predicted_home_score: 1, predicted_away_score: 0,
    actual_home_score: null, actual_away_score: null, model_version: '1.0.0',
  },
  {
    fixture_id: 1489372, match_date: '2026-06-13T22:00:00Z', stage: 'Group Stage', group_name: 'C',
    home_team: 'Brazil', away_team: 'Morocco', home_flag: flag('br'), away_flag: flag('ma'),
    prob_home: 0.390, prob_draw: 0.300, prob_away: 0.310, xg_home: 1.42, xg_away: 1.18,
    predicted_home_score: 1, predicted_away_score: 1,
    actual_home_score: null, actual_away_score: null, model_version: '1.0.0',
  },
  {
    fixture_id: 1489371, match_date: '2026-06-13T01:00:00Z', stage: 'Group Stage', group_name: 'D',
    home_team: 'USA', away_team: 'Paraguay', home_flag: flag('us'), away_flag: flag('py'),
    prob_home: 0.466, prob_draw: 0.287, prob_away: 0.247, xg_home: 1.34, xg_away: 0.95,
    predicted_home_score: 1, predicted_away_score: 1,
    actual_home_score: null, actual_away_score: null, model_version: '1.0.0',
  },
  {
    fixture_id: 1489370, match_date: '2026-06-12T19:00:00Z', stage: 'Group Stage', group_name: 'B',
    home_team: 'Canada', away_team: 'Bosnia & Herzegovina', home_flag: flag('ca'), away_flag: flag('ba'),
    prob_home: 0.643, prob_draw: 0.235, prob_away: 0.122, xg_home: 1.70, xg_away: 0.71,
    predicted_home_score: 1, predicted_away_score: 0,
    actual_home_score: null, actual_away_score: null, model_version: '1.0.0',
  },
  {
    fixture_id: 1489380, match_date: '2026-06-14T20:00:00Z', stage: 'Group Stage', group_name: 'J',
    home_team: 'Argentina', away_team: 'Algeria', home_flag: flag('ar'), away_flag: flag('dz'),
    prob_home: 0.640, prob_draw: 0.240, prob_away: 0.130, xg_home: 1.80, xg_away: 0.70,
    predicted_home_score: 2, predicted_away_score: 0,
    actual_home_score: null, actual_away_score: null, model_version: '1.0.0',
  },
  {
    fixture_id: 1489376, match_date: '2026-06-14T01:00:00Z', stage: 'Group Stage', group_name: 'C',
    home_team: 'Haiti', away_team: 'Scotland', home_flag: flag('ht'), away_flag: flag('gb-sct'),
    prob_home: 0.244, prob_draw: 0.286, prob_away: 0.470, xg_home: 0.92, xg_away: 1.36,
    predicted_home_score: 1, predicted_away_score: 1,
    actual_home_score: null, actual_away_score: null, model_version: '1.0.0',
  },
]

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
]

const MOCK_SUMMARY = {
  total_predictions: 72,
  completed_matches: 3,
  model_accuracy: 66.7,
  last_updated: new Date().toISOString(),
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

export async function getPredictions({ stage, group, upcoming } = {}) {
  if (USE_MOCK) {
    let r = MOCK_PREDICTIONS
    if (stage) r = r.filter((m) => m.stage === stage)
    if (group) r = r.filter((m) => m.group_name === group)
    if (upcoming) r = r.filter((m) => new Date(m.match_date) >= new Date())
    return [...r].sort((a, b) => new Date(a.match_date) - new Date(b.match_date))
  }
  const qs = new URLSearchParams()
  if (stage) qs.set('stage', stage)
  if (group) qs.set('group', group)
  if (upcoming) qs.set('upcoming', 'true')
  const q = qs.toString()
  return http(`/api/predictions${q ? `?${q}` : ''}`)
}

export async function getPostmortem() {
  if (USE_MOCK) return MOCK_POSTMORTEM
  return http('/api/predictions/postmortem')
}
