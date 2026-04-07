import { supabase } from './supabase.js?v=8'

let vaultData = []
let cachedVaultKey = null
// ===== NETZWERK-STATUS =====

function isOffline() {
    return !navigator.onLine
}

function showVaultError(msg) {
    const listEl = document.getElementById('saved-passwords-list')
    if (listEl) listEl.innerHTML = `<p style="text-align:center;color:#ef4444;padding:20px;">${msg}</p>`
}

function showOfflineBanner() {
    if (document.getElementById('offlineBanner')) return
    const banner = document.createElement('div')
    banner.id = 'offlineBanner'
    banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#b45309;color:#fef3c7;text-align:center;padding:10px;font-size:14px;z-index:99999;font-family:Inter,sans-serif;'
    banner.textContent = '\u26a0\ufe0f Kein Internet \u2014 Tresor kann nicht geladen werden.'
    document.body.prepend(banner)
}

function hideOfflineBanner() {
    document.getElementById('offlineBanner')?.remove()
}

window.addEventListener('online',  () => { hideOfflineBanner(); renderVault() })
window.addEventListener('offline', () => showOfflineBanner())
// ===== VERSCHLÜSSELUNG =====
// Schlüssel wird automatisch aus E-Mail (unveränderlich) abgeleitet — kein Extra-Passwort nötig

async function getVaultKey(email, userId) {
    if (cachedVaultKey) return cachedVaultKey
    const enc = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
        'raw', enc.encode(email), 'PBKDF2', false, ['deriveKey']
    )
    cachedVaultKey = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: enc.encode(userId), iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    )
    return cachedVaultKey
}

async function encryptValue(plaintext, key) {
    const enc = new TextEncoder()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext))
    const combined = new Uint8Array(12 + ciphertext.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(ciphertext), 12)
    return 'ENC:' + btoa(String.fromCharCode(...combined))
}

async function decryptValue(encString, key) {
    try {
        const data = Uint8Array.from(atob(encString.slice(4)), c => c.charCodeAt(0))
        const iv = data.slice(0, 12)
        const ciphertext = data.slice(12)
        const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
        return new TextDecoder().decode(plain)
    } catch {
        return null
    }
}

// ===== TRESOR LADEN =====

async function renderVault() {
    const listElement = document.getElementById('saved-passwords-list')
    if (!listElement) return

    if (isOffline()) {
        showOfflineBanner()
        showVaultError('Kein Internet \u2014 bitte Verbindung pr\u00fcfen und Seite neu laden.')
        return
    }

    let session
    try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        session = data.session
    } catch {
        showVaultError('Verbindungsfehler beim Pr\u00fcfen der Anmeldung. Bitte Seite neu laden.')
        return
    }

    if (!session) {
        listElement.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.5); padding: 20px;">Bitte <a href="login.html" style="color:#3399ff">einloggen</a> um deinen Tresor zu sehen.</p>'
        return
    }

    const searchContainer = document.getElementById('vaultSearchContainer')
    if (searchContainer) searchContainer.style.display = 'block'

    listElement.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.4); padding:20px;">Wird geladen…</p>'

    const { data, error } = await supabase
        .from('passwords')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        if (error.message?.includes('JWT') || error.message?.includes('session') || error.message?.includes('token')) {
            showVaultError('Deine Sitzung ist abgelaufen. Bitte <a href="login.html" style="color:#3399ff">neu einloggen</a>.')
        } else if (isOffline()) {
            showOfflineBanner()
            showVaultError('Kein Internet \u2014 Tresor kann nicht geladen werden.')
        } else {
            showVaultError('Fehler beim Laden des Tresors. Bitte Seite neu laden.')
        }
        return
    }

    // Key-Check-Eintrag herausfiltern (alte Daten)
    const entries = data.filter(pw => pw.label !== '__vault_key_check__')

    const key = await getVaultKey(session.user.email, session.user.id)
    const decryptedEntries = await Promise.all(entries.map(async pw => {
        if (pw.value && pw.value.startsWith('ENC:')) {
            const dec = await decryptValue(pw.value, key)
            return { ...pw, value: dec ?? '[Entschlüsselungsfehler]' }
        }
        return pw
    }))

    vaultData = decryptedEntries

    if (decryptedEntries.length === 0) {
        listElement.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.5); padding: 20px;">Noch keine Passwörter gespeichert.</p>'
        return
    }

    // Duplikate erkennen: alle Passwort-Werte zählen
    const valueCounts = {}
    decryptedEntries.forEach(pw => {
        if (pw.value && pw.value !== '[Entschlüsselungsfehler]') {
            valueCounts[pw.value] = (valueCounts[pw.value] || 0) + 1
        }
    })
    const duplicateIndices = new Set(
        decryptedEntries
            .map((pw, i) => valueCounts[pw.value] > 1 ? i : -1)
            .filter(i => i !== -1)
    )
    const duplicateCount = duplicateIndices.size

    // Warnbanner
    let dupBanner = document.getElementById('vaultDupBanner')
    if (!dupBanner) {
        dupBanner = document.createElement('div')
        dupBanner.id = 'vaultDupBanner'
        listElement.before(dupBanner)
    }
    if (duplicateCount > 0) {
        dupBanner.style.cssText = 'display:flex;align-items:center;gap:10px;background:rgba(251,146,60,0.12);border:1px solid rgba(251,146,60,0.4);border-radius:10px;padding:12px 16px;margin-bottom:16px;color:#fb923c;font-size:14px;font-family:Inter,sans-serif;'
        dupBanner.innerHTML = `<span class="material-symbols-outlined" style="font-size:20px;color:#fb923c;">warning</span> <span><strong>${duplicateCount} Einträge</strong> verwenden dasselbe Passwort — das ist ein Sicherheitsrisiko!</span>`
    } else {
        dupBanner.style.display = 'none'
    }

    listElement.innerHTML = decryptedEntries.map((pw, index) => {
        const isDup = duplicateIndices.has(index)
        const dupBadge = isDup
            ? `<span style="font-size:11px;background:rgba(251,146,60,0.2);border:1px solid rgba(251,146,60,0.5);color:#fb923c;border-radius:6px;padding:2px 7px;margin-left:6px;vertical-align:middle;">Duplikat</span>`
            : ''
        const borderStyle = isDup ? 'border-color:rgba(251,146,60,0.5);' : ''
        return `
        <div class="vault-item" style="${borderStyle}">
            <div style="display:flex;flex-direction:column;gap:2px;overflow:hidden;margin-right:10px;">
                <strong style="color:#ffffff;font-size:1rem;margin-bottom:2px;display:block;">${pw.label}${dupBadge}</strong>
                <span class="password-display" id="pw-${index}" style="font-family:monospace;color:#66d9ff;font-size:1.1rem;letter-spacing:2px;">••••••••</span>
                <small style="font-size:0.7rem;color:rgba(255,255,255,0.4);">${pw.date || '-'}</small>
            </div>
            <div style="display:flex;gap:8px;flex-shrink:0;">
                <button class="vault-view-btn" onclick="window.editLabel('${pw.id}', '${pw.label}')" title="Umbenennen" style="background:linear-gradient(135deg,#FFB347,#FFCC33);color:#0b1220 !important;">
                    <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="vault-view-btn" onclick="window.toggleVisibility(${index})" title="Anzeigen">
                    <span class="material-symbols-outlined" id="eye-${index}">visibility</span>
                </button>
                <button class="vault-copy-btn" onclick="window.copyToClipboard(${index})" title="Kopieren">
                    <span class="material-symbols-outlined">content_copy</span>
                </button>
                <button class="vault-delete-btn" onclick="window.deletePassword('${pw.id}')" title="Löschen">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        </div>
    `}).join('')

    // Aktive Suche nach Reload beibehalten
    const searchInput = document.getElementById('vaultSearch')
    if (searchInput && searchInput.value.trim()) {
        window.filterVault(searchInput.value)
    }
}

// Namen bearbeiten
window.editLabel = async function(id, currentLabel) {
    const newLabel = prompt('Gib einen neuen Namen ein:', currentLabel)
    if (newLabel === null) return
    const label = newLabel.trim() === '' ? 'Unbenannt' : newLabel
    if (isOffline()) { alert('Kein Internet \u2014 \u00c4nderung kann nicht gespeichert werden.'); return }
    const { error } = await supabase.from('passwords').update({ label }).eq('id', id)
    if (error) { alert('Fehler beim Umbenennen. Bitte versuche es erneut.'); return }
    renderVault()
}

// Sichtbarkeit umschalten
window.toggleVisibility = function(index) {
    const pwSpan = document.getElementById(`pw-${index}`)
    const eyeIcon = document.getElementById(`eye-${index}`)
    const realValue = vaultData[index]?.value ?? ''
    if (pwSpan.innerText === '••••••••') {
        pwSpan.innerText = realValue
        pwSpan.style.letterSpacing = '1px'
        eyeIcon.innerText = 'visibility_off'
    } else {
        pwSpan.innerText = '••••••••'
        pwSpan.style.letterSpacing = '2px'
        eyeIcon.innerText = 'visibility'
    }
}

// Passwort löschen
window.deletePassword = async function(id) {
    if (!confirm('Möchtest du dieses Passwort wirklich löschen?')) return
    await supabase.from('passwords').delete().eq('id', id)
    renderVault()
}

// ===== PASSWORT SPEICHERN =====

window.savePassword = async function(newPasswordValue, labelValue) {
    if (isOffline()) { alert('Kein Internet \u2014 Passwort kann nicht gespeichert werden.'); return }

    let session
    try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        session = data.session
    } catch {
        alert('Verbindungsfehler. Bitte Seite neu laden.')
        return
    }
    if (!session) { alert('Deine Sitzung ist abgelaufen. Bitte neu einloggen.'); window.location.href = 'login.html'; return }

    const finalLabel = (labelValue && labelValue.trim() !== '') ? labelValue : 'Unbenanntes Passwort'

    let valueToStore
    try {
        const key = await getVaultKey(session.user.email, session.user.id)
        valueToStore = await encryptValue(newPasswordValue, key)
    } catch {
        alert('Verschl\u00fcsselungsfehler. Passwort konnte nicht gespeichert werden.')
        return
    }

    const { error: insertError } = await supabase.from('passwords').insert({
        user_id: session.user.id,
        label: finalLabel,
        value: valueToStore,
        date: new Date().toLocaleDateString('de-CH')
    })
    if (insertError) {
        if (insertError.message?.includes('JWT') || insertError.message?.includes('token')) {
            alert('Deine Sitzung ist abgelaufen. Bitte neu einloggen.')
            window.location.href = 'login.html'
        } else {
            alert('Fehler beim Speichern: ' + insertError.message)
        }
        return
    }
    if (document.getElementById('saved-passwords-list')) renderVault()
}

// Manuelles Speichern aus dem Modal
window.saveManual = async function() {
    const label = (document.getElementById('manualLabel')?.value || '').trim()
    const password = (document.getElementById('manualPassword')?.value || '').trim()
    if (!password) { alert('Bitte ein Passwort eingeben.'); return }
    await window.savePassword(password, label || 'Manuell gespeichert')
    document.getElementById('manualModal').style.display = 'none'
    document.getElementById('manualLabel').value = ''
    document.getElementById('manualPassword').value = ''
}

// Vom Generator zum Tresor übertragen
window.transferToVault = async function() {
    const outputField = document.getElementById('password-output')
    const labelField = document.getElementById('password-label')
    const currentPassword = outputField ? outputField.value : ''
    const currentLabel = labelField ? labelField.value : ''

    if (!currentPassword || currentPassword === 'Klicke auf Generieren') {
        alert('Bitte generiere erst ein Passwort.')
        return
    }

    await window.savePassword(currentPassword, currentLabel)
    alert(`Passwort für "${currentLabel || 'Unbenannt'}" gespeichert!`)
    if (labelField) labelField.value = ''
}

// ===== ALLE LÖSCHEN =====

window.clearVault = async function() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    if (!confirm('Möchtest du wirklich ALLE gespeicherten Passwörter löschen?')) return
    if (isOffline()) { alert('Kein Internet \u2014 L\u00f6schen nicht m\u00f6glich.'); return }
    const { error } = await supabase.from('passwords').delete().eq('user_id', session.user.id)
    if (error) { alert('Fehler beim L\u00f6schen. Bitte versuche es erneut.'); return }
    renderVault()
}

// Kopieren
window.copyToClipboard = function(index) {
    const text = vaultData[index]?.value ?? ''
    if (!text) { alert('Kein Passwort zum Kopieren gefunden.'); return }
    if (!navigator.clipboard) {
        // Fallback f\u00fcr \u00e4ltere Browser / unsichere Verbindungen
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.cssText = 'position:fixed;opacity:0'
        document.body.appendChild(ta)
        ta.select()
        try { document.execCommand('copy'); alert('Passwort kopiert!') } catch { alert('Kopieren nicht m\u00f6glich \u2014 bitte manuell kopieren.') }
        document.body.removeChild(ta)
        return
    }
    navigator.clipboard.writeText(text)
        .then(() => alert('Passwort kopiert!'))
        .catch(() => alert('Kopieren fehlgeschlagen \u2014 bitte manuell kopieren.'))
}

// ===== CSV EXPORT =====

window.exportCSV = function() {
    if (vaultData.length === 0) {
        alert('Keine Passwörter zum Exportieren vorhanden.')
        return
    }
    if (!confirm(`Achtung: Die exportierte Datei enthält alle ${vaultData.length} Passwörter im Klartext. Bewahre sie sicher auf!\n\nExport fortfahren?`)) return

    const rows = [['Name', 'Passwort', 'Datum']]
    vaultData.forEach(pw => {
        const name = `"${(pw.label || '').replace(/"/g, '""')}"`
        const password = `"${(pw.value || '').replace(/"/g, '""')}"`
        const date = `"${(pw.date || '').replace(/"/g, '""')}"`
        rows.push([name, password, date])
    })

    const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\n') // BOM für Excel-Kompatibilität
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `safenet-export-${new Date().toLocaleDateString('de-CH').replace(/\./g, '-')}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

// ===== CSV IMPORT =====

window.importCSV = async function(input) {
    const file = input.files[0]
    if (!file) return
    input.value = '' // Reset damit man dieselbe Datei nochmal laden kann

    if (isOffline()) { alert('Kein Internet — Import nicht möglich.'); return }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { alert('Bitte zuerst einloggen.'); return }

    const text = await file.text()
    const lines = text.split('\n').map(l => l.trim()).filter(l => l)

    if (lines.length < 2) { alert('Die CSV-Datei ist leer oder hat kein gültiges Format.'); return }

    // Header-Zeile erkennen (Chrome-Format: name,url,username,password)
    const header = lines[0].toLowerCase()
    const hasHeader = header.includes('name') || header.includes('password') || header.includes('url')
    const dataLines = hasHeader ? lines.slice(1) : lines

    if (dataLines.length === 0) { alert('Keine Einträge in der CSV gefunden.'); return }

    const key = await getVaultKey(session.user.email, session.user.id)
    const today = new Date().toLocaleDateString('de-CH')

    let imported = 0
    let skipped = 0
    const batchSize = 50

    for (let i = 0; i < dataLines.length; i += batchSize) {
        const batch = dataLines.slice(i, i + batchSize)
        const rows = []

        for (const line of batch) {
            // CSV parsen (einfaches Komma-Split, quoted fields unterstützt)
            const cols = parseCSVLine(line)
            if (cols.length < 2) { skipped++; continue }

            // Chrome-Format: name, url, username, password
            // Fallback: label, password
            let label, password
            if (cols.length >= 4) {
                label = cols[0]?.trim() || cols[2]?.trim() || 'Importiert'
                password = cols[3]?.trim()
            } else {
                label = cols[0]?.trim() || 'Importiert'
                password = cols[1]?.trim()
            }

            if (!password) { skipped++; continue }

            const encVal = await encryptValue(password, key)
            rows.push({ user_id: session.user.id, label: label || 'Importiert', value: encVal, date: today })
        }

        if (rows.length > 0) {
            const { error } = await supabase.from('passwords').insert(rows)
            if (error) { alert('Fehler beim Importieren: ' + error.message); break }
            imported += rows.length
        }
    }

    alert(`Import abgeschlossen: ${imported} Passwörter importiert${skipped > 0 ? `, ${skipped} übersprungen` : ''}.`)
    renderVault()
}

function parseCSVLine(line) {
    const result = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
        const ch = line[i]
        if (ch === '"') {
            inQuotes = !inQuotes
        } else if (ch === ',' && !inQuotes) {
            result.push(current)
            current = ''
        } else {
            current += ch
        }
    }
    result.push(current)
    return result
}

// ===== SUCHE =====

window.filterVault = function(query) {
    const q = query.trim().toLowerCase()
    const items = document.querySelectorAll('#saved-passwords-list .vault-item')
    let visible = 0
    items.forEach((item, index) => {
        const label = vaultData[index]?.label?.toLowerCase() ?? ''
        const match = !q || label.includes(q)
        item.style.display = match ? '' : 'none'
        if (match) visible++
    })
    // "Keine Treffer"-Hinweis
    let noResult = document.getElementById('vaultNoResult')
    if (!noResult) {
        noResult = document.createElement('p')
        noResult.id = 'vaultNoResult'
        noResult.style.cssText = 'text-align:center;color:rgba(255,255,255,0.4);padding:16px;'
        noResult.textContent = 'Keine Passwörter gefunden.'
        document.getElementById('saved-passwords-list').after(noResult)
    }
    noResult.style.display = (q && visible === 0) ? 'block' : 'none'
}

// ===== START =====

document.addEventListener('DOMContentLoaded', () => {
    supabase.auth.onAuthStateChange((event, session) => {
        cachedVaultKey = null // Key bei Session-Wechsel zurücksetzen
        renderVault()
    })
})