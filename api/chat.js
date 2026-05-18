export const config = { runtime: 'edge' }

const SUPABASE_URL = 'https://dygrabyaiyessqmjdprc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Z3JhYnlhaXllc3NxbWpkcHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTkzMzMsImV4cCI6MjA5MTA3NTMzM30.l4fAwsz3deB3rZuA5EOG-_9doe2ohXunv1KwFezR2ss'

const SYSTEM_PROMPT = `Du bist SafeNet Assistent, der KI-Helfer der Sicherheits-Lernplattform SafeNet Security (safenet-security.ch).

Du hilfst bei:
- Fragen zu Cybersicherheit: Phishing, Bruteforce, Social Engineering, Keylogger, Wörterbuchangriff, Ransomware, MFA/2FA, Man-in-the-Middle, Quishing (QR-Phishing)
- Navigation auf der Plattform: Passwort-Analysator, Generator, Tresor, Notizen, Tutorials, Meine Stats, Einstellungen
- Allgemeinen Sicherheitstipps und Best Practices

Verfügbare Seiten (DE):
- /de/pages/analysator.html – Passwort-Analysator
- /de/pages/generator.html – Passwort-Generator
- /de/pages/tresor.html – Verschlüsselter Passwort-Tresor
- /de/pages/notizen.html – Sichere Notizen
- /de/pages/phishing.html – Phishing
- /de/pages/bruteforce.html – Bruteforce-Angriffe
- /de/pages/socialengineering.html – Social Engineering
- /de/pages/keylogger.html – Keylogger
- /de/pages/wörterbuchangriff.html – Wörterbuchangriff
- /de/pages/ransomware.html – Ransomware
- /de/pages/mfa-bypass.html – MFA-Bypass
- /de/pages/2fa.html – Zwei-Faktor-Authentifizierung
- /de/pages/mitm.html – Man-in-the-Middle
- /de/pages/quishing.html – Quishing
- /de/pages/tutorials.html – Tutorials
- /de/pages/meine-stats.html – Meine Statistiken

Antworte auf Deutsch wenn die Frage auf Deutsch ist, auf Englisch wenn sie auf Englisch ist.
Bleibe beim Thema Cybersicherheit und der SafeNet Plattform.
Halte Antworten kurz und präzise (2–4 Sätze), außer bei komplexen Themen.
Sei freundlich und lehrreich.`

const CORS = {
  'Access-Control-Allow-Origin': 'https://safenet-security.ch',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: CORS })
  }

  // Auth-Token prüfen
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Nicht eingeloggt' }), {
      status: 401,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  // Token bei Supabase validieren
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: auth, apikey: SUPABASE_ANON_KEY },
  })
  if (!userRes.ok) {
    return new Response(JSON.stringify({ error: 'Ungültige Sitzung' }), {
      status: 401,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  // Body parsen
  let body
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Ungültige Anfrage' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  const { message, history = [] } = body

  if (!message || typeof message !== 'string' || message.length > 1000) {
    return new Response(JSON.stringify({ error: 'Ungültige Nachricht' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  // Gesprächsverlauf aufbauen (max. 10 vorherige Nachrichten)
  const contents = []
  for (const msg of history.slice(-10)) {
    if (msg.role && typeof msg.text === 'string' && msg.text.length <= 2000) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      })
    }
  }
  contents.push({ role: 'user', parts: [{ text: message }] })

  // Gemini API aufrufen
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'KI nicht konfiguriert' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents,
          generationConfig: { maxOutputTokens: 600, temperature: 0.7 },
        }),
      }
    )

    if (!geminiRes.ok) {
      return new Response(JSON.stringify({ error: 'KI-Fehler, bitte erneut versuchen' }), {
        status: 502,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const data = await geminiRes.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'Keine Antwort erhalten.'

    return new Response(JSON.stringify({ reply }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Verbindungsfehler' }), {
      status: 502,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
}
