# Search visibility

How this site is set up to be found, what the code does automatically, and what only a
person can do. Written after an audit against the keywords the site is trying to win:
*Ethiopia real estate*, *Ethiopia real estate expo*, *Ethiopia real estate exhibition*,
*Ethiopia expo*, *Ethiopia exhibition*, *Ethiopia construction*, *Ethiopia construction
expo/exhibition*, *Ethiopia real estate market*, *real estate expo*, *real estate
exhibition*.

## Which URL owns which keyword

One page per intent, and only one. Two URLs chasing the same query split the links
between them and neither ranks.

| URL | Owns |
| --- | --- |
| `/` | Ethiopia real estate expo · Ethiopia real estate exhibition · Ethiopia construction expo · real estate expo · Ethiopia exhibition |
| `/ethiopia-real-estate-market` | Ethiopia real estate market |
| `/real-estate`, `/properties` | Addis Ababa real estate · Ethiopia property listings |
| `/marketplace/contractors` | Ethiopia construction · construction contractors Ethiopia |
| `/marketplace/suppliers` | Construction material suppliers Ethiopia |

The home page is the expo page — `/` renders `ExhibitionLandingView`, so its title and
`<h1>` describe the exhibition rather than the listings search.

### Alias URLs

`/exhibition` and `/marketplace/real-estate` render exactly the same views as `/` and
`/real-estate`. They stay reachable, but they are aliases, not pages:

- `meta.canonicalPath` in `src/router/index.js` makes the in-page `<link rel="canonical">`
  name the owner URL.
- `nginx.conf` has an exact-match block per alias emitting the same owner URL in the
  `Link: rel=canonical` header. Without it, `@spa` would echo the requested path back and
  the page would advertise two different canonicals, which makes a crawler discard both.
- `SitemapController` omits them.

Add an alias and all three have to agree. `SitemapControllerTest` fails if the sitemap
starts listing one.

## What the build does

`vite/prerender.js` writes `dist/prerender/{home,exhibition,ethiopia-real-estate-market}.html`
after each build: a copy of the built `index.html` with the route's title, description and
canonical substituted in and the page's real copy placed inside `#app`. nginx serves those
files for the matching URLs and falls back to `index.html`, so a build without the plugin
still works.

This exists because the app is client-rendered. Without it, the first response for any URL
is a shell containing no words, and the text only appears once a ~174 kB bundle has
downloaded and executed. Google does run JavaScript, but on a later pass.

Two rules when editing it:

- **The prerendered text must be text the rendered page also shows.** It is generated from
  `src/i18n/locales/en.json` and `marketOverviewContent.js` for that reason. Serving a
  crawler something a visitor does not get is cloaking, whether or not anyone meant it.
- **Never hide it.** No `display: none`, no `visibility: hidden`, no off-screen wrapper.
  Hidden text is discounted at best and read as keyword stuffing at worst. It is styled to
  be legible because a visitor on a slow connection genuinely reads it.

## Structured data

| Markup | Where |
| --- | --- |
| `Organization`, `WebSite` | `index.html` |
| `ExhibitionEvent` | `setExpoEventJsonLd` — expo landing only, torn down on leave |
| `FAQPage` | `ExhibitionFaqSection.vue` |
| `Article` | `EthiopiaRealEstateMarketView.vue` |
| `BreadcrumbList` | `setBreadcrumbJsonLd`, from the same array `Breadcrumbs.vue` renders |

Event markup is held to agreeing with the visible page, so the expo's dates and venue are
rendered in the hero from `exhibition.hero.dateVenue` — the same string
`eventDetails.js` is documented against. If the dates move, change both.

Nothing asserts a rating, a price or a date the page does not show. `buildAggregateRating`
returns `undefined` rather than a zero-count rating for exactly this reason.

## Statistics on the market guide

`/ethiopia-real-estate-market` publishes medians, quartiles, price per square metre and
inventory mix computed from live listings, served by `/api/v1/public/market-statistics`.

The presentation lives in `marketStatisticsView.js`, a plain module with no imports, because
both the Vue view and the build-time prerenderer render from it — same payload, same function,
so the baked figures and the live ones cannot disagree. The prerenderer fetches the endpoint
during the build (`VITE_API_BASE_URL`, or `PRERENDER_STATS_URL` to override) and seeds the
payload onto `window` so Vue starts from those exact numbers instead of blanking the section
until its own request lands. No backend at build time is not an error — the section is skipped
and the browser fills it in — but it is warned about loudly, because the same thing in CI means
production shipped without figures.

The rules on what may be published are in `MarketStatisticsService`; the short version is that
sale and rental are never pooled, medians never means, and any bucket under five priced
listings reports that it has too few rather than printing a number. Do not relax those to make
the page look fuller — the page's entire argument is that these numbers are trustworthy.

## Amharic has its own URLs

Amharic is served under `/am`; English stays unprefixed. Before this, the language was a
`localStorage` setting, so both shared one URL — only one could be indexed, and `hreflang`
could not be declared at all because there was no second address to point it at.

`src/i18n/localeRoutes.js` owns the rules. The router mirrors the whole route tree under
each prefix in `localizedRoutes()`, so a route added once exists in both languages.

**A mirrored route is `noindex` unless `amSeoByRouteName` has a real translated title for
it.** That is the safety catch: an English title under an Amharic URL is a page claiming
to be a translation it is not, and Google would index it as a duplicate of its twin. The
page still works for a visitor browsing in Amharic — it is simply not offered to search
engines as Amharic content. Deliberately excluded on those grounds: the market guide
(English by design), the three legal documents (English bodies), and the property,
building and organization detail pages (the same listing text under two URLs is a
duplicate, not a translation).

`hreflang` is emitted only where a page is genuinely indexable in both, and the set is
reciprocal — en, am and x-default on both editions, with x-default naming English. The two
prerendered expo pages carry it in their HTML so a crawler that runs no JavaScript still
learns the Amharic edition exists.

Two behaviours worth knowing before changing them:

- **The URL decides the language, never a stored preference.** Auto-redirecting a visitor
  to their remembered language would send Googlebot — which crawls as an anonymous US
  visitor — somewhere other than the URL it asked for, and would make a shared link open
  in a different language for the recipient than the sender.
- **Internal links are written unprefixed** (`to="/properties"`), and the router carries
  the prefix across in `beforeEach` so following one from inside `/am` does not drop the
  reader into English. The language switcher is the one navigation allowed to leave, and
  it is recognised by targeting precisely the current page's English twin.

Oromo and Arabic have no URL prefix on purpose: `src/i18n/index.js` serves them the English
catalogue, so giving them addresses would publish English pages claiming to be Oromo and
Arabic. They stay a display preference until someone translates them.

## The market guide is English-only

`marketOverviewContent.js` is prose, not interface strings, and it is not translated. The
query it answers is English, and machine-guessed Amharic at that length would be worse
than none. An Amharic edition wants a native writer and its own URL — see below.

## What the code cannot do

Everything above makes the site *eligible*. Ranking for a competitive term also needs:

1. **Search Console.** Submit `https://ethiobuildconnect.et/sitemap.xml`, then use
   URL Inspection → Request Indexing on `/` and `/ethiopia-real-estate-market` after
   deploying. Watch the Pages report for "Crawled - currently not indexed"; that is what
   caught the duplicate URLs in the first place.
2. **Links from other sites.** The single biggest remaining gap. `SEO-TARGETS.md` is the
   researched list — who holds each keyword's result page today, which aggregators and
   directories to list on, and which Ethiopian outlets have covered a real estate expo
   before. Read it before doing any outreach; it also records two things that are not SEO
   problems but were found while looking (a brand-name collision with an established
   competitor, and a possible venue clash in the same week).
3. **A Google Business Profile** for the Addis Ababa office, which is what puts the
   organisation in the map pack for local queries.
4. **Amharic translation.** The URLs exist now (see above), so the remaining work is
   content, not plumbing: the market guide and the three legal documents are English-only
   and are excluded from the Amharic index until a native writer translates them. Adding a
   page to `amSeoByRouteName` is what makes it eligible, so translate first, list second.
5. **Something to link to.** Exhibitor lists, floor plans, speaker sessions and post-event
   coverage are the pages other sites cite. The expo page invites registration; it does not
   yet publish an exhibitor list.
