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

  // User-Client mit dem JWT des Nutzers initialisieren (empfohlenes Supabase-Pattern)
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false }
    }
  )

  // JWT verifizieren und Benutzer abrufen
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
  if (userError || !user?.email) {
    console.error('Auth error:', userError?.message, 'user:', user?.email)
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
    from: 'SafeNet Security <noreply@safenet-security.ch>',
    to: [user.email],
    subject: 'Sicherheitshinweis: Neue Anmeldung bei SafeNet',
    html: `
      <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;background:#0f172a;color:#e2e8f0;border-radius:16px;padding:48px 40px;text-align:center;">

        <!-- Logo -->
        <div style="margin-bottom:32px;">
          <img src="https://safe-net-umber.vercel.app/images/SafeNet-Security-Logo/Withoutbg/ShieldWhiteName.png" alt="SafeNet Security" style="height:48px;width:auto;">
        </div>

        <!-- Titel -->
        <h1 style="margin:0 0 20px;font-size:26px;font-weight:700;color:#f1f5f9;line-height:1.3;">Neue Anmeldung erkannt</h1>

        <!-- E-Mail Badge -->
        <div style="display:inline-block;background:#172441;border-radius:999px;padding:8px 18px;margin-bottom:28px;">
          <span style="font-size:14px;color:#93c5fd;">${user.email}</span>
        </div>

        <!-- Trennlinie -->
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:0 0 28px;">

        <!-- Text -->
        <p style="margin:0 0 32px;font-size:15px;color:#94a3b8;line-height:1.7;">
          Dein SafeNet-Konto wurde soeben erfolgreich angemeldet.<br>
          Falls du das nicht warst, sichere bitte sofort dein Konto.
        </p>

        <!-- Button -->
        <a href="https://safe-net-umber.vercel.app/de/pages/einstellungen.html"
           style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#3399ff,#66d9ff);color:#0f172a;font-weight:700;font-size:15px;border-radius:999px;text-decoration:none;margin-bottom:36px;">
          Aktivität prüfen
        </a>

        <!-- Details -->
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
            <span style="color:#cbd5e1;max-width:260px;text-align:right;">${userAgent.split(' ').slice(0,3).join(' ')}</span>
          </div>
        </div>

        <!-- Footer -->
        <p style="margin:0;font-size:12px;color:#475569;line-height:1.6;">
          Wenn du diese Anmeldung kennst, musst du nichts weiter tun.<br>
          Sicherheitsaktivitäten einsehen:
          <a href="https://safe-net-umber.vercel.app/de/pages/einstellungen.html" style="color:#3399ff;text-decoration:none;">Einstellungen öffnen</a>
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
    console.error('Resend error:', err)
    return new Response('Email delivery failed', { status: 502, headers: corsHeaders })
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
