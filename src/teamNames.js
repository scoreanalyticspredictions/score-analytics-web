// Nombres de selección localizados al español (ES). En inglés se usa el nombre
// original de los datos. Para LOOKUPS (código FIFA, navegación) se sigue usando el
// nombre original en inglés; esto es solo para MOSTRAR.
import { useTranslation } from 'react-i18next'

const ES = {
  algeria: 'Argelia', argentina: 'Argentina', australia: 'Australia', austria: 'Austria',
  belgium: 'Bélgica', bosniaherzegovina: 'Bosnia y Herzegovina', brazil: 'Brasil',
  canada: 'Canadá', capeverdeislands: 'Cabo Verde', capeverde: 'Cabo Verde',
  colombia: 'Colombia', congodr: 'RD Congo', croatia: 'Croacia', curacao: 'Curazao',
  czechrepublic: 'República Checa', ecuador: 'Ecuador', egypt: 'Egipto', england: 'Inglaterra',
  france: 'Francia', germany: 'Alemania', ghana: 'Ghana', haiti: 'Haití', iran: 'Irán',
  iraq: 'Irak', ivorycoast: 'Costa de Marfil', japan: 'Japón', jordan: 'Jordania',
  mexico: 'México', morocco: 'Marruecos', netherlands: 'Países Bajos', newzealand: 'Nueva Zelanda',
  norway: 'Noruega', panama: 'Panamá', paraguay: 'Paraguay', portugal: 'Portugal',
  qatar: 'Catar', saudiarabia: 'Arabia Saudita', scotland: 'Escocia', senegal: 'Senegal',
  southafrica: 'Sudáfrica', southkorea: 'Corea del Sur', spain: 'España', sweden: 'Suecia',
  switzerland: 'Suiza', tunisia: 'Túnez', turkiye: 'Turquía', turkey: 'Turquía',
  uruguay: 'Uruguay', usa: 'Estados Unidos', uzbekistan: 'Uzbekistán',
  nigeria: 'Nigeria', denmark: 'Dinamarca', italy: 'Italia', honduras: 'Honduras',
}

const norm = (s) => (s || '')
  .normalize('NFKD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z]/g, '')

export function localizeTeam(name, lang) {
  if (!(lang || '').startsWith('es')) return name
  return ES[norm(name)] || name
}

// Hook: devuelve una función tn(name) ligada al idioma activo.
export function useTeamName() {
  const { i18n } = useTranslation()
  const lang = i18n.resolvedLanguage || i18n.language
  return (name) => localizeTeam(name, lang)
}
