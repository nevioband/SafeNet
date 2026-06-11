!(function () {
  const t = document.getElementById("mfa-approve"),
    e = document.getElementById("mfa-deny"),
    n = document.getElementById("mfa-reset"),
    a = document.getElementById("mfa-log"),
    o = document.getElementById("mfa-result"),
    s = document.getElementById("mfa-attempt-badge"),
    d = document.getElementById("mfa-location"),
    l = [
      "Moscow, RU",
      "Lagos, NG",
      "Shanghai, CN",
      "São Paulo, BR",
      "Bucharest, RO",
    ];
  let c = 0,
    i = !1;
  function m(t, e) {
    const n = new Date().toLocaleTimeString("en-GB", { hour12: !1 }),
      o = document.createElement("div");
    ((o.style.color = e || "#fca5a5"),
      (o.textContent = "[" + n + "] " + t),
      "Waiting for first attempt…" === a.textContent && (a.textContent = ""),
      a.appendChild(o),
      (a.scrollTop = a.scrollHeight));
  }
  function r() {
    s.textContent = c + (1 === c ? " attempt" : " attempts");
  }
  (t.addEventListener("click", () => {
    i ||
      ((i = !0),
      c++,
      r(),
      m("Login APPROVED – attacker has access!", "#ef4444"),
      (o.className = "mfa-result-banner fail"),
      (o.textContent =
        "⚠️ Account compromised! The attacker successfully signed in."),
      (o.style.display = "block"),
      (t.disabled = !0),
      (e.disabled = !0));
  }),
    e.addEventListener("click", () => {
      i ||
        (c++,
        r(),
        m("Attempt " + c + " denied – retrying...", "#94a3b8"),
        (d.textContent = l[c % l.length]),
        c >= 12 &&
          (m("Attacker gives up after 12 attempts.", "#86efac"),
          (o.className = "mfa-result-banner success"),
          (o.textContent =
            "✓ Well done! You denied all requests and stopped the attack."),
          (o.style.display = "block"),
          (t.disabled = !0),
          (e.disabled = !0),
          (i = !0)));
    }),
    n.addEventListener("click", () => {
      ((c = 0),
        (i = !1),
        (a.textContent = "Waiting for first attempt…"),
        (s.textContent = "0 attempts"),
        (o.style.display = "none"),
        (d.textContent = l[0]),
        (t.disabled = !1),
        (e.disabled = !1));
    }));
})();
