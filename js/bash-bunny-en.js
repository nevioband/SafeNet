!(function () {
  const e = document.getElementById("bb-start-btn"),
    t = document.getElementById("bb-reset-btn"),
    n = document.getElementById("bb-terminal-body"),
    a = document.getElementById("bb-badge"),
    l = document.getElementById("bb-status-text"),
    s = document.getElementById("bb-result");
  let d = !1,
    c = [];
  const o = [
    { delay: 0, cls: "hw-line-prompt", text: "bash-bunny$ " },
    {
      delay: 400,
      cls: "hw-line-danger",
      text: "# Payload loaded: NTLM_Credential_Harvest",
    },
    {
      delay: 1e3,
      cls: "hw-line-output",
      text: "[*] Initializing network adapter...",
    },
    {
      delay: 1600,
      cls: "hw-line-output",
      text: '[*] Windows recognizes: "Gigabit USB Ethernet Adapter"',
    },
    {
      delay: 2300,
      cls: "hw-line-warn",
      text: "[*] Responder started – waiting for NTLM requests...",
    },
    {
      delay: 3100,
      cls: "hw-line-output",
      text: "[*] SMB request received from 192.168.1.42",
    },
    { delay: 3800, cls: "hw-line-danger", text: "[+] NTLMv2 hash captured:" },
    {
      delay: 4200,
      cls: "hw-line-cmd",
      text: "    User     : DOMAIN\\john.doe",
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
      text: "[+] Hash saved. Offline cracking can begin.",
    },
  ];
  function i() {
    n.innerHTML = '<span class="hw-cursor"></span>';
  }
  (e.addEventListener("click", () => {
    d ||
      ((d = !0),
      (e.disabled = !0),
      (a.className = "hw-badge active"),
      (a.textContent = "Active – payload running"),
      (l.textContent = "Bash Bunny plugged in"),
      i(),
      o.forEach(({ delay: e, cls: t, text: a }) => {
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
            (a.textContent = "Hash captured"),
            (s.className = "hw-result-banner danger"),
            (s.textContent =
              "⚠️ Credentials stolen – without typing a single password. The hash can be cracked offline."),
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
        (a.textContent = "Not plugged in"),
        (l.textContent = "No device"),
        (s.style.display = "none"),
        (s.className = "hw-result-banner"),
        i());
    }));
})();
