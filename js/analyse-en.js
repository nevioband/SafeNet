// ─── Configuration & Constants ────────────────────────────────────────────────

const COMMON_PASSWORDS = ["123456","password","12345678","qwerty","12345","123456789",
  "letmein","admin","welcome","123123","passw0rd","iloveyou","1234","hallo",
  "hallo123","passwort","test","abc123","000000","111111","monkey","dragon"];

// Assumption: 10^9 attempts per second (modern GPU cracking)
const RATE = 1_000_000_000n;

// ─── Helper: BigInt seconds → human-readable time string ─────────────────────
function formatCrackTime(sek) {
  if (sek <= 0n) return 'instantly';
  if (sek < 60n) return sek + ' seconds';
  if (sek < 3600n) return (sek / 60n) + ' minutes';
  if (sek < 86400n) return (sek / 3600n) + ' hours';
  const days = sek / 86400n;
  if (days < 365n) return days + ' days';
  const years = days / 365n;
  if (years < 1_000_000n) return years.toLocaleString('en') + ' years';
  if (years < 1_000_000_000n) return (years / 1_000_000n).toLocaleString('en') + ' million years';
  return (years / 1_000_000_000n).toLocaleString('en') + ' billion years';
}

// ─── Main function: Analyze password & display result ────────────────────────
function analyzePassword() {

  const pw = document.getElementById('passwordInput').value;
  const result = document.getElementById('result');
  const suggestions = document.getElementById('suggestions');
  const bar = document.getElementById('pw-bar');
  const badgeWrap = document.getElementById('pw-badges');
  const crackDiv = document.getElementById('pw-cracktime');

  suggestions.innerHTML = '';
  badgeWrap.innerHTML = '';
  crackDiv.textContent = '';

  if (!pw.length) {
    result.textContent = '';
    result.style.color = '';
    bar.style.width = '0%';
    bar.style.background = '';
    suggestions.style.display = 'none';
    return;
  }

  const hasLower   = /[a-z]/.test(pw);
  const hasUpper   = /[A-Z]/.test(pw);
  const hasDigit   = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const len = pw.length;
  const isCommon = COMMON_PASSWORDS.some(w => pw.toLowerCase().includes(w));

  let charsetSize = 0;
  if (hasLower)   charsetSize += 26;
  if (hasUpper)   charsetSize += 26;
  if (hasDigit)   charsetSize += 10;
  if (hasSpecial) charsetSize += 32;
  if (!charsetSize) charsetSize = 26;

  const total  = BigInt(charsetSize) ** BigInt(len);
  const zeitSek = total / RATE;

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

  const tips = [];
  if (len < 12)     tips.push('Use at least 12 characters.');
  if (!hasUpper)    tips.push('Add at least one uppercase letter.');
  if (!hasLower)    tips.push('Add at least one lowercase letter.');
  if (!hasDigit)    tips.push('Add at least one number.');
  if (!hasSpecial)  tips.push('Use at least one special character (e.g. ! # $ %).');
  if (isCommon)     tips.push('This password resembles commonly used passwords – choose something unique.');

  let label, color, barColor;
  if (score < 30) {
    label = 'Very weak'; color = '#ef4444';
    barColor = 'linear-gradient(90deg,#ef4444,#f87171)';
  } else if (score < 50) {
    label = 'Weak'; color = '#f97316';
    barColor = 'linear-gradient(90deg,#f97316,#fbbf24)';
  } else if (score < 70) {
    label = 'Medium'; color = '#eab308';
    barColor = 'linear-gradient(90deg,#eab308,#fde047)';
  } else if (score < 87) {
    label = 'Strong'; color = '#22c55e';
    barColor = 'linear-gradient(90deg,#22c55e,#4ade80)';
  } else {
    label = 'Very strong'; color = '#3399ff';
    barColor = 'linear-gradient(90deg,#3399ff,#66d9ff)';
  }

  bar.style.width = score + '%';
  bar.style.background = barColor;
  result.textContent = 'Strength: ' + label;
  result.style.color = color;

  const badgeDefs = [
    { label: 'A–Z', active: hasUpper },
    { label: 'a–z', active: hasLower },
    { label: '0–9', active: hasDigit },
    { label: '!#$', active: hasSpecial },
    { label: '≥ 12 chars', active: len >= 12 },
  ];
  badgeDefs.forEach(b => {
    const span = document.createElement('span');
    span.className = 'pw-badge ' + (b.active ? 'pw-badge-on' : 'pw-badge-off');
    span.textContent = b.label;
    badgeWrap.appendChild(span);
  });

  crackDiv.textContent = 'Estimated crack time: ' + formatCrackTime(zeitSek);
  crackDiv.style.color = color;

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

document.getElementById('passwordInput').addEventListener('input', analyzePassword);

document.getElementById('pw-toggle').addEventListener('click', () => {
  const input = document.getElementById('passwordInput');
  const icon  = document.getElementById('pw-eye-icon');
  const show  = input.type === 'password';
  input.type  = show ? 'text' : 'password';
  icon.innerHTML = show
    ? '<line x1="2" y1="2" x2="22" y2="22"/><path d="M6.71 6.71C4.01 8.36 2 12 2 12s4 8 10 8a9.9 9.9 0 0 0 5.29-1.53"/><path d="M10.58 5.11A9.9 9.9 0 0 1 12 5c6 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19"/><circle cx="12" cy="12" r="3"/>'
    : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
});

// ─── HIBP Breach Check (k-Anonymity) ─────────────────────────────────────────
async function sha1(str) {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

async function checkBreaches() {
  const pw = document.getElementById('passwordInput').value;
  const resultEl = document.getElementById('hibpResult');
  const btn = document.getElementById('hibpBtn');

  if (!pw) {
    resultEl.textContent = 'Please enter a password first.';
    resultEl.className = 'hibp-result hibp-warn';
    return;
  }

  btn.disabled = true;
  btn.textContent = 'Checking\u2026';
  resultEl.textContent = '';
  resultEl.className = '';

  try {
    const hash = await sha1(pw);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const response = await fetch('https://api.pwnedpasswords.com/range/' + prefix, {
      headers: { 'Add-Padding': 'true' }
    });
    if (!response.ok) throw new Error('API unavailable');

    const text = await response.text();
    const found = text.split('\n').find(line => line.split(':')[0] === suffix);

    if (found) {
      const count = parseInt(found.split(':')[1], 10);
      resultEl.innerHTML = '<strong>&#9888; Found!</strong> This password appears <strong>' + count.toLocaleString('en') + '\xd7</strong> in known data breaches. Change it immediately!';
      resultEl.className = 'hibp-result hibp-danger';
    } else {
      resultEl.innerHTML = '<strong>&#10003; Not found.</strong> This password does not appear in any known data breach.';
      resultEl.className = 'hibp-result hibp-safe';
    }
  } catch {
    resultEl.textContent = 'Check failed. Please try again.';
    resultEl.className = 'hibp-result hibp-warn';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Check for data breaches';
  }
}

document.getElementById('hibpBtn')?.addEventListener('click', checkBreaches);
