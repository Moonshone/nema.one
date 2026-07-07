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
SUPABASE_SERVICE_ROLE_KEY=your-private-service-role-or-secret-key
# or
SUPABASE_SECRET_KEY=your-private-sb-secret-key
```

Dieser Key wird nur in der Vercel Serverless Function `/api/artists` verwendet und nicht an den Browser ausgeliefert. Danach das Vercel-Projekt neu deployen.

Optional kann der Tabellenname angepasst werden:

```text
SUPABASE_ARTISTS_TABLE=artists
```

### Künstlerbilder aus Supabase Storage

Für die Tabelle `artists` kann `img_url` entweder eine vollständige Bild-URL enthalten oder einen Supabase-Storage-Pfad im Format:

```text
Artists/Laleh/01.jpeg
```

Dieser Pfad wird automatisch zu öffentlichen Supabase-Storage-URLs normalisiert. Die App probiert mehrere Kandidaten, damit sowohl Bucket-Namen als auch Ordner-Pfade funktionieren, zum Beispiel:

```text
https://your-project-ref.supabase.co/storage/v1/object/public/artists/Laleh/01.jpeg
https://your-project-ref.supabase.co/storage/v1/object/public/Artists/Laleh/01.jpeg
https://your-project-ref.supabase.co/storage/v1/object/public/artists/Artists/Laleh/01.jpeg
```

Der passende Storage-Bucket muss dafür öffentlich lesbar sein oder eine passende Storage-Policy besitzen.

Wenn `SUPABASE_SERVICE_ROLE_KEY` oder `SUPABASE_SECRET_KEY` in Vercel gesetzt ist, erzeugt `/api/artists` zusätzlich signierte Supabase-Storage-URLs für die Künstlerbilder. Dadurch können Bilder auch dann geladen werden, wenn der Bucket nicht direkt öffentlich erreichbar ist, solange der Service Role Key korrekt gesetzt ist.
