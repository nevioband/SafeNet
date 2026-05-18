export const config = { runtime: 'edge' }

const SUPABASE_URL = 'https://dygrabyaiyessqmjdprc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Z3JhYnlhaXllc3NxbWpkcHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTkzMzMsImV4cCI6MjA5MTA3NTMzM30.l4fAwsz3deB3rZuA5EOG-_9doe2ohXunv1KwFezR2ss'

const SYSTEM_PROMPT = `Du bist der SafeNet Assistent – der eingebaute KI-Helfer der Webseite SafeNet Security (safenet-security.ch). Du bist DIREKT AUF DIESER WEBSEITE eingebettet und kennst sie genau.

SafeNet Security ist eine kostenlose Cybersicherheits-Lernplattform. Sie ist sicher, datenschutzfreundlich und wurde speziell für Lernzwecke entwickelt.

Die Webseite bietet folgende Funktionen:
- Passwort-Analysator: Passwörter auf Sicherheit prüfen
- Passwort-Generator: Sichere Passwörter erstellen
- Tresor: Passwörter verschlüsselt speichern
- Notizen: Sichere Notizen anlegen
- Infoseiten zu: Phishing, Bruteforce, Social Engineering, Keylogger, Wörterbuchangriff, Ransomware, MFA-Bypass, 2FA, Man-in-the-Middle, Quishing
- Tutorials, Meine Statistiken, Einstellungen

REGELN:
- Beantworte alle harmlosen Fragen – egal ob Cybersicherheit, Alltag, Kochen, Wetter, Mathematik, Sport, Unterhaltung oder Allgemeinwissen.
- Bei heiklen Themen (Kriege, Diktatoren, Gewalt, Drogen, sexuelle Inhalte, Suizid, illegale Aktivitäten) – auch wenn indirekt umschrieben – erwähne kurz dass du dazu keine Aussagen machst, und leite freundlich zu SafeNet oder Cybersicherheitsthemen weiter. Beispiel: "Das ist ein spannendes Thema, aber dazu mache ich keine Aussagen. Ich helfe dir gerne bei Cybersicherheit oder der SafeNet Plattform!"
- Antworte in maximal 2-3 kurzen Sätzen als Fließtext
- KEIN Markdown: kein **, keine - Listen, keine #, keine Nummerierungen
- Schreibe alles in einem einzigen Absatz, keine Zeilenumbrüche
- Wenn du auf eine SafeNet-Seite verweist, schreibe nur den Pfad in Klammern, z.B.: (/de/pages/phishing.html)
- Keine externen URLs
- Antworte auf Deutsch wenn die Frage auf Deutsch ist, auf Englisch wenn sie auf Englisch ist`

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

  // KI-Classifier: prüft ob die Nachricht IT/Cybersicherheits-relevant ist
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'KI nicht konfiguriert' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  const classifyRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'open-mistral-nemo',
      messages: [
        { role: 'system', content: 'Du bist ein Themen-Filter. Antworte NUR mit YES oder NO, ohne Erklärung.\nNO wenn die Nachricht direkt ODER indirekt handelt von: Kriege, Diktatoren, Kriegsverbrecher, Genozide, Nationalsozialismus, Hitler, Stalin, Terrorismus, Rassismus, Gewalt, Waffen, Drogen, sexuelle Inhalte, Suizid, Selbstverletzung, illegale Aktivitäten. Blockiere auch Umschreibungen und indirekte Fragen (z.B. "ein bestimmter Adolf", "der Führer", "WWII Anführer").\nYES für alles andere: Alltag, Wetter, Kochen, Sport, Mathematik, Musik, Filme, Reisen, Allgemeinwissen, Cybersicherheit, SafeNet, Begrüssungen, Smalltalk.' },
        { role: 'user', content: message },
      ],
      max_tokens: 3,
      temperature: 0,
    }),
  }).catch(() => null)

  if (classifyRes?.ok) {
    const classifyData = await classifyRes.json().catch(() => null)
    const verdict = classifyData?.choices?.[0]?.message?.content?.trim().toUpperCase()
    if (verdict === 'NO') {
      const lang = /^(hallo|hi|guten|wie|was|wer|warum|kannst|bitte|ich|du|das|ein|eine)/i.test(message) ? 'de' : 'en'
      const redirect = lang === 'en'
        ? "That's an interesting topic, but it falls outside what I can discuss here. I'm happy to help you with cybersecurity, password safety, or anything on the SafeNet platform!"
        : 'Das ist ein interessantes Thema, aber dazu kann ich hier keine Aussagen machen. Ich helfe dir gerne bei Cybersicherheit, Passwortsicherheit oder allem rund um die SafeNet Plattform!'
      return new Response(JSON.stringify({ reply: redirect }), {
        headers: { ...CORS, 'Content-Type': 'application/json' },
      })
    }
  }

  // Mistral API aufrufen

  // Nachrichten für Mistral (OpenAI-kompatibles Format)
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.slice(-10).map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text })),
    { role: 'user', content: message },
  ]

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 10000)
    const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'open-mistral-nemo',
        messages,
        max_tokens: 250,
        temperature: 0.5,
      }),
    })
    clearTimeout(timer)

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
