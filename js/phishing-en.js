const emails = [
  {
    sender: "support@microsoft-login.com",
    subject: "Urgent security alert for your account",
    body: "\n      Dear user,<br><br>\n      A suspicious login attempt was detected on your Microsoft account.<br>\n      Please confirm your identity immediately using the following link:<br><br>\n      <strong>Confirm account now</strong><br><br>\n      If you do not respond within 24 hours, your account will be locked.\n    ",
    isPhishing: !0,
    explanation:
      "This email is a phishing attempt. The sender address looks fake, creates urgency, and asks for immediate action.",
    warningSigns: [
      "Suspicious sender address",
      "Urgency and time pressure",
      "Request for immediate confirmation",
      "Fear tactics",
    ],
  },
  {
    sender: "no-reply@post.com",
    subject: "Your package is on its way",
    body: "\n      Hello,<br><br>\n      Your package has been processed and is on its way to you.<br><br>\n      Estimated delivery: tomorrow between 9:00 and 14:00.<br><br>\n      Best regards,<br>\n      Your support team\n    ",
    isPhishing: !1,
    explanation:
      "This email looks legitimate. It does not ask for sensitive data, does not create panic, and contains no suspicious actions.",
    warningSigns: [
      "No request for sensitive data",
      "No threats or artificial panic",
      "Content is factual",
    ],
  },
  {
    sender: "invoice@dhl-support-center.net",
    subject: "Package delivery failed - fee due",
    body: "\n      Hello,<br><br>\n      Your package could not be delivered.<br>\n      Please pay the outstanding processing fee of $2.99 via the following link so your package can be resent.<br><br>\n      Thank you.\n    ",
    isPhishing: !0,
    explanation:
      "This is typical phishing. Small amounts of money seem harmless. The sender is suspicious and there is a payment link.",
    warningSigns: [
      "Suspicious domain",
      "Payment request via email",
      "Small fee to appear harmless",
      "Pressure to act quickly",
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
  ((resultTitle.textContent = t ? "Correct!" : "Not quite right"),
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
