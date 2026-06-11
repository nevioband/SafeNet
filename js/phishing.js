const emails = [
  {
    sender: "support@micr0soft-login.com",
    subject: "Dringende Sicherheitswarnung für Ihr Konto",
    body: "\n      Sehr geehrter Nutzer,<br><br>\n      bei Ihrem Microsoft-Konto wurde ein verdächtiger Anmeldeversuch festgestellt.\n      Bitte bestätigen Sie sofort Ihre Identität über den folgenden Link:<br><br>\n      <strong>Jetzt Konto bestätigen</strong><br><br>\n      Falls Sie nicht innerhalb von 24 Stunden reagieren, wird Ihr Konto gesperrt.\n    ",
    isPhishing: !0,
    explanation:
      "Diese E-Mail ist ein Phishing-Versuch. Die Absenderadresse wirkt gefälscht, erzeugt Druck und fordert eine sofortige Reaktion.",
    warningSigns: [
      "Verdächtige Absenderadresse",
      "Druck durch Fristsetzung",
      "Aufforderung zur sofortigen Bestätigung",
      "Typische Angst-Taktik",
    ],
  },
  {
    sender: "no-reply@post.ch",
    subject: "Ihr Paket ist unterwegs",
    body: "\n      Guten Tag,<br><br>\n      Ihr Paket wurde erfolgreich bearbeitet und befindet sich auf dem Weg zu Ihnen.<br><br>\n      Voraussichtliche Zustellung: morgen zwischen 09:00 und 14:00 Uhr.<br><br>\n      Freundliche Grüsse<br>\n      Ihr Support-Team\n    ",
    isPhishing: !1,
    explanation:
      "Diese E-Mail wirkt unauffällig. Sie fordert keine Eingabe von Daten, setzt keinen Zeitdruck und enthält keine verdächtige Handlung.",
    warningSigns: [
      "Keine direkte Aufforderung zur Eingabe sensibler Daten",
      "Keine Drohung oder künstliche Panik",
      "Inhalt wirkt sachlich",
    ],
  },
  {
    sender: "rechnung@dhl-support-center.net",
    subject: "Paketzustellung fehlgeschlagen - Gebühr offen",
    body: "\n      Guten Tag,<br><br>\n      Ihre Paketzustellung konnte nicht abgeschlossen werden.\n      Bitte zahlen Sie die offene Bearbeitungsgebühr von 2.99 CHF über den folgenden Link, damit Ihr Paket erneut versendet werden kann.<br><br>\n      Vielen Dank.\n    ",
    isPhishing: !0,
    explanation:
      "Das ist typisch Phishing. Kleine Geldbeträge sollen unkritisch wirken. Dazu kommt ein verdächtiger Absender und ein Link zur Zahlung.",
    warningSigns: [
      "Verdächtige Domain",
      "Zahlungsaufforderung per E-Mail",
      "Kleine Gebühr soll harmlos wirken",
      "Druck zum schnellen Handeln",
    ],
  },
];
let currentIndex = 0;
const mailSender = document.getElementById("mailSender"),
  mailSubject = document.getElementById("mailSubject"),
  mailBody = document.getElementById("mailBody"),
  realBtn = document.getElementById("realBtn"),
  phishingBtn = document.getElementById("phishingBtn"),
  nextBtn = document.getElementById("nextBtn"),
  resultBox = document.getElementById("resultBox"),
  resultTitle = document.getElementById("resultTitle"),
  resultExplanation = document.getElementById("resultExplanation"),
  warningSigns = document.getElementById("warningSigns");
function loadEmail() {
  const e = emails[currentIndex];
  ((mailSender.textContent = e.sender),
    (mailSubject.textContent = e.subject),
    (mailBody.innerHTML = e.body),
    resultBox.classList.add("hidden"),
    (realBtn.disabled = !1),
    (phishingBtn.disabled = !1));
}
function showResult(e) {
  const n = emails[currentIndex],
    t = e === n.isPhishing;
  ((resultTitle.textContent = t ? "Richtig erkannt" : "Nicht ganz richtig"),
    (resultTitle.className = t ? "correct" : "wrong"),
    (resultExplanation.textContent = n.explanation),
    (warningSigns.innerHTML = ""),
    n.warningSigns.forEach((e) => {
      const n = document.createElement("li");
      ((n.textContent = e), warningSigns.appendChild(n));
    }),
    resultBox.classList.remove("hidden"),
    (realBtn.disabled = !0),
    (phishingBtn.disabled = !0));
}
function nextEmail() {
  (currentIndex++,
    currentIndex >= emails.length && (currentIndex = 0),
    loadEmail());
}
(realBtn.addEventListener("click", () => showResult(!1)),
  phishingBtn.addEventListener("click", () => showResult(!0)),
  nextBtn.addEventListener("click", nextEmail),
  loadEmail());
