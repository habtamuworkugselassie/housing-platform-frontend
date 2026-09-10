/**
 * Copy for the Ethiopia real estate market overview page (`/ethiopia-real-estate-market`).
 *
 * Kept as data, in one plain ESM module with no imports, for two reasons. The page is
 * long-form prose rather than interface strings, so it reads better as a document than
 * as forty i18n keys; and the build-time prerenderer (`vite/prerender.js`) imports this
 * same module to emit the crawlable HTML, so the text a search engine is served and the
 * text a visitor is served cannot drift apart.
 *
 * DELIBERATELY NO STATISTICS. Everything here describes how the market is structured —
 * who the participants are, how a purchase proceeds, what the constraints are — which is
 * durable and checkable. Prices, yields and growth rates would date within months, and
 * quoting a figure this page cannot source would be worse than omitting it. Where a
 * number would help, the page links to the platform's own live listings instead.
 *
 * English only, unlike the rest of the app. The queries this page answers are English
 * ("ethiopia real estate market"), and shipping machine-guessed Amharic prose of this
 * length would be worse than shipping none — an Amharic edition wants a native writer
 * and its own URL. See the note in `docs/SEO.md`.
 */

export const MARKET_OVERVIEW_PATH = '/ethiopia-real-estate-market'

export const MARKET_OVERVIEW = {
  h1: 'The Ethiopia real estate market',
  standfirst:
    'A practical guide to how property is built, financed, bought and rented in Ethiopia — who the participants are, where activity concentrates, and what to check before you commit.',
  sections: [
    {
      id: 'overview',
      heading: 'What the Ethiopian real estate market looks like',
      paragraphs: [
        'Ethiopia is urbanising quickly, and most formal real estate activity is concentrated in Addis Ababa, with secondary activity in regional cities such as Adama, Hawassa, Bahir Dar, Mekelle and Dire Dawa. Demand comes from three broad groups: households moving out of rented or family housing, the Ethiopian diaspora buying from abroad, and businesses looking for office, retail and warehouse space.',
        'Supply reaches the market through several channels at once. Private developers build apartment blocks and gated compounds for sale off-plan; individual owners sell or rent completed houses, often called betoch, through agents or by word of mouth; and government-led condominium programmes have delivered large volumes of housing allocated outside the open market. Because these channels operate under different rules, two apparently similar homes can carry very different paperwork and payment terms.',
        'The practical consequence for a buyer is that the market is fragmented rather than centralised. There is no single national listings register, so comparable pricing is hard to establish and the same unit may be advertised by several intermediaries at different prices.'
      ]
    },
    {
      id: 'participants',
      heading: 'Who operates in the market',
      paragraphs: [
        'A single completed building involves most of the following, and it is worth knowing which one you are actually dealing with:'
      ],
      list: [
        {
          term: 'Real estate developers',
          detail:
            'Design and build for sale, usually selling off-plan and collecting payment in instalments tied to construction milestones.'
        },
        {
          term: 'Agents and brokers',
          detail:
            'Match buyers and tenants to existing stock. Commission practice varies, so agree in writing who pays it and when.'
        },
        {
          term: 'Contractors',
          detail:
            'Execute construction under contract to a developer or a private owner, and are graded by the relevant authority according to the value of work they may undertake.'
        },
        {
          term: 'Consultants and architects',
          detail:
            'Produce the design and supervise the works. On a private build, an independent supervising consultant is the main protection against defective work.'
        },
        {
          term: 'Banks and financial institutions',
          detail:
            'Provide mortgages and construction finance, and hold the property as collateral until the loan is repaid.'
        },
        {
          term: 'Insurers',
          detail:
            'Cover the works during construction and the completed asset afterwards.'
        },
        {
          term: 'Material suppliers',
          detail:
            'Supply cement, reinforcement steel, aggregates, finishes and fittings — the input costs that move project budgets most.'
        }
      ]
    },
    {
      id: 'addis-ababa',
      heading: 'Where the activity is: Addis Ababa and beyond',
      paragraphs: [
        'Within Addis Ababa, demand and pricing differ sharply by location rather than by city average. Bole and the areas around the airport carry a premium for access and for proximity to embassies and offices. CMC, Ayat and Summit sit further out with more new apartment supply and lower prices per square metre. Kazanchis and the centre mix commercial redevelopment with older residential stock, while Lebu, Jemo and the south-west host much of the large-scale condominium supply.',
        'Two things move a location\'s value more than the building itself: road access and utilities. A finished unit on an unmade access road, or one waiting on a water and power connection, does not trade at the same price as an otherwise identical unit that is fully serviced. Corridor and road upgrades therefore reprice whole neighbourhoods, which is why buyers track infrastructure plans as closely as listings.'
      ]
    },
    {
      id: 'buying',
      heading: 'Buying and renting: what to check',
      paragraphs: [
        'Land in Ethiopia is state-owned and what changes hands is a leasehold interest plus the building on it. Verifying exactly what you are acquiring matters more here than the headline price.'
      ],
      list: [
        {
          term: 'Title and lease',
          detail:
            'Confirm the title deed and land-lease documentation at the relevant land administration office, and check that the seller is the registered holder and that the lease term and permitted use match your plans.'
        },
        {
          term: 'Permits',
          detail:
            'For anything under construction or recently completed, ask for the building permit and the occupancy certificate. A unit without an occupancy certificate is not finished in the eyes of the authorities, whatever it looks like.'
        },
        {
          term: 'Off-plan payment terms',
          detail:
            'Tie instalments to verified construction milestones rather than to dates, and establish in writing what happens if the project is delayed or the specification changes.'
        },
        {
          term: 'Encumbrances',
          detail:
            'Check whether the property is already mortgaged or subject to a court restriction before any money moves.'
        },
        {
          term: 'Rental agreements',
          detail:
            'Put the term, the rent-review basis, the deposit and the repair obligations in a written contract. Advance-payment expectations vary widely between landlords and are negotiable.'
        },
        {
          term: 'Diaspora purchases',
          detail:
            'Buying from abroad adds a power-of-attorney step and foreign-exchange rules to the process; both are worth settling with a lawyer and your bank before committing to a payment schedule.'
        }
      ]
    },
    {
      id: 'financing',
      heading: 'How purchases and projects get financed',
      paragraphs: [
        'Most residential purchases in Ethiopia are still equity-heavy: buyers assemble savings, family contributions and diaspora remittances, and finance the balance. Commercial banks offer mortgage products with a required deposit, a repayment term and the property itself as collateral, and they lend against their own valuation rather than the agreed price — so a valuation below the price leaves a gap the buyer must cover.',
        'Developers finance construction differently again, combining bank facilities with the off-plan instalments their buyers pay. That is why a developer\'s payment schedule is not merely an administrative detail: it is part of the project\'s funding, and a project that depends on it is exposed if sales slow.',
        'Compare offers on total cost over the full term rather than on the advertised rate alone, and confirm what happens to your instalment if the rate is variable.'
      ],
      links: [
        { label: 'Compare banks and financing partners', to: '/marketplace/banks' },
        { label: 'Insurance partners for property and construction', to: '/marketplace/insurance' }
      ]
    },
    {
      id: 'construction',
      heading: 'Construction costs and the supply chain',
      paragraphs: [
        'Building costs in Ethiopia are driven less by labour than by materials, and the materials that matter most — cement, reinforcement steel, finishes and fittings — are sensitive to import availability and foreign-exchange access. When those tighten, projects slow or specifications get quietly downgraded, which is one of the more common causes of off-plan delay.',
        'For anyone commissioning work, the defences are unglamorous and effective: a priced bill of quantities rather than a lump-sum handshake, an independent consultant supervising the works, retention held until defects are made good, and written agreement on who carries the risk of a material price rise.'
      ],
      links: [
        { label: 'Find construction contractors', to: '/marketplace/contractors' },
        { label: 'Find consultants and architects', to: '/marketplace/consultants-and-architects' },
        { label: 'Find construction material suppliers', to: '/marketplace/suppliers' },
        { label: 'Find finishing and interior specialists', to: '/marketplace/finishing-work' }
      ]
    },
    {
      id: 'live',
      heading: 'Current listings and companies',
      paragraphs: [
        'Rather than quote prices that would be out of date within a season, this page points at what is actually on the market now. Listings on Ethio Build Connect are published by registered companies and agents, and each one carries its own asking price, location and contact details.'
      ],
      links: [
        { label: 'Browse property listings in Ethiopia', to: '/properties' },
        { label: 'Search Addis Ababa real estate', to: '/real-estate' },
        { label: 'Browse buildings and developments', to: '/buildings' }
      ]
    },
    {
      id: 'expo',
      heading: 'Meeting the market in person',
      paragraphs: [
        'The whole chain described above — developers, contractors, architects, suppliers, banks and insurers — gathers at Ethio Build Connect Expo, Ethiopia\'s real estate and construction exhibition, on 16–18 November 2026 at the Addis Convention Center in Addis Ababa. It is the most efficient way to compare developers and suppliers side by side, and to ask the questions above of several of them in one afternoon.'
      ],
      links: [
        { label: 'Ethiopia Real Estate Expo and Construction Exhibition 2026', to: '/' }
      ]
    }
  ]
}
