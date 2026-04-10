// English phishing quiz data and logic for SafeNet Security
const emails = [
  {
    sender: "support@microsoft-login.com",
    subject: "Urgent security alert for your account",
    body: `
      Dear user,<br><br>
      A suspicious login attempt was detected on your Microsoft account.<br>
      Please confirm your identity immediately using the following link:<br><br>
      <strong>Confirm account now</strong><br><br>
      If you do not respond within 24 hours, your account will be locked.
    `,
    isPhishing: true,
    explanation: "This email is a phishing attempt. The sender address looks fake, creates urgency, and asks for immediate action.",
    warningSigns: [
      "Suspicious sender address",
      "Urgency and time pressure",
      "Request for immediate confirmation",
      "Fear tactics"
    ]
  },
  {
    sender: "no-reply@post.com",
    subject: "Your package is on its way",
    body: `
      Hello,<br><br>
      Your package has been processed and is on its way to you.<br><br>
      Estimated delivery: tomorrow between 9:00 and 14:00.<br><br>
      Best regards,<br>
      Your support team
    `,
    isPhishing: false,
    explanation: "This email looks legitimate. It does not ask for sensitive data, does not create panic, and contains no suspicious actions.",
    warningSigns: [
      "No request for sensitive data",
      "No threats or artificial panic",
      "Content is factual"
    ]
  },
  {
    sender: "invoice@dhl-support-center.net",
    subject: "Package delivery failed - fee due",
    body: `
      Hello,<br><br>
      Your package could not be delivered.<br>
      Please pay the outstanding processing fee of $2.99 via the following link so your package can be resent.<br><br>
      Thank you.
    `,
    isPhishing: true,
    explanation: "This is typical phishing. Small amounts of money seem harmless. The sender is suspicious and there is a payment link.",
    warningSigns: [
      "Suspicious domain",
      "Payment request via email",
      "Small fee to appear harmless",
      "Pressure to act quickly"
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
  resultTitle.textContent = correct ? "Correct!" : "Not quite right";
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
