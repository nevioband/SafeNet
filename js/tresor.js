import { supabase } from './supabase.js?v=3'

let vaultData = [] // lokaler Cache

// Tresor laden
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

    vaultData = data

    if (data.length === 0) {
        listElement.innerHTML = '<p style="text-align:center; color:rgba(255,255,255,0.5); padding: 20px;">Noch keine Passwörter gespeichert.</p>'
        return
    }

    listElement.innerHTML = data.map((pw, index) => `
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

// Passwort speichern (aufgerufen vom Generator)
window.savePassword = async function(newPasswordValue, labelValue) {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) { alert('Bitte zuerst einloggen.'); return }

    const finalLabel = (labelValue && labelValue.trim() !== '') ? labelValue : 'Unbenanntes Passwort'
    const { error: insertError } = await supabase.from('passwords').insert({
        user_id: session.user.id,
        label: finalLabel,
        value: newPasswordValue,
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

    if (currentPassword && currentPassword !== '' && currentPassword !== 'Klicke auf Generieren') {
        await window.savePassword(currentPassword, currentLabel)
        alert(`Passwort für "${currentLabel || 'Unbenannt'}" gespeichert!`)
        if (labelField) labelField.value = ''
    } else {
        alert('Bitte generiere erst ein Passwort.')
    }
}

// Alle löschen
window.clearVault = async function() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    if (!confirm('Möchtest du wirklich ALLE gespeicherten Passwörter löschen?')) return
    await supabase.from('passwords').delete().eq('user_id', session.user.id)
    renderVault()
}

// Kopieren
window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => alert('Passwort kopiert!'))
}

// Start: warten bis Supabase die Session wiederhergestellt hat
document.addEventListener('DOMContentLoaded', () => {
    supabase.auth.onAuthStateChange((event, session) => {
        renderVault()
    })
    // Direkt auch versuchen (falls Session schon da)
    renderVault()
})