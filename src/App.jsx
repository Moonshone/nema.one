import { useEffect, useState } from 'react'
import Artists from './Artists.jsx'
import { getInitialLanguage, saveLanguage } from './languageStorage.js'
import translations from './translations.js'

function App() {
  const [language, setLanguage] = useState(getInitialLanguage)
  const content = translations[language]

  useEffect(() => {
    document.documentElement.lang = language
    document.title = `nema.one | ${content.artists.heading}`
    saveLanguage(language)
  }, [content.artists.heading, language])

  return (
    <div className="siteShell">
      <header className="siteHeader">
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
        <Artists labels={content.artists} />
      </main>
    </div>
  )
}

export default App
