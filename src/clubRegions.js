// Agrupación de ligas de clubes por región → país (para el sidebar del tablero).
// LEAGUE_COUNTRY se genera de la BD (competition.country). Si aparece una liga nueva
// sin mapear, cae en la región "Otras". Los nombres de liga se muestran vía clubLeagueName.
// Etiquetas bilingües: l = español, le = inglés. Usa pickLabel(meta, lang).
import { clubLeagueName } from './clubLeagues.js'

// api-football league_id -> país (clave de country en la BD)
export const LEAGUE_COUNTRY = {
  128: 'Argentina', 188: 'Australia', 218: 'Austria', 116: 'Belarus', 117: 'Belarus',
  144: 'Belgium', 71: 'Brazil', 72: 'Brazil', 172: 'Bulgaria', 265: 'Chile', 169: 'China',
  239: 'Colombia', 211: 'Croatia', 210: 'Croatia',
  318: 'Cyprus', 345: 'Czech-Republic', 120: 'Denmark', 119: 'Denmark', 233: 'Egypt',
  40: 'England', 41: 'England', 39: 'England', 244: 'Finland', 61: 'France', 62: 'France',
  63: 'France', 79: 'Germany', 80: 'Germany', 78: 'Germany', 197: 'Greece', 271: 'Hungary',
  323: 'India', 357: 'Ireland', 382: 'Israel', 383: 'Israel', 135: 'Italy', 136: 'Italy', 98: 'Japan',
  365: 'Latvia', 361: 'Lithuania', 362: 'Lithuania', 263: 'Mexico', 262: 'Mexico',
  200: 'Morocco', 88: 'Netherlands', 103: 'Norway', 106: 'Poland', 107: 'Poland',
  94: 'Portugal', 305: 'Qatar', 283: 'Romania', 235: 'Russia', 308: 'Saudi-Arabia',
  307: 'Saudi-Arabia', 179: 'Scotland', 286: 'Serbia', 287: 'Serbia', 332: 'Slovakia',
  373: 'Slovenia', 292: 'South-Korea', 140: 'Spain', 141: 'Spain', 113: 'Sweden',
  207: 'Switzerland', 203: 'Turkey', 333: 'Ukraine',
  301: 'United-Arab-Emirates', 253: 'USA',
}

// país -> { r: región, c: código ISO (flagcdn), l: etiqueta ES, le: etiqueta EN }
const C = {
  Argentina: { r: 'sudamerica', c: 'ar', l: 'Argentina', le: 'Argentina' },
  Brazil: { r: 'sudamerica', c: 'br', l: 'Brasil', le: 'Brazil' },
  Chile: { r: 'sudamerica', c: 'cl', l: 'Chile', le: 'Chile' },
  Colombia: { r: 'sudamerica', c: 'co', l: 'Colombia', le: 'Colombia' },
  Mexico: { r: 'norteamerica', c: 'mx', l: 'México', le: 'Mexico' },
  USA: { r: 'norteamerica', c: 'us', l: 'Estados Unidos', le: 'United States' },
  Austria: { r: 'europa', c: 'at', l: 'Austria', le: 'Austria' },
  Belarus: { r: 'europa', c: 'by', l: 'Bielorrusia', le: 'Belarus' },
  Belgium: { r: 'europa', c: 'be', l: 'Bélgica', le: 'Belgium' },
  Bulgaria: { r: 'europa', c: 'bg', l: 'Bulgaria', le: 'Bulgaria' },
  Croatia: { r: 'europa', c: 'hr', l: 'Croacia', le: 'Croatia' },
  Cyprus: { r: 'europa', c: 'cy', l: 'Chipre', le: 'Cyprus' },
  'Czech-Republic': { r: 'europa', c: 'cz', l: 'Chequia', le: 'Czechia' },
  Denmark: { r: 'europa', c: 'dk', l: 'Dinamarca', le: 'Denmark' },
  England: { r: 'europa', c: 'gb-eng', l: 'Inglaterra', le: 'England' },
  Finland: { r: 'europa', c: 'fi', l: 'Finlandia', le: 'Finland' },
  France: { r: 'europa', c: 'fr', l: 'Francia', le: 'France' },
  Germany: { r: 'europa', c: 'de', l: 'Alemania', le: 'Germany' },
  Greece: { r: 'europa', c: 'gr', l: 'Grecia', le: 'Greece' },
  Hungary: { r: 'europa', c: 'hu', l: 'Hungría', le: 'Hungary' },
  Ireland: { r: 'europa', c: 'ie', l: 'Irlanda', le: 'Ireland' },
  Israel: { r: 'europa', c: 'il', l: 'Israel', le: 'Israel' },
  Italy: { r: 'europa', c: 'it', l: 'Italia', le: 'Italy' },
  Latvia: { r: 'europa', c: 'lv', l: 'Letonia', le: 'Latvia' },
  Lithuania: { r: 'europa', c: 'lt', l: 'Lituania', le: 'Lithuania' },
  Netherlands: { r: 'europa', c: 'nl', l: 'Países Bajos', le: 'Netherlands' },
  Norway: { r: 'europa', c: 'no', l: 'Noruega', le: 'Norway' },
  Poland: { r: 'europa', c: 'pl', l: 'Polonia', le: 'Poland' },
  Portugal: { r: 'europa', c: 'pt', l: 'Portugal', le: 'Portugal' },
  Romania: { r: 'europa', c: 'ro', l: 'Rumanía', le: 'Romania' },
  Russia: { r: 'europa', c: 'ru', l: 'Rusia', le: 'Russia' },
  Scotland: { r: 'europa', c: 'gb-sct', l: 'Escocia', le: 'Scotland' },
  Serbia: { r: 'europa', c: 'rs', l: 'Serbia', le: 'Serbia' },
  Slovakia: { r: 'europa', c: 'sk', l: 'Eslovaquia', le: 'Slovakia' },
  Slovenia: { r: 'europa', c: 'si', l: 'Eslovenia', le: 'Slovenia' },
  Spain: { r: 'europa', c: 'es', l: 'España', le: 'Spain' },
  Sweden: { r: 'europa', c: 'se', l: 'Suecia', le: 'Sweden' },
  Switzerland: { r: 'europa', c: 'ch', l: 'Suiza', le: 'Switzerland' },
  Turkey: { r: 'europa', c: 'tr', l: 'Turquía', le: 'Turkey' },
  Ukraine: { r: 'europa', c: 'ua', l: 'Ucrania', le: 'Ukraine' },
  China: { r: 'asia', c: 'cn', l: 'China', le: 'China' },
  India: { r: 'asia', c: 'in', l: 'India', le: 'India' },
  Japan: { r: 'asia', c: 'jp', l: 'Japón', le: 'Japan' },
  Qatar: { r: 'asia', c: 'qa', l: 'Catar', le: 'Qatar' },
  'Saudi-Arabia': { r: 'asia', c: 'sa', l: 'Arabia Saudí', le: 'Saudi Arabia' },
  'South-Korea': { r: 'asia', c: 'kr', l: 'Corea del Sur', le: 'South Korea' },
  'United-Arab-Emirates': { r: 'asia', c: 'ae', l: 'Emiratos Árabes', le: 'United Arab Emirates' },
  Egypt: { r: 'africa', c: 'eg', l: 'Egipto', le: 'Egypt' },
  Morocco: { r: 'africa', c: 'ma', l: 'Marruecos', le: 'Morocco' },
  Australia: { r: 'oceania', c: 'au', l: 'Australia', le: 'Australia' },
}

// URL de bandera (imagen) — flagcdn, misma fuente que la sección del Mundial.
// Se usa imagen en vez de emoji porque Windows no renderiza banderas emoji.
export const flagUrl = (code, w = 40) => (code ? `https://flagcdn.com/w${w}/${code}.png` : null)

export const REGION_META = {
  europa: { l: 'Europa', le: 'Europe', ic: '🌍' },
  sudamerica: { l: 'Sudamérica', le: 'South America', ic: '🌎' },
  norteamerica: { l: 'Norteamérica', le: 'North America', ic: '🌎' },
  asia: { l: 'Asia', le: 'Asia', ic: '🌏' },
  africa: { l: 'África', le: 'Africa', ic: '🌍' },
  oceania: { l: 'Oceanía', le: 'Oceania', ic: '🌏' },
  otras: { l: 'Otras ligas', le: 'Other leagues', ic: '🏳️' },
}
const REGION_ORDER = ['europa', 'sudamerica', 'norteamerica', 'asia', 'africa', 'oceania', 'otras']

// normaliza el idioma de i18next a 'en' | 'es'
export const langOf = (i18n) => ((i18n?.resolvedLanguage || i18n?.language || 'es').startsWith('en') ? 'en' : 'es')
// etiqueta según idioma (fallback a español)
export const pickLabel = (meta, lang) => (lang === 'en' && meta && meta.le ? meta.le : (meta ? meta.l : '—'))

// División por liga, para ordenar dentro del país (1ª, 2ª, 3ª). Default = 1.
export const LEAGUE_DIV = {
  40: 2, 41: 3,   // Inglaterra (39=1ª)
  117: 2,         // Bielorrusia (116=1ª Premier League)
  62: 2, 63: 3,   // Francia (61=1ª)
  79: 2, 80: 3,   // Alemania (78=1ª)
  72: 2,          // Brasil (71=1ª)
  107: 2,         // Polonia (106=1ª Ekstraklasa)
  120: 2,         // Dinamarca (119=1ª Superliga)
  136: 2,         // Italia (135=1ª)
  141: 2,         // España (140=1ª La Liga)
  211: 2,         // Croacia (210=1ª HNL)
  263: 2,         // México (262=1ª Liga MX)
  287: 2,         // Serbia (286=1ª Super Liga)
  308: 2,         // Arabia Saudí (307=1ª Pro League)
  361: 2,         // Lituania (362=1ª A Lyga)
  382: 2,         // Israel (383=1ª Ligat Ha'al)
}
export const divOf = (id) => LEAGUE_DIV[id] || 1

export const countryOf = (id) => LEAGUE_COUNTRY[id] || null
export const countryMeta = (country) => C[country] || { r: 'otras', c: null, l: country || '—', le: country || '—' }
export const regionOf = (id) => countryMeta(LEAGUE_COUNTRY[id]).r

// leagues = [{ league_id, league_name }] presentes → árbol región → país (alfabético) → ligas
export function buildRegionTree(leagues, lang = 'es') {
  const regions = {}
  leagues.forEach((lg) => {
    const country = LEAGUE_COUNTRY[lg.league_id] || '—'
    const cm = countryMeta(country)
    const rk = cm.r
    const reg = (regions[rk] ??= { countries: {} })
    const cc = (reg.countries[country] ??= { country, label: pickLabel(cm, lang), code: cm.c, leagues: [] })
    if (!cc.leagues.some((x) => x.league_id === lg.league_id)) cc.leagues.push(lg)
  })
  const loc = lang === 'en' ? 'en' : 'es'
  return REGION_ORDER.filter((rk) => regions[rk]).map((rk) => {
    const countries = Object.values(regions[rk].countries)
      .sort((a, b) => a.label.localeCompare(b.label, loc))
    countries.forEach((c) => c.leagues.sort((a, b) =>
      divOf(a.league_id) - divOf(b.league_id)
      || clubLeagueName(a.league_id, a.league_name).localeCompare(clubLeagueName(b.league_id, b.league_name), loc)))
    return { key: rk, label: pickLabel(REGION_META[rk], lang), ic: REGION_META[rk].ic, countries }
  })
}
