import { supabase as e } from "/js/supabase.js";

// Hilfsfunktionen für UI-Zustände
function showResetForm() {
  document.getElementById("formBox").style.display = "block";
  document.getElementById("invalidBox").style.display = "none";
}

function showInvalidMessage() {
  if (document.getElementById("formBox").style.display === "none") {
    document.getElementById("invalidBox").style.display = "block";
  }
}

// Fehler-Übersetzer für die Passwort-Aktualisierung
function translateError(e) {
  if (!e) return "Ein unbekannter Fehler ist aufgetreten.";
  const t = e.toLowerCase();
  return t.includes("same password") || t.includes("different from")
    ? "Das neue Passwort muss anders als das alte sein."
    : t.includes("weak password") || t.includes("at least")
      ? "Das Passwort ist zu schwach. Bitte wähle ein stärkeres."
      : t.includes("session") || t.includes("token") || t.includes("expired")
        ? "Dieser Link ist abgelaufen. Bitte fordere einen neuen Reset-Link an."
        : t.includes("network") || t.includes("fetch")
          ? "Verbindungsfehler. Bitte prüfe deine Internetverbindung."
          : "Fehler: " + e;
}

// Haupt-Initialisierung (Verhindert Top-Level-Await-Blockaden)
async function initResetPage() {
  // 1. Sofort-Check: Ist ein Token im URL-Hash aktiv?
  const hash = window.location.hash;
  if (hash.includes("type=recovery") || hash.includes("access_token=")) {
    showResetForm();
    return;
  }

  // 2. Auf offizielle Supabase Event-Wechsel hören
  e.auth.onAuthStateChange((type, session) => {
    if ("PASSWORD_RECOVERY" === type) {
      showResetForm();
    }
  });

  // 3. Fallback: Aktuelle Client-Session prüfen
  try {
    const { data: { session: t }, error } = await e.auth.getSession();
    if (t) {
      showResetForm();
    } else {
      // Wenn nach 2 Sekunden kein Event kam und keine Session existiert, Link verwerfen
      setTimeout(showInvalidMessage, 2000);
    }
  } catch (err) {
    console.error("Session-Abfrage fehlgeschlagen:", err);
    setTimeout(showInvalidMessage, 1000);
  }
}

// Initialisierung ausführen
initResetPage();

// --- EVENT LISTENERS ---

// Passwort Sichtbarkeit umschalten
document.getElementById("togglePass").addEventListener("click", () => {
  const e = document.getElementById("newPass"),
    t = document.getElementById("eyeIcon");
  "password" === e.type
    ? ((e.type = "text"),
      (t.innerHTML =
        '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'))
    : ((e.type = "password"),
      (t.innerHTML =
        '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'));
});

// Neues Passwort an Supabase senden
document.getElementById("resetBtn").addEventListener("click", async () => {
  const t = document.getElementById("newPass").value,
    n = document.getElementById("confirmPass").value,
    s = document.getElementById("errorBox"),
    d = document.getElementById("errorText"),
    i = document.getElementById("resetBtn");
    
  if ((s.classList.add("hidden"), !t || !n)) {
    d.textContent = "Bitte beide Felder ausfüllen.";
    return void s.classList.remove("hidden");
  }
  if (t.length < 6) {
    d.textContent = "Passwort muss mindestens 6 Zeichen lang sein.";
    return void s.classList.remove("hidden");
  }
  if (t !== n) {
    d.textContent = "Passwörter stimmen nicht überein.";
    return void s.classList.remove("hidden");
  }

  ((i.textContent = "Wird gespeichert…"), (i.disabled = !0));
  
  const { error: o } = await e.auth.updateUser({ password: t });
  
  if (o) {
    d.textContent = translateError(o.message);
    s.classList.remove("hidden");
    i.textContent = "Passwort speichern";
    i.disabled = !1;
  } else {
    document.getElementById("formBox").style.display = "none";
    document.getElementById("successBox").style.display = "block";
  }
});