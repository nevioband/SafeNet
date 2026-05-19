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

  const { message, history = [], lang = 'de' } = body

  if (!message || typeof message !== 'string' || message.length > 1000) {
    return new Response(JSON.stringify({ error: 'Ungültige Nachricht' }), {
      status: 400,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  // API Key prüfen
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'KI nicht konfiguriert' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  // Sicherheits-Filter: nur explizit sichere Anfragen kommen durch
  const blockRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'open-mistral-nemo',
      messages: [
        { role: 'system', content: 'You are a content safety filter. Reply with exactly one word: SAFE or UNSAFE.\n\nUNSAFE only for: Hitler, Nazis, Holocaust, Stalin, Pol Pot, genocides, war criminals, dictators and their crimes, terrorism, mass murderers, violence, weapons, drugs, sexual content, self-harm — even if phrased indirectly.\n\nSAFE for everything else, including: cybersecurity, hacking, account problems, passwords, phishing, malware, social engineering, data breaches, IT help, coding, cooking, weather, sports, math, music, films, travel, greetings, SafeNet platform, and ALL questions in German or any other language about these topics. Examples that are SAFE: "Mein Account wurde gehackt", "Ich habe ein Problem", "Was ist Phishing", "Wie sicher ist mein Passwort".\n\nReply with exactly one word: SAFE or UNSAFE.' },
        { role: 'user', content: message },
      ],
      max_tokens: 5,
      temperature: 0,
    }),
  }).catch(() => null)

  const filterVerdict = blockRes?.ok
    ? ((await blockRes.json().catch(() => null))?.choices?.[0]?.message?.content?.trim().toUpperCase() ?? '')
    : ''

  if (!filterVerdict.startsWith('SAFE')) {
    const reply = lang === 'en'
      ? "That's a topic I can't discuss here. I'm happy to help you with cybersecurity or anything on the SafeNet platform!"
      : 'Dazu kann ich hier keine Aussagen machen. Ich helfe dir gerne bei Cybersicherheit oder der SafeNet Plattform!'
    return new Response(JSON.stringify({ reply }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  // Mistral API aufrufen

  // Nachrichten für Mistral (OpenAI-kompatibles Format)
  const FEW_SHOT = [
    { role: 'user', content: 'Mein Account wurde gehackt' },
    { role: 'assistant', content: 'Ändere sofort dein Passwort und aktiviere die Zwei-Faktor-Authentifizierung. Überprüfe in den Einstellungen welche Geräte Zugriff haben (/de/pages/einstellungen.html).' },
    { role: 'user', content: 'Was ist Phishing?' },
    { role: 'assistant', content: 'Phishing ist ein Angriff bei dem Betrüger gefälschte E-Mails oder Webseiten nutzen um deine Zugangsdaten zu stehlen. Mehr dazu findest du hier (/de/pages/phishing.html).' },
    { role: 'user', content: 'Wie erstelle ich ein sicheres Passwort?' },
    { role: 'assistant', content: 'Ein sicheres Passwort hat mindestens 16 Zeichen, Gross- und Kleinbuchstaben, Zahlen und Sonderzeichen. Nutze unseren Passwort-Generator (/de/pages/generator.html).' },
    { role: 'user', content: 'Was ist 2FA?' },
    { role: 'assistant', content: 'Zwei-Faktor-Authentifizierung (2FA) schützt deinen Account mit einem zweiten Schritt nach dem Passwort, z.B. einem Code per App oder SMS. Details findest du hier (/de/pages/2fa.html).' },
    { role: 'user', content: 'Was ist Social Engineering?' },
    { role: 'assistant', content: 'Social Engineering ist eine Manipulationsmethode bei der Angreifer Menschen täuschen statt Technik zu hacken, z.B. durch gefälschte Anrufe oder E-Mails. Mehr dazu (/de/pages/socialengineering.html).' },
    { role: 'user', content: 'Was ist Ransomware?' },
    { role: 'assistant', content: 'Ransomware ist Schadsoftware die deine Dateien verschlüsselt und Lösegeld fordert. Sichere regelmässig deine Daten und öffne keine unbekannten Anhänge (/de/pages/ransomware.html).' },
    { role: 'user', content: 'Was ist ein Keylogger?' },
    { role: 'assistant', content: 'Ein Keylogger zeichnet alle Tastatureingaben auf und kann so Passwörter und sensible Daten stehlen. Halte dein System und Antivirenprogramm aktuell (/de/pages/keylogger.html).' },
    { role: 'user', content: 'Was ist ein Bruteforce-Angriff?' },
    { role: 'assistant', content: 'Bei einem Bruteforce-Angriff probiert ein Programm automatisch millionen Passwortkombinationen aus. Lange und komplexe Passwörter sowie 2FA schützen davor (/de/pages/bruteforce.html).' },
    { role: 'user', content: 'Was ist Man-in-the-Middle?' },
    { role: 'assistant', content: 'Bei einem Man-in-the-Middle-Angriff schaltet sich ein Angreifer unbemerkt zwischen dich und eine Webseite und liest den Datenverkehr mit. Nutze immer HTTPS und kein öffentliches WLAN ohne VPN (/de/pages/mitm.html).' },
    { role: 'user', content: 'Wie funktioniert der Tresor?' },
    { role: 'assistant', content: 'Der SafeNet Tresor speichert deine Passwörter verschlüsselt direkt in deinem Account. Nur du hast Zugriff über dein Master-Passwort (/de/pages/tresor.html).' },
    { role: 'user', content: 'Was ist Quishing?' },
    { role: 'assistant', content: 'Quishing ist Phishing über QR-Codes. Scanne nur QR-Codes aus vertrauenswürdigen Quellen und prüfe die URL nach dem Scannen (/de/pages/quishing.html).' },
    { role: 'user', content: 'Wie sicher ist mein Passwort?' },
    { role: 'assistant', content: 'Das kannst du mit unserem Passwort-Analysator direkt testen (/de/pages/analysator.html). Er zeigt dir wie lange ein Angriff brauchen würde und gibt Verbesserungsvorschläge.' },
    { role: 'user', content: 'Was ist MFA-Bypass?' },
    { role: 'assistant', content: 'MFA-Bypass ist eine Angriffsmethode um die Zwei-Faktor-Authentifizierung zu umgehen, z.B. durch SIM-Swapping oder Phishing-Kits die den 2FA-Code abfangen (/de/pages/mfa-bypass.html).' },
    { role: 'user', content: 'Mein Passwort wurde geleakt' },
    { role: 'assistant', content: 'Ändere das Passwort sofort auf allen Diensten wo du es verwendet hast und aktiviere 2FA. Prüfe ob weitere Accounts betroffen sind und nutze für jeden Dienst ein einzigartiges Passwort.' },
  ]

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...FEW_SHOT,
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
