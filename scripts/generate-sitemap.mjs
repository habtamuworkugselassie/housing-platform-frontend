#!/usr/bin/env node
/**
 * Optional: generate sitemap XML including dynamic /properties/:id and /organizations/:id URLs.
 *
 * 1. Expose a public API (or reuse existing list endpoints) that return published property and organization IDs.
 * 2. Set BASE_URL and API_URL, then run: node scripts/generate-sitemap.mjs > public/sitemap-generated.xml
 * 3. Point robots.txt Sitemap to the generated file or merge URLs into public/sitemap.xml.
 *
 * This stub does not call the network; it documents the intended workflow for Search Console discovery.
 */

const BASE_URL = process.env.SITEMAP_BASE_URL || 'https://ethiobuildconnect.et'

const staticPaths = [
  '/',
  '/real-estate',
  '/properties',
  '/buildings',
  '/marketplace/real-estate',
  '/marketplace/banks',
  '/marketplace/insurance',
  '/marketplace/contractors',
  '/marketplace/consultants-and-architects',
  '/marketplace/suppliers',
  '/marketplace/finishing-work',
  '/exhibition',
  '/ethio-real-estate-marketplace.html'
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
