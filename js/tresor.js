import { supabase } from "./supabase.js";

const isEN = window.location.pathname.startsWith('/en/');

let vaultData = [];
let masterKey = null;
let aktivKategorie = 'alle'; // Aktiver Kategorie-Filter

// Kategorien in DE und EN
const KATEGORIEN = [
  { key: 'alle',           de: 'Alle',          en: 'All' },
  { key: 'allgemein',     de: 'Allgemein',     en: 'General' },
  { key: 'banking',       de: 'Banking',       en: 'Banking' },
  { key: 'email',         de: 'E-Mail',        en: 'E-Mail' },
  { key: 'sozial',        de: 'Soziale Medien',en: 'Social Media' },
  { key: 'shopping',      de: 'Shopping',      en: 'Shopping' },
  { key: 'arbeit',        de: 'Arbeit',        en: 'Work' },
  { key: 'gaming',        de: 'Gaming',        en: 'Gaming' },
];

function kategorieLabel(key) {
  const k = KATEGORIEN.find(k => k.key === key);
  if (!k) return key;
  return isEN ? k.en : k.de;
}

const VERIFY_LABEL = "__vault_verify__";
const VERIFY_PLAINTEXT = "__safenet_vault_verified__";

// ===== NETZWERK-STATUS =====

function isOffline() {
  return !navigator.onLine;
}

function showVaultError(msg) {
  const listEl = document.getElementById("saved-passwords-list");
  if (listEl)
    listEl.innerHTML = `<p style="text-align:center;color:#ef4444;padding:20px;">${msg}</p>`;
}

function showOfflineBanner() {
  if (document.getElementById("offlineBanner")) return;
  const banner = document.createElement("div");
  banner.id = "offlineBanner";
  banner.style.cssText =
    "position:fixed;top:0;left:0;right:0;background:#b45309;color:#fef3c7;text-align:center;padding:10px;font-size:14px;z-index:99999;font-family:Inter,sans-serif;";
  banner.textContent = isEN
    ? "\u26a0\ufe0f No internet \u2014 Vault cannot be loaded."
    : "\u26a0\ufe0f Kein Internet \u2014 Tresor kann nicht geladen werden.";
  document.body.prepend(banner);
}

function hideOfflineBanner() {
  document.getElementById("offlineBanner")?.remove();
}

window.addEventListener("online", () => {
  hideOfflineBanner();
  renderVault();
});
window.addEventListener("offline", () => showOfflineBanner());

// ===== VERSCHLÜSSELUNG =====

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

async function encryptValue(plaintext, key) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext),
  );
  const combined = new Uint8Array(12 + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), 12);
  return "ENC:" + btoa(String.fromCharCode(...combined));
}

async function decryptValue(encString, key) {
  try {
    const data = Uint8Array.from(atob(encString.slice(4)), (c) =>
      c.charCodeAt(0),
    );
    const iv = data.slice(0, 12);
    const ciphertext = data.slice(12);
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext,
    );
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
}

// ===== MASTER-PASSWORT =====

function buildMasterModal(isSetup, errorMsg, onCancel) {
  document.getElementById("masterModal")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "masterModal";
  overlay.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:Inter,sans-serif;";

  const title = isSetup
    ? (isEN ? "Create Master Password" : "Master-Passwort erstellen")
    : (isEN ? "Unlock Vault" : "Tresor entsperren");
  const btnText = isSetup
    ? (isEN ? "Set up vault" : "Tresor einrichten")
    : (isEN ? "Unlock" : "Entsperren");

  const setupInfo = isSetup
    ? (isEN
        ? `<p style="font-size:13px;color:#94a3b8;margin:0 0 20px;line-height:1.6;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:12px;display:flex;gap:10px;align-items:flex-start;"><span class="material-symbols-outlined" style="font-size:20px;color:#ef4444;flex-shrink:0;margin-top:1px;">warning</span><span><strong style="color:#ef4444;">Warning:</strong> If you forget your master password, support can reset it, but <b>not restore</b> your saved passwords \u2014 they will be lost. <br> Write it down in a safe place.</span></p>`
        : `<p style="font-size:13px;color:#94a3b8;margin:0 0 20px;line-height:1.6;background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:12px;display:flex;gap:10px;align-items:flex-start;"><span class="material-symbols-outlined" style="font-size:20px;color:#ef4444;flex-shrink:0;margin-top:1px;">warning</span><span><strong style="color:#ef4444;">Achtung:</strong> Falls du dein Master-Passwort vergisst, kann der Support es zurücksetzen, aber <b>nicht wiederherstellen</b>. Deine gespeicherten Passwörter gehen dabei verloren. <br> Notiere es an einem sicheren Ort.</span></p>`)
    : (isEN
        ? `<p style="font-size:13px;color:#94a3b8;margin:0 0 20px;">Enter your master password to unlock the vault.</p>`
        : `<p style="font-size:13px;color:#94a3b8;margin:0 0 20px;">Gib dein Master-Passwort ein, um den Tresor zu entsperren.</p>`);

  const errorHtml = errorMsg
    ? `<p style="font-size:13px;color:#ef4444;margin:0 0 16px;padding:10px 12px;background:rgba(239,68,68,0.1);border-radius:8px;border:1px solid rgba(239,68,68,0.3);">${errorMsg}</p>`
    : "";

  const confirmHtml = isSetup
    ? `<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:24px;">
               <label style="font-size:14px;color:#cbd5e1;font-weight:500;">${isEN ? "Confirm master password" : "Master-Passwort best\u00e4tigen"}</label>
               <input type="password" id="masterPwConfirm" autocomplete="new-password"
                   style="width:100%;padding:12px 14px;background:#0f172a;border:1px solid rgba(59,130,246,0.25);border-radius:8px;color:white;font-size:15px;font-family:Inter,sans-serif;box-sizing:border-box;outline:none;">
           </div>`
    : "";

  overlay.innerHTML = `
        <div style="background:#172441;border:1px solid rgba(59,130,246,0.25);border-radius:16px;padding:36px 32px;width:100%;max-width:440px;margin:20px;box-shadow:0 20px 60px rgba(0,0,0,0.5);">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                <span class="material-symbols-outlined" style="font-size:26px;color:#3399ff;">lock</span>
                <h3 style="margin:0;font-size:18px;background:linear-gradient(135deg,#3399ff,#66d9ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${title}</h3>
                ${onCancel ? `<button id="masterModalClose" style="margin-left:auto;background:none;border:none;color:rgba(255,255,255,0.4);cursor:pointer;padding:4px;display:flex;align-items:center;" title="${isEN ? 'Cancel' : 'Abbrechen'}"><span class="material-symbols-outlined" style="font-size:22px;">close</span></button>` : ""}
            </div>
            ${setupInfo}
            ${errorHtml}
            <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:16px;">
                <label style="font-size:14px;color:#cbd5e1;font-weight:500;">${isEN ? "Master password" : "Master-Passwort"}</label>
                <input type="password" id="masterPwInput" autocomplete="${isSetup ? "new-password" : "current-password"}"
                    style="width:100%;padding:12px 14px;background:#0f172a;border:1px solid rgba(59,130,246,0.25);border-radius:8px;color:white;font-size:15px;font-family:Inter,sans-serif;box-sizing:border-box;outline:none;">
            </div>
            ${confirmHtml}
            <button id="masterPwBtn" style="width:100%;padding:13px;background:linear-gradient(135deg,#3399ff,#66d9ff);color:#0f172a;border:none;border-radius:8px;font-size:15px;font-weight:700;font-family:Inter,sans-serif;cursor:pointer;">${btnText}</button>
        </div>
    `;
  document.body.appendChild(overlay);
  if (onCancel)
    document
      .getElementById("masterModalClose")
      ?.addEventListener("click", onCancel);
  setTimeout(() => document.getElementById("masterPwInput")?.focus(), 50);
}

async function askMasterPassword(session) {
  if (masterKey) return masterKey;

  // Master-Passwort aus sessionStorage laden (bleibt im Tab nach Reload erhalten)
  const storedPw = sessionStorage.getItem("vaultMasterPw_" + session.user.id);
  if (storedPw) {
    const { data: verifyEntry } = await supabase
      .from("passwords")
      .select("value")
      .eq("user_id", session.user.id)
      .eq("label", VERIFY_LABEL)
      .maybeSingle();
    if (verifyEntry) {
      const key = await deriveKey(storedPw, session.user.id);
      const decrypted = await decryptValue(verifyEntry.value, key);
      if (decrypted === VERIFY_PLAINTEXT) {
        masterKey = key;
        return masterKey;
      }
    }
    // Gespeichertes Passwort ungültig → löschen und neu fragen
    sessionStorage.removeItem("vaultMasterPw_" + session.user.id);
  }

  const { data: verifyEntry } = await supabase
    .from("passwords")
    .select("id, value")
    .eq("user_id", session.user.id)
    .eq("label", VERIFY_LABEL)
    .maybeSingle();

  const isSetup = !verifyEntry;

  return new Promise((resolve) => {
    let errorMsg = "";

    function render() {
      buildMasterModal(isSetup, errorMsg, () => {
        document.getElementById("masterModal")?.remove();
        resolve(null);
      });

      const btn = document.getElementById("masterPwBtn");
      const pwInput = document.getElementById("masterPwInput");
      const confirmInput = document.getElementById("masterPwConfirm");

      async function handleSubmit() {
        const pw = pwInput.value;
        if (!pw) {
          errorMsg = isEN ? "Please enter a master password." : "Bitte ein Master-Passwort eingeben.";
          render();
          return;
        }

        if (isSetup) {
          const confirm = confirmInput?.value ?? "";
          if (pw.length < 12) {
            errorMsg = isEN
              ? "The master password must be at least 12 characters long."
              : "Das Master-Passwort muss mindestens 12 Zeichen lang sein.";
            render();
            return;
          }
          if (pw !== confirm) {
            errorMsg = isEN ? "The passwords do not match." : "Die Passwörter stimmen nicht überein.";
            render();
            return;
          }

          btn.disabled = true;
          btn.textContent = isEN ? "Setting up\u2026" : "Wird eingerichtet\u2026";

          try {
            const newKey = await deriveKey(pw, session.user.id);

            // Bestehende Einträge mit altem Key (E-Mail + UserID) migrieren
            const { data: allEntries } = await supabase
              .from("passwords")
              .select("id, value")
              .eq("user_id", session.user.id)
              .neq("label", VERIFY_LABEL);

            if (allEntries?.length > 0) {
              btn.textContent = isEN ? "Migrating existing data\u2026" : "Bestehende Daten werden migriert\u2026";
              const legacyKey = await deriveKey(
                session.user.email,
                session.user.id,
              );
              for (const entry of allEntries) {
                if (!entry.value?.startsWith("ENC:")) continue;
                const plain = await decryptValue(entry.value, legacyKey);
                if (plain === null) continue;
                const newEnc = await encryptValue(plain, newKey);
                await supabase
                  .from("passwords")
                  .update({ value: newEnc })
                  .eq("id", entry.id);
              }
            }

            // Verify-Eintrag speichern
            const verifyEnc = await encryptValue(VERIFY_PLAINTEXT, newKey);
            await supabase.from("passwords").insert({
              user_id: session.user.id,
              label: VERIFY_LABEL,
              value: verifyEnc,
              date: new Date().toLocaleDateString(isEN ? "en-GB" : "de-CH"),
            });

            masterKey = newKey;
            sessionStorage.setItem("vaultMasterPw_" + session.user.id, pw);
            document.getElementById("masterModal")?.remove();
            resolve(masterKey);
          } catch {
            errorMsg = isEN ? "Error during setup. Please try again." : "Fehler beim Einrichten. Bitte versuche es erneut.";
            render();
          }
        } else {
          btn.disabled = true;
          btn.textContent = isEN ? "Verifying\u2026" : "Wird geprüft\u2026";

          try {
            const key = await deriveKey(pw, session.user.id);
            const decrypted = await decryptValue(verifyEntry.value, key);

            if (decrypted !== VERIFY_PLAINTEXT) {
              errorMsg = isEN ? "Wrong master password. Please try again." : "Falsches Master-Passwort. Bitte versuche es erneut.";
              render();
              return;
            }

            masterKey = key;
            sessionStorage.setItem("vaultMasterPw_" + session.user.id, pw);
            document.getElementById("masterModal")?.remove();
            resolve(masterKey);
          } catch {
            errorMsg = isEN ? "Error during verification. Please try again." : "Fehler beim Prüfen. Bitte versuche es erneut.";
            render();
          }
        }
      }

      btn.addEventListener("click", handleSubmit);
      pwInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") handleSubmit();
      });
      if (confirmInput)
        confirmInput.addEventListener("keydown", (e) => {
          if (e.key === "Enter") handleSubmit();
        });
    }

    render();
  });
}

async function ensureUnlocked() {
  if (masterKey) return masterKey;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return null;
  return await askMasterPassword(session);
}

// ===== PASSWORT-STÄRKE =====

function passwordScore(pw) {
  if (!pw || pw === "[Entschlüsselungsfehler]") return 100;
  const HAEUFIGE = ["123456","password","12345678","qwerty","12345","123456789",
    "letmein","admin","welcome","123123","passw0rd","iloveyou","1234","hallo",
    "hallo123","passwort","test","abc123","000000","111111","monkey","dragon"];
  const hasLower   = /[a-z]/.test(pw);
  const hasUpper   = /[A-Z]/.test(pw);
  const hasDigit   = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const len = pw.length;
  const isCommon = HAEUFIGE.some(w => pw.toLowerCase().includes(w));
  let score = 0;
  if (len >= 8)  score += 15;
  if (len >= 12) score += 20;
  if (len >= 16) score += 15;
  if (hasLower)   score += 10;
  if (hasUpper)   score += 10;
  if (hasDigit)   score += 10;
  if (hasSpecial) score += 20;
  if (isCommon)   score = Math.max(0, score - 35);
  return Math.min(100, score);
}

// ===== TRESOR LADEN =====

async function renderVault() {
  const listElement = document.getElementById("saved-passwords-list");
  if (!listElement) return;

  if (isOffline()) {
    showOfflineBanner();
    showVaultError(
      isEN
        ? "No internet \u2014 please check your connection and reload the page."
        : "Kein Internet \u2014 bitte Verbindung pr\u00fcfen und Seite neu laden.",
    );
    return;
  }

  let session;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    session = data.session;
  } catch {
    showVaultError(
      isEN ? "Connection error. Please reload the page." : "Verbindungsfehler beim Pr\u00fcfen der Anmeldung. Bitte Seite neu laden.",
    );
    return;
  }

  if (!session) {
    const loginUrl = window.location.pathname.includes('/en/') ? '/en/pages/login.html' : '/de/pages/login.html';
    const loginMsg = isEN
      ? `Please <a href="${loginUrl}" style="color:#3399ff">log in</a> to see your vault.`
      : `Bitte <a href="${loginUrl}" style="color:#3399ff">einloggen</a> um deinen Tresor zu sehen.`;
    listElement.innerHTML = `<p style="text-align:center; color:rgba(255,255,255,0.5); padding: 20px;">${loginMsg}</p>`;
    return;
  }

  // Master-Passwort abfragen falls noch nicht entsperrt
  if (!masterKey) {
    listElement.innerHTML =
      `<p style="text-align:center; color:rgba(255,255,255,0.4); padding:20px;">${isEN ? "Unlocking vault\u2026" : "Tresor wird entsperrt\u2026"}</p>`;
    await askMasterPassword(session);
  }

  if (!masterKey) {
    listElement.innerHTML = `
            <div style="text-align:center;padding:40px 20px;">
                <span class="material-symbols-outlined" style="font-size:48px;color:rgba(255,255,255,0.2);display:block;margin-bottom:16px;">lock</span>
                <p style="color:rgba(255,255,255,0.5);margin:0 0 20px;">${isEN ? "The vault is locked." : "Der Tresor ist gesperrt."}</p>
                <button id="unlockAgainBtn" style="padding:10px 24px;background:linear-gradient(135deg,#3399ff,#66d9ff);color:#0f172a;border:none;border-radius:8px;font-size:14px;font-weight:700;font-family:Inter,sans-serif;cursor:pointer;">${isEN ? "Unlock" : "Entsperren"}</button>
            </div>
        `;
    document
      .getElementById("unlockAgainBtn")
      ?.addEventListener("click", renderVault);
    return;
  }

  const searchContainer = document.getElementById("vaultSearchContainer");
  if (searchContainer) searchContainer.style.display = "block";

  // Kategorie-Filter-Leiste aufbauen
  let filterBar = document.getElementById('vaultKategorieFilter');
  if (!filterBar) {
    filterBar = document.createElement('div');
    filterBar.id = 'vaultKategorieFilter';
    filterBar.className = 'vault-kategorie-filter';
    searchContainer
      ? searchContainer.after(filterBar)
      : listElement.before(filterBar);
  }
  filterBar.innerHTML = KATEGORIEN.map(k => {
    const label = isEN ? k.en : k.de;
    const active = aktivKategorie === k.key ? ' vault-kat-active' : '';
    return `<button class="vault-kat-btn${active}" data-key="${k.key}">${label}</button>`;
  }).join('');
  filterBar.querySelectorAll('.vault-kat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      aktivKategorie = btn.dataset.key;
      filterBar.querySelectorAll('.vault-kat-btn').forEach(b => b.classList.remove('vault-kat-active'));
      btn.classList.add('vault-kat-active');
      // Aktive Suche beibehalten
      const searchInput = document.getElementById('vaultSearch');
      window.filterVault(searchInput?.value ?? '');
    });
  });

  listElement.innerHTML =
    `<p style="text-align:center; color:rgba(255,255,255,0.4); padding:20px;">${isEN ? "Loading\u2026" : "Wird geladen\u2026"}</p>`;

  const { data, error } = await supabase
    .from("passwords")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    if (
      error.message?.includes("JWT") ||
      error.message?.includes("session") ||
      error.message?.includes("token")
    ) {
      const loginUrl = window.location.pathname.includes('/en/') ? '/en/pages/login.html' : '/de/pages/login.html';
      const sessionMsg = isEN
        ? `Your session has expired. Please <a href="${loginUrl}" style="color:#3399ff">log in again</a>.`
        : `Deine Sitzung ist abgelaufen. Bitte <a href="${loginUrl}" style="color:#3399ff">neu einloggen</a>.`;
      showVaultError(sessionMsg);
    } else if (isOffline()) {
      showOfflineBanner();
      showVaultError(isEN ? "No internet \u2014 Vault cannot be loaded." : "Kein Internet \u2014 Tresor kann nicht geladen werden.");
    } else {
      showVaultError(isEN ? "Error loading the vault. Please reload the page." : "Fehler beim Laden des Tresors. Bitte Seite neu laden.");
    }
    return;
  }

  // Systemeinträge herausfiltern
  const entries = data.filter((pw) => !pw.label?.startsWith("__"));

  const decryptedEntries = await Promise.all(
    entries.map(async (pw) => {
      if (pw.value && pw.value.startsWith("ENC:")) {
        const dec = await decryptValue(pw.value, masterKey);
        return { ...pw, value: dec ?? "[Entschlüsselungsfehler]" };
      }
      return pw;
    }),
  );

  vaultData = decryptedEntries;

  if (decryptedEntries.length === 0) {
    listElement.innerHTML =
      `<p style="text-align:center; color:rgba(255,255,255,0.5); padding: 20px;">${isEN ? "No passwords saved yet." : "Noch keine Passw\u00f6rter gespeichert."}</p>`;
    return;
  }

  // Duplikate erkennen: alle Passwort-Werte zählen
  const valueCounts = {};
  decryptedEntries.forEach((pw) => {
    if (pw.value && pw.value !== "[Entschlüsselungsfehler]") {
      valueCounts[pw.value] = (valueCounts[pw.value] || 0) + 1;
    }
  });
  const duplicateIndices = new Set(
    decryptedEntries
      .map((pw, i) => (valueCounts[pw.value] > 1 ? i : -1))
      .filter((i) => i !== -1),
  );
  const duplicateCount = duplicateIndices.size;

  // Schwache Passwörter erkennen (Score < 40)
  const weakIndices = new Set(
    decryptedEntries
      .map((pw, i) => (passwordScore(pw.value) < 40 ? i : -1))
      .filter((i) => i !== -1),
  );
  const weakCount = weakIndices.size;

  // Statistiken in sessionStorage speichern (für Einstellungsseite)
  const strongCount = decryptedEntries.filter(pw => passwordScore(pw.value) >= 60).length;
  sessionStorage.setItem('vaultStats', JSON.stringify({
    total: decryptedEntries.length,
    duplicates: duplicateCount,
    weak: weakCount,
    strong: strongCount
  }));

  // Duplikat-Warnbanner
  let dupBanner = document.getElementById("vaultDupBanner");
  if (!dupBanner) {
    dupBanner = document.createElement("div");
    dupBanner.id = "vaultDupBanner";
    listElement.before(dupBanner);
  }
  if (duplicateCount > 0) {
    dupBanner.style.cssText =
      "display:flex;align-items:center;gap:10px;background:rgba(251,146,60,0.12);border:1px solid rgba(251,146,60,0.4);border-radius:10px;padding:12px 16px;margin-bottom:16px;color:#fb923c;font-size:14px;font-family:Inter,sans-serif;";
    dupBanner.innerHTML = isEN
      ? `<span class="material-symbols-outlined" style="font-size:20px;color:#fb923c;">warning</span> <span><strong>${duplicateCount} entries</strong> use the same password \u2014 this is a security risk!</span>`
      : `<span class="material-symbols-outlined" style="font-size:20px;color:#fb923c;">warning</span> <span><strong>${duplicateCount} Eintr\u00e4ge</strong> verwenden dasselbe Passwort \u2014 das ist ein Sicherheitsrisiko!</span>`;
  } else {
    dupBanner.style.display = "none";
  }

  // Schwach-Warnbanner
  let weakBanner = document.getElementById("vaultWeakBanner");
  if (!weakBanner) {
    weakBanner = document.createElement("div");
    weakBanner.id = "vaultWeakBanner";
    (document.getElementById("vaultDupBanner") ?? listElement).before(weakBanner);
  }
  if (weakCount > 0) {
    weakBanner.style.cssText =
      "display:flex;align-items:center;gap:10px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.4);border-radius:10px;padding:12px 16px;margin-bottom:16px;color:#f87171;font-size:14px;font-family:Inter,sans-serif;";
    weakBanner.innerHTML = isEN
      ? `<span class="material-symbols-outlined" style="font-size:20px;color:#f87171;">security</span> <span><strong>${weakCount} ${weakCount === 1 ? "password is" : "passwords are"} too weak</strong> \u2014 replace them with stronger ones!</span>`
      : `<span class="material-symbols-outlined" style="font-size:20px;color:#f87171;">security</span> <span><strong>${weakCount} ${weakCount === 1 ? "Passwort ist" : "Passw\u00f6rter sind"} zu schwach</strong> \u2014 ersetze ${weakCount === 1 ? "es" : "sie"} durch st\u00e4rkere!</span>`;
  } else {
    weakBanner.style.display = "none";
  }

  listElement.innerHTML = decryptedEntries
    .map((pw, index) => {
      const isDup = duplicateIndices.has(index);
      const isWeak = weakIndices.has(index);
      const dupBadge = isDup
        ? `<span style="font-size:11px;background:rgba(251,146,60,0.2);border:1px solid rgba(251,146,60,0.5);color:#fb923c;border-radius:6px;padding:2px 7px;margin-left:6px;vertical-align:middle;">${isEN ? "Duplicate" : "Duplikat"}</span>`
        : "";
      const weakBadge = isWeak
        ? `<span style="font-size:11px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.5);color:#f87171;border-radius:6px;padding:2px 7px;margin-left:6px;vertical-align:middle;">${isEN ? "Weak" : "Schwach"}</span>`
        : "";
      const kat = pw.kategorie || '';
      const katBadge = kat && kat !== 'allgemein'
        ? `<span style="font-size:11px;background:rgba(51,153,255,0.12);border:1px solid rgba(51,153,255,0.35);color:#93c5fd;border-radius:6px;padding:2px 7px;margin-left:6px;vertical-align:middle;">${kategorieLabel(kat)}</span>`
        : '';
      const borderStyle = isDup
        ? "border-color:rgba(251,146,60,0.5);"
        : isWeak
        ? "border-color:rgba(239,68,68,0.45);"
        : "";
      return `
        <div class="vault-item" style="${borderStyle}">
            <div style="display:flex;flex-direction:column;gap:2px;overflow:hidden;margin-right:10px;">
                <strong style="color:#ffffff;font-size:1rem;margin-bottom:2px;display:block;">${pw.label}${dupBadge}${weakBadge}${katBadge}</strong>
                <span class="password-display" id="pw-${index}" style="font-family:monospace;color:#66d9ff;font-size:1.1rem;letter-spacing:2px;">••••••••</span>
                <small style="font-size:0.7rem;color:rgba(255,255,255,0.4);">${pw.date || "-"}</small>
            </div>
            <div style="display:flex;gap:8px;flex-shrink:0;">
                <button class="vault-view-btn" onclick="window.editLabel('${pw.id}', '${pw.label}')" title="${isEN ? 'Rename' : 'Umbenennen'}" style="background:linear-gradient(135deg,#FFB347,#FFCC33);color:#0b1220 !important;">
                    <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="vault-view-btn" onclick="window.editKategorie('${pw.id}', '${pw.kategorie || 'allgemein'}')" title="${isEN ? 'Change category' : 'Kategorie ändern'}" style="background:linear-gradient(135deg,#3399ff,#66d9ff);color:#0b1220 !important;">
                    <span class="material-symbols-outlined">label</span>
                </button>
                <button class="vault-view-btn" onclick="window.toggleVisibility(${index})" title="${isEN ? 'Show' : 'Anzeigen'}">
                    <span class="material-symbols-outlined" id="eye-${index}">visibility</span>
                </button>
                <button class="vault-copy-btn" onclick="window.copyToClipboard(${index})" title="${isEN ? 'Copy' : 'Kopieren'}">
                    <span class="material-symbols-outlined">content_copy</span>
                </button>
                <button class="vault-delete-btn" onclick="window.deletePassword('${pw.id}')" title="${isEN ? 'Delete' : 'L\u00f6schen'}">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        </div>
    `;
    })
    .join("");

  // Aktive Suche nach Reload beibehalten
  const searchInput = document.getElementById("vaultSearch");
  if (searchInput && searchInput.value.trim()) {
    window.filterVault(searchInput.value);
  } else if (aktivKategorie !== 'alle') {
    window.filterVault('');
  }
}

// Kategorie bearbeiten
window.editKategorie = async function (id, currentKategorie) {
  const options = KATEGORIEN.filter(k => k.key !== 'alle');
  const optionText = options.map((k, i) => `${i + 1}. ${isEN ? k.en : k.de}`).join('\n');
  const current = options.findIndex(k => k.key === currentKategorie) + 1;
  const input = prompt(
    (isEN ? `Choose category (current: ${kategorieLabel(currentKategorie)}):\n` : `Kategorie wählen (aktuell: ${kategorieLabel(currentKategorie)}):\n`) + optionText,
    String(current)
  );
  if (input === null) return;
  const idx = parseInt(input) - 1;
  if (isNaN(idx) || idx < 0 || idx >= options.length) {
    alert(isEN ? 'Invalid selection.' : 'Ungültige Auswahl.');
    return;
  }
  const newKategorie = options[idx].key;
  if (isOffline()) {
    alert(isEN ? 'No internet — change cannot be saved.' : 'Kein Internet — Änderung kann nicht gespeichert werden.');
    return;
  }
  const { error } = await supabase.from('passwords').update({ kategorie: newKategorie }).eq('id', id);
  if (error) {
    alert(isEN ? 'Error saving category.' : 'Fehler beim Speichern der Kategorie.');
    return;
  }
  renderVault();
};

// Namen bearbeiten
window.editLabel = async function (id, currentLabel) {
  const newLabel = prompt(isEN ? "Enter a new name:" : "Gib einen neuen Namen ein:", currentLabel);
  if (newLabel === null) return;
  const label = newLabel.trim() === "" ? (isEN ? "Unnamed" : "Unbenannt") : newLabel;
  if (isOffline()) {
    alert(isEN ? "No internet \u2014 change cannot be saved." : "Kein Internet \u2014 \u00c4nderung kann nicht gespeichert werden.");
    return;
  }
  const { error } = await supabase
    .from("passwords")
    .update({ label })
    .eq("id", id);
  if (error) {
    alert(isEN ? "Rename error. Please try again." : "Fehler beim Umbenennen. Bitte versuche es erneut.");
    return;
  }
  renderVault();
};

// Sichtbarkeit umschalten
window.toggleVisibility = function (index) {
  const pwSpan = document.getElementById(`pw-${index}`);
  const eyeIcon = document.getElementById(`eye-${index}`);
  const realValue = vaultData[index]?.value ?? "";
  if (pwSpan.innerText === "••••••••") {
    pwSpan.innerText = realValue;
    pwSpan.style.letterSpacing = "1px";
    eyeIcon.innerText = "visibility_off";
  } else {
    pwSpan.innerText = "••••••••";
    pwSpan.style.letterSpacing = "2px";
    eyeIcon.innerText = "visibility";
  }
};

// Passwort löschen
window.deletePassword = async function (id) {
  if (!confirm(isEN ? "Do you really want to delete this password?" : "Möchtest du dieses Passwort wirklich löschen?")) return;
  await supabase.from("passwords").delete().eq("id", id);
  renderVault();
};

// ===== PASSWORT SPEICHERN =====

window.savePassword = async function (newPasswordValue, labelValue, kategorieValue) {
  if (isOffline()) {
    alert(isEN ? "No internet \u2014 password cannot be saved." : "Kein Internet \u2014 Passwort kann nicht gespeichert werden.");
    return;
  }

  let session;
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    session = data.session;
  } catch {
    alert(isEN ? "Connection error. Please reload the page." : "Verbindungsfehler. Bitte Seite neu laden.");
    return;
  }
  if (!session) {
    alert(isEN ? "Your session has expired. Please log in again." : "Deine Sitzung ist abgelaufen. Bitte neu einloggen.");
    window.location.href = window.location.pathname.includes('/en/') ? '/en/pages/login.html' : '/de/pages/login.html';
    return;
  }

  const finalLabel =
    labelValue && labelValue.trim() !== ""
      ? labelValue
      : (isEN ? "Unnamed password" : "Unbenanntes Passwort");

  let valueToStore;
  try {
    const key = await ensureUnlocked();
    if (!key) {
      alert(isEN ? "Vault is locked. Please reload the page." : "Tresor ist gesperrt. Bitte Seite neu laden.");
      return;
    }
    valueToStore = await encryptValue(newPasswordValue, key);
  } catch {
    alert(
      isEN ? "Encryption error. Password could not be saved." : "Verschl\u00fcsselungsfehler. Passwort konnte nicht gespeichert werden.",
    );
    return;
  }

  const { error: insertError } = await supabase.from("passwords").insert({
    user_id: session.user.id,
    label: finalLabel,
    value: valueToStore,
    date: new Date().toLocaleDateString(isEN ? "en-GB" : "de-CH"),
    kategorie: kategorieValue || 'allgemein',
  });
  if (insertError) {
    if (
      insertError.message?.includes("JWT") ||
      insertError.message?.includes("token")
    ) {
      alert(isEN ? "Your session has expired. Please log in again." : "Deine Sitzung ist abgelaufen. Bitte neu einloggen.");
      window.location.href = window.location.pathname.includes('/en/') ? '/en/pages/login.html' : '/de/pages/login.html';
    } else {
      alert((isEN ? "Save error: " : "Fehler beim Speichern: ") + insertError.message);
    }
    return;
  }
  if (document.getElementById("saved-passwords-list")) renderVault();
};

// Manuelles Speichern aus dem Modal
window.saveManual = async function () {
  const label = (document.getElementById("manualLabel")?.value || "").trim();
  const password = (
    document.getElementById("manualPassword")?.value || ""
  ).trim();
  const kategorie = document.getElementById("manualKategorie")?.value || 'allgemein';
  if (!password) {
    alert(isEN ? "Please enter a password." : "Bitte ein Passwort eingeben.");
    return;
  }
  await window.savePassword(password, label || (isEN ? "Manually saved" : "Manuell gespeichert"), kategorie);
  document.getElementById("manualModal").style.display = "none";
  document.getElementById("manualLabel").value = "";
  document.getElementById("manualPassword").value = "";
  if (document.getElementById("manualKategorie")) document.getElementById("manualKategorie").value = 'allgemein';
};

// Vom Generator zum Tresor übertragen
window.transferToVault = async function () {
  const outputField = document.getElementById("password-output");
  const labelField = document.getElementById("password-label");
  const kategorieField = document.getElementById("generator-kategorie");
  const currentPassword = outputField ? outputField.value : "";
  const currentLabel = labelField ? labelField.value : "";
  const currentKategorie = kategorieField ? kategorieField.value : "allgemein";

  if (!currentPassword || currentPassword === "Klicke auf Generieren" || currentPassword === "Click Generate") {
    alert(isEN ? "Please generate a password first." : "Bitte generiere erst ein Passwort.");
    return;
  }

  await window.savePassword(currentPassword, currentLabel, currentKategorie);
  alert(isEN
    ? `Password for "${currentLabel || "Unnamed"}" saved!`
    : `Passwort für "${currentLabel || "Unbenannt"}" gespeichert!`);
  if (labelField) labelField.value = "";
};

// ===== ALLE LÖSCHEN =====

window.clearVault = async function () {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return;
  if (!confirm(isEN ? "Do you really want to delete ALL saved passwords?" : "Möchtest du wirklich ALLE gespeicherten Passwörter löschen?"))
    return;
  if (isOffline()) {
    alert(isEN ? "No internet \u2014 deletion not possible." : "Kein Internet \u2014 Löschen nicht möglich.");
    return;
  }
  const { error } = await supabase
    .from("passwords")
    .delete()
    .eq("user_id", session.user.id);
  if (error) {
    alert(isEN ? "Delete error. Please try again." : "Fehler beim Löschen. Bitte versuche es erneut.");
    return;
  }
  renderVault();
};

// Kopieren
window.copyToClipboard = function (index) {
  const text = vaultData[index]?.value ?? "";
  if (!text) {
    alert("Kein Passwort zum Kopieren gefunden.");
    return;
  }
  if (!navigator.clipboard) {
    // Fallback f\u00fcr \u00e4ltere Browser / unsichere Verbindungen
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      alert("Passwort kopiert!");
    } catch {
      alert("Kopieren nicht m\u00f6glich \u2014 bitte manuell kopieren.");
    }
    document.body.removeChild(ta);
    return;
  }
  navigator.clipboard
    .writeText(text)
    .then(() => alert("Passwort kopiert!"))
    .catch(() =>
      alert("Kopieren fehlgeschlagen \u2014 bitte manuell kopieren."),
    );
};

// ===== CSV EXPORT =====

window.exportCSV = function () {
  if (vaultData.length === 0) {
    alert(isEN ? "No passwords to export." : "Keine Passwörter zum Exportieren vorhanden.");
    return;
  }
  if (
    !confirm(
      isEN
        ? `Warning: The exported file contains all ${vaultData.length} passwords in plain text. Keep it in a safe place!\n\nContinue with export?`
        : `Achtung: Die exportierte Datei enthält alle ${vaultData.length} Passwörter im Klartext. Bewahre sie sicher auf!\n\nExport fortfahren?`,
    )
  )
    return;

  const rows = [isEN ? ["Name", "Password", "Date"] : ["Name", "Passwort", "Datum"]];
  vaultData.forEach((pw) => {
    const name = `"${(pw.label || "").replace(/"/g, '""')}"`;
    const password = `"${(pw.value || "").replace(/"/g, '""')}"`;
    const date = `"${(pw.date || "").replace(/"/g, '""')}"`;
    rows.push([name, password, date]);
  });

  const csvContent = "\uFEFF" + rows.map((r) => r.join(",")).join("\n"); // BOM für Excel-Kompatibilität
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const locale = isEN ? "en-GB" : "de-CH";
  a.download = `safenet-export-${new Date().toLocaleDateString(locale).replace(/[\.]/g, "-")}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ===== CSV IMPORT =====

window.importCSV = async function (input) {
  const file = input.files[0];
  if (!file) return;
  input.value = ""; // Reset damit man dieselbe Datei nochmal laden kann

  if (isOffline()) {
    alert("Kein Internet — Import nicht möglich.");
    return;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    alert("Bitte zuerst einloggen.");
    return;
  }

  const key = await ensureUnlocked();
  if (!key) {
    alert("Tresor ist gesperrt. Bitte Seite neu laden.");
    return;
  }

  const text = await file.text();
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l);

  if (lines.length < 2) {
    alert("Die CSV-Datei ist leer oder hat kein gültiges Format.");
    return;
  }

  // Header-Zeile erkennen (Chrome-Format: name,url,username,password)
  const header = lines[0].toLowerCase();
  const hasHeader =
    header.includes("name") ||
    header.includes("password") ||
    header.includes("url");
  const dataLines = hasHeader ? lines.slice(1) : lines;

  if (dataLines.length === 0) {
    alert(isEN ? "No entries found in the CSV." : "Keine Einträge in der CSV gefunden.");
    return;
  }

  const today = new Date().toLocaleDateString(isEN ? "en-GB" : "de-CH");

  let imported = 0;
  let skipped = 0;
  const batchSize = 50;

  for (let i = 0; i < dataLines.length; i += batchSize) {
    const batch = dataLines.slice(i, i + batchSize);
    const rows = [];

    for (const line of batch) {
      // CSV parsen (einfaches Komma-Split, quoted fields unterstützt)
      const cols = parseCSVLine(line);
      if (cols.length < 2) {
        skipped++;
        continue;
      }

      // Chrome-Format: name, url, username, password
      // Fallback: label, password
      let label, password;
      if (cols.length >= 4) {
        label = cols[0]?.trim() || cols[2]?.trim() || (isEN ? "Imported" : "Importiert");
        password = cols[3]?.trim();
      } else {
        label = cols[0]?.trim() || (isEN ? "Imported" : "Importiert");
        password = cols[1]?.trim();
      }

      if (!password) {
        skipped++;
        continue;
      }

      const encVal = await encryptValue(password, key);
      rows.push({
        user_id: session.user.id,
        label: label || (isEN ? "Imported" : "Importiert"),
        value: encVal,
        date: today,
      });
    }

    if (rows.length > 0) {
      const { error } = await supabase.from("passwords").insert(rows);
      if (error) {
        alert((isEN ? "Import error: " : "Fehler beim Importieren: ") + error.message);
        break;
      }
      imported += rows.length;
    }
  }

  alert(
    isEN
      ? `Import complete: ${imported} password${imported !== 1 ? "s" : ""} imported${skipped > 0 ? `, ${skipped} skipped` : ""}.`
      : `Import abgeschlossen: ${imported} Passwörter importiert${skipped > 0 ? `, ${skipped} übersprungen` : ""}.`,
  );
  renderVault();
};

function parseCSVLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ===== SUCHE =====

window.filterVault = function (query) {
  const q = (query || '').trim().toLowerCase();
  const items = document.querySelectorAll("#saved-passwords-list .vault-item");
  let visible = 0;
  items.forEach((item, index) => {
    const pw = vaultData[index];
    const label = pw?.label?.toLowerCase() ?? "";
    const matchText = !q || label.includes(q);
    const matchKat = aktivKategorie === 'alle' || (pw?.kategorie || 'allgemein') === aktivKategorie;
    const match = matchText && matchKat;
    item.style.display = match ? "" : "none";
    if (match) visible++;
  });
  // "Keine Treffer"-Hinweis
  let noResult = document.getElementById("vaultNoResult");
  if (!noResult) {
    noResult = document.createElement("p");
    noResult.id = "vaultNoResult";
    noResult.style.cssText =
      "text-align:center;color:rgba(255,255,255,0.4);padding:16px;";
    noResult.textContent = isEN ? "No passwords found." : "Keine Passwörter gefunden.";
    document.getElementById("saved-passwords-list").after(noResult);
  }
  noResult.style.display = visible === 0 ? "block" : "none";
};

// ===== START =====

document.addEventListener("DOMContentLoaded", () => {
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT" || !session) {
      // Master-Passwort aus sessionStorage entfernen
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith("vaultMasterPw_"))
        .forEach((k) => sessionStorage.removeItem(k));
    }
    masterKey = null;
    renderVault();
  });
});
