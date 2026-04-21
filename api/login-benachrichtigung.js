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
    html: `<!DOCTYPE html><html lang="de" xmlns="http://www.w3.org/1999/xhtml"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="only light"><meta name="supported-color-schemes" content="only light"><meta name="format-detection" content="email=no,telephone=no,address=no"><style>:root{color-scheme:only light;supported-color-schemes:only light;}body,table,td,div,p,a,span{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}a[href^="mailto:"]{color:inherit !important;text-decoration:none !important;pointer-events:none !important;}body{margin:0;padding:0;background-color:#0a0f1e !important;}@media(prefers-color-scheme:dark){body,table,td,div,p,span{background-color:#0a0f1e !important;color:#e2e8f0 !important;}.card{background-color:#0f172a !important;}.badge{background-color:#172441 !important;}.details{background-color:#172441 !important;}}</style></head><body style="margin:0;padding:0;background-color:#0a0f1e;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0f1e;"><tr><td align="center" style="padding:24px 16px;"><table class="card" role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#0f172a;border-radius:16px;border:1px solid rgba(51,153,255,0.2);"><tr><td style="padding:48px 40px;text-align:center;font-family:Arial,sans-serif;">

          <img src="https://safenet-security.ch/images/SafeNet-Security-Logo/Withoutbg/ShieldWhiteName.png" alt="SafeNet Security" height="48" style="display:block;margin:0 auto 32px;height:48px;width:auto;">

          <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#f1f5f9;line-height:1.3;font-family:Arial,sans-serif;">Neue Anmeldung erkannt</h1>

          <table class="badge" role="presentation" cellpadding="0" cellspacing="0" align="center" style="background-color:#172441;border-radius:999px;margin-bottom:28px;"><tr><td style="padding:8px 18px;font-size:14px;color:#f1f5f9;font-family:Arial,sans-serif;text-decoration:none;">${user.email.replace('@', '<span></span>@').replace(/\./g, '<span></span>.')}</td></tr></table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="border-top:1px solid rgba(255,255,255,0.08);padding-bottom:28px;"></td></tr></table>

          <p style="margin:0 0 32px;font-size:15px;color:#94a3b8;line-height:1.7;font-family:Arial,sans-serif;">
            Dein SafeNet-Konto wurde soeben erfolgreich angemeldet.<br>
            Falls du das nicht warst, sichere bitte sofort dein Konto.
          </p>

          <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin-bottom:36px;"><tr><td style="background:#3399ff;border-radius:999px;"><a href="https://safenet-security.ch/de/pages/reset-password.html" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#3399ff,#66d9ff);color:#0f172a;font-weight:700;font-size:15px;border-radius:999px;text-decoration:none;font-family:Arial,sans-serif;">Passwort zur&uuml;cksetzen</a></td></tr></table>

          <table class="details" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#172441;border-radius:12px;margin-bottom:28px;"><tr><td style="padding:20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr><td style="font-size:13px;color:#94a3b8;font-family:Arial,sans-serif;padding-bottom:10px;">Zeitpunkt</td><td align="right" style="font-size:13px;color:#e2e8f0;font-family:Arial,sans-serif;padding-bottom:10px;">${zeitstempel}</td></tr>
              <tr><td style="font-size:13px;color:#94a3b8;font-family:Arial,sans-serif;padding-bottom:10px;">IP-Adresse</td><td align="right" style="font-size:13px;color:#e2e8f0;font-family:Arial,sans-serif;padding-bottom:10px;">${ip}</td></tr>
              <tr><td style="font-size:13px;color:#94a3b8;font-family:Arial,sans-serif;">Browser</td><td align="right" style="font-size:13px;color:#e2e8f0;font-family:Arial,sans-serif;">${userAgent.split(' ').slice(0,3).join(' ')}</td></tr>
            </table>
          </td></tr></table>

          <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;font-family:Arial,sans-serif;">
            Warst du das nicht? Setze sofort dein Passwort zur&uuml;ck und sichere dein Konto.
          </p>

        </td></tr></table></td></tr></table></body></html>
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
