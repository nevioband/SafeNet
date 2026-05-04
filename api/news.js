export const config = { runtime: 'edge' }

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}

const SOURCES = [
  { name: 'The Hacker News',  url: 'https://thehackernews.com/feeds/posts/default' },
  { name: 'Bleeping Computer',url: 'https://www.bleepingcomputer.com/feed/' },
  { name: 'Krebs on Security',url: 'https://krebsonsecurity.com/feed/' },
  { name: 'Ars Technica',     url: 'https://feeds.arstechnica.com/arstechnica/security' },
  { name: 'SecurityWeek',     url: 'https://www.securityweek.com/feed/' },
]

function cdataOrText(raw) {
  const m = raw.match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/)
  return (m ? m[1] : raw).trim()
}

function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}(?:[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i')
  const m  = xml.match(re)
  return m ? cdataOrText(m[1]) : ''
}

function extractAttr(xml, tag, attr) {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, 'i')
  const m  = xml.match(re)
  return m ? m[1] : ''
}

function stripHtml(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim()
}

function parseItems(xml, sourceName) {
  const isAtom = /<entry[\s>]/.test(xml)
  const block  = isAtom ? 'entry' : 'item'
  const re     = new RegExp(`<${block}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${block}>`, 'gi')

  return [...xml.matchAll(re)].map(m => {
    const b = m[1]

    const title = stripHtml(extractTag(b, 'title'))
    const link  = extractAttr(b, 'link', 'href') || extractTag(b, 'link').trim()
    const rawDesc = extractTag(b, 'summary') || extractTag(b, 'description') || extractTag(b, 'content')
    const desc    = stripHtml(rawDesc).slice(0, 260)

    const rawDate = extractTag(b, 'published') || extractTag(b, 'updated') || extractTag(b, 'pubDate')
    let date = null
    if (rawDate) { try { date = new Date(rawDate).toISOString() } catch {} }

    return (title && link) ? { title, link, description: desc, date, source: sourceName } : null
  }).filter(Boolean)
}

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS })
  }

  try {
    const results = await Promise.all(
      SOURCES.map(async src => {
        try {
          const res = await fetch(src.url, { headers: { 'User-Agent': 'SafeNet-Security/1.0' } })
          if (!res.ok) return []
          const xml = await res.text()
          return parseItems(xml, src.name)
        } catch { return [] }
      })
    )

    const items = results
      .flat()
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 9)

    return new Response(JSON.stringify({ items }), { headers: CORS })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, items: [] }), { status: 502, headers: CORS })
  }
}
