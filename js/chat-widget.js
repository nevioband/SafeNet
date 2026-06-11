import { supabase as e } from "./supabase.js";
const t = /^\/en(\/|$)/.test(window.location.pathname),
  n = t ? "en" : "de",
  s = {
    title: t ? "SafeNet Assistant" : "SafeNet Assistent",
    placeholder: t ? "Ask a question..." : "Frage stellen...",
    welcome: t
      ? "Hi! I'm the SafeNet Security Assistant. Ask me anything about cybersecurity or the platform!"
      : "Hallo! Ich bin der SafeNet Sicherheits-Assistent. Frag mich alles zu Cybersicherheit oder zur Plattform!",
    thinking: t ? "Thinking..." : "Denke nach...",
    rateLimit: t
      ? "Daily message limit reached (50 messages). Come back tomorrow!"
      : "Tageslimit erreicht (50 Nachrichten). Morgen geht es weiter!",
    error: t
      ? "An error occurred. Please try again."
      : "Ein Fehler ist aufgetreten. Bitte erneut versuchen.",
    notLoggedIn: t
      ? "Please log in to use the assistant."
      : "Bitte einloggen, um den Assistenten zu nutzen.",
  };
(new Date().toISOString().slice(0, 10),
  (function () {
    if (document.getElementById("sn-chat-css")) return;
    const e = document.createElement("link");
    ((e.id = "sn-chat-css"),
      (e.rel = "stylesheet"),
      (e.href = "/css/chat.css"),
      document.head.appendChild(e));
  })(),
  (function () {
    if (document.getElementById("sn-chat-fab")) return;
    const e = document.createElement("button");
    ((e.id = "sn-chat-fab"),
      e.setAttribute("aria-label", s.title),
      (e.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>'));
    const n = document.createElement("div");
    ((n.id = "sn-chat-widget"), n.setAttribute("aria-hidden", "true"));
    const i = document.createElement("div");
    ((i.id = "sn-chat-header"),
      (i.innerHTML = `<div id="sn-chat-title"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><span>${s.title}</span></div><button id="sn-chat-close" aria-label="Schließen">×</button>`));
    const o = document.createElement("div");
    o.id = "sn-chat-messages";
    const a = document.createElement("div");
    a.id = "sn-chat-footer";
    const r = document.createElement("input");
    ((r.type = "text"),
      (r.id = "sn-chat-input"),
      (r.placeholder = s.placeholder),
      (r.maxLength = 500),
      (r.autocomplete = "off"));
    const c = document.createElement("button");
    ((c.id = "sn-chat-send"),
      c.setAttribute("aria-label", t ? "Send" : "Senden"),
      (c.innerHTML =
        '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>'),
      a.appendChild(r),
      a.appendChild(c),
      n.appendChild(i),
      n.appendChild(o),
      n.appendChild(a),
      document.body.appendChild(e),
      document.body.appendChild(n));
  })());
let i = !1,
  o = !1;
const a = [],
  r = "sn_chat_s_" + n;
let c = [];
try {
  const e = JSON.parse(sessionStorage.getItem(r) || "null");
  e && e.d && ((c = e.d), a.push(...(e.r || [])));
} catch {}
function l(e, t) {
  const n = document.getElementById("sn-chat-messages");
  if (!n) return null;
  const s = document.createElement("div");
  if (((s.className = `sn-msg sn-msg-${t}`), "bot" === t)) {
    const t = e
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(
        /\(\/((?:de|en)\/[^\s)]+\.html)\)|\/((de|en)\/[^\s,.:!?()]+\.html)/g,
        (e, t, n) => {
          const s = t || n,
            i = `<a href="/${s}" style="color:#66d9ff;text-decoration:underline">${s.split("/").pop().replace(".html", "")}</a>`;
          return t ? `(${i})` : i;
        },
      );
    s.innerHTML = `<div class="sn-bot-avatar"><img src="/images/SafeNet-Security-Logo/Withoutbg/SafeNet Security 48 x 48 px.png" class="sn-bot-avatar-img" alt="SafeNet"></div><div class="sn-bot-bubble">${t.replace(/\n/g, "<br>")}</div>`;
  } else s.textContent = e;
  return (n.appendChild(s), (n.scrollTop = n.scrollHeight), s);
}
function d() {
  const e = document.getElementById("sn-chat-widget");
  e &&
    ((i = !i),
    e.classList.toggle("open", i),
    e.setAttribute("aria-hidden", String(!i)),
    i &&
      0 === document.getElementById("sn-chat-messages").children.length &&
      (c.length ? c.forEach((e) => l(e.x, e.y)) : l(s.welcome, "bot"),
      document.getElementById("sn-chat-input")?.focus()));
}
async function h() {
  if (o) return;
  const t = document.getElementById("sn-chat-input"),
    i = document.getElementById("sn-chat-send");
  if (!t) return;
  const d = t.value.trim();
  if (!d) return;
  const {
    data: { session: h },
  } = await e.auth.getSession();
  if (!h) return void l(s.notLoggedIn, "bot");
  ((t.value = ""),
    l(d, "user"),
    a.push({ role: "user", text: d }),
    c.push({ x: d, y: "user" }),
    sessionStorage.setItem(r, JSON.stringify({ d: c, r: a })),
    (o = !0),
    i && (i.disabled = !0));
  const u = l(s.thinking, "typing");
  try {
    const e = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${h.access_token}`,
      },
      body: JSON.stringify({ message: d, history: a.slice(-10), lang: n }),
    });
    if ((u?.remove(), e.ok)) {
      const { reply: t } = await e.json();
      (l(t, "bot"),
        a.push({ role: "model", text: t }),
        c.push({ x: t, y: "bot" }),
        sessionStorage.setItem(r, JSON.stringify({ d: c, r: a })));
    } else {
      let t = {};
      try {
        t = await e.json();
      } catch {}
      (console.error("[SafeNet Chat] API Error", e.status, t),
        l(t.error || "HTTP " + e.status, "bot"));
    }
  } catch (e) {
    (u?.remove(),
      console.error("[SafeNet Chat]", e),
      l(s.error + " (" + e.message + ")", "bot"));
  } finally {
    ((o = !1), i && (i.disabled = !1), t.focus());
  }
}
function u(e) {
  const t = document.getElementById("sn-chat-fab"),
    n = document.getElementById("sn-chat-widget");
  t &&
    (t.classList.toggle("visible", e),
    !e && i && n && ((i = !1), n.classList.remove("open")));
}
(document.getElementById("sn-chat-fab")?.addEventListener("click", d),
  document.getElementById("sn-chat-close")?.addEventListener("click", d),
  document.getElementById("sn-chat-send")?.addEventListener("click", h),
  document.getElementById("sn-chat-input")?.addEventListener("keydown", (e) => {
    "Enter" !== e.key || e.shiftKey || (e.preventDefault(), h());
  }),
  e.auth.getSession().then(({ data: { session: e } }) => {
    u(!!e);
  }),
  e.auth.onAuthStateChange((e, t) => {
    u(!!t);
  }),
  (function () {
    const t = !/^\/en(\/|$)/.test(window.location.pathname),
      n = document.createElement("div");
    let s;
    function i() {
      const e = document.getElementById("sn-chat-fab");
      e &&
        e.classList.contains("visible") &&
        ((n.className = ""),
        (n.innerHTML = t
          ? "<strong>Hast du Fragen?</strong>Frag unseren KI-Assistenten!"
          : "<strong>Got questions?</strong>Ask our AI Assistant!"),
        n.classList.add("visible"),
        (s = setTimeout(() => {
          n.classList.remove("visible");
        }, 7e3)),
        (n.onclick = () => {
          (clearTimeout(s), n.classList.remove("visible"), d());
        }));
    }
    function o() {
      ((n.className = "sn-chat-hint-guest"),
        (n.innerHTML = t
          ? `<strong>KI-Assistent</strong>Erstelle ein Konto und stell dem Assistenten Fragen! <span class="sn-hint-reg-link">${t ? "Jetzt registrieren →" : "Register now →"}</span>`
          : '<strong>AI Assistant</strong>Create an account and ask our AI anything! <span class="sn-hint-reg-link">Register now →</span>'),
        n.classList.add("visible"),
        (s = setTimeout(() => {
          n.classList.remove("visible");
        }, 8e3)),
        (n.onclick = () => {
          window.location.href = t
            ? "/de/pages/register.html"
            : "/en/pages/register.html";
        }));
    }
    ((n.id = "sn-chat-hint"),
      document.body.appendChild(n),
      e.auth.getSession().then(({ data: { session: e } }) => {
        e ? setTimeout(i, 2e3) : setTimeout(o, 4e3);
      }),
      e.auth.onAuthStateChange((e, t) => {
        t && setTimeout(i, 2e3);
      }));
  })());
