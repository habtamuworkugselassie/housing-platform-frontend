# Google Ads — expo campaign

Built for a nine-week run to the expo on **16–18 November 2026**. Paid search is here because
organic ranking for the competitive terms is a six-to-twelve month project and the event is not
waiting; see `SEO-TARGETS.md` for who holds those results and why. Switch this off on 19 November.

Every asset below is within Google's character limits (headline 30, description 90, callout 25,
sitelink text 25, sitelink description 35), checked rather than eyeballed. Paste them as they are.

## Before you spend anything: turn on conversion tracking

Without it you cannot tell which keyword produced a registration, and Google cannot optimise.
The event already exists — `register_interest`, fired by both interest forms with an
`interest_type` of visitor, exhibitor or partner.

1. Google Ads → Tools → Data manager → link the GA4 property.
2. Goals → Conversions → import `register_interest` from GA4.
3. Mark it **Primary**. Leave everything else secondary.
4. Because the event carries `interest_type`, segment by it: an exhibitor registration is worth
   far more than a visitor one and should be allowed a much higher cost per conversion.

**Known gap, and a decision to make.** The cookie banner blocks Google Analytics until a visitor
accepts, so conversions from anyone who declines are invisible. That is correct privacy behaviour
and it undercounts your ads. Google Consent Mode v2 is the standard answer — on denial it sends
cookieless pings so conversions can be modelled instead of lost. It is a real trade-off, not a
free win: something is then sent for visitors who declined, and the cookie policy would have to be
corrected, because today it says the script is never fetched at all. Decide deliberately.

## Campaign structure

Three campaigns, because the intents have different values and should not share a budget.

### 1. Expo — visitors (Search, Ethiopia)

| Ad group | Keywords (phrase match unless noted) |
| --- | --- |
| Real estate expo | "real estate expo ethiopia", "real estate exhibition ethiopia", "real estate expo addis ababa", [ethiopia real estate exhibition], "property expo ethiopia", "home expo addis ababa" |
| Construction expo | "construction expo ethiopia", "construction exhibition ethiopia", "building expo addis ababa", "building exhibition ethiopia" |
| Expo in Addis | "expo addis ababa", "exhibition addis ababa november", "trade show addis ababa" |

### 2. Expo — exhibitors and sponsors (Search, Ethiopia + UAE, Turkey, China)

Smaller volume, much higher value. Give it its own budget so visitor clicks cannot eat it.

Keywords: "exhibit in ethiopia", "trade show stand addis ababa", "exhibition booth ethiopia",
"sponsor expo ethiopia", "exhibit real estate expo", "trade fair ethiopia 2026".

### 3. Brand defence (Search, Ethiopia, tiny budget)

Keywords: [ethio build connect], [ethiobuildconnect], "ethio build connect expo".

Cheap, and it stops a competitor bidding on your name. It also matters more than usual here:
the name collides with Inexpo's **Ethiopia Build Expo**, so people searching for you may be one
letter from someone else's ad.

## Negative keywords (apply at account level)

Without these you will pay for the wrong country, the wrong event and job seekers.

```
free, jobs, job, vacancy, vacancies, salary, recruitment, internship,
download, pdf, template, wikipedia, images, wallpaper, meaning, definition,
kenya, nigeria, tanzania, uganda, rwanda, ghana, egypt, south africa,
dubai, uae, qatar, saudi, london, uk, usa, america, canada, china, turkey,
2023, 2024, 2025
```

Two of those are specific and deliberate. **dubai** — there is a "Dubai Real Estate Expo in
Ethiopia" that will otherwise soak up your budget. **london** — Ethio Home-Expo 2026 is a London
event for the diaspora. Neither is your audience.

Exclude `dubai`, `uae`, `turkey`, `china` from campaign 1 only; campaign 2 wants them, because
that is where exhibitors and suppliers are.

## Ad copy

Load all fifteen headlines and all four descriptions into one responsive search ad per ad group
and let Google combine them. Pin nothing except the date — that is the one thing every
impression should carry.

**Headlines**

```
Ethiopia Real Estate Expo      16-18 November 2026            Addis Convention Center
Ethio Build Connect Expo       Real Estate & Construction     Register Your Interest
Meet Developers & Builders     Book Your Stand                Exhibit at the Expo
Register to Visit              Addis Ababa, Ethiopia          Property, Finance, Building
Banks, Builders, Suppliers     Ethiopia's Building Show       Three Days in Addis Ababa
```

**Descriptions**

```
Ethiopia's real estate and construction exhibition, 16-18 November 2026 in Addis Ababa.
Meet developers, contractors, banks and suppliers under one roof. Register your interest.
Showcase your projects to buyers and investors. Ask about exhibiting or sponsoring.
Three days at the Addis Convention Center. Register your interest in a few minutes.
```

Note what is *not* claimed: no exhibitor counts, no visitor numbers, no "free entry". Google
requires ad claims to be substantiated on the landing page, and the site does not state any of
those. Add them to the copy only once the page says them.

**Callouts:** `16-18 November 2026` · `Addis Convention Center` · `Verified companies` ·
`English & Amharic`

**Sitelinks**

| Text | Description 1 | Description 2 | URL |
| --- | --- | --- | --- |
| Register Interest | Visitor, exhibitor or partner | Takes about two minutes | `/register-interest` |
| Property Listings | Browse verified listings | Prices, photos and contacts | `/properties` |
| Contractors | Find construction partners | Contractors and consultants | `/marketplace/contractors` |
| Market Guide | Ethiopia real estate market | Asking prices and supply | `/ethiopia-real-estate-market` |

## Amharic ads

The site now serves Amharic at its own URLs, so Amharic ads have somewhere to land. Run these as a
separate ad group pointing at `/am`, so performance is measurable on its own.

**Headlines:** `የኢትዮጵያ የሪል እስቴት ኤክስፖ` · `16-18 ኖቬምበር 2026` · `ፍላጎትዎን ይመዝግቡ` · `አዲስ ኮንቬንሽን ማእከል`

**Description:** `የኢትዮጵያ የሪል እስቴት ኤክስፖ እና የግንባታ ኤግዚቢሽን። 16-18 ኖቬምበር 2026፣ አዲስ አበባ።`

Every word is taken from the site's own Amharic catalogue, where a translator wrote it. **Have a
native speaker read it before spending money on it** — ad copy is not the place to discover a
wording problem.

## Landing pages

| Campaign | Send to |
| --- | --- |
| Visitors | `/` — already the expo page, with the registration form on it |
| Exhibitors | `/register-interest` — the standalone form, no site chrome to distract |
| Brand | `/` |
| Amharic | `/am` |

Do not build a separate landing page for this. `/` is prerendered, loads its content without
waiting for JavaScript, and carries the registration form — which is what a landing page is for.

## Budget and bidding

No cost-per-click figures here on purpose: reliable Ethiopian CPC data is not something this
document can source, and a made-up number would anchor you wrongly. Let the auction tell you.

- **Start on Manual CPC or Maximise Clicks with a cap.** Smart Bidding needs roughly 30
  conversions a month to work; you will not have that in week one, and it will spend badly.
- **Switch to Maximise Conversions once you clear ~30/month**, not before.
- Split budget roughly 50 visitors / 35 exhibitors / 15 brand to begin with, then move money
  toward whichever produces registrations.
- **Check the search terms report every second day for the first fortnight.** That is where the
  real negative keywords come from — the ones above are only the predictable half.
- Raise budgets in the final three weeks, when intent peaks, rather than spreading evenly.

## Targeting

- **Location:** Ethiopia. Set "Presence: people in your targeted locations", *not* the default
  "presence or interest", or you will pay for people abroad reading about Ethiopia.
- **Diaspora, from week three if budget allows:** a separate campaign for USA, UK, UAE, Saudi
  Arabia, Canada and Israel with buying-focused copy. Diaspora buyers are a real segment — an
  entire competing expo is aimed at them — but they need different wording, not a location bolt-on.
- **Schedule:** all week. Ethiopian business hours skew the mornings; check the hour report after
  ten days and trim what does not convert.

## What to watch

Week one is for eliminating waste, not for results. Judge on:

1. **Search terms report** — is the traffic your audience? Add negatives.
2. **Cost per registration**, split by `interest_type`. Exhibitors justify far more than visitors.
3. **Impression share lost to budget** — if it is high on the exhibitor campaign, move money there.

Do not judge on clicks or impressions. The number that matters is registrations, and you can only
see it if the conversion import above is done first.
