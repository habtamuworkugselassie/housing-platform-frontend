/**
 * All platform organization types — any category may register as a visitor or as an
 * exhibitor / sponsorship interest (same list for both flows).
 */
export const EXHIBITION_REGISTER_INTEREST_ORGANIZATION_TYPES = [
  { value: 'REAL_ESTATE_COMPANY', labelKey: 'nav.marketplaceRealEstate' },
  { value: 'BANK', labelKey: 'nav.marketplaceBanks' },
  { value: 'INSURANCE', labelKey: 'nav.marketplaceInsurance' },
  { value: 'DEVELOPER', labelKey: 'admin.typeDeveloper' },
  { value: 'CONTRACTOR', labelKey: 'nav.marketplaceContractors' },
  { value: 'SUPPLIER', labelKey: 'nav.marketplaceSuppliers' },
  { value: 'CONSULTANT_ARCHITECT', labelKey: 'nav.marketplaceConsultantsArchitects' },
  { value: 'FINISHING_CONTRACTOR', labelKey: 'nav.marketplaceFinishingWork' }
] as const
