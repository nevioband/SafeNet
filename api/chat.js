export const config = { runtime: 'edge' }

const SUPABASE_URL = 'https://dygrabyaiyessqmjdprc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Z3JhYnlhaXllc3NxbWpkcHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTkzMzMsImV4cCI6MjA5MTA3NTMzM30.l4fAwsz3deB3rZuA5EOG-_9doe2ohXunv1KwFezR2ss'

function buildSystemPrompt(lang) {
  const prefix = `/${lang}/pages`
  if (lang === 'en') {
    return `You are the SafeNet Assistant – the built-in AI helper of the website SafeNet Security (safenet-security.ch). You are embedded DIRECTLY ON THIS WEBSITE and know it well.

SafeNet Security is a free cybersecurity learning platform. It is secure, privacy-friendly and designed specifically for educational purposes.

AVAILABLE PAGES (use ONLY these exact URLs, never invent paths):
${prefix}/analysator.html – Password Analyser
${prefix}/generator.html – Password Generator
${prefix}/tresor.html – Vault
${prefix}/notizen.html – Notes
${prefix}/tutorials.html – Tutorials
${prefix}/meine-stats.html – My Statistics
${prefix}/einstellungen.html – Settings
${prefix}/phishing.html – Phishing
${prefix}/bruteforce.html – Bruteforce
${prefix}/socialengineering.html – Social Engineering
${prefix}/keylogger.html – Keylogger
${prefix}/wörterbuchangriff.html – Dictionary Attack
${prefix}/ransomware.html – Ransomware
${prefix}/mfa-bypass.html – MFA Bypass
${prefix}/2fa.html – 2FA
${prefix}/mitm.html – Man-in-the-Middle
${prefix}/quishing.html – Quishing
${prefix}/angriff.html – Attack Overview
${prefix}/news.html – News
${prefix}/login.html – Login
${prefix}/register.html – Register
${prefix}/kontakt.html – Contact
${prefix}/feedback.html – Feedback
${prefix}/datenschutzerklärung.html – Privacy Policy
${prefix}/impressum.html – Imprint
${prefix}/haftungsausschluss.html – Disclaimer
${prefix}/übersns.html – About SafeNet
${prefix}/desktop.html – Desktop App

RULES:
- ALWAYS respond in English. Never use German or any other language. Not even one word.
- Answer all harmless questions – whether cybersecurity, everyday topics, cooking, weather, math, sports, or general knowledge.
- For sensitive topics (wars, dictators, violence, drugs, sexual content, suicide, illegal activities) – briefly state you cannot comment and redirect to SafeNet or cybersecurity topics.
- Be precise and professional. No small talk, no casual language, no irony.
- Answer in maximum 2-3 short sentences as plain text.
- NO Markdown: no **, no bullet lists, no #, no numbering.
- Write everything in one single paragraph, no line breaks.
- Do NOT ask follow-up questions. If a message is unclear, give a helpful answer based on the most likely meaning.
- When referring to a SafeNet page, write only the path in brackets using EXACTLY the URLs listed above.
- No external URLs.`
  }
  return `Du bist der SafeNet Assistent – der eingebaute KI-Helfer der Webseite SafeNet Security (safenet-security.ch). Du bist DIREKT AUF DIESER WEBSEITE eingebettet und kennst sie genau.

SafeNet Security ist eine kostenlose Cybersicherheits-Lernplattform. Sie ist sicher, datenschutzfreundlich und wurde speziell für Lernzwecke entwickelt.

VERFÜGBARE SEITEN (verwende AUSSCHLIESSLICH diese exakten URLs, erfinde keine Pfade):
${prefix}/analysator.html – Passwort-Analysator
${prefix}/generator.html – Passwort-Generator
${prefix}/tresor.html – Tresor
${prefix}/notizen.html – Notizen
${prefix}/tutorials.html – Tutorials
${prefix}/meine-stats.html – Meine Statistiken
${prefix}/einstellungen.html – Einstellungen
${prefix}/phishing.html – Phishing
${prefix}/bruteforce.html – Bruteforce
${prefix}/socialengineering.html – Social Engineering
${prefix}/keylogger.html – Keylogger
${prefix}/wörterbuchangriff.html – Wörterbuchangriff
${prefix}/ransomware.html – Ransomware
${prefix}/mfa-bypass.html – MFA-Bypass
${prefix}/2fa.html – 2FA
${prefix}/mitm.html – Man-in-the-Middle
${prefix}/quishing.html – Quishing
${prefix}/angriff.html – Angriffsübersicht
${prefix}/news.html – News
${prefix}/login.html – Login
${prefix}/register.html – Registrieren
${prefix}/kontakt.html – Kontakt
${prefix}/feedback.html – Feedback
${prefix}/datenschutzerklärung.html – Datenschutzerklärung
${prefix}/impressum.html – Impressum
${prefix}/haftungsausschluss.html – Haftungsausschluss
${prefix}/übersns.html – Über SafeNet
${prefix}/desktop.html – Desktop App

REGELN:
- Antworte in der Sprache in der der Nutzer schreibt. Schreibt er Deutsch → antworte Deutsch. Schreibt er Englisch → antworte Englisch. Standardsprache ist Deutsch.
- Beantworte alle harmlosen Fragen – egal ob Cybersicherheit, Alltag, Kochen, Wetter, Mathematik, Sport, Unterhaltung oder Allgemeinwissen.
- Bei heiklen Themen (Kriege, Diktatoren, Gewalt, Drogen, sexuelle Inhalte, Suizid, illegale Aktivitäten) – auch wenn indirekt umschrieben – erwähne kurz dass du dazu keine Aussagen machst, und leite freundlich zu SafeNet oder Cybersicherheitsthemen weiter.
- Sei präzise und professionell. Kein Smalltalk, keine Umgangssprache, keine Ironie.
- Antworte in maximal 2-3 kurzen Sätzen als Fließtext.
- KEIN Markdown: kein **, keine - Listen, keine #, keine Nummerierungen.
- Schreibe alles in einem einzigen Absatz, keine Zeilenumbrüche.
- Stelle KEINE Rückfragen. Wenn eine Nachricht unklar ist, gib sofort eine hilfreiche Antwort basierend auf der wahrscheinlichsten Bedeutung.
- Wenn du auf eine SafeNet-Seite verweist, schreibe nur den Pfad in Klammern und nutze AUSSCHLIESSLICH die oben aufgelisteten URLs.
- Keine externen URLs.`
}

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

  // Sprache der Nachricht erkennen (übersteuert UI-Sprache falls Nutzer andere Sprache schreibt)
  const msgIsEnglish = !/[äöüÄÖÜß]/.test(message) &&
    /\b(is|are|the|who|what|how|why|when|where|admin|from|this|that|my|your|can|please|help|and|not|have|has|tell|me|a|an|i|im|dont|speak|english|hello|hi|understand|understand|problem|question|want|need)/i.test(message)
  const effectiveLang = msgIsEnglish ? 'en' : lang

  // Sicherheits-Filter: nur explizit sichere Anfragen kommen durch
  const blockRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'open-mistral-nemo',
      messages: [
        { role: 'system', content: 'You are a content safety filter. Reply with exactly one word: SAFE or UNSAFE.\n\nUNSAFE only for: Hitler, Nazis, Holocaust, Stalin, Pol Pot, genocides, war criminals, dictators and their crimes, terrorism, mass murderers, violence, weapons, drugs, sexual content, self-harm, suicide — even if phrased indirectly.\n\nSAFE for absolutely everything else, especially: cybersecurity, hacking, being hacked, account problems, passwords, phishing, malware, social engineering, data breaches, IT help, coding, cooking, weather, sports, math, music, films, travel, greetings, general questions, SafeNet platform topics, and any short or vague messages.\n\nExamples that are SAFE: "My password is hacked", "I was hacked", "My account got hacked", "Someone hacked me", "My password is leaked", "Mein Account wurde gehackt", "Ich habe ein Problem", "Was ist Phishing", "Wie sicher ist mein Passwort", "Nein", "Ja", "Help", "Hello", "I need help", "What is phishing?", "Wo finde ich den Tresor", "Tresor", "Vault", "SafeNet Tresor", "Wo finde ich die Einstellungen", "Wo finde ich den Generator", "Wo finde ich die Notizen", "Wo ist der Tresor", "Password vault", "Was bietet SafeNet", "Wo finde ich", "Wie benutze ich", "Welche Funktionen", "Was kann ich hier machen"\n\nWhen in doubt, reply SAFE.\n\nReply with exactly one word: SAFE or UNSAFE.' },
        { role: 'user', content: message },
      ],
      max_tokens: 5,
      temperature: 0,
    }),
  }).catch(() => null)

  const filterVerdict = blockRes?.ok
    ? ((await blockRes.json().catch(() => null))?.choices?.[0]?.message?.content?.trim().toUpperCase() ?? '')
    : ''

  if (filterVerdict.startsWith('UNSAFE')) {
    const reply = effectiveLang === 'en'
      ? "That's a topic I can't discuss here. I'm happy to help you with cybersecurity or anything on the SafeNet platform!"
      : 'Dazu kann ich hier keine Aussagen machen. Ich helfe dir gerne bei Cybersicherheit oder der SafeNet Plattform!'
    return new Response(JSON.stringify({ reply }), {
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }

  // Mistral API aufrufen

  // Nachrichten für Mistral (OpenAI-kompatibles Format)
  const EN_FEW_SHOT = [
    { role: 'user', content: 'Where is the privacy policy?' },
    { role: 'assistant', content: 'You can find the SafeNet Privacy Policy here (/en/pages/datenschutzerklärung.html).' },
    { role: 'user', content: 'Where is the imprint?' },
    { role: 'assistant', content: 'The imprint is available here (/en/pages/impressum.html).' },
    { role: 'user', content: 'Where are the Terms of Service?' },
    { role: 'assistant', content: 'SafeNet does not have separate Terms of Service. For legal information, see the Privacy Policy (/en/pages/datenschutzerklärung.html) and the Imprint (/en/pages/impressum.html).' },
    { role: 'user', content: 'How can I contact you?' },
    { role: 'assistant', content: 'You can reach us via the contact page (/en/pages/kontakt.html).' },
    { role: 'user', content: 'Hello' },
    { role: 'assistant', content: 'Hello! How can I assist you with cybersecurity or SafeNet today?' },
    { role: 'user', content: 'What is phishing?' },
    { role: 'assistant', content: 'Phishing is an attack where scammers use fake emails or websites to steal your login credentials. Learn more here (/en/pages/phishing.html).' },
    { role: 'user', content: 'How do I create a secure password?' },
    { role: 'assistant', content: 'A strong password has at least 16 characters, upper and lowercase letters, numbers and symbols. Use our Password Generator (/en/pages/generator.html).' },
    { role: 'user', content: 'My account was hacked' },
    { role: 'assistant', content: 'Change your password immediately and enable 2FA. Check your active sessions in the settings (/en/pages/einstellungen.html).' },
    { role: 'user', content: 'What is 2FA?' },
    { role: 'assistant', content: '2FA (two-factor authentication) protects your account with a second verification step after your password, like a code from an app or SMS (/en/pages/2fa.html).' },
    { role: 'user', content: 'How is the weather today?' },
    { role: 'assistant', content: "I'm a cybersecurity assistant, so I can't provide weather information. For that, check a weather service. Is there anything about cybersecurity or SafeNet I can help you with?" },
  ]

  const FEW_SHOT = [
    // Account-Probleme
    { role: 'user', content: 'Es wurde gehackt' },
    { role: 'assistant', content: 'Ändere sofort dein Passwort, aktiviere 2FA und überprüfe alle aktiven Sitzungen. Falls es dein SafeNet-Account ist, findest du die Einstellungen hier (/de/pages/einstellungen.html).' },
    { role: 'user', content: 'Mein Account wurde gehackt' },
    { role: 'assistant', content: 'Ändere sofort dein Passwort und aktiviere 2FA. Überprüfe in den Einstellungen welche Geräte Zugriff haben (/de/pages/einstellungen.html).' },
    { role: 'user', content: 'Mein Passwort wurde geleakt' },
    { role: 'assistant', content: 'Ändere das Passwort sofort auf allen Diensten wo du es verwendet hast und aktiviere 2FA. Nutze für jeden Dienst ein einzigartiges Passwort.' },
    { role: 'user', content: 'Ich kann mich nicht mehr einloggen' },
    { role: 'assistant', content: 'Nutze die "Passwort vergessen"-Funktion auf der Login-Seite (/de/pages/login.html). Falls dein Account kompromittiert wurde, ändere auch deine E-Mail-Adresse.' },
    { role: 'user', content: 'Ich habe eine verdächtige E-Mail erhalten' },
    { role: 'assistant', content: 'Klicke keine Links an und öffne keine Anhänge. Prüfe den Absender genau auf Tippfehler und melde die E-Mail als Spam.' },
    { role: 'user', content: 'Jemand hat meine Daten gestohlen' },
    { role: 'assistant', content: 'Ändere sofort alle betroffenen Passwörter und aktiviere 2FA. Informiere bei sensiblen Daten auch die betroffene Plattform und bei Finanzdaten deine Bank.' },
    // Passwörter
    { role: 'user', content: 'Wie erstelle ich ein sicheres Passwort?' },
    { role: 'assistant', content: 'Ein sicheres Passwort hat mindestens 16 Zeichen, Gross- und Kleinbuchstaben, Zahlen und Sonderzeichen. Nutze unseren Passwort-Generator (/de/pages/generator.html).' },
    { role: 'user', content: 'Wie sicher ist mein Passwort?' },
    { role: 'assistant', content: 'Teste dein Passwort mit unserem Analysator (/de/pages/analysator.html). Er zeigt dir die Stärke und wie lange ein Angriff brauchen würde.' },
    { role: 'user', content: 'Wie viele Passwörter sollte ich haben?' },
    { role: 'assistant', content: 'Für jeden Dienst solltest du ein einzigartiges Passwort haben. Nutze unseren Tresor um sie sicher zu speichern (/de/pages/tresor.html).' },
    { role: 'user', content: 'Was ist Credential Stuffing?' },
    { role: 'assistant', content: 'Beim Credential Stuffing probieren Angreifer automatisch gestohlene Login-Daten auf vielen Webseiten aus. Einzigartige Passwörter pro Dienst und 2FA schützen davor.' },
    { role: 'user', content: 'Was ist ein Passwort-Manager?' },
    { role: 'assistant', content: 'Ein Passwort-Manager speichert alle deine Passwörter sicher verschlüsselt. SafeNet bietet einen eigenen Tresor dafür (/de/pages/tresor.html).' },
    // 2FA / MFA
    { role: 'user', content: 'Was ist 2FA?' },
    { role: 'assistant', content: 'Zwei-Faktor-Authentifizierung schützt deinen Account mit einem zweiten Schritt nach dem Passwort, z.B. einem Code per App oder SMS (/de/pages/2fa.html).' },
    { role: 'user', content: 'Was ist MFA?' },
    { role: 'assistant', content: 'Multi-Faktor-Authentifizierung verwendet zwei oder mehr Faktoren zur Anmeldung: Wissen (Passwort), Besitz (Handy) oder Biometrie (Fingerabdruck) (/de/pages/2fa.html).' },
    { role: 'user', content: 'Was ist MFA-Bypass?' },
    { role: 'assistant', content: 'MFA-Bypass umgeht die Zwei-Faktor-Authentifizierung z.B. durch SIM-Swapping oder Phishing-Kits die den Code abfangen (/de/pages/mfa-bypass.html).' },
    { role: 'user', content: 'Wie richte ich 2FA ein?' },
    { role: 'assistant', content: 'Gehe zu den Einstellungen deines Accounts (/de/pages/einstellungen.html) und aktiviere die Zwei-Faktor-Authentifizierung. Du brauchst dafür eine Authenticator-App wie Google Authenticator.' },
    // Angriffsmethoden
    { role: 'user', content: 'Was ist Phishing?' },
    { role: 'assistant', content: 'Phishing ist ein Angriff bei dem Betrüger gefälschte E-Mails oder Webseiten nutzen um Zugangsdaten zu stehlen. Mehr Infos hier (/de/pages/phishing.html).' },
    { role: 'user', content: 'Was ist Spear-Phishing?' },
    { role: 'assistant', content: 'Spear-Phishing ist gezieltes Phishing auf eine bestimmte Person, mit persönlichen Details um glaubwürdiger zu wirken (/de/pages/phishing.html).' },
    { role: 'user', content: 'Was ist Quishing?' },
    { role: 'assistant', content: 'Quishing ist Phishing über QR-Codes die auf gefälschte Seiten weiterleiten. Prüfe immer die URL nach dem Scannen eines QR-Codes (/de/pages/quishing.html).' },
    { role: 'user', content: 'Was ist Social Engineering?' },
    { role: 'assistant', content: 'Social Engineering manipuliert Menschen durch psychologischen Druck statt technische Angriffe, z.B. durch gefälschte Anrufe oder Hilfsbereitschaft (/de/pages/socialengineering.html).' },
    { role: 'user', content: 'Was ist ein Bruteforce-Angriff?' },
    { role: 'assistant', content: 'Bei einem Bruteforce-Angriff probiert ein Programm automatisch millionen Passwortkombinationen aus. Lange Passwörter und 2FA schützen davor (/de/pages/bruteforce.html).' },
    { role: 'user', content: 'Was ist ein Wörterbuchangriff?' },
    { role: 'assistant', content: 'Ein Wörterbuchangriff verwendet Listen mit häufigen Wörtern und Passwörtern statt alle Kombinationen zu probieren. Vermeide echte Wörter in Passwörtern (/de/pages/wörterbuchangriff.html).' },
    { role: 'user', content: 'Was ist ein Keylogger?' },
    { role: 'assistant', content: 'Ein Keylogger zeichnet alle Tastatureingaben auf um Passwörter zu stehlen. Halte dein System aktuell und nutze eine Antivirensoftware (/de/pages/keylogger.html).' },
    { role: 'user', content: 'Was ist Ransomware?' },
    { role: 'assistant', content: 'Ransomware verschlüsselt deine Dateien und fordert Lösegeld. Erstelle regelmässige Backups und öffne keine unbekannten Anhänge (/de/pages/ransomware.html).' },
    { role: 'user', content: 'Was ist Man-in-the-Middle?' },
    { role: 'assistant', content: 'Bei einem MITM-Angriff schaltet sich ein Angreifer unbemerkt zwischen dich und eine Webseite. Nutze immer HTTPS und kein öffentliches WLAN ohne VPN (/de/pages/mitm.html).' },
    { role: 'user', content: 'Was ist ein Trojaner?' },
    { role: 'assistant', content: 'Ein Trojaner ist Schadsoftware die sich als nützliches Programm tarnt. Lade Software nur aus vertrauenswürdigen Quellen herunter und nutze ein Antivirenprogramm.' },
    { role: 'user', content: 'Was ist ein DDoS-Angriff?' },
    { role: 'assistant', content: 'Ein DDoS-Angriff überflutet einen Server mit Anfragen bis er zusammenbricht. Webseiten schützen sich mit Traffic-Filterung und Content Delivery Networks.' },
    { role: 'user', content: 'Was ist SQL-Injection?' },
    { role: 'assistant', content: 'SQL-Injection ist ein Angriff bei dem Schadcode in Datenbankabfragen eingeschleust wird um Daten zu stehlen. Entwickler schützen sich mit parametrisierten Abfragen.' },
    { role: 'user', content: 'Was ist ein Zero-Day-Exploit?' },
    { role: 'assistant', content: 'Ein Zero-Day-Exploit nutzt eine noch unbekannte Sicherheitslücke aus bevor der Hersteller einen Patch veröffentlicht. Regelmässige Updates minimieren das Risiko.' },
    // Netzwerk & Geräte
    { role: 'user', content: 'Was ist ein VPN?' },
    { role: 'assistant', content: 'Ein VPN verschlüsselt deinen Internetverkehr und verbirgt deine IP-Adresse. Besonders wichtig in öffentlichen WLAN-Netzwerken.' },
    { role: 'user', content: 'Ist öffentliches WLAN sicher?' },
    { role: 'assistant', content: 'Öffentliches WLAN ist unsicher da Angreifer den Datenverkehr mitlesen können. Nutze immer ein VPN und vermeide sensible Transaktionen in öffentlichen Netzwerken.' },
    { role: 'user', content: 'Was ist eine Firewall?' },
    { role: 'assistant', content: 'Eine Firewall überwacht und filtert den ein- und ausgehenden Netzwerkverkehr nach festgelegten Regeln. Sie schützt vor unautorisierten Zugriffen.' },
    { role: 'user', content: 'Wie schütze ich mein Handy?' },
    { role: 'assistant', content: 'Halte dein Betriebssystem aktuell, nutze eine Bildschirmsperre, installiere nur Apps aus offiziellen Stores und aktiviere die Geräteverschlüsselung.' },
    { role: 'user', content: 'Was bedeutet HTTPS?' },
    { role: 'assistant', content: 'HTTPS verschlüsselt die Verbindung zwischen deinem Browser und einer Webseite. Achte immer auf das Schloss-Symbol in der Adressleiste.' },
    // Datenschutz & Privacy
    { role: 'user', content: 'Was ist Datenschutz?' },
    { role: 'assistant', content: 'Datenschutz schützt deine persönlichen Daten vor unbefugtem Zugriff und Missbrauch. In der EU regelt die DSGVO welche Daten Unternehmen speichern dürfen.' },
    { role: 'user', content: 'Was ist Identitätsdiebstahl?' },
    { role: 'assistant', content: 'Beim Identitätsdiebstahl nutzen Kriminelle deine persönlichen Daten um in deinem Namen Käufe zu tätigen oder Konten zu eröffnen. Starke Passwörter und 2FA helfen dagegen.' },
    { role: 'user', content: 'Sind meine Daten im Darknet?' },
    { role: 'assistant', content: 'Du kannst prüfen ob deine E-Mail-Adresse in bekannten Datenlecks auftaucht, z.B. auf haveibeenpwned.com. Falls ja, ändere sofort das betroffene Passwort.' },
    // SafeNet Features
    { role: 'user', content: 'Was bietet SafeNet?' },
    { role: 'assistant', content: 'SafeNet bietet einen Passwort-Analysator, Passwort-Generator, verschlüsselten Tresor, sichere Notizen und Infoseiten zu allen wichtigen Cyberangriffs-Methoden.' },
    { role: 'user', content: 'Wie funktioniert der Tresor?' },
    { role: 'assistant', content: 'Der SafeNet Tresor speichert deine Passwörter verschlüsselt. Nur du hast Zugriff über dein Master-Passwort (/de/pages/tresor.html).' },
    { role: 'user', content: 'Wie funktionieren die Notizen?' },
    { role: 'assistant', content: 'Die sicheren Notizen auf SafeNet sind verschlüsselt und nur für dich sichtbar. Du findest sie hier (/de/pages/notizen.html).' },
    { role: 'user', content: 'Was ist der Passwort-Analysator?' },
    { role: 'assistant', content: 'Der Analysator bewertet die Stärke deines Passworts und zeigt wie lange ein Angriff dauern würde (/de/pages/analysator.html).' },
    { role: 'user', content: 'Wo finde ich die Tutorials?' },
    { role: 'assistant', content: 'Die SafeNet Tutorials findest du hier (/de/pages/tutorials.html). Sie erklären Schritt für Schritt wie du dich online schützen kannst.' },
    { role: 'user', content: 'Wie kann ich mein Konto löschen?' },
    { role: 'assistant', content: 'Du kannst deinen Account in den Einstellungen löschen (/de/pages/einstellungen.html). Alle deine gespeicherten Daten werden dabei permanent entfernt.' },
    { role: 'user', content: 'Was sind meine Statistiken?' },
    { role: 'assistant', content: 'Unter "Meine Statistiken" siehst du eine Übersicht deiner Aktivitäten auf SafeNet (/de/pages/meine-stats.html).' },
    { role: 'user', content: 'Wie kann ich Feedback geben?' },
    { role: 'assistant', content: 'Du kannst uns Feedback auf der Feedback-Seite hinterlassen (/de/pages/feedback.html). Wir freuen uns über jede Rückmeldung.' },
    // Rechtliche Seiten
    { role: 'user', content: 'Wo finde ich die Datenschutzerklärung?' },
    { role: 'assistant', content: 'Die Datenschutzerklärung von SafeNet findest du hier (/de/pages/datenschutzerklärung.html).' },
    { role: 'user', content: 'Wo ist das Impressum?' },
    { role: 'assistant', content: 'Das Impressum findest du hier (/de/pages/impressum.html).' },
    { role: 'user', content: 'Wie kann ich euch kontaktieren?' },
    { role: 'assistant', content: 'Du kannst uns über die Kontaktseite erreichen (/de/pages/kontakt.html).' },
    { role: 'user', content: 'Was ist der Haftungsausschluss?' },
    { role: 'assistant', content: 'Den Haftungsausschluss von SafeNet findest du hier (/de/pages/haftungsausschluss.html).' },
    { role: 'user', content: 'Wo finde ich die AGB?' },
    { role: 'assistant', content: 'SafeNet hat keine separaten AGB. Für rechtliche Informationen stehen die Datenschutzerklärung (/de/pages/datenschutzerklärung.html) und das Impressum (/de/pages/impressum.html) zur Verfügung.' },
    { role: 'user', content: 'Was ist SafeNet?' },
    { role: 'assistant', content: 'Mehr über SafeNet Security erfährst du auf der Über-uns-Seite (/de/pages/übersns.html).' },
    // Allgemeine Sicherheitstipps
    { role: 'user', content: 'Wie schütze ich mich im Internet?' },
    { role: 'assistant', content: 'Nutze starke einzigartige Passwörter, aktiviere 2FA, halte Software aktuell und sei vorsichtig bei unbekannten Links und E-Mails.' },
    { role: 'user', content: 'Was soll ich tun wenn ich einen Virus habe?' },
    { role: 'assistant', content: 'Trenne das Gerät vom Internet, führe einen vollständigen Antivirenscan durch und ändere danach alle Passwörter von einem sicheren Gerät aus.' },
    { role: 'user', content: 'Was ist Verschlüsselung?' },
    { role: 'assistant', content: 'Verschlüsselung wandelt Daten in unlesbaren Code um sodass nur autorisierte Personen sie entschlüsseln können. SafeNet nutzt Verschlüsselung für den Tresor und Notizen.' },
    { role: 'user', content: 'Wie erkenne ich eine Phishing-Webseite?' },
    { role: 'assistant', content: 'Achte auf Tippfehler in der URL, fehlendes HTTPS und ungewöhnliche Designs. Im Zweifel gehe direkt zur offiziellen Webseite (/de/pages/phishing.html).' },
    { role: 'user', content: 'Was ist ein Datenleck?' },
    { role: 'assistant', content: 'Ein Datenleck tritt auf wenn Nutzerdaten durch einen Angriff oder Fehler öffentlich zugänglich werden. Ändere betroffene Passwörter sofort und aktiviere 2FA.' },
  ]

  const messages = [
    { role: 'system', content: buildSystemPrompt(effectiveLang) },
    ...(effectiveLang === 'de' ? FEW_SHOT : EN_FEW_SHOT),
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
        temperature: 0.3,
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
