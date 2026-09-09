# Backlink and outreach targets

A researched target list for the eleven keywords in `SEO.md`, built by searching each one
and recording who actually holds the results. Companion to `SEO.md`, which covers what the
code does; this file covers the part only a person can do.

## How to read this, and what it is not

Searches were run in **September 2026 against a US-based index**. Google localises heavily,
so a searcher in Addis Ababa sees a different page — more Ethiopian domains, fewer
international ones. Treat the lists below as the *shape* of each result page and spot-check
the ones you care about from an Ethiopian connection before spending real effort.

Two other limits worth stating: several aggregator listings gave **conflicting dates** for
the same competing event, so no competitor date here should be trusted without checking the
organiser's own site; and submission policy and cost were not checked for any directory —
some are free, some charge for anything above a basic listing.

## What each keyword's result page actually looks like

| Keyword | Who holds it now | Verdict |
| --- | --- | --- |
| Ethiopia real estate expo | A Facebook page, press articles, ET Real Estate & Home Expo, Addis Africa | **Winnable.** No dedicated event site dominates — press coverage and a Facebook page hold this page |
| Ethiopia real estate exhibition | Same, plus alladdisevents.com and a ministry press release | **Winnable**, same reason |
| Ethiopia expo | 10times, EventsEye, Exposale, TradeFairDates, Neventum, the two chambers | **Join, don't fight.** These are aggregators; the win is being listed *on* them |
| Ethiopia exhibition | Same aggregator set | Same |
| Ethiopia construction expo | Big 5 Construct Ethiopia, BUILDEXPO Africa, Ethiopia Build Expo | **Hard.** Funded international organisers on dedicated domains |
| Ethiopia construction exhibition | Same | **Hard** |
| Ethiopia construction | AddisBiz, ethiopianconstruction.com, Dun & Bradstreet, ZoomInfo, allaboutETHIO, 2merkato | **Directory layer.** Get listed; you will not outrank D&B |
| Ethiopia real estate | jiji.com.et, Ethiopia Property Centre, Living Ethio, Temer, Noah, Metropolitan | **Long game.** Established marketplaces with years of accumulated links |
| Ethiopia real estate market | theafricanvestor.com holds roughly six of the top ten | **Beatable — see Finding 1** |
| real estate expo | EXPO REAL Munich, NAR NXT, Florida Realtors, NYC Real Estate Expo | **Not winnable globally.** Geo-local only |
| real estate exhibition | Same | **Not winnable globally** |

The two bare terms are worth being blunt about: they are held by events with decades of
history and enormous link profiles. You will show up for them for searchers *in Ethiopia*,
because Google localises, and that is the whole of the realistic upside. Spend the effort on
"Ethiopia real estate expo" instead, which is genuinely open.

## Three findings that should change what you do

### 1. The market page is losing to numbers, and you have better numbers than the winner

> **Built.** `/api/v1/public/market-statistics` and the statistics section on
> `/ethiopia-real-estate-market` implement this. What remains is the sub-city field described
> at the end of this section.

`theafricanvestor.com` does not hold "Ethiopia real estate market" with one page. It holds it
with a cluster of six: Ethiopia market analysis, Addis market analysis, Ethiopia housing
prices, Addis housing prices, Ethiopia price forecasts, Addis price forecasts. Every one of
them leads with figures — median price, price per square metre by area, inventory mix by
property type, twelve-month forecasts.

`/ethiopia-real-estate-market` deliberately ships no statistics, on the grounds that quoting
a figure the page cannot source is worse than omitting it. That reasoning was about
*unsourced* numbers and it still stands. But it does not apply to **your own listings
database**, which is a source — and a better one than a foreign blog aggregating public
estimates.

Publishing computed, auto-updating statistics from live listings would be the strongest
single content move available:

- Median and range of asking price by sub-city (Bole, CMC, Ayat, Summit, Lebu, Kazanchis…)
- ETB per square metre by area and by property type
- Inventory mix — apartments vs condominiums vs villas vs standalone
- Count of active listings and how it has moved

Every figure sourced to your own platform, dated, and correct the day it is read. That is
something no competitor can copy, and it is exactly the kind of page other sites cite.

**What shipped, and the one gap.** Median and quartile asking prices, price per square metre,
and the inventory mix are live, split for sale and rental, with any bucket under five priced
listings reporting "too few listings" rather than a number. The figures are baked into the
prerendered HTML at build time, so a crawler reads them without running JavaScript.

Two things are deliberately *not* published, and both are fixable in the product rather than
the page:

- **No breakdown by sub-city.** Properties carry a free-text `city` and no sub-city column at
  all, so the finest honest grouping is city level. Bole, CMC, Ayat and Lebu are exactly what a
  searcher wants and exactly what the competitor publishes. Adding a normalised sub-city field
  to listings would unlock that table — and would fix listing search at the same time, since
  `PublicSupportChatService` already carries a workaround telling users to search inside listing
  titles because no neighbourhood filter exists. This is the highest-value follow-up on the page.
- **No rental prices.** Listings record a price but no rental period, so a rental median could
  be pooling monthly and annual asking rents. Rental counts are shown; rental prices wait for a
  period field.

### 2. Your brand name collides with an established competitor's

**Ethio Build Connect Expo** and **Ethiopia Build Expo** are one letter and one word apart.
Ethiopia Build Expo is run by Inexpo Group, is listed across the aggregators, and describes
itself as the largest annual building and construction trade event in the country.

This matters beyond SEO. Google will conflate the two, aggregators may file you under the
wrong entity, and searchers looking for you will land on them. There is no code fix. The
practical mitigations are to always publish the full name with the organiser attached, to be
consistent about it everywhere (site, directories, press, sponsor links), and to make the
dates and venue part of how the event is identified in every listing.

### 3. A likely clash in the same week, at possibly the same venue

Multiple independent listings put **Ethiopia Build Expo 2026 on 16–18 November 2026 at the
Addis International Convention Center** — three days after yours ends. Two more events, the
Ethiopia Food Expo and the Ethiopia Medical & Health Expo, are listed at the same venue on
14–16 November.

`eventDetails.js` gives your venue as "Addis Convention Center". Whether that is the same
building as the Addis International Convention Center is not something the search results
settle. **Worth confirming with your venue contract this week** — if it is the same building,
you are looking at back-to-back load-in against a larger event with a near-identical name,
which is an exhibitor-recruitment and logistics problem long before it is an SEO one.

## The target list, in the order I would work it

### Tier 1 — Aggregators that already rank for your keywords

These hold the "Ethiopia expo" and "Ethiopia exhibition" pages outright. A listing is
usually a free form, takes a few hours in total for all of them, and returns both a link and
direct referral traffic from people browsing Ethiopian trade shows.

| Site | Where to list |
| --- | --- |
| 10times | `10times.com/ethiopia/tradeshows` — also has a real-estate category per country |
| EventsEye | `eventseye.com/fairs/c1_trade-shows_ethiopia.html` |
| Exposale | `exposale.net/en/exhibitions/all/all/738` |
| TradeIndia Trade Shows | `tradeindia.com/tradeshows/country/ethiopia/` |
| Neventum | `neventum.com/tradeshows/ethiopia` |
| TradeFairDates | `tradefairdates.com/Addis-Ababa-X8-S1-Fairs-Addis-Ababa.html` |
| All Addis Events | `alladdisevents.com` — local, and already ranks for "Ethiopia real estate exhibition" |
| Eventbrite | Ranks for expo queries and gives you a registration surface as well |

Use the identical event name, dates, venue and URL on every one. Inconsistent details across
directories is what causes the entity confusion in Finding 2.

### Tier 2 — Ethiopian business directories

Local domains that hold the "Ethiopia construction" result page. List the *platform*, not the
event, in these.

- AddisBiz — `addisbiz.com/business-directory/construction`
- Ethiopian Construction — `ethiopianconstruction.com`
- allaboutETHIO business directory — `allaboutethio.com`
- 2merkato — `2merkato.com/directory/`
- East Africa Tenders — `eastafricatenders.com/ethiopia-businesses/category/construction/`

### Tier 3 — Institutional

Higher authority, slower, usually needs a relationship or membership.

- **Addis Ababa Chamber of Commerce** — `tradefair.addischamber.com`, plus member directory
- **Ethiopian Chamber of Commerce** — `event.ethiopianchamber.com`
- **Ministry of Urban and Infrastructure** — `mui.gov.et` publishes press releases about real
  estate expos; a competitor already has one
- **Your venue's own events page** — venues list their upcoming events, and this is one of the
  easiest links you will ever get. Ask when you confirm Finding 3

### Tier 4 — Press that demonstrably covers this exact beat

Every one of these has published on an Ethiopian real estate expo before, which is far better
qualification than a generic media list.

| Outlet | Evidence |
| --- | --- |
| Capital Ethiopia | Covered the 7th ET Real Estate & Home Expo, and East African housing policy |
| Ethiopian Business Review | Covered the Ethiopia Real Estate and Home Expo |
| Tadias Magazine | Covered the same expo — also reaches the diaspora, who are a buyer segment |
| New Business Ethiopia | Maintains a "real estate expo" tag page |
| Pulse of Africa | Covered Ethiopia's largest construction exhibition |
| Ethiopian Real Estate News | `ethiorealestate.com` — sector-specific |
| Tewedaje Media | Covered the Addis Africa exhibition |

Pitch a story, not an announcement. What these outlets published before was *the event as
industry news* — who is exhibiting, what it says about the sector. The market statistics from
Finding 1 would give a journalist something to quote, which is what actually earns coverage.

### Tier 5 — Reciprocal, and the easiest yes you will get

Every sponsor and exhibitor has a website with an "events" or "news" page. They have already
agreed to be associated with you. Send a ready-made snippet — anchor text, URL, logo — so
linking back takes them thirty seconds.

The developer and construction companies that already rank for your keywords are also your
exhibitor pipeline: Temer Properties, Noah Real Estate, Metropolitan, Ambassador, and the
larger contractors (MIDROC, Sur, Yencomad). Recruiting them as exhibitors and getting the
link are the same conversation.

## Suggested order

1. **This week** — confirm the venue and date question in Finding 3.
2. **Week 1** — Tier 1 listings, all of them, in one sitting. Highest return per hour available.
3. **Week 1** — record the Search Console baseline before any of this lands, or you will not
   be able to tell what worked.
4. **Weeks 2–3** — Tier 2 and Tier 5. Tier 5 while exhibitor conversations are already open.
5. **Weeks 3–4** — build the statistics from Finding 1. It is what makes Tier 4 worth pitching.
6. **Week 4 onward** — Tier 4 and Tier 3, with the statistics as the hook.

## The acceptance test

Search `Ethio Build Connect` today and the pages that surface are `/privacy` and two
`/organizations/{uuid}` URLs — not the home page. The `/privacy` result even shows the
site-wide description from the shell rather than its own title, which is what Google indexing
a pre-JavaScript shell looks like from the outside.

That is direct confirmation that the canonical and prerendering work in `SEO.md` was aimed at
a real problem. Re-run the same search about four weeks after deploying. The home page ranking
first for your own brand is the signal that indexing is fixed; until that happens, none of the
keyword work above can land.
