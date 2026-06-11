import { supabase as t } from "/js/supabase.js";
const s = document.getElementById("stats-root"),
  e = {
    allgemein: "General",
    banking: "Banking",
    email: "E-Mail",
    sozial: "Social Media",
    shopping: "Shopping",
    arbeit: "Work",
    gaming: "Gaming",
    sonstiges: "Other",
  };
(async () => {
  let a = null;
  try {
    const t = localStorage.getItem("sb-dygrabyaiyessqmjdprc-auth-token");
    t && (a = JSON.parse(t));
  } catch {}
  const {
    data: { session: n },
  } = await t.auth.getSession();
  if (((a = n ?? a), !a?.access_token))
    return void (s.innerHTML =
      '<p class="stats-login-hint">Please <a href="/en/pages/login.html">log in</a> to see your security overview.</p>');
  let i;
  try {
    i = await (async function (t, s) {
      const e = new TextEncoder(),
        a = await crypto.subtle.importKey("raw", e.encode(t), "PBKDF2", !1, [
          "deriveKey",
        ]);
      return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt: e.encode(s), iterations: 1e5, hash: "SHA-256" },
        a,
        { name: "AES-GCM", length: 256 },
        !1,
        ["encrypt", "decrypt"],
      );
    })(a.user.id, a.user.id);
  } catch {
    return void (s.innerHTML =
      '<p class="stats-loading">Encryption error. Please reload.</p>');
  }
  const r = await (async function (t) {
    const s = new URL("/api/vault", window.location.origin),
      e = new AbortController(),
      a = setTimeout(() => e.abort(), 15e3);
    try {
      const n = await fetch(s.toString(), {
        method: "GET",
        signal: e.signal,
        headers: {
          Authorization: `Bearer ${t}`,
          "Content-Type": "application/json",
        },
      });
      return (clearTimeout(a), n.ok ? await n.json() : []);
    } catch {
      return (clearTimeout(a), []);
    }
  })(a.access_token);
  if (!Array.isArray(r))
    return void (s.innerHTML =
      '<p class="stats-loading">Error loading vault.</p>');
  const l = await Promise.all(
    r
      .filter((t) => !t.label?.startsWith("__"))
      .map(async (t) => {
        const s = t.value?.startsWith("ENC:")
          ? await (async function (t, s) {
              try {
                const e = Uint8Array.from(atob(t.slice(4)), (t) =>
                    t.charCodeAt(0),
                  ),
                  a = await crypto.subtle.decrypt(
                    { name: "AES-GCM", iv: e.slice(0, 12) },
                    s,
                    e.slice(12),
                  );
                return new TextDecoder().decode(a);
              } catch {
                return null;
              }
            })(t.value, i)
          : t.value;
        return { ...t, value: s ?? "" };
      }),
  );
  !(function (t) {
    if (0 === t.length)
      return void (s.innerHTML =
        '<p class="stats-login-hint">No passwords saved yet. <a href="/en/pages/tresor.html">Go to Vault →</a></p>');
    const a = t.length,
      n = t.map((t) =>
        (function (t) {
          if (!t) return 0;
          const s = [
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
            "hallo",
            "hallo123",
            "passwort",
            "test",
            "abc123",
            "000000",
            "111111",
          ].some((s) => t.toLowerCase().includes(s));
          let e = 0;
          return (
            t.length >= 8 && (e += 15),
            t.length >= 12 && (e += 20),
            t.length >= 16 && (e += 15),
            /[a-z]/.test(t) && (e += 10),
            /[A-Z]/.test(t) && (e += 10),
            /[0-9]/.test(t) && (e += 10),
            /[^A-Za-z0-9]/.test(t) && (e += 20),
            s && (e = Math.max(0, e - 35)),
            Math.min(100, e)
          );
        })(t.value ?? ""),
      ),
      i = Math.round(n.reduce((t, s) => t + s, 0) / a),
      r = n.filter((t) => t >= 60).length,
      l = n.filter((t) => t >= 40 && t < 60).length,
      o = n.filter((t) => t < 40).length,
      c = {};
    t.forEach((t) => {
      t.value && (c[t.value] = (c[t.value] || 0) + 1);
    });
    const d = t.filter((t) => t.value && c[t.value] > 1).length,
      u = {};
    t.forEach((t) => {
      const s = t.kategorie || "allgemein";
      u[s] = (u[s] || 0) + 1;
    });
    const p = Math.round(264 - (i / 100) * 264),
      v = (g = i) >= 70 ? "#4ade80" : g >= 40 ? "#fb923c" : "#ef4444";
    var g;
    const h = (function (t) {
        return t >= 80
          ? {
              text: "Excellent 🛡️",
              css: "color:#4ade80;-webkit-text-fill-color:#4ade80;",
            }
          : t >= 65
            ? {
                text: "Good",
                css: "color:#86efac;-webkit-text-fill-color:#86efac;",
              }
            : t >= 45
              ? {
                  text: "Could be better",
                  css: "color:#fb923c;-webkit-text-fill-color:#fb923c;",
                }
              : {
                  text: "Needs improvement",
                  css: "color:#f87171;-webkit-text-fill-color:#f87171;",
                };
      })(i),
      m = [];
    (o > 0 &&
      m.push({
        icon: "🔴",
        title: `${o} weak passwords`,
        text: "Replace them with passwords of at least 12 characters.",
        link: "/en/pages/generator.html",
        linkText: "Open Generator",
      }),
      d > 0 &&
        m.push({
          icon: "🟠",
          title: `${d} duplicate passwords`,
          text: "Use a unique password for every service.",
          link: "/en/pages/analysator.html",
          linkText: "Open Analyzer",
        }),
      l > 0 &&
        m.push({
          icon: "🟡",
          title: `${l} medium-strength passwords`,
          text: "Add special characters and aim for ≥ 16 characters.",
        }),
      0 === m.length &&
        m.push({
          icon: "✅",
          title: "All good!",
          text: "Your passwords look great. Keep it up and review them regularly.",
        }),
      (s.innerHTML = `\n    <div class="stats-score-section">\n      <div class="score-ring-wrap">\n        <svg class="score-ring" viewBox="0 0 100 100">\n          <circle class="score-ring-bg" cx="50" cy="50" r="42"/>\n          <circle class="score-ring-fill" id="ring-fill" cx="50" cy="50" r="42"\n            stroke="${v}"\n            stroke-dasharray="264"\n            stroke-dashoffset="264"/>\n        </svg>\n        <div class="score-center">\n          <span class="score-number" id="score-num">0</span>\n          <span class="score-label">/ 100</span>\n        </div>\n      </div>\n      <div class="score-verdict" style="${h.css}">${h.text}</div>\n      <div class="score-meta">${a} passwords in vault</div>\n    </div>\n\n    <div class="stats-section-card">\n      <h2>Password Quality</h2>\n      <div class="quality-bar-item">\n        <span class="quality-label">Strong</span>\n        <div class="quality-track"><div class="quality-fill quality-fill-strong" data-w="${a ? Math.round((r / a) * 100) : 0}"></div></div>\n        <span class="quality-count">${r} / ${a}</span>\n      </div>\n      <div class="quality-bar-item">\n        <span class="quality-label">Medium</span>\n        <div class="quality-track"><div class="quality-fill quality-fill-medium" data-w="${a ? Math.round((l / a) * 100) : 0}"></div></div>\n        <span class="quality-count">${l} / ${a}</span>\n      </div>\n      <div class="quality-bar-item">\n        <span class="quality-label">Weak</span>\n        <div class="quality-track"><div class="quality-fill quality-fill-weak" data-w="${a ? Math.round((o / a) * 100) : 0}"></div></div>\n        <span class="quality-count">${o} / ${a}</span>\n      </div>\n    </div>\n\n    <div class="stats-section-card">\n      <h2>Warnings</h2>\n      <div class="stats-warnings">\n        ${d > 0 ? `<div class="stats-warning-item orange"><span class="warn-icon">⚠️</span><span><strong>${d} duplicate passwords</strong> found – security risk!</span></div>` : ""}\n        ${o > 0 ? `<div class="stats-warning-item red"><span class="warn-icon">🛑</span><span><strong>${o} passwords too weak</strong> – replace them with stronger ones.</span></div>` : ""}\n        ${0 === d && 0 === o ? '<div class="stats-warning-item green"><span class="warn-icon">✅</span><span>No critical issues found.</span></div>' : ""}\n      </div>\n    </div>\n\n    <div class="stats-section-card">\n      <h2>Categories</h2>\n      <div class="category-grid">\n        ${Object.entries(
        u,
      )
        .map(
          ([t, s]) =>
            `\n          <div class="category-item">\n            <span class="category-name">${e[t] ?? t}</span>\n            <span class="category-count">${s}</span>\n          </div>`,
        )
        .join(
          "",
        )}\n      </div>\n    </div>\n\n    <div class="stats-section-card">\n      <h2>Recommendations</h2>\n      <div class="recs-grid">\n        ${m.map((t) => `\n          <div class="rec-item">\n            <span class="rec-icon">${t.icon}</span>\n            <div class="rec-text">\n              <strong>${t.title}</strong>${t.text}\n              ${t.link ? `<a class="rec-link" href="${t.link}">${t.linkText} →</a>` : ""}\n            </div>\n          </div>`).join("")}\n      </div>\n    </div>\n  `),
      requestAnimationFrame(() => {
        const t = document.getElementById("ring-fill"),
          s = document.getElementById("score-num");
        (t &&
          (t.style.transition =
            "stroke-dashoffset 1.4s cubic-bezier(0.25, 1, 0.5, 1)"),
          requestAnimationFrame(() => {
            t && (t.style.strokeDashoffset = p);
          }));
        const e = performance.now();
        (requestAnimationFrame(function t(a) {
          const n = Math.min((a - e) / 1400, 1);
          (s && (s.textContent = Math.round((1 - Math.pow(1 - n, 3)) * i)),
            n < 1 && requestAnimationFrame(t));
        }),
          document.querySelectorAll(".quality-fill[data-w]").forEach((t) => {
            requestAnimationFrame(() => {
              t.style.width = t.dataset.w + "%";
            });
          }));
      }));
  })(l);
})();
