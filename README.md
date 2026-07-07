# nema.one

React-Grundgerüst für die Website `nema.one`.

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
├── public/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
└── vite.config.js
```

## Supabase-Konfiguration für Vercel

Die Künstlerliste lädt Daten aus der Supabase-Tabelle `artists`. Wenn die Seite über Vercel deployed wird, müssen die Environment Variables im Vercel-Projekt gesetzt werden. GitHub Secrets werden von Vercel-Autodeployments nicht automatisch in den Vite-Build übernommen.

Erforderliche Variablen:

```text
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

Alternativ werden auch diese Vercel-/Next-üblichen Namen unterstützt:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key
```

Für die Vercel Runtime-API `/api/supabase-config` werden zusätzlich diese Namen unterstützt:

```text
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-public-anon-key
```

Nach dem Setzen oder Ändern der Variablen muss das Vercel-Projekt neu deployed werden.

### Wenn die Seite „keine Künstler vorhanden“ zeigt

Wenn `/api/supabase-config` Werte zurückgibt, aber die Seite trotzdem „Aktuell sind keine Künstler vorhanden.“ zeigt, liefert die Supabase-Abfrage ein leeres Array. Häufige Ursache ist Row Level Security auf der Tabelle `artists` ohne öffentliche `SELECT`-Policy.

Sichere Lösung für Vercel:

```text
SUPABASE_SERVICE_ROLE_KEY=your-private-service-role-key
```

Dieser Key wird nur in der Vercel Serverless Function `/api/artists` verwendet und nicht an den Browser ausgeliefert. Danach das Vercel-Projekt neu deployen.

Optional kann der Tabellenname angepasst werden:

```text
SUPABASE_ARTISTS_TABLE=artists
```
