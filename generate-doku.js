// SafeNet Security – Word-Dokumentation Generator
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, BorderStyle,
  AlignmentType, PageBreak, Spacing, ShadingType,
} from 'docx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Hilfsfunktionen ────────────────────────────────────────────────────────

function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
  });
}

function h2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 160 },
  });
}

function h3(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 120 },
  });
}

function p(text, bold = false) {
  return new Paragraph({
    children: [new TextRun({ text, bold, size: 22 })],
    spacing: { before: 80, after: 80 },
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22 })],
    bullet: { level },
    spacing: { before: 60, after: 60 },
  });
}

function code(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: 'Courier New', size: 20 })],
    spacing: { before: 60, after: 60 },
    indent: { left: 720 },
    shading: { type: ShadingType.SOLID, color: 'F3F4F6', fill: 'F3F4F6' },
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

function separator() {
  return new Paragraph({ text: '', spacing: { before: 100, after: 100 } });
}

function simpleTable(headers, rows) {
  const headerRow = new TableRow({
    children: headers.map(h =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20 })] })],
        shading: { type: ShadingType.SOLID, color: '1E3A5F', fill: '1E3A5F' },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
      })
    ),
    tableHeader: true,
  });

  const dataRows = rows.map((row, i) =>
    new TableRow({
      children: row.map(cell =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20 })] })],
          shading: i % 2 === 0
            ? { type: ShadingType.SOLID, color: 'FFFFFF', fill: 'FFFFFF' }
            : { type: ShadingType.SOLID, color: 'F8FAFC', fill: 'F8FAFC' },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
        })
      ),
    })
  );

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

// ─── Dokument-Inhalt ─────────────────────────────────────────────────────────

const children = [

  // ══════════════════════════════════════════════════════
  // TITELSEITE
  // ══════════════════════════════════════════════════════
  new Paragraph({
    children: [new TextRun({ text: 'SafeNet Security', bold: true, size: 72, color: '1E3A8A' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 2000, after: 400 },
  }),
  new Paragraph({
    children: [new TextRun({ text: 'Vollständige Projektdokumentation', size: 40, color: '374151' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
  }),
  new Paragraph({
    children: [new TextRun({ text: 'safenet-security.ch', size: 28, color: '3399ff', italics: true })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 2000 },
  }),
  new Paragraph({
    children: [new TextRun({ text: `Erstellt am: ${new Date().toLocaleDateString('de-CH', { dateStyle: 'full' })}`, size: 22, color: '6B7280' })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 200 },
  }),

  pageBreak(),

  // ══════════════════════════════════════════════════════
  // 1. PROJEKTÜBERSICHT
  // ══════════════════════════════════════════════════════
  h1('1. Projektübersicht'),
  p('SafeNet Security ist eine deutschsprachige (und englische) Cybersicherheits-Lernplattform im Browser. Sie wurde als Schulprojekt entwickelt und ist unter safenet-security.ch öffentlich erreichbar.'),
  p('Die Plattform verbindet Lerninhalt über Angriffsmethoden mit praktischen Sicherheitstools: Passwort-Analyse, Passwort-Generator, verschlüsselter Tresor, sichere Notizen und einen KI-Assistenten.'),
  separator(),

  h2('1.1 Ziele der Plattform'),
  bullet('Nutzer über Cyberangriffe informieren (Phishing, Ransomware, Social Engineering, etc.)'),
  bullet('Praktische Sicherheitstools direkt im Browser anbieten'),
  bullet('Deutschen und englischen Nutzern eine vollständig lokalisierte Erfahrung bieten'),
  bullet('Moderne Webtechnologien ohne Frameworks einsetzen (Vanilla JS)'),
  separator(),

  h2('1.2 Tech-Stack im Überblick'),
  simpleTable(
    ['Schicht', 'Technologie'],
    [
      ['Frontend', 'Vanilla HTML5, CSS3, JavaScript ES-Module (kein Framework)'],
      ['Backend / API', 'Vercel Edge Functions (Node.js-kompatibel, global verteilt)'],
      ['Datenbank & Auth', 'Supabase (PostgreSQL + Auth + REST API)'],
      ['KI-Chatbot', 'Mistral API – Modell: open-mistral-nemo'],
      ['E-Mail-Versand', 'Resend API (Login-Benachrichtigungen)'],
      ['Hosting', 'Vercel (CDN + Serverless, Domain: safenet-security.ch)'],
      ['PWA', 'Service Worker + Web App Manifest (installierbar)'],
      ['Tests', 'Playwright (E2E Smoke- & Flow-Tests)'],
      ['Minifizierung', 'Terser (via build.js, alle 67 JS-Dateien)'],
      ['Schriftart', 'Google Fonts – Inter'],
    ]
  ),

  pageBreak(),

  // ══════════════════════════════════════════════════════
  // 2. PROJEKTSTRUKTUR
  // ══════════════════════════════════════════════════════
  h1('2. Projektstruktur & Ordneraufbau'),
  p('Das Projekt verwendet eine klare, modulare Ordnerstruktur ohne Build-Tools für das Frontend:'),
  separator(),
  code('SafeNet/Code/'),
  code('├── index.html              ← Root-Redirect zur DE-Startseite'),
  code('├── de/                     ← Deutsche Version'),
  code('│   ├── index.html          ← Deutsche Startseite'),
  code('│   ├── pages/              ← ~30 Unterseiten (DE)'),
  code('│   └── partials/           ← navbar.html, footer.html (DE)'),
  code('├── en/                     ← Englische Version (vollständige Spiegelung)'),
  code('│   ├── index.html          ← Englische Startseite'),
  code('│   ├── pages/              ← ~30 Unterseiten (EN)'),
  code('│   └── partials/           ← navbar.html, footer.html (EN)'),
  code('├── css/                    ← Modulare CSS-Dateien (1 Datei pro Seite)'),
  code('├── js/                     ← 67 JavaScript-Module'),
  code('├── api/                    ← 5 Vercel Edge Functions (Backend)'),
  code('├── images/                 ← Logo, Icons, Avatare'),
  code('├── supabase/               ← SQL-Schemas & Migrations'),
  code('├── sw.js                   ← Service Worker (PWA-Caching)'),
  code('├── manifest.json           ← PWA Web App Manifest'),
  code('├── vercel.json             ← Hosting-Konfiguration & Security-Header'),
  code('├── build.js                ← Minifizierungs-Script (Terser)'),
  code('├── package.json            ← NPM-Abhängigkeiten'),
  code('└── tests/                  ← Playwright E2E-Tests'),
  separator(),

  h2('2.1 Mehrsprachigkeit (DE / EN)'),
  p('Alle Seiten und alle JavaScript-Dateien existieren in zwei Versionen:'),
  bullet('URL-Prefix erkennt Sprache: /de/pages/... und /en/pages/...'),
  bullet('JS-Dateien: beispiel-de.js und beispiel-en.js'),
  bullet('Spracherkennung per Regex: /^\\/en(\\/|$)/.test(window.location.pathname)'),
  bullet('vercel.json leitet /pages/:path* → /de/pages/:path* weiter (Standardsprache: Deutsch)'),
  bullet('Alte Vercel-Subdomain safe-net-umber.vercel.app leitet permanent auf safenet-security.ch weiter'),

  pageBreak(),

  // ══════════════════════════════════════════════════════
  // 3. FRONTEND-ARCHITEKTUR
  // ══════════════════════════════════════════════════════
  h1('3. Frontend-Architektur'),

  h2('3.1 CSS-System'),
  p('Das CSS ist streng modular aufgebaut – kein CSS-Framework, alles selbst geschrieben:'),
  simpleTable(
    ['Datei', 'Inhalt'],
    [
      ['style.css', 'Reset, Body, Typografie (h1–h4), globale Klassen'],
      ['shared.css', 'Buttons, Formulare, Cards, Modals (seitenübergreifend)'],
      ['navbar.css', 'Navigation, Dropdown-Menü, User-Avatar'],
      ['footer.css', 'Footer-Layout und Links'],
      ['[seite].css', 'Jede Seite hat eine eigene CSS-Datei (z.B. generator.css)'],
    ]
  ),
  separator(),
  bullet('Dark-Theme (Standard): Hintergrund #0f172a, Schrift weiß'),
  bullet('Light-Theme: Umschaltbar über data-theme-Attribut mit View Transition API-Animation'),
  bullet('Überschriften: Gradient-Verlauf #3399ff → #66d9ff mit -webkit-background-clip: text'),
  bullet('Mobiler Breakpoint: max-width: 768px'),
  separator(),

  h2('3.2 HTML-Konventionen'),
  p('Jede Seite bindet folgende Ressourcen ein:'),
  code('<link rel="stylesheet" href="../css/navbar.css">'),
  code('<link rel="stylesheet" href="../css/style.css">'),
  code('<link rel="stylesheet" href="../css/shared.css">'),
  code('<div id="navbar"></div>   ← Navbar wird per JS injiziert'),
  code('<div id="footer"></div>   ← Footer wird per JS injiziert'),
  code('<script type="module" src="../js/auth.js"></script>'),
  code('<script type="module" src="../js/[seite]-de.js"></script>'),
  separator(),
  bullet('Favicon: images/SafeNet-Security-Logo/Withoutbg/SafeNet Security 48 x 48 px.png'),
  bullet('Pfade aus pages/ immer mit ../ Prefix'),
  bullet('Seiten-Titel immer im Format: Seitenname – SafeNet Security'),

  pageBreak(),

  // ══════════════════════════════════════════════════════
  // 4. JAVASCRIPT-MODULE
  // ══════════════════════════════════════════════════════
  h1('4. JavaScript-Module (67 Dateien)'),

  h2('4.1 js/supabase.js – Zentraler Supabase-Client'),
  p('Initialisiert den Supabase-Client genau einmalig und exportiert ihn. Alle anderen Module importieren:'),
  code("import { supabase } from './supabase.js'"),
  separator(),
  p('Konfiguration:'),
  bullet('Storage: window.localStorage (Session bleibt nach Browserneustart erhalten)'),
  bullet('persistSession: true, autoRefreshToken: true'),
  separator(),
  p('Tab-Synchronisation: Enthält einen BroadcastChannel("safenet_auth_sync"). Wenn ein Tab eingeloggt ist, werden andere Tabs im selben Browser automatisch synchronisiert – ohne erneuten Login.'),
  separator(),

  h2('4.2 js/auth.js – Das Herzstück (18 KB)'),
  p('Das wichtigste und umfangreichste Modul. Wird auf jeder Seite geladen und übernimmt globale Funktionen:'),
  simpleTable(
    ['Funktion', 'Beschreibung'],
    [
      ['User-State Navbar', 'Zeigt Avatar (Base64), Initialen oder Login-Button je nach Session'],
      ['MFA/2FA-Prüfung', 'Prüft AAL2 (Authenticator Assurance Level 2) bei aktivierter 2FA – sonst Logout'],
      ['window.alert()', 'Überschrieben → custom Toast-Benachrichtigung (kein Browser-Dialog)'],
      ['window.snConfirm()', 'Custom async Bestätigungs-Dialog (Promise-basiert)'],
      ['window.snPrompt()', 'Custom async Eingabe-Dialog mit OK/Abbrechen'],
      ['Dark/Light-Theme', 'Toggle mit View Transition API und CSS-Animation'],
      ['Cookie-Banner', 'DSGVO-konformer Banner (kein Tracking, nur localStorage für Theme)'],
      ['Seitensuche', 'Live-Suche über alle ~30 Seiten ohne Server (Ctrl+K / Suchbutton)'],
      ['Scroll-to-Top', 'Floating Button erscheint nach 300px Scroll'],
      ['PWA-Registrierung', 'Registriert Service Worker und fügt Apple-Touch-Icons hinzu'],
      ['Chat-Widget laden', "Dynamischer Import: import('/js/chat-widget.js')"],
      ['Aktiver Nav-Link', 'Markiert den aktuellen Menüeintrag mit Klasse active'],
    ]
  ),
  separator(),

  h2('4.3 Weitere wichtige Module'),
  simpleTable(
    ['Modul', 'Grösse', 'Funktion'],
    [
      ['tresor.js', '37 KB → 26 KB', 'Passwort-Tresor: CRUD via /api/vault, AES-Anzeige, Kopieren, Suche'],
      ['notizen.js', '31 KB → 31 KB', 'Notizen mit Ordnern, Pinning, Volltextsuche, Echtzeit-Speicherung'],
      ['analyse.js', '~5 KB', 'Passwortanalyse: Entropie, Zeichenklassen, Have I Been Pwned API'],
      ['generator-de.js', '~1.4 KB', 'Passwort-Generator: Länge, Zeichenregeln, Zufallsgenerator'],
      ['einstellungen-de.js', '13 KB', 'Account: Passwort ändern, Avatar-Upload, 2FA-Setup, Account löschen'],
      ['login-de.js', '6.9 KB → 5.3 KB', 'Login-Formular mit MFA-TOTP-Support und Login-Benachrichtigung'],
      ['chat-widget.js', '9 KB → 6.8 KB', 'KI-Chatbot: Floating Button, Chat-UI, API-Kommunikation, Session'],
      ['passwortliste.js', '29 KB', 'Liste bekannter schwacher Passwörter für Offline-Prüfung'],
      ['meine-stats-de.js', '7.5 KB', 'Persönliche Sicherheitsstatistiken des eingeloggten Users'],
      ['phishing-check-de.js', '7.1 KB', 'Interaktiver Quiz: echte vs. gefälschte E-Mails erkennen'],
      ['auth-gate.js', '1.3 KB', 'Schützt Seiten – leitet nicht eingeloggte User zur Login-Seite'],
      ['navbar-loader.js', '807 B', 'Fetcht und injiziert navbar.html und footer.html per fetch()'],
    ]
  ),

  pageBreak(),

  // ══════════════════════════════════════════════════════
  // 5. BACKEND – VERCEL EDGE FUNCTIONS
  // ══════════════════════════════════════════════════════
  h1('5. Backend – Vercel Edge Functions (api/)'),
  p('Alle 5 API-Routen laufen als Edge Functions (export const config = { runtime: "edge" }). Das bedeutet: Sie starten in Millisekunden auf Vercel-Servern weltweit nahe beim Nutzer – kein Cold-Start wie bei normalen Serverless Functions.'),
  p('CORS ist auf allen Routes auf https://safenet-security.ch beschränkt.'),
  separator(),

  h2('5.1 api/chat.js – KI-Chatbot-Backend'),
  p('Ablauf einer Chatanfrage (Schritt für Schritt):'),
  bullet('1. Bearer-Token aus Authorization-Header prüfen'),
  bullet('2. Token bei Supabase validieren (POST /auth/v1/user)'),
  bullet('3. Body parsen: { message, history, lang }'),
  bullet('4. Sprache automatisch erkennen (DE/EN) anhand des Nachrichteninhalts'),
  bullet('5. Keyword-Filter: Regex-Check auf absolut verbotene Inhalte (ohne Extra-API-Call)'),
  bullet('6. Mistral API aufrufen: System-Prompt + Few-Shot-Beispiele + History (14 Nachrichten) + aktuelle Nachricht'),
  bullet('7. Antwort als JSON { reply: "..." } zurück ans Frontend'),
  separator(),
  p('Mistral-Konfiguration:'),
  bullet('Modell: open-mistral-nemo'),
  bullet('max_tokens: 250, temperature: 0.3'),
  bullet('Timeout: 10 Sekunden (AbortController)'),
  separator(),
  p('System-Prompt enthält:'),
  bullet('Alle ~30 Seiten-URLs mit exaktem Mapping (welches Thema → welche URL)'),
  bullet('Verhaltensregeln: kein Markdown, max 2-3 Sätze, keine externen URLs'),
  bullet('Few-Shot-Beispiele: Muster für typische Fragen und richtige Antworten'),
  bullet('Sprachregel: Antwortet in der Sprache des Nutzers'),
  separator(),

  h2('5.2 api/vault.js – Passwort-Tresor-Proxy'),
  p('Proxy zwischen Frontend und Supabase REST API. Das Frontend kommuniziert nie direkt mit Supabase für Tresor-Daten.'),
  simpleTable(
    ['HTTP-Methode', 'Supabase-Endpunkt', 'Funktion'],
    [
      ['GET', '/rest/v1/passwords?select=*&order=created_at.desc', 'Alle Passwörter des Users laden'],
      ['POST', '/rest/v1/passwords', 'Neues Passwort speichern'],
      ['PATCH', '/rest/v1/passwords?id=eq.{id}', 'Passwort aktualisieren'],
      ['DELETE', '/rest/v1/passwords?id=eq.{id}', 'Einzelnes Passwort löschen'],
      ['DELETE', '/rest/v1/passwords?user_id=eq.{id}', 'Alle Passwörter löschen'],
    ]
  ),
  separator(),

  h2('5.3 api/delete-account.js – Account-Löschung'),
  bullet('Nutzt den SUPABASE_SERVICE_ROLE_KEY (nur im Backend verfügbar, NIE im Frontend)'),
  bullet('Verifiziert erst den Nutzer via Access-Token'),
  bullet('Löscht dann via Supabase Admin-API: DELETE /auth/v1/admin/users/{userId}'),
  bullet('Supabase löscht durch ON DELETE CASCADE alle Nutzerdaten automatisch'),
  separator(),

  h2('5.4 api/login-benachrichtigung.js – Login-E-Mail'),
  bullet('Verifiziert den Access-Token'),
  bullet('Ermittelt IP-Adresse, User-Agent und Zeitstempel (Schweizer Zeit via Europe/Zurich)'),
  bullet('Sendet E-Mail über Resend API mit Login-Details'),
  bullet('Verwendet RESEND_API_KEY aus Vercel-Umgebungsvariablen'),
  separator(),

  h2('5.5 api/news.js – Cybersecurity RSS-Aggregator'),
  bullet('Fetcht 5 RSS/Atom-Feeds parallel: The Hacker News, Bleeping Computer, Krebs on Security, Ars Technica, SecurityWeek'),
  bullet('Parst XML manuell mit Regex (kein Parser-Paket) – unterstützt RSS 2.0 und Atom'),
  bullet('Normalisiert auf: { title, link, description (260 Zeichen), date, source }'),
  bullet('Gibt sortiertes JSON-Array zurück, CORS-gesichert'),

  pageBreak(),

  // ══════════════════════════════════════════════════════
  // 6. SUPABASE
  // ══════════════════════════════════════════════════════
  h1('6. Supabase – Datenbank & Authentifizierung'),
  p('Supabase-Projekt-URL: https://dygrabyaiyessqmjdprc.supabase.co'),
  separator(),

  h2('6.1 Authentifizierung'),
  bullet('Email/Passwort Login mit Supabase Auth'),
  bullet('2FA/TOTP vollständig integriert (Authenticator App wie Google Authenticator)'),
  bullet('Auth-Level AAL2: Wenn 2FA aktiviert, wird nach dem Login der TOTP-Code verlangt'),
  bullet('Session in localStorage, persistSession: true, autoRefreshToken: true'),
  bullet('Tab-Synchronisation via BroadcastChannel API'),
  bullet('Passwort-Reset-Flow via E-Mail-Link (PASSWORD_RECOVERY-Event)'),
  separator(),

  h2('6.2 Datenbank-Tabellen'),
  simpleTable(
    ['Tabelle', 'Spalten', 'Zweck'],
    [
      ['passwords', 'id, user_id, title, username, password, url, note, created_at', 'Passwort-Tresor – verschlüsselt gespeicherte Zugangsdaten'],
      ['notiz_ordner', 'id, user_id, name, erstellt_am', 'Ordner-Struktur für Notizen'],
      ['notiz_titel', 'id, user_id, text, geaendert_am', 'Notiz-Titel (normalisiert, separat gespeichert)'],
      ['notiz_inhalt', 'id, user_id, text, geaendert_am', 'Notiz-Inhalt (normalisiert, separat gespeichert)'],
      ['notiz_notizen', 'id, user_id, ordner_id, titel_id, inhalt_id, angepinnt, erstellt/geaendert_am', 'Haupt-Notiztabelle mit Fremdschlüsseln'],
    ]
  ),
  separator(),

  h2('6.3 Row Level Security (RLS)'),
  p('RLS ist auf ALLEN Tabellen aktiviert. Das bedeutet: Selbst wenn jemand den Supabase-Anon-Key kennt, kann er nur seine eigenen Daten sehen/bearbeiten.'),
  bullet('Policy-Prinzip: auth.uid() = user_id (jede Zeile gehört einem User)'),
  bullet('Operationen: SELECT, INSERT, UPDATE, DELETE – alle nur auf eigene Daten'),
  bullet('ON DELETE CASCADE: Wird ein User gelöscht, werden alle seine Daten automatisch mitgelöscht'),
  separator(),

  h2('6.4 Notizen-Datenbankstruktur (normalisiert)'),
  p('Die Notizen verwenden eine normalisierte Struktur mit 4 Tabellen statt einer:'),
  bullet('notiz_ordner: Enthält nur Ordner (id, name)'),
  bullet('notiz_titel: Enthält nur Titel-Texte'),
  bullet('notiz_inhalt: Enthält nur Inhalt-Texte'),
  bullet('notiz_notizen: Verknüpfungstabelle mit Fremdschlüsseln auf die drei obigen Tabellen'),
  p('Vorteile: Einzelne Teile (Titel/Inhalt) können unabhängig aktualisiert werden. Weniger Datenduplizierung.'),
  separator(),

  h2('6.5 Umgebungsvariablen (in Vercel konfiguriert)'),
  simpleTable(
    ['Variable', 'Verwendung', 'Verfügbar'],
    [
      ['MISTRAL_API_KEY', 'KI-Chatbot (Mistral API)', 'Nur Backend (Edge Functions)'],
      ['SUPABASE_SERVICE_ROLE_KEY', 'Account-Löschung mit Admin-Rechten', 'Nur Backend – NIE im Frontend'],
      ['RESEND_API_KEY', 'Login-Benachrichtigungs-E-Mails', 'Nur Backend (Edge Functions)'],
    ]
  ),

  pageBreak(),

  // ══════════════════════════════════════════════════════
  // 7. KI-CHATBOT
  // ══════════════════════════════════════════════════════
  h1('7. KI-Chatbot – Vollständiger Aufbau'),

  h2('7.1 Frontend: js/chat-widget.js'),
  p('Das Chat-Widget wird dynamisch von auth.js geladen (import()). Es erstellt die komplette Chat-UI per JavaScript:'),
  bullet('Floating-Action-Button (FAB) unten rechts – nur für eingeloggte User sichtbar'),
  bullet('Chat-Fenster mit Header (SafeNet-Logo + Titel + Schließen-Button)'),
  bullet('Nachrichtenliste mit Bot-Avataren und User-Bubbles'),
  bullet('Eingabefeld (max. 500 Zeichen) + Senden-Button'),
  bullet('Tipp-Indikator ("Denke nach...") während der API-Antwort wartet'),
  bullet('Session-Persistenz: Gesprächsverlauf bleibt im sessionStorage (Tab bleibt, Browser-Neustart löscht)'),
  bullet('Tageslimit: 50 Nachrichten (Rate-Limiting)'),
  bullet('Welcome-Bubble beim ersten Öffnen'),
  bullet('Hint-Bubble für eingeloggte User nach 2 Sekunden, für Gäste nach 4 Sekunden (mit Registrierungs-CTA)'),
  separator(),

  h2('7.2 Backend: api/chat.js – Ablaufdiagramm'),
  code('Nutzer schreibt Nachricht'),
  code('        ↓'),
  code('chat-widget.js'),
  code('  ├─ Supabase Session holen → Access Token'),
  code('  └─ POST /api/chat { message, history (letzte 10), lang }'),
  code('        ↓'),
  code('api/chat.js (Edge Function)'),
  code('  1. Bearer-Token validieren (Supabase /auth/v1/user)'),
  code('  2. Sprache auto-erkennen (DE/EN per Regex auf Nachrichteninhalt)'),
  code('  3. Keyword-Filter (Regex, kein extra API-Aufruf)'),
  code('        ↓ SAFE'),
  code('  4. Mistral API: open-mistral-nemo'),
  code('     System-Prompt + Few-Shot-Beispiele + History + Nachricht'),
  code('     max_tokens: 250, temperature: 0.3, timeout: 10s'),
  code('        ↓'),
  code('  5. JSON { reply: "..." } → Frontend'),
  code('        ↓'),
  code('chat-widget.js zeigt Antwort + speichert History in sessionStorage'),
  separator(),

  h2('7.3 Sicherheitsfilter'),
  p('Früher: Zweiter Mistral-API-Aufruf (open-mistral-nemo) zur Klassifizierung → verursachte viele falsch-positive Sperren.'),
  p('Jetzt: Schneller Keyword-Regex-Check ohne Extra-API-Call. Gesperrte Themen: Hitler, Nazis, Holocaust, Terrorismus, Kinderpornografie, Selbstmord-Anleitungen, Drogen kaufen.'),
  p('Vorteil: ~50% schnellere Antwortzeit, keine falsch-positiven Sperren mehr bei harmlosen Nachrichten.'),
  separator(),

  h2('7.4 Few-Shot-Beispiele (Qualitätssicherung)'),
  p('Das Modell verhält sich zuverlässiger wenn es Beispiele sieht statt nur Regeln. Enthaltene Beispiele:'),
  bullet('Was ist Phishing / Ransomware / Keylogger / Rubber Ducky / Bash Bunny'),
  bullet('Mein Account wurde gehackt → Sofortmaßnahmen'),
  bullet('Wie erstelle ich ein sicheres Passwort → Generator-Link'),
  bullet('Wie erstelle ich eine PowerPoint-Präsentation → Schritt-für-Schritt Erklärung'),
  bullet('Kann ich das selber bauen → Ja, mit Raspberry Pi Pico/ESP32'),
  bullet('Du gehst nicht auf mich ein → Entschuldigung + Bitte um Wiederholung'),
  bullet('Gemini kann das trotzdem → Einräumen + hilfreiche Antwort'),

  pageBreak(),

  // ══════════════════════════════════════════════════════
  // 8. PWA
  // ══════════════════════════════════════════════════════
  h1('8. Progressive Web App (PWA)'),
  p('SafeNet Security ist als installierbare Web-App ausgelegt. Nutzer können die Seite zum Homescreen hinzufügen und wie eine native App öffnen.'),
  separator(),

  h2('8.1 manifest.json'),
  bullet('Name: SafeNet Security, Short Name: SafeNet'),
  bullet('Display: standalone (kein Browser-Chrome bei Installation)'),
  bullet('Background Color: #0f172a (Dark-Theme)'),
  bullet('Theme Color: #3399ff (Blau)'),
  bullet('Icons: 48px, 192px, 512px (auch maskable für Android)'),
  bullet('Shortcuts: Direktlinks zu Generator und Passwort-Analyse aus dem App-Icon'),
  separator(),

  h2('8.2 sw.js – Service Worker'),
  bullet('Cache-Name: safenet-v4 (wird bei Updates automatisch erneuert)'),
  bullet('Pre-Cache: Alle kritischen Assets beim ersten Besuch gecacht (HTML, CSS, JS)'),
  bullet('Strategie: Network-First – immer frische Daten vom Server, Fallback auf Cache'),
  bullet('Beim Update: Alle alten Caches werden beim Aktivieren gelöscht'),
  bullet('skipWaiting(): Neue Service-Worker-Version wird sofort aktiv'),

  pageBreak(),

  // ══════════════════════════════════════════════════════
  // 9. SICHERHEIT
  // ══════════════════════════════════════════════════════
  h1('9. Sicherheits-Header & OWASP'),

  h2('9.1 HTTP-Security-Header (vercel.json)'),
  simpleTable(
    ['Header', 'Wert / Zweck'],
    [
      ['X-Content-Type-Options', 'nosniff – verhindert MIME-Type-Sniffing'],
      ['X-Frame-Options', 'DENY – kein Einbetten in iframes (Clickjacking-Schutz)'],
      ['X-XSS-Protection', '1; mode=block – Browser-XSS-Filter'],
      ['Referrer-Policy', 'strict-origin-when-cross-origin'],
      ['Permissions-Policy', 'camera=(), microphone=(), geolocation=() – alles verboten'],
      ['Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload – 2 Jahre HTTPS'],
      ['Content-Security-Policy', 'Nur self, jsDelivr CDN, Google Fonts erlaubt'],
    ]
  ),
  separator(),

  h2('9.2 Weitere Sicherheitsmaßnahmen'),
  bullet('Kein innerHTML mit Nutzerdaten (XSS-Schutz) – textContent verwendet'),
  bullet('Alle API-Routes prüfen Bearer-Token vor jeder Operation'),
  bullet('Service Role Key niemals im Frontend – nur in Vercel-Umgebungsvariablen'),
  bullet('Supabase RLS: Jeder User sieht nur seine eigenen Daten'),
  bullet('CORS eingeschränkt auf safenet-security.ch – kein Zugriff von anderen Domains'),
  bullet('Eingaben werden vor Supabase-Übergabe validiert (Typ, Länge)'),
  bullet('Have I Been Pwned API: Passwörter werden per k-Anonymity geprüft (Hash, nie Klartext)'),

  pageBreak(),

  // ══════════════════════════════════════════════════════
  // 10. BUILD & DEPLOYMENT
  // ══════════════════════════════════════════════════════
  h1('10. Build-Prozess & Deployment'),

  h2('10.1 build.js – Minifizierung'),
  p('Alle 67 JS-Dateien in /js/ werden mit Terser minifiziert:'),
  bullet('Entfernt: alle Kommentare, Whitespace, Zeilenumbrüche'),
  bullet('Umbenennung: Variablen werden zu a, b, c etc. (Mangle)'),
  bullet('passes: 2 – zwei Optimierungsdurchläufe'),
  bullet('ES-Modul-Erkennung: Regex auf import{...}/import */import " für korrekte Verarbeitung'),
  bullet('Ergebnis: 20–30% kleinere Dateien (z.B. tresor.js: 37 KB → 26 KB)'),
  bullet('Ausführung: node build.js oder npm run minify'),
  separator(),

  h2('10.2 Deployment-Prozess'),
  code('1. Lokale Entwicklung (node dev-server.js)'),
  code('2. node build.js → alle 67 JS-Dateien minifiziert'),
  code('3. git add . && git commit && git push → GitHub'),
  code('4. Vercel erkennt Push → automatisches Deployment'),
  code('5. Vercel führt build.js aus (buildCommand)'),
  code('6. Weltweit auf Vercel Edge-Network aktiv (~30 Sekunden)'),
  separator(),

  h2('10.3 Vercel-Konfiguration (vercel.json)'),
  bullet('cleanUrls: true – URLs ohne .html-Endung funktionieren'),
  bullet('Rewrites: /api/:path* → /api/:path* (Edge Functions)'),
  bullet('Redirect: safe-net-umber.vercel.app → safenet-security.ch (permanent 301)'),
  bullet('Redirect: /pages/:path* → /de/pages/:path* (Standardsprache Deutsch)'),

  pageBreak(),

  // ══════════════════════════════════════════════════════
  // 11. TESTING
  // ══════════════════════════════════════════════════════
  h1('11. Testing (Playwright)'),
  p('Das Projekt verwendet Playwright für automatisierte End-to-End-Tests im Chromium-Browser.'),
  separator(),

  h2('11.1 Test-Suiten'),
  simpleTable(
    ['Datei', 'Inhalt', 'Befehl'],
    [
      ['tests/smoke.spec.js', 'Prüft ob alle Seiten erreichbar sind (HTTP 200)', 'npm run smoke'],
      ['tests/flows.spec.js', 'Testet User-Abläufe (Login, Navigation, Features)', 'npm run smoke:flows'],
    ]
  ),
  separator(),

  h2('11.2 Weitere Skripte (package.json)'),
  simpleTable(
    ['Skript', 'Befehl'],
    [
      ['Dev-Server starten', 'npm run dev'],
      ['JS minifizieren', 'npm run minify'],
      ['Alle Tests', 'npm run smoke:all'],
      ['Tests mit Browser', 'npm run smoke:headed'],
      ['Test-Report anzeigen', 'npm run smoke:report'],
    ]
  ),

  pageBreak(),

  // ══════════════════════════════════════════════════════
  // 12. SEITENÜBERSICHT
  // ══════════════════════════════════════════════════════
  h1('12. Vollständige Seitenübersicht'),

  h2('12.1 Lern-Seiten (Angriffsmethoden)'),
  simpleTable(
    ['Seite', 'URL', 'Inhalt'],
    [
      ['Angriffsübersicht', '/de/pages/angriff.html', 'Übersicht aller Angriffsmethoden'],
      ['Phishing', '/de/pages/phishing.html', 'Fake-E-Mails, Spear-Phishing, Schutzmaßnahmen'],
      ['Quishing', '/de/pages/quishing.html', 'QR-Code-basiertes Phishing'],
      ['Bruteforce', '/de/pages/bruteforce.html', 'Automatisiertes Passwort-Raten'],
      ['Social Engineering', '/de/pages/socialengineering.html', 'Psychologische Manipulation'],
      ['Keylogger', '/de/pages/keylogger.html', 'Tastatureingaben heimlich aufzeichnen'],
      ['Wörterbuchangriff', '/de/pages/wörterbuchangriff.html', 'Angriffe mit Passwortlisten'],
      ['Ransomware', '/de/pages/ransomware.html', 'Verschlüsselung von Dateien gegen Lösegeld'],
      ['MFA-Bypass', '/de/pages/mfa-bypass.html', 'Umgehung der Zwei-Faktor-Auth'],
      ['Man-in-the-Middle', '/de/pages/mitm.html', 'Kommunikation abfangen'],
      ['2FA', '/de/pages/2fa.html', 'Zwei-Faktor-Authentifizierung erklärt'],
    ]
  ),
  separator(),

  h2('12.2 Hardware-Hacking-Seiten'),
  simpleTable(
    ['Seite', 'URL', 'Gerät'],
    [
      ['USB Rubber Ducky', '/de/pages/rubber-ducky.html', 'USB-Gerät das Tastatureingaben emuliert (Hak5)'],
      ['Bash Bunny', '/de/pages/bash-bunny.html', 'Multifunktionaler USB-Angriffsvector (Hak5)'],
      ['Flipper Zero', '/de/pages/flipper-zero.html', 'Multi-Tool für RF, NFC, IR, Sub-GHz'],
      ['WiFi Pineapple', '/de/pages/wifi-pineapple.html', 'WLAN-Auditing und Man-in-the-Middle (Hak5)'],
      ['O.MG Cable', '/de/pages/omg-cable.html', 'USB-Kabel mit verstecktem Chip (Keylogger/HID)'],
    ]
  ),
  separator(),

  h2('12.3 Tool-Seiten (eingeloggte User)'),
  simpleTable(
    ['Seite', 'URL', 'Funktion'],
    [
      ['Passwort-Analyse', '/de/pages/analysator.html', 'Entropie, Stärke, Have I Been Pwned'],
      ['Passwort-Generator', '/de/pages/generator.html', 'Sichere zufällige Passwörter generieren'],
      ['Tresor', '/de/pages/tresor.html', 'Verschlüsselte Passwörter speichern und verwalten'],
      ['Notizen', '/de/pages/notizen.html', 'Sichere Notizen mit Ordner-Struktur'],
      ['Meine Statistiken', '/de/pages/meine-stats.html', 'Persönliche Sicherheits-Statistiken'],
      ['Tutorials', '/de/pages/tutorials.html', 'Schritt-für-Schritt Sicherheits-Anleitungen'],
      ['Einstellungen', '/de/pages/einstellungen.html', 'Account, Avatar, 2FA, Theme, Passwort'],
      ['Security-News', '/de/pages/news.html', 'Aktuelle News aus 5 Cybersecurity-Quellen'],
    ]
  ),
  separator(),

  h2('12.4 Account-Seiten'),
  simpleTable(
    ['Seite', 'URL', 'Funktion'],
    [
      ['Login', '/de/pages/login.html', 'E-Mail/Passwort + 2FA-TOTP'],
      ['Registrierung', '/de/pages/register.html', 'Neuen Account erstellen'],
      ['Passwort zurücksetzen', '/de/pages/reset-password.html', 'Neues Passwort via E-Mail-Link'],
    ]
  ),

  pageBreak(),

  // ══════════════════════════════════════════════════════
  // 13. ABSCHLUSS
  // ══════════════════════════════════════════════════════
  h1('13. Zusammenfassung & Fazit'),
  p('SafeNet Security ist eine vollständig selbst entwickelte Cybersicherheits-Lernplattform ohne Frameworks oder Build-Tools für das Frontend. Die wichtigsten technischen Highlights:'),
  separator(),
  bullet('Vanilla JavaScript: Kein React, kein Vue – alles in reinem JS/HTML/CSS'),
  bullet('Edge Computing: API-Routen laufen weltweit nahe beim Nutzer (Vercel Edge)'),
  bullet('Row Level Security: Datenbank-Sicherheit auf Supabase-Ebene, nicht nur im Frontend'),
  bullet('PWA: Vollständig installierbar als App auf iOS, Android und Desktop'),
  bullet('KI-Assistent: Integrierter Chatbot mit Kontextwissen über die Plattform'),
  bullet('Mehrsprachig: Vollständige DE/EN-Lokalisierung mit ~60 Seiten und 67 JS-Modulen'),
  bullet('Sicherheits-Header: HSTS, CSP, X-Frame-Options und mehr ab Hosting-Ebene'),
  bullet('Automatisierte Tests: Playwright E2E-Tests für alle kritischen Seiten'),
  separator(),
  p('Das Projekt zeigt, dass eine vollwertige Webanwendung mit Authentifizierung, Datenbank, KI, E-Mails, PWA und automatisierten Tests ohne ein einziges Frontend-Framework realisiert werden kann.'),

];

// ─── Dokument erstellen ───────────────────────────────────────────────────────

const doc = new Document({
  creator: 'SafeNet Security',
  title: 'SafeNet Security – Vollständige Projektdokumentation',
  description: 'Technische Dokumentation der SafeNet Security Plattform',
  styles: {
    default: {
      heading1: {
        run: { color: '1E3A8A', bold: true, size: 36 },
        paragraph: { spacing: { before: 400, after: 200 } },
      },
      heading2: {
        run: { color: '1D4ED8', bold: true, size: 28 },
        paragraph: { spacing: { before: 280, after: 140 } },
      },
      heading3: {
        run: { color: '2563EB', bold: true, size: 24 },
        paragraph: { spacing: { before: 200, after: 100 } },
      },
    },
  },
  sections: [{
    properties: {
      page: {
        margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 },
      },
    },
    children,
  }],
});

Packer.toBuffer(doc).then((buffer) => {
  const outPath = path.join(__dirname, 'SafeNet-Security-Dokumentation.docx');
  fs.writeFileSync(outPath, buffer);
  console.log(`\n✓ Word-Dokument erstellt: ${outPath}\n`);
});
