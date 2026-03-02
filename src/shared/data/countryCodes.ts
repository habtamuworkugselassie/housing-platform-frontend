/**
 * Common country calling codes for phone inputs.
 * iso2: ISO 3166-1 alpha-2 for flag emoji (e.g. ET → 🇪🇹)
 */
export const COUNTRY_CODES: Array<{ code: string; label: string; iso2: string }> = [
  { code: '+251', label: 'Ethiopia (+251)', iso2: 'ET' },
  { code: '+1', label: 'USA/Canada (+1)', iso2: 'US' },
  { code: '+44', label: 'UK (+44)', iso2: 'GB' },
  { code: '+91', label: 'India (+91)', iso2: 'IN' },
  { code: '+86', label: 'China (+86)', iso2: 'CN' },
  { code: '+81', label: 'Japan (+81)', iso2: 'JP' },
  { code: '+49', label: 'Germany (+49)', iso2: 'DE' },
  { code: '+33', label: 'France (+33)', iso2: 'FR' },
  { code: '+39', label: 'Italy (+39)', iso2: 'IT' },
  { code: '+34', label: 'Spain (+34)', iso2: 'ES' },
  { code: '+31', label: 'Netherlands (+31)', iso2: 'NL' },
  { code: '+41', label: 'Switzerland (+41)', iso2: 'CH' },
  { code: '+43', label: 'Austria (+43)', iso2: 'AT' },
  { code: '+32', label: 'Belgium (+32)', iso2: 'BE' },
  { code: '+46', label: 'Sweden (+46)', iso2: 'SE' },
  { code: '+47', label: 'Norway (+47)', iso2: 'NO' },
  { code: '+45', label: 'Denmark (+45)', iso2: 'DK' },
  { code: '+358', label: 'Finland (+358)', iso2: 'FI' },
  { code: '+353', label: 'Ireland (+353)', iso2: 'IE' },
  { code: '+351', label: 'Portugal (+351)', iso2: 'PT' },
  { code: '+48', label: 'Poland (+48)', iso2: 'PL' },
  { code: '+420', label: 'Czech Republic (+420)', iso2: 'CZ' },
  { code: '+36', label: 'Hungary (+36)', iso2: 'HU' },
  { code: '+30', label: 'Greece (+30)', iso2: 'GR' },
  { code: '+90', label: 'Turkey (+90)', iso2: 'TR' },
  { code: '+7', label: 'Russia (+7)', iso2: 'RU' },
  { code: '+380', label: 'Ukraine (+380)', iso2: 'UA' },
  { code: '+971', label: 'UAE (+971)', iso2: 'AE' },
  { code: '+966', label: 'Saudi Arabia (+966)', iso2: 'SA' },
  { code: '+20', label: 'Egypt (+20)', iso2: 'EG' },
  { code: '+254', label: 'Kenya (+254)', iso2: 'KE' },
  { code: '+234', label: 'Nigeria (+234)', iso2: 'NG' },
  { code: '+27', label: 'South Africa (+27)', iso2: 'ZA' },
  { code: '+61', label: 'Australia (+61)', iso2: 'AU' },
  { code: '+64', label: 'New Zealand (+64)', iso2: 'NZ' },
  { code: '+55', label: 'Brazil (+55)', iso2: 'BR' },
  { code: '+52', label: 'Mexico (+52)', iso2: 'MX' },
  { code: '+54', label: 'Argentina (+54)', iso2: 'AR' },
  { code: '+57', label: 'Colombia (+57)', iso2: 'CO' },
  { code: '+233', label: 'Ghana (+233)', iso2: 'GH' },
  { code: '+255', label: 'Tanzania (+255)', iso2: 'TZ' },
  { code: '+256', label: 'Uganda (+256)', iso2: 'UG' },
]

/** Turn ISO 3166-1 alpha-2 (e.g. ET) into flag emoji (🇪🇹) */
export function iso2ToFlag(iso2: string): string {
  if (!iso2 || iso2.length !== 2) return ''
  return [...iso2.toUpperCase()].map((c) => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0))).join('')
}

export const DEFAULT_COUNTRY_CODE = '+251'
