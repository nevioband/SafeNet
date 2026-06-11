const HAEUFIGE = [
    "123456",
    "password",
    "12345678",
    "qwerty",
    "12345",
    "123456789",
    "letmein",
    "admin",
    "welcome",
    "123123",
    "passw0rd",
    "iloveyou",
    "1234",
    "hallo",
    "hallo123",
    "passwort",
    "test",
    "abc123",
    "000000",
    "111111",
    "monkey",
    "dragon",
  ],
  RATE = 1000000000n;
function formatKnackzeit(e) {
  if (e <= 0n) return "sofort";
  if (e < 60n) return e + " Sekunden";
  if (e < 3600n) return e / 60n + " Minuten";
  if (e < 86400n) return e / 3600n + " Stunden";
  const t = e / 86400n;
  if (t < 365n) return t + " Tage";
  const n = t / 365n;
  return n < 1000000n
    ? n.toLocaleString("de-CH") + " Jahre"
    : n < 1000000000n
      ? (n / 1000000n).toLocaleString("de-CH") + " Millionen Jahre"
      : (n / 1000000000n).toLocaleString("de-CH") + " Milliarden Jahre";
}
function analyzePassword() {
  const e = document.getElementById("passwordInput").value,
    t = document.getElementById("result"),
    n = document.getElementById("suggestions"),
    s = document.getElementById("pw-bar"),
    a = document.getElementById("pw-badges"),
    r = document.getElementById("pw-cracktime");
  if (((n.innerHTML = ""), (a.innerHTML = ""), (r.textContent = ""), !e.length))
    return (
      (t.textContent = ""),
      (t.style.color = ""),
      (s.style.width = "0%"),
      (s.style.background = ""),
      void (n.style.display = "none")
    );
  const i = /[a-z]/.test(e),
    o = /[A-Z]/.test(e),
    d = /[0-9]/.test(e),
    l = /[^A-Za-z0-9]/.test(e),
    c = e.length,
    u = HAEUFIGE.some((t) => e.toLowerCase().includes(t));
  let h = 0;
  (i && (h += 26),
    o && (h += 26),
    d && (h += 10),
    l && (h += 32),
    h || (h = 26));
  const g = BigInt(h) ** BigInt(c) / RATE;
  let p = 0;
  (c >= 8 && (p += 15),
    c >= 12 && (p += 20),
    c >= 16 && (p += 15),
    i && (p += 10),
    o && (p += 10),
    d && (p += 10),
    l && (p += 20),
    u && (p = Math.max(0, p - 35)),
    (p = Math.min(100, p)));
  const m = [];
  let f, w, y;
  (c < 12 && m.push("Verwende mindestens 12 Zeichen."),
    o || m.push("Füge mindestens einen Großbuchstaben hinzu."),
    i || m.push("Füge mindestens einen Kleinbuchstaben hinzu."),
    d || m.push("Füge mindestens eine Zahl hinzu."),
    l || m.push("Verwende mindestens ein Sonderzeichen (z. B. ! # $ %)."),
    u &&
      m.push(
        "Dieses Passwort ähnelt häufig genutzten Passwörtern – wähle etwas Einzigartiges.",
      ),
    p < 30
      ? ((f = "Sehr schwach"),
        (w = "#ef4444"),
        (y = "linear-gradient(90deg,#ef4444,#f87171)"))
      : p < 50
        ? ((f = "Schwach"),
          (w = "#f97316"),
          (y = "linear-gradient(90deg,#f97316,#fbbf24)"))
        : p < 70
          ? ((f = "Mittel"),
            (w = "#eab308"),
            (y = "linear-gradient(90deg,#eab308,#fde047)"))
          : p < 87
            ? ((f = "Stark"),
              (w = "#22c55e"),
              (y = "linear-gradient(90deg,#22c55e,#4ade80)"))
            : ((f = "Sehr stark"),
              (w = "#3399ff"),
              (y = "linear-gradient(90deg,#3399ff,#66d9ff)")),
    (s.style.width = p + "%"),
    (s.style.background = y),
    (t.textContent = "Stärke: " + f),
    (t.style.color = w),
    [
      { label: "A–Z", active: o },
      { label: "a–z", active: i },
      { label: "0–9", active: d },
      { label: "!#$", active: l },
      { label: "≥ 12 Zeichen", active: c >= 12 },
    ].forEach((e) => {
      const t = document.createElement("span");
      ((t.className =
        "pw-badge " + (e.active ? "pw-badge-on" : "pw-badge-off")),
        (t.textContent = e.label),
        a.appendChild(t));
    }),
    (r.textContent = "Geschätzte Knackzeit: " + formatKnackzeit(g)),
    (r.style.color = w),
    m.length > 0
      ? ((n.style.display = "block"),
        m.forEach((e) => {
          const t = document.createElement("li");
          ((t.textContent = e), n.appendChild(t));
        }))
      : (n.style.display = "none"));
}
async function sha1(e) {
  const t = new TextEncoder().encode(e),
    n = await crypto.subtle.digest("SHA-1", t);
  return Array.from(new Uint8Array(n))
    .map((e) => e.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}
async function datenleckPruefen() {
  const e = document.getElementById("passwordInput").value,
    t = document.getElementById("hibpResult"),
    n = document.getElementById("hibpBtn");
  if (!e)
    return (
      (t.textContent = "Bitte zuerst ein Passwort eingeben."),
      void (t.className = "hibp-result hibp-warn")
    );
  ((n.disabled = !0),
    (n.textContent = "Wird geprüft…"),
    (t.textContent = ""),
    (t.className = ""));
  try {
    const n = await sha1(e),
      s = n.slice(0, 5),
      a = n.slice(5),
      r = await fetch("https://api.pwnedpasswords.com/range/" + s, {
        headers: { "Add-Padding": "true" },
      });
    if (!r.ok) throw new Error("API nicht erreichbar");
    const i = (await r.text()).split("\n").find((e) => e.split(":")[0] === a);
    if (i) {
      const e = parseInt(i.split(":")[1], 10);
      ((t.innerHTML =
        "<strong>&#9888; Gefunden!</strong> Dieses Passwort erscheint <strong>" +
        e.toLocaleString("de-CH") +
        "×</strong> in bekannten Datenlecks. Wechsle es sofort!"),
        (t.className = "hibp-result hibp-danger"));
    } else
      ((t.innerHTML =
        "<strong>&#10003; Nicht gefunden.</strong> Dieses Passwort taucht in keinem bekannten Datenleck auf."),
        (t.className = "hibp-result hibp-safe"));
  } catch {
    ((t.textContent = "Prüfung fehlgeschlagen. Bitte versuche es erneut."),
      (t.className = "hibp-result hibp-warn"));
  } finally {
    ((n.disabled = !1), (n.textContent = "Auf Datenlecks prüfen"));
  }
}
(document
  .getElementById("passwordInput")
  .addEventListener("input", analyzePassword),
  document.getElementById("pw-toggle").addEventListener("click", () => {
    const e = document.getElementById("passwordInput"),
      t = document.getElementById("pw-eye-icon"),
      n = "password" === e.type;
    ((e.type = n ? "text" : "password"),
      (t.innerHTML = n
        ? '<line x1="2" y1="2" x2="22" y2="22"/><path d="M6.71 6.71C4.01 8.36 2 12 2 12s4 8 10 8a9.9 9.9 0 0 0 5.29-1.53"/><path d="M10.58 5.11A9.9 9.9 0 0 1 12 5c6 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19"/><circle cx="12" cy="12" r="3"/>'
        : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'));
  }),
  document
    .getElementById("hibpBtn")
    ?.addEventListener("click", datenleckPruefen),
  document.getElementById("passwordInput").addEventListener("keydown", (e) => {
    "Enter" === e.key && datenleckPruefen();
  }));
