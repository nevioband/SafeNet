const emails = [
  {
    sender: "support@micr0soft-login.com",
    subject: "Dringende Sicherheitswarnung für Ihr Konto",
    body: `
      Sehr geehrter Nutzer,<br><br>
      bei Ihrem Microsoft-Konto wurde ein verdächtiger Anmeldeversuch festgestellt.
      Bitte bestätigen Sie sofort Ihre Identität über den folgenden Link:<br><br>
      <strong>Jetzt Konto bestätigen</strong><br><br>
      Falls Sie nicht innerhalb von 24 Stunden reagieren, wird Ihr Konto gesperrt.
    `,
    isPhishing: true,
    explanation: "Diese E-Mail ist ein Phishing-Versuch. Die Absenderadresse wirkt gefälscht, erzeugt Druck und fordert eine sofortige Reaktion.",
    warningSigns: [
      "Verdächtige Absenderadresse",
      "Druck durch Fristsetzung",
      "Aufforderung zur sofortigen Bestätigung",
      "Typische Angst-Taktik"
    ]
  },
  {
    sender: "no-reply@post.ch",
    subject: "Ihr Paket ist unterwegs",
    body: `
      Guten Tag,<br><br>
      Ihr Paket wurde erfolgreich bearbeitet und befindet sich auf dem Weg zu Ihnen.<br><br>
      Voraussichtliche Zustellung: morgen zwischen 09:00 und 14:00 Uhr.<br><br>
      Freundliche Grüsse<br>
      Ihr Support-Team
    `,
    isPhishing: false,
    explanation: "Diese E-Mail wirkt unauffällig. Sie fordert keine Eingabe von Daten, setzt keinen Zeitdruck und enthält keine verdächtige Handlung.",
    warningSigns: [
      "Keine direkte Aufforderung zur Eingabe sensibler Daten",
      "Keine Drohung oder künstliche Panik",
      "Inhalt wirkt sachlich"
    ]
  },
  {
    sender: "rechnung@dhl-support-center.net",
    subject: "Paketzustellung fehlgeschlagen - Gebühr offen",
    body: `
      Guten Tag,<br><br>
      Ihre Paketzustellung konnte nicht abgeschlossen werden.
      Bitte zahlen Sie die offene Bearbeitungsgebühr von 2.99 CHF über den folgenden Link, damit Ihr Paket erneut versendet werden kann.<br><br>
      Vielen Dank.
    `,
    isPhishing: true,
    explanation: "Das ist typisch Phishing. Kleine Geldbeträge sollen unkritisch wirken. Dazu kommt ein verdächtiger Absender und ein Link zur Zahlung.",
    warningSigns: [
      "Verdächtige Domain",
      "Zahlungsaufforderung per E-Mail",
      "Kleine Gebühr soll harmlos wirken",
      "Druck zum schnellen Handeln"
    ]
  }
];

let currentIndex = 0;

const mailSender = document.getElementById("mailSender");
const mailSubject = document.getElementById("mailSubject");
const mailBody = document.getElementById("mailBody");

const realBtn = document.getElementById("realBtn");
const phishingBtn = document.getElementById("phishingBtn");
const nextBtn = document.getElementById("nextBtn");

const resultBox = document.getElementById("resultBox");
const resultTitle = document.getElementById("resultTitle");
const resultExplanation = document.getElementById("resultExplanation");
const warningSigns = document.getElementById("warningSigns");

function loadEmail() {
  const email = emails[currentIndex];

  mailSender.textContent = email.sender;
  mailSubject.textContent = email.subject;
  mailBody.innerHTML = email.body;

  resultBox.classList.add("hidden");
  realBtn.disabled = false;
  phishingBtn.disabled = false;
}

function showResult(userChoice) {
  const email = emails[currentIndex];
  const correct = userChoice === email.isPhishing;

  resultTitle.textContent = correct
    ? "Richtig erkannt"
    : "Nicht ganz richtig";

  resultTitle.className = correct ? "correct" : "wrong";
  resultExplanation.textContent = email.explanation;

  warningSigns.innerHTML = "";
  email.warningSigns.forEach(sign => {
    const li = document.createElement("li");
    li.textContent = sign;
    warningSigns.appendChild(li);
  });

  resultBox.classList.remove("hidden");
  realBtn.disabled = true;
  phishingBtn.disabled = true;
}

function nextEmail() {
  currentIndex++;

  if (currentIndex >= emails.length) {
    currentIndex = 0;
  }

  loadEmail();
}

realBtn.addEventListener("click", () => showResult(false));
phishingBtn.addEventListener("click", () => showResult(true));
nextBtn.addEventListener("click", nextEmail);

loadEmail();