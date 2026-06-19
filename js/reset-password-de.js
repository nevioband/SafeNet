import { supabase as e } from "/js/supabase.js";

// Initialer Zustand: Formular und Fehler verstecken, Lade-Zustand aktiv halten
document.getElementById("formBox").style.display = "none";
document.getElementById("invalidBox").style.display = "none";

// Hilfsfunktion: Schaltet das Formular frei und bricht das unendliche Laden ab
function showResetForm() {
  document.getElementById("formBox").style.display = "block";
  document.getElementById("invalidBox").style.display = "none";
  
  // Falls du ein Lade-Element (z.B. mit ID "loading" oder Ähnliches) im HTML hast,
  // blende es hier aus. Zum Beispiel:
  const loader = document.getElementById("loading") || document.querySelector(".loading-wrapper");
  if (loader) loader.style.display = "none";
}

// 1. Auf das offizielle Supabase Event hören
e.auth.onAuthStateChange((type, session) => {
  if ("PASSWORD_RECOVERY" === type) {
    showResetForm();
  }
});

// 2. Fallback für den ersten Klick: Direkt den URL-Hash prüfen
const hash = window.location.hash;
if (hash.includes("type=recovery") || hash.includes("access_token=")) {
  // Wenn der Token in der URL liegt, erzwingen wir die Anzeige des Formulars
  showResetForm();
} else {
  // Nur wenn KEIN Token in der URL existiert, prüfen wir die bestehende Session
  const { data: { session: t } } = await e.auth.getSession();
  if (t) {
    showResetForm();
  } else {
    // Wenn nach 2.5 Sekunden absolut nichts erkannt wurde, ist der Link ungültig
    setTimeout(() => {
      if ("none" === document.getElementById("formBox").style.display) {
        document.getElementById("invalidBox").style.display = "block";
        const loader = document.getElementById("loading") || document.querySelector(".loading-wrapper");
        if (loader) loader.style.display = "none";
      }
    }, 2500);
  }
}

// --- AB HIER BLEIBT DEIN CODE UNVERÄNDERT ---
document.getElementById("togglePass").addEventListener("click", () => {
// ... ab hier folgt dein Eventlistener für togglePass und den resetBtn wie gehabt