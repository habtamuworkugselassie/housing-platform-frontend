/**
 * Per-route title and meta description, keyed by route name.
 *
 * Kept in its own module with no imports so the build-time prerenderer
 * (`vite/prerender.js`) can import it directly under Node. The `<title>` baked into a
 * prerendered page and the one the router sets on navigation then come from the same
 * place; when they were separate, a crawler and a visitor could be told two different
 * things about the same URL.
 */
export const defaultSeo = {
  title: 'Ethio Build Connect - Ethiopia Real Estate and Construction Marketplace',
  description:
    'Find Addis Ababa real estate, betoch, apartments, developers, contractors, and suppliers in one Ethiopia marketplace.'
}

export const seoByRouteName = {
  // The home page renders the expo landing view, so its title describes the expo. It
  // used to promise "Addis Ababa Real Estate, Betoch and Construction" — a listings
  // page — while the page a searcher landed on was the exhibition, and the two
  // exhibition keywords people actually search ("expo" and "exhibition" are separate
  // queries) sat on /exhibition, a URL that now folds into this one. No brand suffix:
  // the WebSite/Organization markup already names the site and Google appends it for a
  // home page, so the 58 characters go to the keywords instead of repeating it.
  Home: {
    title: 'Ethiopia Real Estate Expo and Construction Exhibition 2026',
    description:
      "Ethiopia's real estate and construction expo: 16-18 November 2026 at the Addis Convention Center, Addis Ababa. See exhibitors, sponsors and property listings."
  },
  EthiopiaRealEstateMarket: {
    title: 'Ethiopia Real Estate Market Overview - Prices, Demand and Outlook',
    description:
      'How the Ethiopian real estate market works: Addis Ababa demand, pricing, financing, construction costs, and who builds and sells. Updated for 2026.'
  },
  RealEstateSearch: {
    title: 'Addis Ababa Real Estate Listings - Ethio Build Connect',
    description:
      'Browse Ethiopia property listings including houses, apartments, and betoch in Addis Ababa.'
  },
  MarketplaceRealEstate: {
    title: 'Ethiopia Real Estate Marketplace - Ethio Build Connect',
    description:
      'Discover verified real estate opportunities, developers, and agents across Ethiopia.'
  },
  MarketplaceBanks: {
    title: 'Banks and Financing Partners in Ethiopia - Ethio Build Connect',
    description:
      'Find banks and financing partners for property and construction projects in Addis Ababa and Ethiopia.'
  },
  MarketplaceInsurance: {
    title: 'Insurance Partners for Property and Construction - Ethio Build Connect',
    description:
      'Connect with insurance providers for real estate and construction coverage in Ethiopia.'
  },
  MarketplaceContractors: {
    title: 'Construction Contractors in Ethiopia - Ethio Build Connect',
    description:
      'Find construction contractors and project partners for residential and commercial development.'
  },
  MarketplaceConsultantsArchitects: {
    title: 'Consultants and Architects in Ethiopia - Ethio Build Connect',
    description:
      'Hire architects, engineers, and consultants for design and project delivery in Ethiopia.'
  },
  MarketplaceSuppliers: {
    title: 'Construction Material Suppliers in Ethiopia - Ethio Build Connect',
    description:
      'Connect with trusted construction suppliers and material partners in Addis Ababa and beyond.'
  },
  MarketplaceFinishingWork: {
    title: 'Finishing and Interior Work in Ethiopia - Ethio Build Connect',
    description:
      'Find finishing contractors and interior specialists for homes and commercial spaces in Ethiopia.'
  },
  Properties: {
    title: 'Property Listings Ethiopia - Houses, Betoch and Apartments',
    description:
      'Explore verified property listings in Ethiopia, including Addis Ababa houses and apartments.'
  },
  PropertyDetails: {
    title: 'Property Details - Ethio Build Connect',
    description:
      'View complete property information, media, and location insights on Ethio Build Connect.'
  },
  Buildings: {
    title: 'Residential and Commercial Buildings in Ethiopia - Ethio Build Connect',
    description:
      'Browse buildings, developments, and multi-unit projects listed on Ethio Build Connect in Ethiopia.'
  },
  BuildingDetails: {
    title: 'Building Details - Ethio Build Connect',
    description:
      'View building information, units, location, and financing options on Ethio Build Connect.'
  },
  OrganizationDetail: {
    title: 'Organization Profile - Ethio Build Connect',
    description:
      'View company details, contact information, and listings on Ethio Build Connect.'
  },
  // Identical to Home on purpose: this route renders the same component and
  // canonicalises to `/`, so describing it differently would advertise two pages
  // where there is one.
  ExhibitionLanding: {
    title: 'Ethiopia Real Estate Expo and Construction Exhibition 2026',
    description:
      "Ethiopia's real estate and construction expo: 16-18 November 2026 at the Addis Convention Center, Addis Ababa. See exhibitors, sponsors and property listings."
  },
  Register: {
    title: 'Create Account - Ethio Build Connect',
    description: 'Register for Ethio Build Connect to list properties and access the marketplace.'
  },
  RegisterInterest: {
    title: 'Register Interest - Ethio Build Connect',
    description: 'Register your interest for the Ethiopia Property and Construction Expo.'
  },
  Login: {
    title: 'Sign In - Ethio Build Connect',
    description: 'Sign in to your Ethio Build Connect account.'
  },
  ForgotPassword: {
    title: 'Forgot Password - Ethio Build Connect',
    description: 'Reset your Ethio Build Connect account password.'
  },
  ResetPassword: {
    title: 'Reset Password - Ethio Build Connect',
    description: 'Set a new password for your Ethio Build Connect account.'
  },
  PrivacyPolicy: {
    title: 'Privacy Policy - Ethio Build Connect',
    description:
      'How Ethio Build Connect collects, uses, and protects your information on our website and mobile apps.'
  },
  TermsOfUse: {
    title: 'Terms of Use - Ethio Build Connect',
    description:
      'Terms and conditions for using Ethio Build Connect marketplace, listings, and related services.'
  },
  CookiePolicy: {
    title: 'Cookie Policy - Ethio Build Connect',
    description:
      'What Ethio Build Connect stores in your browser, which third parties set cookies on the site, and how to turn any of it off.'
  },
  LegalHub: {
    title: 'Legal - Ethio Build Connect',
    description: 'Privacy policy and terms of use for Ethio Build Connect.'
  },
  ThankYou: {
    title: 'Thank You - Ethio Build Connect',
    description: 'Your expo registration has been received by Ethio Build Connect.'
  },
  NotFound: {
    title: 'Page Not Found - Ethio Build Connect',
    description:
      'This page could not be found. Browse Ethiopia property listings, the construction marketplace, and the Ethio Build Connect expo.'
  }
}

/**
 * Amharic titles and descriptions, for the `/am` tree.
 *
 * Only the routes listed here are indexable in Amharic. The router marks every other
 * `/am` route `noindex`, which is the point: an English title under an Amharic URL is a
 * page claiming to be a translation it is not, and it would be indexed as a duplicate of
 * its English twin. Adding a route here is what makes it eligible, so add one only when
 * the page is genuinely Amharic.
 *
 * Every string below is lifted from `am.json`, where a translator wrote it — the nav
 * labels, the two home headlines, the expo description. Nothing here is newly composed
 * prose. If a page needs wording that does not already exist in the catalogue, it wants a
 * translator, not this file.
 *
 * Deliberately absent, because their bodies are English whatever the interface language:
 * the market guide (English-only by design, see marketOverviewContent.js) and the three
 * legal documents. Also absent: the property, building and organization detail pages,
 * whose content is whatever the listing company typed — the same text under two URLs is a
 * duplicate, not a translation, so Amharic serves them without being indexed.
 */
export const amSeoByRouteName = {
  Home: {
    title: 'የኢትዮጵያ የሪል እስቴት ኤክስፖ እና የግንባታ ኤግዚቢሽን 2026',
    description:
      '16–18 ኖቬምበር 2026፣ በአዲስ ኮንቬንሽን ማእከል፣ አዲስ አበባ። የንብረት ኩባንያዎች፣ ተቋራጮች፣ አቅራቢዎች እና ኮንሳልታንቶች ፕሮጀክቶቻቸውን ለገዢዎች፣ ባለሃብቶች እና አጋሮች የሚያሳዩበት መድረክ።'
  },
  ExhibitionLanding: {
    title: 'የኢትዮጵያ የሪል እስቴት ኤክስፖ እና የግንባታ ኤግዚቢሽን 2026',
    description:
      '16–18 ኖቬምበር 2026፣ በአዲስ ኮንቬንሽን ማእከል፣ አዲስ አበባ። የንብረት ኩባንያዎች፣ ተቋራጮች፣ አቅራቢዎች እና ኮንሳልታንቶች ፕሮጀክቶቻቸውን ለገዢዎች፣ ባለሃብቶች እና አጋሮች የሚያሳዩበት መድረክ።'
  },
  RealEstateSearch: {
    title: 'በኢትዮጵያ ቀጣዩን ቤትዎን ይፈልጉ',
    description:
      'በአዲስ አበባ እና በሌሎች ከተማዎች ፈቃድ ካላቸው የሪል እስቴት ኩባንያዎች፣ ባንኮች እና ግንበኞች የተረጋገጡ ዝርዝሮችን ይፈልጉ።'
  },
  MarketplaceRealEstate: {
    title: 'በኢትዮጵያ ቀጣዩን ቤትዎን ይፈልጉ',
    description:
      'በአዲስ አበባ እና በሌሎች ከተማዎች ፈቃድ ካላቸው የሪል እስቴት ኩባንያዎች፣ ባንኮች እና ግንበኞች የተረጋገጡ ዝርዝሮችን ይፈልጉ።'
  },
  Properties: {
    title: 'ንብረቶች እና ሕንፃዎች',
    description:
      'በአዲስ አበባ እና በሌሎች ከተማዎች ፈቃድ ካላቸው የሪል እስቴት ኩባንያዎች፣ ባንኮች እና ግንበኞች የተረጋገጡ ዝርዝሮችን ይፈልጉ።'
  },
  Buildings: {
    title: 'ሕንፃዎች',
    description: 'በኢትዮጵያ የሚገኙ ሕንፃዎችን እና ፕሮጀክቶችን ይመልከቱ።'
  },
  MarketplaceBanks: {
    title: 'ባንኮች',
    description: 'ለንብረት እና ለግንባታ ፕሮጀክቶች ባንኮችን እና የፋይናንስ አጋሮችን ያግኙ።'
  },
  MarketplaceInsurance: {
    title: 'ኢንሹራንስ',
    description: 'ለንብረት እና ለግንባታ የኢንሹራንስ አገልግሎት ሰጪዎችን ያግኙ።'
  },
  MarketplaceContractors: {
    title: 'ኮንትራክተሮች',
    description: 'በኢትዮጵያ የግንባታ ኮንትራክተሮችን እና ተቋራጮችን ያግኙ።'
  },
  MarketplaceConsultantsArchitects: {
    title: 'ጠባቂዎች እና ሀንደበት ባለሙያዎች',
    description: 'በኢትዮጵያ አርኪቴክቶችን፣ መሐንዲሶችን እና ኮንሳልታንቶችን ያግኙ።'
  },
  MarketplaceSuppliers: {
    title: 'የግንባታ ቁሳቁስ አቅራቢዎች',
    description: 'በአዲስ አበባ እና በኢትዮጵያ የግንባታ ቁሳቁስ አቅራቢዎችን ያግኙ።'
  },
  MarketplaceFinishingWork: {
    title: 'የመጨረሻ ስራ',
    description: 'በኢትዮጵያ የመጨረሻ ስራ ተቋራጮችን እና የውስጥ ማስዋቢያ ባለሙያዎችን ያግኙ።'
  }
}
