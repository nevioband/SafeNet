import { supabase } from "./supabase.js";

(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) return;

  const isEn = window.location.pathname.startsWith("/en/");
  const gate = document.createElement("div");
  gate.id = "sn-auth-gate";

  gate.innerHTML = `
    <div class="sn-auth-gate-box">
      <button id="sn-auth-gate-close" class="sn-auth-gate-close" aria-label="Schließen">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
      <div class="sn-auth-gate-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
      </div>
      <h2>${isEn ? "Login required" : "Login erforderlich"}</h2>
      <p>${isEn ? "This feature is only available to registered users. Create a free account and use the vault, notes and AI assistant!" : "Diese Funktion steht nur registrierten Nutzern zur Verfügung. Erstelle kostenlos ein Konto und nutze Tresor, Notizen und KI-Assistent!"}</p>
      <div class="sn-auth-gate-btns">
        <a href="${isEn ? "/en/pages/register.html" : "/de/pages/register.html"}" class="sn-auth-gate-btn primary">${isEn ? "Register for free" : "Kostenlos registrieren"}</a>
        <a href="${isEn ? "/en/pages/login.html" : "/de/pages/login.html"}" class="sn-auth-gate-secondary">${isEn ? "Already have an account? Log in" : "Bereits registriert? Einloggen"}</a>
      </div>
    </div>`;

  document.body.appendChild(gate);

  const removeGate = () => gate.remove();

  document.getElementById("sn-auth-gate-close").onclick = removeGate;

  gate.onclick = (e) => e.target === gate && removeGate();
})();