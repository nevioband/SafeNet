import { supabase as e } from "/js/supabase.js";
function t(e) {
  ((document.getElementById("errorText").textContent = e),
    document.getElementById("errorBox").classList.remove("hidden"));
}
(document.getElementById("togglePass").addEventListener("click", function () {
  const e = document.getElementById("regPass"),
    t = document.getElementById("eyeIcon");
  "password" === e.type
    ? ((e.type = "text"),
      (t.innerHTML =
        '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>'))
    : ((e.type = "password"),
      (t.innerHTML =
        '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'));
}),
  document.getElementById("registerBtn").addEventListener("click", async () => {
    const n = document.getElementById("regEmail").value.trim(),
      s = document.getElementById("regPass").value,
      i = document.getElementById("regPassConfirm").value,
      r = document.getElementById("successBox"),
      d = document.getElementById("registerBtn");
    if (
      (document.getElementById("errorBox").classList.add("hidden"),
      (r.style.display = "none"),
      !n || !s || !i)
    )
      return void t("Bitte alle Felder ausfüllen.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(n))
      return void t("Bitte gib eine gültige E-Mail-Adresse ein.");
    if (s.length < 6)
      return void t("Passwort muss mindestens 6 Zeichen lang sein.");
    if (s !== i) return void t("Passwörter stimmen nicht überein.");
    ((d.textContent = "Wird registriert…"), (d.disabled = !0));
    const { error: l } = await e.auth.signUp({ email: n, password: s });
    l
      ? (t(
          (function (e) {
            if (!e) return "Ein unbekannter Fehler ist aufgetreten.";
            const t = e.toLowerCase();
            return t.includes("user already registered") ||
              t.includes("already been registered")
              ? "Diese E-Mail-Adresse ist bereits registriert."
              : t.includes("invalid email") ||
                  t.includes("unable to validate email")
                ? "Bitte gib eine gültige E-Mail-Adresse ein."
                : t.includes("password should be at least")
                  ? "Das Passwort muss mindestens 6 Zeichen lang sein."
                  : t.includes("too many requests") || t.includes("rate limit")
                    ? "Zu viele Versuche. Bitte warte einen Moment."
                    : t.includes("network") || t.includes("fetch")
                      ? "Verbindungsfehler. Bitte prüfe deine Internetverbindung."
                      : "Fehler: " + e;
          })(l.message),
        ),
        (d.textContent = "Registrieren"),
        (d.disabled = !1))
      : ((r.style.display = "flex"),
        (d.textContent = "Registriert!"),
        setTimeout(() => {
          window.location.href = "login.html";
        }, 3e3));
  }),
  document.addEventListener("keydown", (e) => {
    "Enter" === e.key && document.getElementById("registerBtn").click();
  }));
