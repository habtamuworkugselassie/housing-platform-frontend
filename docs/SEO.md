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
4. **Amharic URLs.** The locale currently lives in `localStorage`, so English and Amharic
   share one URL and there are no alternates to declare — `hreflang` cannot be used as
   things stand. Moving the locale into the path (`/am/...`) would make the Amharic content
   indexable in its own right. This is a real opportunity and a real piece of work.
5. **Something to link to.** Exhibitor lists, floor plans, speaker sessions and post-event
   coverage are the pages other sites cite. The expo page invites registration; it does not
   yet publish an exhibitor list.
