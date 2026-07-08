import { useEffect, useRef, useState } from 'react'
import Artists from './Artists.jsx'
import { getInitialLanguage, saveLanguage } from './languageStorage.js'
import translations from './translations.js'

const languageFlags = {
  en: '🇬🇧',
  de: '🇩🇪',
}

function LanguageFlag({ code }) {
  if (code === 'fa') {
    return (
      <span aria-hidden="true" className="languageFlag persianFlag">
        <span className="persianFlagSun">☀</span>
        <span className="persianFlagLion">♌</span>
      </span>
    )
  }

  return (
    <span aria-hidden="true" className="languageFlag">
      {languageFlags[code]}
    </span>
  )
}

function App() {
  const [language, setLanguage] = useState(getInitialLanguage)
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false)
  const languageSwitcherRef = useRef(null)
  const content = translations[language]

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr'
    document.title = `nema.one | ${content.artists.heading}`
    saveLanguage(language)
  }, [content.artists.heading, language])

  useEffect(() => {
    const closeLanguageMenu = (event) => {
      if (!languageSwitcherRef.current?.contains(event.target)) {
        setIsLanguageMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeLanguageMenu)

    return () => document.removeEventListener('pointerdown', closeLanguageMenu)
  }, [])

  const selectLanguage = (code) => {
    setLanguage(code)
    setIsLanguageMenuOpen(false)
  }

  return (
    <div className="siteShell">
      <header className="siteHeader">
        <div className="languageSwitcher" ref={languageSwitcherRef}>
          <button
            aria-expanded={isLanguageMenuOpen}
            aria-haspopup="menu"
            aria-label={content.switchLabel}
            className="languageMenuButton"
            onClick={() => setIsLanguageMenuOpen((isOpen) => !isOpen)}
            type="button"
          >
            <LanguageFlag code={language} />
            <span className="languageShortName">{content.shortName}</span>
            <span className="languageName">{content.languageName}</span>
            <span aria-hidden="true" className="languageMenuChevron">⌄</span>
          </button>

          {isLanguageMenuOpen && (
            <div aria-label={content.switchLabel} className="languageMenu" role="menu">
              {Object.entries(translations).map(([code, translation]) => (
                <button
                  aria-checked={code === language}
                  className={code === language ? 'active' : ''}
                  key={code}
                  onClick={() => selectLanguage(code)}
                  role="menuitemradio"
                  type="button"
                >
                  <LanguageFlag code={code} />
                  <span className="languageShortName">{translation.shortName}</span>
                  <span className="languageName">{translation.languageName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="homePage">
        <Artists labels={content.artists} />
      </main>
    </div>
  )
}

export default App
