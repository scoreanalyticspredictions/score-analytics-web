import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './locales/en/translation.json'
import es from './locales/es/translation.json'

i18n
  .use(LanguageDetector)        // detecta idioma del navegador / localStorage
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: 'en',           // si el idioma no es soportado -> inglés
    supportedLngs: ['en', 'es'],
    load: 'languageOnly',        // 'es-MX' -> 'es'
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false },
    detection: {
      // 1) preferencia guardada; 2) idioma del navegador
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'lang',
      caches: ['localStorage'],  // persiste la elección entre visitas
    },
  })

export default i18n
