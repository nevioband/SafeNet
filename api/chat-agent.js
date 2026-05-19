export const config = { runtime: 'edge' }

const AGENT_ID = 'ag_019e3ef5b56470d7be7db6e13cd92aa7'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: CORS })

  let body
  try { body = await req.json() } catch {
    return new Response(JSON.stringify({ error: 'Ungültige Anfrage' }), { status: 400, headers: CORS })
  }

  const { message, history = [] } = body
  if (!message || typeof message !== 'string' || message.length > 1000) {
    return new Response(JSON.stringify({ error: 'Ungültige Nachricht' }), { status: 400, headers: CORS })
  }

  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'KI nicht konfiguriert' }), { status: 500, headers: CORS })
  }

  // Konversation: bisherige History + neue Nachricht
  const inputs = [
    ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message }
  ]

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)

  let reply
  try {
    const res = await fetch('https://api.mistral.ai/v1/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ agent_id: AGENT_ID, inputs }),
      signal: controller.signal
    })
    clearTimeout(timeout)

    const raw = await res.text()
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Mistral Fehler ${res.status}: ${raw.slice(0, 200)}` }), { status: 502, headers: CORS })
    }

    const data = JSON.parse(raw)
    // Mögliche Response-Formate abdecken
    const output = data.outputs?.find(o => o.role === 'assistant') || data.outputs?.[0]
    if (output) {
      // content kann String oder Array sein
      if (typeof output.content === 'string') {
        reply = output.content
      } else if (Array.isArray(output.content)) {
        reply = output.content.map(c => c.text || c.content || '').join('')
      } else {
        reply = JSON.stringify(data) // Debug-Fallback
      }
    } else {
      reply = `Unbekanntes Format: ${JSON.stringify(data).slice(0, 300)}`
    }
  } catch (e) {
    clearTimeout(timeout)
    return new Response(JSON.stringify({ error: `Fehler: ${e.message}` }), { status: 504, headers: CORS })
  }

  return new Response(JSON.stringify({ reply }), {
    headers: { ...CORS, 'Content-Type': 'application/json' }
  })
}
