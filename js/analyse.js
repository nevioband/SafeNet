const commonPasswords = ["123456", "password", "12345678", "qwerty", "12345", "123456789", "letmein", "admin", "welcome", "123123", "passw0rd"];

function analyzePassword() {
    const password = document.getElementById("passwordInput").value;
    const result = document.getElementById("result");
    const suggestions = document.getElementById("suggestions");

    // Liste leeren
    suggestions.innerHTML = "";
    
    if (password.length === 0) {
        result.innerText = "";
        suggestions.style.display = "none"; // Verstecken wenn leer
        return;
    }

    let tips = [];
    let score = 0;
    const lowerPassword = password.toLowerCase();

    // 1. Länge prüfen
    if (password.length >= 12) {
        score += 2; 
    } else {
        tips.push("Verwende mindestens 12 Zeichen.");
    }

    // 2. Komplexität prüfen
    if (/[A-Z]/.test(password)) score++;
    else tips.push("Füge mindestens einen Großbuchstaben hinzu.");

    if (/[a-z]/.test(password)) score++;
    else tips.push("Füge mindestens einen Kleinbuchstaben hinzu.");

    if (/[0-9]/.test(password)) score++;
    else tips.push("Füge mindestens eine Zahl hinzu.");

    if (/[^A-Za-z0-9]/.test(password)) score++;
    else tips.push("Verwende mindestens ein Sonderzeichen.");

    // 3. Blacklist Check
    const isCommon = commonPasswords.some(word => lowerPassword.includes(word));
    if (isCommon) {
        score = Math.max(0, score - 2);
        tips.push("Vermeide einfache Muster oder häufige Wörter.");
    }

    // 4. Ergebnis & Farben
    if (score <= 3) {
        result.innerText = "Status: Schwach";
        result.style.color = "#ff4d4d";
    } else if (score <= 5) {
        result.innerText = "Status: Mittel";
        result.style.color = "#ffcc00";
    } else {
        result.innerText = "Status: Sicher";
        result.style.color = "#00ff99";
    }

    // 5. Tipps anzeigen, nur wenn welche da sind
    if (tips.length > 0) {
        suggestions.style.display = "block"; // Einblenden
        tips.forEach(tip => {
            let li = document.createElement("li");
            li.innerText = tip;
            suggestions.appendChild(li);
        });
    } else {
        suggestions.style.display = "none"; // Ausblenden wenn alles okay
    }
}

document.getElementById("passwordInput").addEventListener("input", analyzePassword);