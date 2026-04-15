// ─── Konfiguration & Konstanten ──────────────────────────────────────────────

// Blacklist: häufig genutzte Passwörter → führt zu Score-Abzug
const HAEUFIGE = ["123456","password","12345678","qwerty","12345","123456789",
  "letmein","admin","welcome","123123","passw0rd","iloveyou","1234","hallo",
  "hallo123","passwort","test","abc123","000000","111111","monkey","dragon"];

// Annahme: 10^9 Versuche pro Sekunde (modernes GPU-Cracking)
const RATE = 1_000_000_000n;

// ─── Hilfsfunktion: BigInt-Sekunden → lesbare Zeitangabe (de-CH) ─────────────
function formatKnackzeit(sek) {
  if (sek <= 0n) return 'sofort';
  if (sek < 60n) return sek + ' Sekunden';
  if (sek < 3600n) return (sek / 60n) + ' Minuten';
  if (sek < 86400n) return (sek / 3600n) + ' Stunden';
  const tage = sek / 86400n;
  if (tage < 365n) return tage + ' Tage';
  const jahre = tage / 365n;
  if (jahre < 1_000_000n) return jahre.toLocaleString('de-CH') + ' Jahre';
  if (jahre < 1_000_000_000n) return (jahre / 1_000_000n).toLocaleString('de-CH') + ' Millionen Jahre';
  return (jahre / 1_000_000_000n).toLocaleString('de-CH') + ' Milliarden Jahre';
}

// ─── Hauptfunktion: Passwort analysieren & Ergebnis darstellen ───────────────
function analyzePassword() {

  // --- DOM-Elemente ---
  const pw = document.getElementById('passwordInput').value;
  const result = document.getElementById('result');
  const suggestions = document.getElementById('suggestions');
  const bar = document.getElementById('pw-bar');
  const badgeWrap = document.getElementById('pw-badges');
  const crackDiv = document.getElementById('pw-cracktime');

  // --- Ausgabe zurücksetzen ---
  suggestions.innerHTML = '';
  badgeWrap.innerHTML = '';
  crackDiv.textContent = '';

  // --- Frühzeitig abbrechen wenn Eingabe leer ---
  if (!pw.length) {
    result.textContent = '';
    result.style.color = '';
    bar.style.width = '0%';
    bar.style.background = '';
    suggestions.style.display = 'none';
    return;
  }

  // --- Zeichenklassen prüfen ---
  const hasLower   = /[a-z]/.test(pw);
  const hasUpper   = /[A-Z]/.test(pw);
  const hasDigit   = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const len = pw.length;
  const isCommon = HAEUFIGE.some(w => pw.toLowerCase().includes(w));

  // --- Zeichensatz-Größe → Anzahl möglicher Kombinationen (BigInt) ---
  let charsetSize = 0;
  if (hasLower)   charsetSize += 26;
  if (hasUpper)   charsetSize += 26;
  if (hasDigit)   charsetSize += 10;
  if (hasSpecial) charsetSize += 32;
  if (!charsetSize) charsetSize = 26;

  // --- Knackzeit: charsetSize^Länge / Angriffsrate ---
  const total  = BigInt(charsetSize) ** BigInt(len);
  const zeitSek = total / RATE;

  // --- Score 0–100 berechnen ---
  let score = 0;
  if (len >= 8)  score += 15;
  if (len >= 12) score += 20;
  if (len >= 16) score += 15;
  if (hasLower)   score += 10;
  if (hasUpper)   score += 10;
  if (hasDigit)   score += 10;
  if (hasSpecial) score += 20;
  if (isCommon)   score = Math.max(0, score - 35);

  score = Math.min(100, score);

  // --- Verbesserungstipps sammeln ---
  const tips = [];
  if (len < 12)     tips.push('Verwende mindestens 12 Zeichen.');
  if (!hasUpper)    tips.push('Füge mindestens einen Großbuchstaben hinzu.');
  if (!hasLower)    tips.push('Füge mindestens einen Kleinbuchstaben hinzu.');
  if (!hasDigit)    tips.push('Füge mindestens eine Zahl hinzu.');
  if (!hasSpecial)  tips.push('Verwende mindestens ein Sonderzeichen (z. B. ! # $ %).');
  if (isCommon)     tips.push('Dieses Passwort ähnelt häufig genutzten Passwörtern – wähle etwas Einzigartiges.');

  // --- Stärke-Label, Textfarbe & Balkenfarbe bestimmen ---
  let label, color, barColor;
  if (score < 30) {
    label = 'Sehr schwach'; color = '#ef4444';
    barColor = 'linear-gradient(90deg,#ef4444,#f87171)';
  } else if (score < 50) {
    label = 'Schwach'; color = '#f97316';
    barColor = 'linear-gradient(90deg,#f97316,#fbbf24)';
  } else if (score < 70) {
    label = 'Mittel'; color = '#eab308';
    barColor = 'linear-gradient(90deg,#eab308,#fde047)';
  } else if (score < 87) {
    label = 'Stark'; color = '#22c55e';
    barColor = 'linear-gradient(90deg,#22c55e,#4ade80)';
  } else {
    label = 'Sehr stark'; color = '#3399ff';
    barColor = 'linear-gradient(90deg,#3399ff,#66d9ff)';
  }

  // --- Stärkebalken & Label aktualisieren ---
  bar.style.width = score + '%';
  bar.style.background = barColor;
  result.textContent = 'Stärke: ' + label;
  result.style.color = color;

  // --- Zeichenklassen-Badges rendern (grün = vorhanden, grau = fehlt) ---
  const badgeDefs = [
    { label: 'A–Z', active: hasUpper },
    { label: 'a–z', active: hasLower },
    { label: '0–9', active: hasDigit },
    { label: '!#$', active: hasSpecial },
    { label: '≥ 12 Zeichen', active: len >= 12 },
  ];
  badgeDefs.forEach(b => {
    const span = document.createElement('span');
    span.className = 'pw-badge ' + (b.active ? 'pw-badge-on' : 'pw-badge-off');
    span.textContent = b.label;
    badgeWrap.appendChild(span);
  });

  // --- Geschätzte Knackzeit anzeigen ---
  crackDiv.textContent = 'Geschätzte Knackzeit: ' + formatKnackzeit(zeitSek);
  crackDiv.style.color = color;

  // --- Verbesserungstipps anzeigen (oder verstecken wenn keine vorhanden) ---
  if (tips.length > 0) {
    suggestions.style.display = 'block';
    tips.forEach(tip => {
      const li = document.createElement('li');
      li.textContent = tip;
      suggestions.appendChild(li);
    });
  } else {
    suggestions.style.display = 'none';
  }
}

// ─── Event-Listener: Analyse bei jeder Eingabe auslösen ─────────────────────
document.getElementById('passwordInput').addEventListener('input', analyzePassword);

// ─── Passwort anzeigen / verbergen (Auge-Button) ──────────────────────────────
document.getElementById('pw-toggle').addEventListener('click', () => {
  const input = document.getElementById('passwordInput');
  const icon  = document.getElementById('pw-eye-icon');
  const show  = input.type === 'password';
  input.type  = show ? 'text' : 'password';
  icon.innerHTML = show
    ? '<line x1="2" y1="2" x2="22" y2="22"/><path d="M6.71 6.71C4.01 8.36 2 12 2 12s4 8 10 8a9.9 9.9 0 0 0 5.29-1.53"/><path d="M10.58 5.11A9.9 9.9 0 0 1 12 5c6 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19"/><circle cx="12" cy="12" r="3"/>'
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
});

// ─── HIBP Datenleck-Prüfung (k-Anonymity) ─────────────────────────────────────
async function sha1(str) {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

async function datenleckPruefen() {
  const pw = document.getElementById('passwordInput').value;
  const resultEl = document.getElementById('hibpResult');
  const btn = document.getElementById('hibpBtn');

  if (!pw) {
    resultEl.textContent = 'Bitte zuerst ein Passwort eingeben.';
    resultEl.className = 'hibp-result hibp-warn';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Wird geprüft\u2026';
  resultEl.textContent = '';
  resultEl.className = '';

  try {
    const hash = await sha1(pw);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const response = await fetch('https://api.pwnedpasswords.com/range/' + prefix, {
      headers: { 'Add-Padding': 'true' }
    });
    if (!response.ok) throw new Error('API nicht erreichbar');

    const text = await response.text();
    const found = text.split('\n').find(line => line.split(':')[0] === suffix);

    if (found) {
      const count = parseInt(found.split(':')[1], 10);
      resultEl.innerHTML = '<strong>&#9888; Gefunden!</strong> Dieses Passwort erscheint <strong>' + count.toLocaleString('de-CH') + '\xd7</strong> in bekannten Datenlecks. Wechsle es sofort!';
      resultEl.className = 'hibp-result hibp-danger';
    } else {
      resultEl.innerHTML = '<strong>&#10003; Nicht gefunden.</strong> Dieses Passwort taucht in keinem bekannten Datenleck auf.';
      resultEl.className = 'hibp-result hibp-safe';
    }
  } catch {
    resultEl.textContent = 'Prüfung fehlgeschlagen. Bitte versuche es erneut.';
    resultEl.className = 'hibp-result hibp-warn';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Auf Datenlecks prüfen';
  }
}

document.getElementById('hibpBtn')?.addEventListener('click', datenleckPruefen);
