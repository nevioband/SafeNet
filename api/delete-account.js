export const config = { runtime: 'edge' }

const SUPABASE_URL = 'https://dygrabyaiyessqmjdprc.supabase.co'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: CORS })
  }

  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401, headers: CORS })
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return new Response('Server not configured', { status: 500, headers: CORS })
  }

  // Benutzer anhand des Access-Tokens ermitteln
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'Authorization': auth,
      'apikey': serviceRoleKey,
    },
  })

  if (!userRes.ok) {
    return new Response('Invalid token', { status: 401, headers: CORS })
  }

  const user = await userRes.json()
  const userId = user.id

  if (!userId) {
    return new Response('User not found', { status: 404, headers: CORS })
  }

  // Benutzer über die Admin-API löschen
  const deleteRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${serviceRoleKey}`,
      'apikey': serviceRoleKey,
    },
  })

  if (!deleteRes.ok) {
    const text = await deleteRes.text()
    return new Response(text, { status: deleteRes.status, headers: CORS })
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}
