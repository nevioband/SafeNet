if (sessionStorage.getItem("loginSuccess")) {
  sessionStorage.removeItem("loginSuccess");
  const e = document.createElement("div");
  ((e.textContent =
    "✔️ Erfolgreich eingeloggt – eine Bestätigungsmail wurde gesendet."),
    (e.style.cssText =
      "position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#1e3a5f;color:#e2e8f0;padding:14px 24px;border-radius:12px;font-size:14px;font-family:Inter,sans-serif;box-shadow:0 4px 24px rgba(0,0,0,0.4);z-index:9999;white-space:nowrap;border:1px solid rgba(51,153,255,0.3);transition:opacity 0.5s;"),
    document.body.appendChild(e),
    setTimeout(function () {
      ((e.style.opacity = "0"),
        setTimeout(function () {
          e.remove();
        }, 500));
    }, 4e3));
}
