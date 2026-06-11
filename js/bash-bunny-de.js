!(function () {
  const e = document.getElementById("bb-start-btn"),
    t = document.getElementById("bb-reset-btn"),
    n = document.getElementById("bb-terminal-body"),
    a = document.getElementById("bb-badge"),
    l = document.getElementById("bb-status-text"),
    s = document.getElementById("bb-result");
  let d = !1,
    c = [];
  const i = [
    { delay: 0, cls: "hw-line-prompt", text: "bash-bunny$ " },
    {
      delay: 400,
      cls: "hw-line-danger",
      text: "# Payload geladen: NTLM_Credential_Harvest",
    },
    {
      delay: 1e3,
      cls: "hw-line-output",
      text: "[*] Netzwerkadapter wird initialisiert...",
    },
    {
      delay: 1600,
      cls: "hw-line-output",
      text: '[*] Windows erkennt: "Gigabit USB Ethernet Adapter"',
    },
    {
      delay: 2300,
      cls: "hw-line-warn",
      text: "[*] Responder gestartet – warte auf NTLM-Anfragen...",
    },
    {
      delay: 3100,
      cls: "hw-line-output",
      text: "[*] SMB-Anfrage von 192.168.1.42 empfangen",
    },
    { delay: 3800, cls: "hw-line-danger", text: "[+] NTLMv2 Hash abgefangen:" },
    {
      delay: 4200,
      cls: "hw-line-cmd",
      text: "    Benutzer : DOMAIN\\max.muster",
    },
    {
      delay: 4500,
      cls: "hw-line-cmd",
      text: "    Hash     : aad3b435b51404eeaad3b435b51404ee:",
    },
    {
      delay: 4700,
      cls: "hw-line-cmd",
      text: "               8f49df3f2d7b4e73a9a0c8e5b6d1f2a4",
    },
    {
      delay: 5400,
      cls: "hw-line-success",
      text: "[+] Hash gespeichert. Offline-Cracking kann beginnen.",
    },
  ];
  function o() {
    n.innerHTML = '<span class="hw-cursor"></span>';
  }
  (e.addEventListener("click", () => {
    d ||
      ((d = !0),
      (e.disabled = !0),
      (a.className = "hw-badge active"),
      (a.textContent = "Aktiv – Payload läuft"),
      (l.textContent = "Bash Bunny eingesteckt"),
      o(),
      i.forEach(({ delay: e, cls: t, text: a }) => {
        const l = setTimeout(() => {
          (n.querySelector(".hw-cursor")?.remove(),
            (function (e, t) {
              const a = document.createElement("div");
              ((a.className = e),
                (a.textContent = t),
                n.appendChild(a),
                (n.scrollTop = n.scrollHeight));
            })(t, a));
          const e = document.createElement("span");
          ((e.className = "hw-cursor"),
            n.appendChild(e),
            (n.scrollTop = n.scrollHeight));
        }, e);
        c.push(l);
      }),
      c.push(
        setTimeout(() => {
          ((a.className = "hw-badge done"),
            (a.textContent = "Hash abgefangen"),
            (s.className = "hw-result-banner danger"),
            (s.textContent =
              "⚠️ Anmeldedaten gestohlen – ohne ein einziges Passwort einzutippen. Der Hash kann offline geknackt werden."),
            (s.style.display = "block"));
        }, 6e3),
      ));
  }),
    t.addEventListener("click", () => {
      (c.forEach(clearTimeout),
        (c = []),
        (d = !1),
        (e.disabled = !1),
        (a.className = "hw-badge idle"),
        (a.textContent = "Nicht eingesteckt"),
        (l.textContent = "Kein Gerät"),
        (s.style.display = "none"),
        (s.className = "hw-result-banner"),
        o());
    }));
})();
