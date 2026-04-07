import { supabase } from './supabase.js?v=4'

// ===== KONSTANTEN =====
const KEY_CHECK_LABEL = '__vault_key_check__'
const KEY_CHECK_PLAIN = 'SAFENET_VAULT_V1'
let vaultData = []
let cachedVaultKey = null

// ===== VERSCHLÜSSELUNG =====

async function deriveKey(password, userId) {
    const enc = new TextEncoder()
    const keyMaterial = await crypto.subtle.importKey(
        'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
    )
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: enc.encode(userId), iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    )
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

async function getVaultKey() {
    if (cachedVaultKey) return cachedVaultKey
    const pw = sessionStorage.getItem('vaultPassword')
    const userId = sessionStorage.getItem('vaultUserId')
    if (!pw || !userId) return null
    cachedVaultKey = await deriveKey(pw, userId)
    return cachedVaultKey
}

// ===== UI HELFER =====

function showVaultContent() {
    const overlay = document.getElementById('unlockOverlay')
    const content = document.getElementById('vaultContent')
    if (overlay) overlay.style.display = 'none'
    if (content) content.style.display = 'block'
}

function showUnlockOverlay() {
    const overlay = document.getElementById('unlockOverlay')
    const content = document.getElementById('vaultContent')
    if (overlay) overlay.style.display = 'flex'
    if (content) content.style.display = 'none'
}

// ===== TRESOR LADEN =====

async function renderVault() {
    const listElement = document.getElementById('saved-passwords-list')
    if (!listElement) return

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
        listElement.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.5); padding: 20px;">Bitte <a href="login.html" style="color:#3399ff">einloggen</a> um deinen Tresor zu sehen.</p>'
        return
    }

    listElement.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.4); padding:20px;">Wird geladen…</p>'

    const { data, error } = await supabase
        .from('passwords')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        listElement.innerHTML = '<p style="text-align:center;color:#ef4444;padding:20px;">Fehler beim Laden.</p>'
        return
    }

    // Key-Check-Eintrag herausfiltern
    const entries = data.filter(pw => pw.label !== KEY_CHECK_LABEL)

    // Werte entschlüsseln
    const key = await getVaultKey()
    const decryptedEntries = await Promise.all(entries.map(async pw => {
        if (pw.value && pw.value.startsWith('ENC:') && key) {
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

    listElement.innerHTML = decryptedEntries.map((pw, index) => `
        <div class="vault-item">
            <div style="display:flex;flex-direction:column;gap:2px;overflow:hidden;margin-right:10px;">
                <strong style="color:#ffffff;font-size:1rem;margin-bottom:2px;display:block;">${pw.label}</strong>
                <span class="password-display" id="pw-${index}" style="font-family:monospace;color:#66d9ff;font-size:1.1rem;letter-spacing:2px;">••••••••</span>
                <small style="font-size:0.7rem;color:rgba(255,255,255,0.4);">${pw.date || '-'}</small>
            </div>
            <div style="display:flex;gap:8px;flex-shrink:0;">
                <button class="vault-view-btn" onclick="window.editLabel('${pw.id}', '${pw.label}')" title="Umbenennen" style="background:linear-gradient(135deg,#FFB347,#FFCC33);color:#0b1220 !important;">
                    <span class="material-symbols-outlined">edit</span>
                </button>
                <button class="vault-view-btn" onclick="window.toggleVisibility(${index}, ${JSON.stringify(pw.value)})" title="Anzeigen">
                    <span class="material-symbols-outlined" id="eye-${index}">visibility</span>
                </button>
                <button class="vault-copy-btn" onclick="window.copyToClipboard(${JSON.stringify(pw.value)})" title="Kopieren">
                    <span class="material-symbols-outlined">content_copy</span>
                </button>
                <button class="vault-delete-btn" onclick="window.deletePassword('${pw.id}')" title="Löschen">
                    <span class="material-symbols-outlined">delete</span>
                </button>
            </div>
        </div>
    `).join('')
}

// Namen bearbeiten
window.editLabel = async function(id, currentLabel) {
    const newLabel = prompt('Gib einen neuen Namen ein:', currentLabel)
    if (newLabel === null) return
    const label = newLabel.trim() === '' ? 'Unbenannt' : newLabel
    await supabase.from('passwords').update({ label }).eq('id', id)
    renderVault()
}

// Sichtbarkeit umschalten
window.toggleVisibility = function(index, realValue) {
    const pwSpan = document.getElementById(`pw-${index}`)
    const eyeIcon = document.getElementById(`eye-${index}`)
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

// ===== TRESOR ENTSPERREN =====

window.unlockVault = async function() {
    const input = document.getElementById('unlockPassword')
    const errorEl = document.getElementById('unlockError')
    const btn = document.getElementById('unlockBtn')
    const password = input ? input.value.trim() : ''

    if (!password) {
        if (errorEl) errorEl.textContent = 'Bitte einen Tresor-Schlüssel eingeben.'
        return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
        if (errorEl) errorEl.textContent = 'Bitte zuerst einloggen.'
        return
    }

    if (btn) { btn.disabled = true; btn.textContent = 'Wird geprüft…' }

    const userId = session.user.id
    const key = await deriveKey(password, userId)

    const { data: checkRows } = await supabase
        .from('passwords')
        .select('value')
        .eq('user_id', userId)
        .eq('label', KEY_CHECK_LABEL)

    if (!checkRows || checkRows.length === 0) {
        // Erster Start: Schlüssel festlegen
        const checkValue = await encryptValue(KEY_CHECK_PLAIN, key)
        await supabase.from('passwords').insert({
            user_id: userId,
            label: KEY_CHECK_LABEL,
            value: checkValue,
            date: ''
        })
        sessionStorage.setItem('vaultPassword', password)
        sessionStorage.setItem('vaultUserId', userId)
        cachedVaultKey = key
        showVaultContent()
        renderVault()
        return
    }

    const dec = await decryptValue(checkRows[0].value, key)
    if (dec !== KEY_CHECK_PLAIN) {
        if (errorEl) errorEl.textContent = 'Falscher Tresor-Schlüssel. Bitte nochmal versuchen.'
        if (btn) { btn.disabled = false; btn.textContent = 'Entsperren' }
        input.value = ''
        input.focus()
        return
    }

    sessionStorage.setItem('vaultPassword', password)
    sessionStorage.setItem('vaultUserId', userId)
    cachedVaultKey = key
    showVaultContent()
    renderVault()
}

// ===== PASSWORT SPEICHERN =====

window.savePassword = async function(newPasswordValue, labelValue) {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) { alert('Bitte zuerst einloggen.'); return }

    const finalLabel = (labelValue && labelValue.trim() !== '') ? labelValue : 'Unbenanntes Passwort'

    const key = await getVaultKey()
    const valueToStore = key ? await encryptValue(newPasswordValue, key) : newPasswordValue

    const { error: insertError } = await supabase.from('passwords').insert({
        user_id: session.user.id,
        label: finalLabel,
        value: valueToStore,
        date: new Date().toLocaleDateString('de-CH')
    })
    if (insertError) { alert('Fehler beim Speichern: ' + insertError.message); return }
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

    // Falls kein Vault-Schlüssel in Session, zum Tresor leiten
    const key = await getVaultKey()
    if (!key) {
        const go = confirm('Du musst deinen Tresor erst entsperren. Jetzt zum Tresor gehen?')
        if (go) window.location.href = 'tresor.html'
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
    // Key-Check-Eintrag behalten
    const { data } = await supabase.from('passwords').select('id, label').eq('user_id', session.user.id)
    const toDelete = data.filter(pw => pw.label !== KEY_CHECK_LABEL).map(pw => pw.id)
    if (toDelete.length > 0) {
        await supabase.from('passwords').delete().in('id', toDelete)
    }
    renderVault()
}

// Kopieren
window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => alert('Passwort kopiert!'))
}

// ===== START =====

document.addEventListener('DOMContentLoaded', () => {
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (!session) {
            const listEl = document.getElementById('saved-passwords-list')
            if (listEl) listEl.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.5); padding: 20px;">Bitte <a href="login.html" style="color:#3399ff">einloggen</a> um deinen Tresor zu sehen.</p>'
            const overlay = document.getElementById('unlockOverlay')
            const content = document.getElementById('vaultContent')
            if (overlay) overlay.style.display = 'none'
            if (content) content.style.display = 'block'
            return
        }

        const storedPw = sessionStorage.getItem('vaultPassword')
        const storedId = sessionStorage.getItem('vaultUserId')
        if (storedPw && storedId === session.user.id) {
            cachedVaultKey = await deriveKey(storedPw, session.user.id)
            showVaultContent()
            renderVault()
        } else {
            showUnlockOverlay()
        }
    })
})