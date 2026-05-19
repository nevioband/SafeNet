export const config = { runtime: 'edge' }

const SUPABASE_URL = 'https://dygrabyaiyessqmjdprc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Z3JhYnlhaXllc3NxbWpkcHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTkzMzMsImV4cCI6MjA5MTA3NTMzM30.l4fAwsz3deB3rZuA5EOG-_9doe2ohXunv1KwFezR2ss'
const AGENT_ID = 'ag_019e3ef5b56470d7be7db6e13cd92aa7'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: CORS })

  // Auth-Prüfung (optional für Test – auskommentieren zum schnellen Testen)
  const authHeader = req.headers.get('authorization') || ''
  const token = authHeader.replace('Bearer ', '')
  if (token) {
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` }
    })
    if (!authRes.ok) return new Response(JSON.stringify({ error: 'Nicht autorisiert' }), { status: 401, headers: CORS })
  }

  const { message, history = [] } = await req.json()
  if (!message || typeof message !== 'string' || message.length > 1000) {
    return new Response(JSON.stringify({ error: 'Ungültige Nachricht' }), { status: 400, headers: CORS })
  }

  const mistralKey = (typeof process !== 'undefined' ? process.env.MISTRAL_API_KEY : null)
    || (typeof EdgeRuntime !== 'undefined' ? globalThis.MISTRAL_API_KEY : null)

  // Konversation aufbauen: bisherige History + neue Nachricht
  const inputs = [
    ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message }
  ]

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)

  let reply
  try {
    const res = await fetch('https://api.mistral.ai/v1/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mistralKey}`
      },
      body: JSON.stringify({
        agent_id: AGENT_ID,
        agent_version: 0,
        inputs
      }),
      signal: controller.signal
    })
    clearTimeout(timeout)

    if (!res.ok) {
      const err = await res.text()
      console.error('Mistral Agent Fehler:', err)
      return new Response(JSON.stringify({ error: 'KI nicht verfügbar' }), { status: 502, headers: CORS })
    }

    const data = await res.json()
    // Agent API gibt outputs zurück
    const output = data.outputs?.find(o => o.role === 'assistant')
    reply = output?.content || data.outputs?.[0]?.content || 'Keine Antwort erhalten.'
  } catch (e) {
    clearTimeout(timeout)
    console.error('Fetch Fehler:', e)
    return new Response(JSON.stringify({ error: 'Timeout oder Verbindungsfehler' }), { status: 504, headers: CORS })
  }

  return new Response(JSON.stringify({ reply }), {
    headers: { ...CORS, 'Content-Type': 'application/json' }
  })
}
