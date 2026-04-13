import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/+esm'

const SUPABASE_URL = 'https://dygrabyaiyessqmjdprc.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Z3JhYnlhaXllc3NxbWpkcHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTkzMzMsImV4cCI6MjA5MTA3NTMzM30.l4fAwsz3deB3rZuA5EOG-_9doe2ohXunv1KwFezR2ss'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        storage: window.localStorage,
        persistSession: true,
        autoRefreshToken: true,
    }
})

// Session zwischen Tabs synchronisieren via BroadcastChannel:
// – Neuer Tab im selben Browser  → erbt Session vom bestehenden Tab  ✓
// – Browser-Neustart             → sessionStorage leer → kein Login  ✓
// – Tab schließen                → Session bleibt in anderen Tabs     ✓
;(function syncSessionBetweenTabs() {
    const channel = new BroadcastChannel('safenet_auth_sync')

    // Beim Laden: Session von anderen Tabs anfragen, falls dieser Tab noch keine hat
    supabase.auth.getSession().then(({ data }) => {
        if (!data.session) {
            channel.postMessage({ type: 'REQUEST_SESSION' })
        }
    })

    channel.addEventListener('message', async (e) => {
        if (e.data.type === 'REQUEST_SESSION') {
            // Ein anderer Tab fragt nach der Session – antworten falls vorhanden
            const { data } = await supabase.auth.getSession()
            if (data.session) {
                channel.postMessage({
                    type: 'SESSION_DATA',
                    access_token:  data.session.access_token,
                    refresh_token: data.session.refresh_token,
                })
            }
        } else if (e.data.type === 'SESSION_DATA') {
            // Session von anderem Tab empfangen und setzen
            const { data: current } = await supabase.auth.getSession()
            if (!current.session) {
                await supabase.auth.setSession({
                    access_token:  e.data.access_token,
                    refresh_token: e.data.refresh_token,
                })
            }
        }
    })
})()

