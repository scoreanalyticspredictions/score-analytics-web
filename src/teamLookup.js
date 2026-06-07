// Resuelve nombre de equipo -> team_id para navegar a /team/:id desde sitios que
// solo tienen el nombre (p. ej. el modal de partido). Memoiza /api/teams: una sola
// llamada para toda la sesión.
import { getTeams } from './api.js'

const norm = (s) => (s || '')
  .normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z]/g, '')

let cache = null
function load() {
  if (!cache) {
    cache = getTeams()
      .then((teams) => {
        const m = {}
        teams.forEach((t) => { m[norm(t.team_name)] = t.team_id })
        return m
      })
      .catch(() => ({}))
  }
  return cache
}

export async function teamIdByName(name) {
  const m = await load()
  return m[norm(name)] ?? null
}
