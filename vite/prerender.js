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

/**
 * The alternates, as markup, for the head of a prerendered page.
 *
 * Worth baking in rather than leaving to the router: hreflang is how a crawler learns the
 * Amharic edition exists at all, and a crawler that does not run JavaScript would
 * otherwise never see it on the one page most likely to be crawled first.
 */
function hreflangTags(alternates) {
  if (!alternates) return ''
  const entries = Object.entries(alternates)
  if (entries.length < 2) return ''
  const all = [...entries, ['x-default', alternates.en]]
  return all
    .map(([lang, path]) => `<link rel="alternate" hreflang="${esc(lang)}" href="${esc(SITE_URL)}${esc(path)}">`)
    .join('\n    ')
}

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

/**
 * Fetches the live statistics so the figures are in the HTML, not only in a later fetch.
 *
 * The numbers are the whole competitive point of this page — the site currently holding
 * these results does so with figures — so leaving them to a client-side request would put
 * them behind the same JavaScript wall the rest of this plugin exists to get around.
 *
 * The build runs in CI with `VITE_API_BASE_URL` pointing at the deployed backend, so this
 * reaches it over the public internet. A local build usually has a relative base and no
 * backend, which is not an error: the section is skipped, the page ships with its prose,
 * and the browser fills the figures in. It is warned about loudly rather than silently,
 * because the same thing happening in CI means production shipped without them.
 */
async function fetchMarketStatistics(statisticsPath, log) {
  const base = (process.env.PRERENDER_STATS_URL || process.env.VITE_API_BASE_URL || '').trim()
  if (!base) {
    log('prerender: VITE_API_BASE_URL is not set, so the market page ships without figures')
    return null
  }
  if (!/^https?:\/\//.test(base)) {
    log(`prerender: VITE_API_BASE_URL ("${base}") is relative and cannot be fetched at build time`)
    return null
  }
  const url = process.env.PRERENDER_STATS_URL
    ? base
    : `${base.replace(/\/$/, '')}${statisticsPath}`
  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(15000)
    })
    if (!response.ok) {
      log(`prerender: ${url} answered ${response.status}; the market page ships without figures`)
      return null
    }
    return await response.json()
  } catch (error) {
    log(`prerender: could not reach ${url} (${error.message}); market page ships without figures`)
    return null
  }
}

/** The statistics section, from the same view model the Vue component renders. */
function statisticsBody(view) {
  if (!view) return ''

  const tiles = view.headline
    .map(
      (item) =>
        `<dt>${esc(item.label)}</dt>\n        <dd><strong>${esc(item.value)}</strong> — ${esc(item.note)}</dd>`
    )
    .join('\n        ')

  const tables = view.tables
    .map((table) => {
      const head = table.columns.map((column) => `<th scope="col">${esc(column)}</th>`).join('')
      const rows = table.rows
        .map(
          (row) =>
            `<tr><th scope="row">${esc(row[0])}</th>${row
              .slice(1)
              .map((cell) => `<td>${esc(cell)}</td>`)
              .join('')}</tr>`
        )
        .join('\n          ')
      return (
        `<table>\n        <caption>${esc(table.caption)}</caption>\n` +
        `        <thead><tr>${head}</tr></thead>\n        <tbody>\n          ${rows}\n        </tbody>\n      </table>`
      )
    })
    .join('\n      ')

  return `
      <h2>${esc(view.heading)}</h2>
      <p>${esc(view.standfirst)}</p>
      <p>Figures as of <time datetime="${esc(view.generatedOn)}">${esc(view.generatedOn)}</time>.</p>
      <dl>
        ${tiles}
      </dl>
      ${tables}
      <p>${esc(view.footnote)}</p>`
}

/** The market guide, rendered from the same module the Vue view renders. */
function marketBody(content, statisticsView) {
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
      ${statisticsBody(statisticsView)}
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
      const catalogues = {}
      for (const locale of ['en', 'am']) {
        const file = path.join(root, `src/i18n/locales/${locale}.json`)
        catalogues[locale] = makeTranslator(
          JSON.parse(await fs.readFile(file, 'utf8')),
          `${locale}.json`
        )
      }
      const t = catalogues.en

      const { seoByRouteName, amSeoByRouteName } = await import(
        pathToFileURL(path.join(root, 'src/router/routeSeo.js'))
      )
      const { MARKET_OVERVIEW, MARKET_OVERVIEW_PATH } = await import(
        pathToFileURL(path.join(root, 'src/features/marketplace/marketOverviewContent.js'))
      )
      const { buildMarketStatisticsView, MARKET_STATISTICS_SEED_KEY, MARKET_STATISTICS_PATH } =
        await import(
          pathToFileURL(path.join(root, 'src/features/marketplace/marketStatisticsView.js'))
        )
      const { buildExpoEventJsonLd, EXPO_EVENT_JSON_LD_ID } = await import(
        pathToFileURL(path.join(root, 'src/features/exhibition/eventDetails.js'))
      )

      // The expo's event markup, baked in rather than left to the client. Google can only
      // show event results for an event it can read, and the runtime injection happens
      // after hydration — on a page whose whole point is that a crawler reads it without
      // running JavaScript. `url` is always the English canonical: /am is a translation of
      // the same event, not a second one.
      // Two cards. The expo pages sell a dated event; the marketplace pages sell listings, and
      // sharing a property search should not advertise a trade show in November.
      const EXPO_CARD = {
        url: `${SITE_URL}/images/branding/ethio-build-connect-share-card.png`,
        alt: 'Ethiopia Real Estate Expo and Construction Exhibition, 16-18 November 2026, Addis Convention Center, Addis Ababa'
      }
      const MARKETPLACE_CARD = {
        url: `${SITE_URL}/images/branding/ethio-build-connect-marketplace-card.png`,
        alt: 'Ethio Build Connect - property listings, developers, contractors and suppliers across Ethiopia'
      }

      const expoEventJsonLd = (translate) =>
        buildExpoEventJsonLd({
          url: `${SITE_URL}/`,
          description: translate('exhibition.hero.subtitle'),
          image: `${SITE_URL}/images/branding/ethio-build-connect-banner.png`
        })

      const statistics = await fetchMarketStatistics(MARKET_STATISTICS_PATH, (message) =>
        this.warn(message)
      )
      const statisticsView = statistics ? buildMarketStatisticsView(statistics) : null

      const shell = await fs.readFile(path.join(outDir, 'index.html'), 'utf8')

      // Home and the expo page in both languages. The alternates are reciprocal, which is
      // what hreflang requires: each edition names the other and itself.
      const expoAlternates = { en: '/', am: '/am' }
      const pages = [
        // `/` and `/exhibition` render the same view, and `/exhibition` canonicalises to
        // `/` — so both get the same body and both name `/` as canonical.
        { file: 'home.html', routeName: 'Home', canonical: '/', body: expoBody(t),
          alternates: expoAlternates, jsonLd: expoEventJsonLd(t) },
        { file: 'exhibition.html', routeName: 'ExhibitionLanding', canonical: '/', body: expoBody(t),
          alternates: expoAlternates, jsonLd: expoEventJsonLd(t) },
        // The Amharic edition. Only the expo pages are prerendered in Amharic: they are
        // the only marketing pages whose copy is genuinely translated. The market guide
        // is English by design, so it has no `/am` edition to bake.
        { file: 'am-home.html', routeName: 'Home', canonical: '/am', locale: 'am',
          body: expoBody(catalogues.am), alternates: expoAlternates,
          jsonLd: expoEventJsonLd(catalogues.am) },
        { file: 'am-exhibition.html', routeName: 'ExhibitionLanding', canonical: '/am', locale: 'am',
          body: expoBody(catalogues.am), alternates: expoAlternates,
          jsonLd: expoEventJsonLd(catalogues.am) },
        {
          file: 'ethiopia-real-estate-market.html',
          routeName: 'EthiopiaRealEstateMarket',
          canonical: MARKET_OVERVIEW_PATH,
          // No alternates: this page has no Amharic edition, and claiming one would point
          // hreflang at a page that is not a translation.
          body: marketBody(MARKET_OVERVIEW, statisticsView),
          // Handed to the page so Vue starts from these exact figures instead of blanking
          // the section until its own request lands.
          seed: statisticsView ? { [MARKET_STATISTICS_SEED_KEY]: statistics } : null
        },
        // The marketplace entry points. These carry no prerendered body on purpose: what they
        // show is live listings, and a baked body would be a page of property copy that is
        // wrong the moment it is served. They are here for their titles and their link
        // previews — without them a shared property search is served the SPA shell, which
        // describes the expo and shows the expo card.
        { file: 'real-estate.html', routeName: 'RealEstateSearch', canonical: '/real-estate',
          image: MARKETPLACE_CARD },
        { file: 'properties.html', routeName: 'Properties', canonical: '/properties',
          image: MARKETPLACE_CARD },
        { file: 'buildings.html', routeName: 'Buildings', canonical: '/buildings',
          image: MARKETPLACE_CARD }
      ]

      const dir = path.join(outDir, 'prerender')
      await fs.mkdir(dir, { recursive: true })

      for (const page of pages) {
        const locale = page.locale || 'en'
        const seo =
          locale === 'am' ? amSeoByRouteName[page.routeName] : seoByRouteName[page.routeName]
        if (!seo) {
          throw new Error(
            `prerender: no ${locale} SEO entry for "${page.routeName}" — a prerendered page ` +
              'must have a title in its own language, not its twin\'s'
          )
        }

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
        const card = page.image || EXPO_CARD
        for (const [attr, name, value] of [
          ['property', 'og:title', seo.title],
          ['property', 'og:description', seo.description],
          ['property', 'og:image', card.url],
          ['property', 'og:image:alt', card.alt],
          ['name', 'twitter:title', seo.title],
          ['name', 'twitter:description', seo.description],
          ['name', 'twitter:image', card.url],
          ['name', 'twitter:image:alt', card.alt]
        ]) {
          html = replaceOnce(
            html,
            new RegExp(`<meta ${attr}="${name}" content="[^"]*">`),
            `<meta ${attr}="${name}" content="${esc(value)}">`,
            `${name} meta`,
            page.file
          )
        }
        if (locale !== 'en') {
          html = replaceOnce(html, /<html lang="en">/, `<html lang="${esc(locale)}">`,
            'html lang attribute', page.file)
          // Link previews read og:locale, not <html lang>, so the two have to be kept in step
          // or an Amharic page is shared as an English one.
          html = replaceOnce(
            html,
            /<meta property="og:locale" content="[^"]*">/,
            '<meta property="og:locale" content="am_ET">',
            'og:locale meta',
            page.file
          )
          html = replaceOnce(
            html,
            /<meta property="og:locale:alternate" content="[^"]*">/,
            '<meta property="og:locale:alternate" content="en_US">',
            'og:locale:alternate meta',
            page.file
          )
        }
        const alternates = hreflangTags(page.alternates)
        if (alternates) {
          html = replaceOnce(html, /<title>/, `${alternates}\n    <title>`,
            'title tag to anchor the hreflang links to', page.file)
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
        if (page.jsonLd) {
          // `<` escaped so nothing inside the payload can close the script tag early.
          const json = JSON.stringify(page.jsonLd).replace(/</g, '\\u003c')
          html = replaceOnce(
            html,
            /<title>/,
            `<script type="application/ld+json" id="${esc(EXPO_EVENT_JSON_LD_ID)}">${json}</script>\n    <title>`,
            'title tag to anchor the event JSON-LD to',
            page.file
          )
        }
        if (page.seed) {
          const [key, value] = Object.entries(page.seed)[0]
          // `<` is escaped so a string inside the payload can never close this script tag.
          const json = JSON.stringify(value).replace(/</g, '\\u003c')
          html = replaceOnce(
            html,
            /<title>/,
            `<script>window[${JSON.stringify(key)}]=${json};</script>\n    <title>`,
            'title tag to anchor the statistics seed to',
            page.file
          )
        }

        if (page.body) {
          html = replaceOnce(
            html,
            /<div id="app"><\/div>/,
            `<div id="app">${PRERENDER_CSS}\n    <main class="pr">${page.body}\n    </main>\n    </div>`,
            'empty #app container',
            page.file
          )
        }

        await fs.writeFile(path.join(dir, page.file), html, 'utf8')
      }

      this.info?.(`prerendered ${pages.length} marketing pages into ${path.relative(root, dir)}/`)
    }
  }
}
