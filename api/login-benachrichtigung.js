export const config = { runtime: 'edge' }

const SUPABASE_URL = 'https://dygrabyaiyessqmjdprc.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5Z3JhYnlhaXllc3NxbWpkcHJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0OTkzMzMsImV4cCI6MjA5MTA3NTMzM30.l4fAwsz3deB3rZuA5EOG-_9doe2ohXunv1KwFezR2ss'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response('Unauthorized', { status: 401 })
  }

  const token = authHeader.slice(7)

  // JWT über Supabase REST API verifizieren
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'apikey': SUPABASE_ANON_KEY,
    }
  })

  if (!userRes.ok) {
    const errText = await userRes.text()
    console.error('Auth REST error:', userRes.status, errText)
    return new Response('Unauthorized', { status: 401 })
  }

  const user = await userRes.json()
  if (!user?.email) {
    return new Response('Unauthorized', { status: 401 })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not set')
    return new Response('Service not configured', { status: 503 })
  }

  // Zeitstempel (Schweizer Zeit)
  const now = new Date()
  const zeitstempel = now.toLocaleString('de-CH', {
    timeZone: 'Europe/Zurich',
    dateStyle: 'full',
    timeStyle: 'short',
  })

  // IP-Adresse
  const ip =
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'Unbekannt'

  const userAgent = req.headers.get('user-agent') ?? 'Unbekannt'

  const emailBody = {
    from: 'SafeNet Security <info@safenet-security.ch>',
    to: [user.email],
    subject: 'Sicherheitshinweis: Neue Anmeldung bei SafeNet',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:16px;padding:48px 40px;text-align:center;">

        <div style="margin-bottom:32px;">
          <img src="https://safenet-security.ch/images/SafeNet-Security-Logo/Withoutbg/ShieldWhiteName.png" alt="SafeNet Security" style="height:48px;width:auto;">
        </div>

        <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#f1f5f9;line-height:1.3;">Neue Anmeldung erkannt</h1>

        <div style="display:inline-block;background:#172441;border-radius:999px;padding:8px 18px;margin-bottom:28px;">
          <span style="font-size:14px;color:#93c5fd;">${user.email}</span>
        </div>

        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:0 0 28px;">

        <p style="margin:0 0 32px;font-size:15px;color:#94a3b8;line-height:1.7;">
          Dein SafeNet-Konto wurde soeben erfolgreich angemeldet.<br>
          Falls du das nicht warst, sichere bitte sofort dein Konto.
        </p>

        <a href="https://safenet-security.ch/de/pages/reset-password.html"
           style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#3399ff,#66d9ff);color:#0f172a;font-weight:700;font-size:15px;border-radius:999px;text-decoration:none;margin-bottom:36px;">
          Passwort zurücksetzen
        </a>

        <div style="background:#172441;border-radius:12px;padding:20px;text-align:left;margin-bottom:28px;font-size:13px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
            <span style="color:#64748b;">Zeitpunkt</span>
            <span style="color:#cbd5e1;">${zeitstempel}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:10px;">
            <span style="color:#64748b;">IP-Adresse</span>
            <span style="color:#cbd5e1;">${ip}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="color:#64748b;">Browser</span>
            <span style="color:#cbd5e1;max-width:260px;text-align:right;">${userAgent.split(' ').slice(0, 3).join(' ')}</span>
          </div>
        </div>

        <p style="margin:0;font-size:12px;color:#475569;line-height:1.6;">
          Warst du das nicht? Setze sofort dein Passwort zurück und sichere dein Konto.<br>
          War es doch du, musst du nichts weiter tun.
        </p>

      </div>
    `,
  }

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailBody),
  })

  if (!resendRes.ok) {
    const err = await resendRes.text()
    console.error('Resend error:', resendRes.status, err)
    return new Response('Email delivery failed', { status: 502, headers: corsHeaders })
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
