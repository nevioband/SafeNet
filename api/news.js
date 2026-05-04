export const config = { runtime: 'edge' }

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    // CISA Known Exploited Vulnerabilities Catalog (öffentlich, kein API-Key nötig)
    const res = await fetch(
      'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
      { headers: { 'User-Agent': 'SafeNet-Security/1.0' } }
    )

    if (!res.ok) throw new Error(`CISA HTTP ${res.status}`)

    const json = await res.json()
    const vulns = (json.vulnerabilities ?? [])
      .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
      .slice(0, 12)
      .map(v => ({
        id:          v.cveID,
        title:       v.vulnerabilityName,
        vendor:      v.vendorProject,
        product:     v.product,
        date:        v.dateAdded,
        description: (v.shortDescription ?? '').slice(0, 220),
        ransomware:  v.knownRansomwareCampaignUse === 'Known',
        link:        `https://nvd.nist.gov/vuln/detail/${v.cveID}`,
      }))

    return new Response(
      JSON.stringify({ items: vulns, updated: json.dateReleased ?? null }),
      { headers: CORS }
    )
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message, items: [] }),
      { status: 502, headers: CORS }
    )
  }
}
