export const config = { runtime: 'edge' }

const SUPABASE_URL = 'https://dygrabyaiyessqmjdprc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Z3JhYnlhaXllc3NxbWpkcHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTkzMzMsImV4cCI6MjA5MTA3NTMzM30.l4fAwsz3deB3rZuA5EOG-_9doe2ohXunv1KwFezR2ss'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401, headers: CORS })
  }

  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  const userId = url.searchParams.get('user_id')

  const sbHeaders = {
    'Authorization': auth,
    'apikey': SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
    'Prefer': 'return=minimal',
  }

  // Supabase REST URL je nach Methode und Parametern aufbauen
  let sbUrl = `${SUPABASE_URL}/rest/v1/passwords`
  if (req.method === 'GET') {
    sbUrl += '?select=*&order=created_at.desc'
  } else if ((req.method === 'PATCH' || req.method === 'DELETE') && id) {
    sbUrl += `?id=eq.${encodeURIComponent(id)}`
  } else if (req.method === 'DELETE' && userId) {
    sbUrl += `?user_id=eq.${encodeURIComponent(userId)}`
  }

  const body = (req.method === 'POST' || req.method === 'PATCH') ? await req.text() : undefined

  try {
    const res = await fetch(sbUrl, { method: req.method, headers: sbHeaders, body })
    const text = await res.text()
    return new Response(text || null, {
      status: res.status,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Proxy error', message: e.message }), {
      status: 502,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    })
  }
}
