export const config = { runtime: 'edge' }

const SUPABASE_URL = 'https://dygrabyaiyessqmjdprc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Z3JhYnlhaXllc3NxbWpkcHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTkzMzMsImV4cCI6MjA5MTA3NTMzM30.l4fAwsz3deB3rZuA5EOG-_9doe2ohXunv1KwFezR2ss'

const SYSTEM_PROMPT = `Du bist SafeNet Assistent, der KI-Helfer der Sicherheits-Lernplattform SafeNet Security (safenet-security.ch).

REGELN (zwingend):
- Antworte IMMER in maximal 3 kurzen Sätzen. Keine langen Erklärungen.
- Kein Markdown: keine **fett**, keine Listen mit -, keine Überschriften mit #
- Wenn du auf eine Seite verweist, schreibe nur den Pfad in Klammern, z.B.: Schau dir Phishing an (/de/pages/phishing.html)
- Keine externen Links, keine URLs ausser SafeNet-Pfade
- Antworte auf Deutsch wenn die Frage auf Deutsch ist, auf Englisch wenn sie auf Englisch ist
- Bleibe beim Thema Cybersicherheit und der SafeNet Plattform

Verfügbare SafeNet-Seiten:
analysator.html, generator.html, tresor.html, notizen.html, phishing.html, bruteforce.html, socialengineering.html, keylogger.html, wörterbuchangriff.html, ransomware.html, mfa-bypass.html, 2fa.html, mitm.html, quishing.html, tutorials.html, meine-stats.html

Beispiel gute Antwort: "Phishing ist eine Methode, bei der Angreifer gefälschte E-Mails verschicken, um Zugangsdaten zu stehlen. Erkenne sie an komischen Absendern und verdächtigen Links. Mehr dazu findest du hier (/de/pages/phishing.html)"`

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
  let userRes
  try {
    userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { Authorization: auth, apikey: SUPABASE_ANON_KEY },
    })
  } catch {
    return new Response(JSON.stringify({ error: 'Auth-Verbindungsfehler' }), {
      status: 502,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
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

  // Mistral API aufrufen
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'KI nicht konfiguriert' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  // Nachrichten für Mistral (OpenAI-kompatibles Format)
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-10).map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text })),
    { role: 'user', content: message },
  ]

  try {
    const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages,
        max_tokens: 600,
        temperature: 0.7,
      }),
    })

    if (!mistralRes.ok) {
      const errText = await mistralRes.text().catch(() => '')
      console.error('[SafeNet Chat] Mistral Error', mistralRes.status, errText)
      return new Response(JSON.stringify({ error: `Mistral ${mistralRes.status}: ${errText.slice(0, 200)}` }), {
        status: 502,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }

    const data = await mistralRes.json()
    const reply = data.choices?.[0]?.message?.content ?? 'Keine Antwort erhalten.'

    return new Response(JSON.stringify({ reply }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Verbindungsfehler: ' + e.message }), {
      status: 502,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
}
