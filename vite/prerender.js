import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

/**
 * Bakes the marketing pages' own copy into static HTML at build time.
 *
 * The app is a client-rendered SPA: `dist/index.html` ships an empty `<div id="app">`,
 * so the first thing any fetch of any URL returns is a shell with no words in it. Google
 * does run JavaScript, but it does so on a second pass that can lag the first by days,
 * and a page whose text only exists after a 174 kB bundle has downloaded is competing
 * with one whose text is in the response. The pages that have to rank — the expo landing
 * page and the market guide — are the ones handled here.
 *
 * How it works: for each page, a copy of the built `index.html` is written to
 * `dist/prerender/<name>.html` with the route's title, description and canonical
 * substituted in and the page's real copy placed inside `#app`. nginx serves that file
 * for the matching URL and falls back to `index.html` if it is missing, so the site keeps
 * working whether or not this plugin ran. The same asset tags are kept, so the SPA still
 * boots exactly as before, and `app.mount('#app')` clears the container on mount — the
 * static copy is what a visitor reads while the bundle downloads, then the app takes over.
 *
 * Both prerendered text and live text come from the same modules — the locale catalogue
 * and `marketOverviewContent.js` — because a prerendered page that says something the
 * rendered page does not is cloaking, whether or not anyone meant it.
 */

const SITE_URL = 'https://ethiobuildconnect.et'

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ESCAPES[c])
}

/** Reads a dotted path out of the locale catalogue, refusing to emit an empty string. */
function makeTranslator(messages, file) {
  return (key) => {
    const value = key.split('.').reduce((node, part) => (node == null ? node : node[part]), messages)
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`prerender: ${file} has no string at "${key}"`)
    }
    return value
  }
}

/**
 * Onward links, using the same labels and destinations the rendered nav and footer use.
 *
 * The prerendered page must not offer a link the real page does not; that is the kind of
 * difference between crawler and visitor that gets a site treated as cloaking.
 */
const EXPO_LINKS = [
  ['/properties', 'nav.properties'],
  ['/real-estate', 'nav.marketplaceRealEstate'],
  ['/ethiopia-real-estate-market', 'nav.ethiopiaRealEstateMarket'],
  ['/marketplace/contractors', 'nav.marketplaceContractors'],
  ['/marketplace/consultants-and-architects', 'nav.marketplaceConsultantsArchitects'],
  ['/marketplace/suppliers', 'nav.marketplaceSuppliers'],
  ['/marketplace/banks', 'nav.marketplaceBanks']
]

/** The expo landing page, which both `/` and `/exhibition` serve. */
function expoBody(t) {
  const cards = [1, 2, 3].map((n) => ({
    title: t(`exhibition.whatHappened.card${n}Title`),
    body: t(`exhibition.whatHappened.card${n}Body`)
  }))

  const faqIds = ['whenWhere', 'whoExhibits', 'howRegister', 'browsingCost', 'listProperty', 'contactCompany', 'languages']

  return `
      <p class="pr-eyebrow">${esc(t('exhibition.hero.eventName'))}</p>
      <h1>${esc(t('home.expoHeadline'))}</h1>
      <p class="pr-when">${esc(t('exhibition.hero.dateVenue'))}</p>
      <p class="pr-lead">${esc(t('exhibition.planning.body'))}</p>
      <p>${esc(t('exhibition.planning.whoShowcases'))}</p>

      <h2>${esc(t('exhibition.whatHappened.title'))}</h2>
      <p>${esc(t('exhibition.whatHappened.subtitle'))}</p>
      ${cards.map((c) => `<h3>${esc(c.title)}</h3>\n      <p>${esc(c.body)}</p>`).join('\n      ')}

      <h2>${esc(t('exhibition.whoAttends.title'))}</h2>
      <p>${esc(t('exhibition.whoAttends.subtitle'))}</p>

      <h2>${esc(t('exhibition.faq.title'))}</h2>
      <dl>
      ${faqIds
        .map(
          (id) =>
            `<dt>${esc(t(`exhibition.faq.items.${id}.q`))}</dt>\n        <dd>${esc(t(`exhibition.faq.items.${id}.a`))}</dd>`
        )
        .join('\n      ')}
      </dl>

      <h2>${esc(t('exhibition.planVisit.title'))}</h2>
      <p>${esc(t('exhibition.planVisit.body'))}</p>
      <ul>
      ${EXPO_LINKS.map(
        ([href, key]) => `<li><a href="${esc(href)}">${esc(t(key))}</a></li>`
      ).join('\n        ')}
      </ul>`
}

/** The market guide, rendered from the same module the Vue view renders. */
function marketBody(content) {
  const section = (s) => {
    const parts = [`<h2>${esc(s.heading)}</h2>`]
    for (const paragraph of s.paragraphs) parts.push(`<p>${esc(paragraph)}</p>`)
    if (s.list) {
      parts.push('<dl>')
      for (const item of s.list) {
        parts.push(`<dt>${esc(item.term)}</dt>`, `<dd>${esc(item.detail)}</dd>`)
      }
      parts.push('</dl>')
    }
    if (s.links) {
      parts.push('<ul>')
      for (const link of s.links) {
        parts.push(`<li><a href="${esc(link.to)}">${esc(link.label)}</a></li>`)
      }
      parts.push('</ul>')
    }
    return parts.join('\n      ')
  }

  return `
      <h1>${esc(content.h1)}</h1>
      <p class="pr-lead">${esc(content.standfirst)}</p>
      ${content.sections.map(section).join('\n      ')}`
}

/**
 * Plain, legible styling for the seconds before the bundle arrives.
 *
 * Scoped inside `#app`, so Vue discards it along with the markup on mount and none of it
 * can reach the running app. Deliberately not `display: none` or `visibility: hidden`:
 * text a visitor cannot see is text Google discounts, and hiding it would turn an honest
 * prerender into a keyword stuffing signal.
 */
const PRERENDER_CSS = `
    <style>
      .pr { max-width: 46rem; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; color: #1f2937;
            font: 400 16px/1.65 Roboto, system-ui, -apple-system, "Segoe UI", Arial, sans-serif; }
      .pr h1 { margin: 0 0 0.75rem; font-size: clamp(1.9rem, 4.4vw, 2.9rem); line-height: 1.1;
               letter-spacing: -0.02em; color: #111827; }
      .pr h2 { margin: 2.25rem 0 0.5rem; font-size: 1.25rem; color: #111827; }
      .pr h3 { margin: 1.5rem 0 0.35rem; font-size: 1rem; color: #111827; }
      .pr p, .pr dd { margin: 0 0 0.9rem; }
      .pr dt { margin: 0 0 0.2rem; font-weight: 700; color: #111827; }
      .pr dd { margin-left: 0; color: #374151; }
      .pr .pr-eyebrow { margin: 0 0 0.6rem; color: #6d28d9; font-size: 0.78rem; font-weight: 700;
                        letter-spacing: 0.08em; text-transform: uppercase; }
      .pr .pr-when { display: inline-block; margin: 0 0 1.1rem; padding: 0.4rem 0.75rem;
                     border-radius: 0.5rem; background: #f5f3ff; color: #5b21b6;
                     font-size: 0.85rem; font-weight: 700; }
      .pr .pr-lead { font-size: 1.0625rem; color: #374151; }
      .pr ul { margin: 0 0 1rem; padding-left: 1.25rem; }
      .pr li { margin: 0 0 0.35rem; }
      .pr a { color: #5b21b6; }
    </style>`

/**
 * Replaces the first match, failing the build if the pattern is not there at all.
 *
 * Every substitution below is against markup this repo controls, so a miss means
 * index.html was edited and the prerendered pages would otherwise be published with a
 * stale title or no canonical — silently, which is the failure worth avoiding.
 */
function replaceOnce(html, pattern, replacement, what, file) {
  if (!pattern.test(html)) throw new Error(`prerender: ${file} has no ${what} to replace`)
  return html.replace(pattern, replacement)
}

export default function prerenderMarketingPages() {
  let outDir = 'dist'
  let root = process.cwd()

  return {
    name: 'ethio-prerender-marketing-pages',
    apply: 'build',

    configResolved(config) {
      root = config.root
      outDir = path.resolve(config.root, config.build.outDir)
    },

    async closeBundle() {
      const localeFile = path.join(root, 'src/i18n/locales/en.json')
      const messages = JSON.parse(await fs.readFile(localeFile, 'utf8'))
      const t = makeTranslator(messages, 'en.json')

      const { seoByRouteName } = await import(pathToFileURL(path.join(root, 'src/router/routeSeo.js')))
      const { MARKET_OVERVIEW, MARKET_OVERVIEW_PATH } = await import(
        pathToFileURL(path.join(root, 'src/features/marketplace/marketOverviewContent.js'))
      )

      const shell = await fs.readFile(path.join(outDir, 'index.html'), 'utf8')

      const pages = [
        // `/` and `/exhibition` render the same view, and `/exhibition` canonicalises to
        // `/` — so both get the same body and both name `/` as canonical.
        { file: 'home.html', routeName: 'Home', canonical: '/', body: expoBody(t) },
        { file: 'exhibition.html', routeName: 'ExhibitionLanding', canonical: '/', body: expoBody(t) },
        {
          file: 'ethiopia-real-estate-market.html',
          routeName: 'EthiopiaRealEstateMarket',
          canonical: MARKET_OVERVIEW_PATH,
          body: marketBody(MARKET_OVERVIEW)
        }
      ]

      const dir = path.join(outDir, 'prerender')
      await fs.mkdir(dir, { recursive: true })

      for (const page of pages) {
        const seo = seoByRouteName[page.routeName]
        if (!seo) throw new Error(`prerender: routeSeo.js has no entry for "${page.routeName}"`)

        const canonicalUrl = `${SITE_URL}${page.canonical === '/' ? '/' : page.canonical}`
        let html = shell

        html = replaceOnce(html, /<title>[\s\S]*?<\/title>/, `<title>${esc(seo.title)}</title>`, '<title>', page.file)
        html = replaceOnce(
          html,
          /<meta name="description" content="[^"]*">/,
          `<meta name="description" content="${esc(seo.description)}">`,
          'description meta',
          page.file
        )
        html = replaceOnce(
          html,
          /<meta property="og:url" content="[^"]*">/,
          `<meta property="og:url" content="${esc(canonicalUrl)}">`,
          'og:url meta',
          page.file
        )
        for (const [attr, name, value] of [
          ['property', 'og:title', seo.title],
          ['property', 'og:description', seo.description],
          ['name', 'twitter:title', seo.title],
          ['name', 'twitter:description', seo.description]
        ]) {
          html = replaceOnce(
            html,
            new RegExp(`<meta ${attr}="${name}" content="[^"]*">`),
            `<meta ${attr}="${name}" content="${esc(value)}">`,
            `${name} meta`,
            page.file
          )
        }
        // index.html deliberately carries no canonical (the router sets it per URL). A
        // prerendered file is for one URL only, so it can and must state its own.
        html = replaceOnce(
          html,
          /<title>/,
          `<link rel="canonical" href="${esc(canonicalUrl)}">\n    <title>`,
          'title tag to anchor the canonical to',
          page.file
        )
        html = replaceOnce(
          html,
          /<div id="app"><\/div>/,
          `<div id="app">${PRERENDER_CSS}\n    <main class="pr">${page.body}\n    </main>\n    </div>`,
          'empty #app container',
          page.file
        )

        await fs.writeFile(path.join(dir, page.file), html, 'utf8')
      }

      this.info?.(`prerendered ${pages.length} marketing pages into ${path.relative(root, dir)}/`)
    }
  }
}
