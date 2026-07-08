import translations from './translations.js'

export const getSavedLanguage = () => {
  try {
    return window.localStorage.getItem('language')
  } catch {
    return null
  }
}

export const saveLanguage = (language) => {
  try {
    window.localStorage.setItem('language', language)
  } catch {
    // The language switcher still works for the current visit if storage is blocked.
  }
}

export const getInitialLanguage = () => {
  const savedLanguage = getSavedLanguage()

  if (savedLanguage && translations[savedLanguage]) {
    return savedLanguage
  }

  return 'en'
}
