import { useEffect, useState } from 'react'

const translations = {
  de: {
    languageName: 'Deutsch',
    eyebrow: 'NEMA.one',
    headline: 'Herzlich Willkommen!',
    intro:
      'Wähle deine bevorzugte Sprache und erlebe diese Webseite auf Deutsch oder Englisch.',
    switchLabel: 'Sprache auswählen',
  },
  en: {
    languageName: 'English',
    eyebrow: 'NEMA.one',
    headline: 'Welcome!',
    intro:
      'Choose your preferred language and experience this website in German or English.',
    switchLabel: 'Select language',
  },
}

const getInitialLanguage = () => {
  const savedLanguage = window.localStorage.getItem('language')

  if (savedLanguage && translations[savedLanguage]) {
    return savedLanguage
  }

  return navigator.language.toLowerCase().startsWith('de') ? 'de' : 'en'
}

function App() {
  const [language, setLanguage] = useState(getInitialLanguage)
  const content = translations[language]

  useEffect(() => {
    document.documentElement.lang = language
    window.localStorage.setItem('language', language)
  }, [language])

  return (
    <main className="homePage">
      <section className="heroCard" aria-labelledby="welcome-heading">
        <p className="eyebrow">{content.eyebrow}</p>
        <h1 id="welcome-heading">{content.headline}</h1>
        <p className="intro">{content.intro}</p>

        <div className="languageSwitcher" aria-label={content.switchLabel}>
          {Object.entries(translations).map(([code, translation]) => (
            <button
              className={code === language ? 'active' : ''}
              key={code}
              onClick={() => setLanguage(code)}
              type="button"
            >
              {translation.languageName}
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}

export default App
