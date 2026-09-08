#!/usr/bin/env node
/**
 * Optional: generate sitemap XML including dynamic /properties/:id and /organizations/:id URLs.
 *
 * 1. Expose a public API (or reuse existing list endpoints) that return published property and organization IDs.
 * 2. Set BASE_URL and API_URL, then run: node scripts/generate-sitemap.mjs > public/sitemap-generated.xml
 * 3. Point robots.txt Sitemap to the generated file or merge URLs into public/sitemap.xml.
 *
 * This stub does not call the network; it documents the intended workflow for Search Console discovery.
 *
 * The live sitemap is served by the backend (SitemapController), which already queries the
 * database and is what robots.txt points at. Keep the path list below in step with that
 * controller's: it omits /exhibition and /marketplace/real-estate, which canonicalise to /
 * and /real-estate, and /ethio-real-estate-marketplace.html, which is a 301.
 */

const BASE_URL = process.env.SITEMAP_BASE_URL || 'https://ethiobuildconnect.et'

const staticPaths = [
  '/',
  '/real-estate',
  '/properties',
  '/buildings',
  '/marketplace/banks',
  '/marketplace/insurance',
  '/marketplace/contractors',
  '/marketplace/consultants-and-architects',
  '/marketplace/suppliers',
  '/marketplace/finishing-work',
  '/ethiopia-real-estate-market'
]

function urlEntry(loc, changefreq, priority) {
  return `  <url>
    <loc>${loc}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

function buildXml(paths) {
  const base = BASE_URL.replace(/\/$/, '')
  const rows = paths.map((p) => {
    const loc = p.startsWith('http') ? p : `${base}${p === '/' ? '' : p}`
    return urlEntry(loc, 'weekly', '0.7')
  })
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${rows.join('\n')}
</urlset>
`
}

// Default: static paths only (same as manual sitemap baseline).
console.log(buildXml(staticPaths))
