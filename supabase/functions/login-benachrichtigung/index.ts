import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

Deno.serve(async (req) => {
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

  // Supabase-Client mit Service-Role-Key initialisieren
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  )

  // JWT verifizieren und Benutzer abrufen
  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
  if (userError || !user?.email) {
    return new Response('Unauthorized', { status: 401 })
  }

  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  if (!resendApiKey) {
    return new Response('Service not configured', { status: 503 })
  }

  // Zeitstempel und Metadaten
  const now = new Date()
  const zeitstempel = now.toLocaleString('de-CH', {
    timeZone: 'Europe/Zurich',
    dateStyle: 'full',
    timeStyle: 'short',
  })

  // IP aus Cloudflare-Header lesen (Vercel setzt CF-Connecting-IP)
  const ip =
    req.headers.get('CF-Connecting-IP') ??
    req.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ??
    'Unbekannt'

  const userAgent = req.headers.get('User-Agent') ?? 'Unbekannt'

  const emailBody = {
    from: 'SafeNet Security <onboarding@resend.dev>',
    to: [user.email],
    subject: 'Neue Anmeldung bei deinem SafeNet-Konto',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#3399ff,#66d9ff);padding:28px 32px;">
          <h1 style="margin:0;font-size:22px;color:#0f172a;font-weight:700;">SafeNet Security</h1>
        </div>
        <div style="padding:32px;">
          <h2 style="margin:0 0 16px;font-size:18px;color:#f1f5f9;">Neue Anmeldung erkannt</h2>
          <p style="margin:0 0 24px;color:#94a3b8;line-height:1.6;">
            Dein SafeNet-Konto wurde soeben erfolgreich angemeldet. Falls du das nicht warst, ändere bitte sofort dein Passwort.
          </p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:10px 14px;background:#172441;border-radius:8px 8px 0 0;color:#64748b;width:120px;">Zeitpunkt</td>
              <td style="padding:10px 14px;background:#172441;border-radius:8px 8px 0 0;color:#e2e8f0;">${zeitstempel}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;background:#1e2d50;color:#64748b;">IP-Adresse</td>
              <td style="padding:10px 14px;background:#1e2d50;color:#e2e8f0;">${ip}</td>
            </tr>
            <tr>
              <td style="padding:10px 14px;background:#172441;border-radius:0 0 8px 8px;color:#64748b;">Browser</td>
              <td style="padding:10px 14px;background:#172441;border-radius:0 0 8px 8px;color:#e2e8f0;font-size:12px;">${userAgent}</td>
            </tr>
          </table>
          <p style="margin:24px 0 0;font-size:13px;color:#475569;">
            Wenn du diese Anmeldung kennst, musst du nichts weiter tun. Bei unbekannter Anmeldung:
            <a href="https://safenet-security.ch/de/pages/einstellungen.html" style="color:#3399ff;">Konto sichern →</a>
          </p>
        </div>
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
    console.error('Resend error:', err)
    return new Response('Email delivery failed', { status: 502, headers: corsHeaders })
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
