# nema.one

Schlanke React-/Vite-Website für `nema.one`. Die Startseite zeigt Künstlerdaten aus einer Vercel Serverless Function, die Supabase serverseitig abfragt.

## Entwicklung starten

```bash
npm install
npm run dev
```

## Build erstellen

```bash
npm run build
```

## Projektstruktur

```text
nema.one/
├── api/
│   └── artists.js
├── public/
├── src/
│   ├── App.jsx
│   ├── Artists.jsx
│   ├── languageStorage.js
│   ├── main.jsx
│   ├── styles.css
│   └── translations.js
├── index.html
├── package.json
└── vite.config.js
```

## Supabase-Konfiguration für Vercel

Die Künstlerliste lädt Daten aus der Supabase-Tabelle `artists`. Setze die Environment Variables im Vercel-Projekt und deploye danach neu.

Erforderliche Variablen:

```text
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Alternativ werden auch diese Namen unterstützt:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-public-anon-key
```

Wenn Row Level Security öffentliche `SELECT`-Abfragen blockiert, nutze serverseitig einen privaten Key. Dieser wird nur in `/api/artists` verwendet und nicht an den Browser ausgeliefert:

```text
SUPABASE_SERVICE_ROLE_KEY=your-private-service-role-or-secret-key
# or
SUPABASE_SECRET_KEY=your-private-sb-secret-key
```

Optional kann der Tabellenname angepasst werden:

```text
SUPABASE_ARTISTS_TABLE=artists
```

## Künstlerbilder aus Supabase Storage

Für die Tabelle `artists` kann eines dieser Felder einen Bildpfad enthalten: `img_url`, `image_url`, `avatar_url`, `photo_url`, `picture` oder `image`.

Unterstützt werden vollständige URLs, Supabase-Storage-Pfade und einfache Dateinamen. Relative Pfade werden automatisch auf den öffentlichen Bucket `Bilder` normalisiert, zum Beispiel:

```text
Laleh/01.jpeg
Bilder/Laleh/01.jpeg
/storage/v1/object/public/Bilder/Laleh/01.jpeg
```

Der Storage-Bucket muss öffentlich lesbar sein oder eine passende Storage-Policy besitzen.
