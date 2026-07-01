function App() {
  return (
    <main className="page">
      <nav className="navbar">
        <a className="logo" href="/">
          nema.one
        </a>

        <div className="navLinks" aria-label="Hauptnavigation">
          <a href="#start">Start</a>
          <a href="#angebote">Angebote</a>
          <a href="#kontakt">Kontakt</a>
        </div>
      </nav>

      <section id="start" className="hero">
        <p className="eyebrow">React Grundgerüst</p>
        <h1>Willkommen auf nema.one</h1>
        <p className="heroText">
          Diese Startseite ist ein modernes, minimalistisches Grundgerüst für dein neues React-Projekt.
          Du kannst darauf deine Inhalte, Seiten und Funktionen Schritt für Schritt aufbauen.
        </p>

        <div className="actions">
          <a className="button primary" href="#angebote">
            Projekt ansehen
          </a>
          <a className="button secondary" href="#kontakt">
            Kontakt
          </a>
        </div>
      </section>

      <section id="angebote" className="cardsSection">
        <h2>Grundaufbau</h2>

        <div className="cards">
          <article className="card">
            <h3>React</h3>
            <p>Komponentenbasierte Struktur mit sauberem Einstiegspunkt.</p>
          </article>

          <article className="card">
            <h3>Vite</h3>
            <p>Schnelle Entwicklungsumgebung für moderne Frontend-Projekte.</p>
          </article>

          <article className="card">
            <h3>CSS</h3>
            <p>Eigene Styling-Datei für Layout, Farben, Buttons und responsive Darstellung.</p>
          </article>
        </div>
      </section>

      <section id="kontakt" className="contactSection">
        <h2>Bereit für den nächsten Schritt?</h2>
        <p>
          Als Nächstes können Navigation, Unterseiten, Bilder, Datenbank-Anbindung oder ein Deployment ergänzt werden.
        </p>
      </section>
    </main>
  )
}

export default App
