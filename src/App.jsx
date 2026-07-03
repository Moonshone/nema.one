import { useEffect, useState } from 'react'

const translations = {
  de: {
    languageName: 'Deutsch',
    shortName: 'DE',
    logoLabel: 'NEMA.one Startseite',
    switchLabel: 'Sprache auswählen',
    navLabel: 'Hauptnavigation',
    navigation: {
      home: 'Startseite',
    },
    eyebrow: 'NEMA.one',
    headline: 'Herzlich Willkommen!',
    intro:
      'Dies ist deine zweisprachige Startseite. Wähle oben im Header Deutsch oder Englisch und die Inhalte passen sich sofort an.',
    cta: 'Los geht’s',
  },
  en: {
    languageName: 'English',
    shortName: 'EN',
    logoLabel: 'NEMA.one homepage',
    switchLabel: 'Select language',
    navLabel: 'Main navigation',
    navigation: {
      home: 'Home',
    },
    eyebrow: 'NEMA.one',
    headline: 'Welcome!',
    intro:
      'This is your bilingual homepage. Choose German or English in the header and the content updates instantly.',
    cta: 'Get started',
  },
}

const getSavedLanguage = () => {
  try {
    return window.localStorage.getItem('language')
  } catch {
    return null
  }
}

const saveLanguage = (language) => {
  try {
    window.localStorage.setItem('language', language)
  } catch {
    // The language switcher still works for the current visit if storage is blocked.
  }
}

const getInitialLanguage = () => {
  const savedLanguage = getSavedLanguage()

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
    document.title = `nema.one | ${content.navigation.home}`
    saveLanguage(language)
  }, [content.navigation.home, language])

  return (
    <div className="siteShell">
      <header className="siteHeader">
        <a className="brand" href="/" aria-label={content.logoLabel}>
          NEMA.one
        </a>

        <nav className="mainNav" aria-label={content.navLabel}>
          <a href="/">{content.navigation.home}</a>
        </nav>

        <div className="languageSwitcher" aria-label={content.switchLabel}>
          {Object.entries(translations).map(([code, translation]) => (
            <button
              aria-pressed={code === language}
              className={code === language ? 'active' : ''}
              key={code}
              onClick={() => setLanguage(code)}
              type="button"
            >
              <span className="languageShortName">{translation.shortName}</span>
              <span className="languageName">{translation.languageName}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="homePage">
        <section className="heroCard" aria-labelledby="welcome-heading">
          <p className="eyebrow">{content.eyebrow}</p>
          <h1 id="welcome-heading">{content.headline}</h1>
          <p className="intro">{content.intro}</p>
          <a className="primaryLink" href="mailto:hello@nema.one">
            {content.cta}
          </a>
        </section>
      </main>
    </div>
  )
}

export default App
