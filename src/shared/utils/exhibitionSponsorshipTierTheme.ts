/**
 * Exhibition sponsorship tier visuals (Ethio Build Connect packages).
 * Shared by ExhibitionSponsorshipPackagesSection, AdSpace, and related UI.
 */
export const TIER_MODAL_THEMES = {
  DEFAULT: {
    showSparkles: false,
    stripeAnimate: false,
    borderGradient: 'from-black/75 via-zinc-600/70 to-zinc-800',
    shadowGlow: 'shadow-[0_0_80px_-20px_rgba(250,204,21,0.22)]',
    stripe: 'bg-gradient-to-r from-black via-amber-400 to-black',
    orb1: 'bg-violet-950/22',
    orb2: 'bg-amber-600/14',
    headerBg: 'bg-gradient-to-br from-zinc-800/85 via-zinc-900 to-zinc-950',
    eyebrow: 'text-black',
    price: 'text-black',
    bulletMarker: 'marker:text-black',
    notesBox: 'border-white/12 bg-white/[0.04]',
    notesLabel: 'text-gray-500',
    primaryCta:
      'bg-white text-black hover:bg-violet-950 shadow-black/30 hover:shadow-black/15',
    secondaryCta: 'border-white/25 hover:border-black/55 hover:bg-violet-950/10',
    closeHover: 'hover:bg-white/10 hover:text-white',
    hintChip: 'border-white/12 bg-white/[0.06] text-gray-100',
    hintDot: 'bg-violet-950',
    formPanel: 'border-white/10 bg-white/[0.04]',
    linkMuted: 'text-gray-500 hover:text-black'
  },
  EXCLUSIVE: {
    showSparkles: true,
    stripeAnimate: true,
    borderGradient: 'from-amber-200/95 via-black/90 to-amber-700/95',
    shadowGlow: 'shadow-[0_0_100px_-12px_rgba(251,191,36,0.5)]',
    stripe: 'bg-gradient-to-r from-amber-300 via-black to-amber-400',
    orb1: 'bg-amber-400/38',
    orb2: 'bg-violet-950/28',
    headerBg: 'bg-gradient-to-br from-amber-950/60 via-zinc-900/95 to-zinc-950',
    eyebrow: 'text-amber-200',
    price: 'text-amber-50',
    bulletMarker: 'marker:text-amber-400',
    notesBox: 'border-amber-500/30 bg-amber-950/30',
    notesLabel: 'text-amber-400/90',
    primaryCta:
      'bg-gradient-to-r from-amber-200 via-black to-amber-200 text-black hover:from-black hover:via-amber-300 hover:to-black shadow-amber-900/40',
    secondaryCta: 'border-amber-500/35 hover:border-amber-400/70 hover:bg-amber-500/12',
    closeHover: 'hover:bg-amber-500/18 hover:text-amber-50',
    hintChip: 'border-amber-500/35 bg-amber-950/45 text-amber-50',
    hintDot: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.85)]',
    formPanel: 'border-amber-500/22 bg-amber-950/[0.12]',
    linkMuted: 'text-gray-500 hover:text-amber-300'
  },
  PLATINUM: {
    showSparkles: false,
    stripeAnimate: true,
    borderGradient: 'from-fuchsia-400/80 via-purple-500/75 to-black/90',
    shadowGlow: 'shadow-[0_0_90px_-18px_rgba(192,132,252,0.45)]',
    stripe: 'bg-gradient-to-r from-fuchsia-400 via-purple-400 to-black',
    orb1: 'bg-fuchsia-500/28',
    orb2: 'bg-violet-950/22',
    headerBg: 'bg-gradient-to-br from-black/55 via-zinc-900/95 to-zinc-950',
    eyebrow: 'text-fuchsia-300',
    price: 'text-fuchsia-200',
    bulletMarker: 'marker:text-fuchsia-400',
    notesBox: 'border-fuchsia-500/25 bg-violet-950/35',
    notesLabel: 'text-fuchsia-400/85',
    primaryCta:
      'bg-gradient-to-r from-fuchsia-300 via-purple-300 to-black text-black hover:from-fuchsia-200 hover:via-purple-200 hover:to-black shadow-purple-900/35',
    secondaryCta: 'border-fuchsia-500/30 hover:border-fuchsia-400/60 hover:bg-fuchsia-500/10',
    closeHover: 'hover:bg-fuchsia-500/15 hover:text-fuchsia-100',
    hintChip: 'border-fuchsia-500/30 bg-violet-950/40 text-fuchsia-100',
    hintDot: 'bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,0.7)]',
    formPanel: 'border-fuchsia-500/20 bg-violet-950/15',
    linkMuted: 'text-gray-500 hover:text-fuchsia-300'
  },
  GOLD: {
    showSparkles: false,
    stripeAnimate: false,
    borderGradient: 'from-orange-400/85 via-amber-500/80 to-black/85',
    shadowGlow: 'shadow-[0_0_85px_-18px_rgba(245,158,11,0.38)]',
    stripe: 'bg-gradient-to-r from-orange-400 via-amber-500 to-black',
    orb1: 'bg-orange-500/30',
    orb2: 'bg-amber-600/20',
    headerBg: 'bg-gradient-to-br from-orange-950/45 via-zinc-900/95 to-zinc-950',
    eyebrow: 'text-orange-300',
    price: 'text-amber-200',
    bulletMarker: 'marker:text-orange-400',
    notesBox: 'border-orange-500/25 bg-orange-950/25',
    notesLabel: 'text-orange-400/85',
    primaryCta:
      'bg-gradient-to-r from-orange-300 via-amber-400 to-black text-black hover:from-amber-300 hover:via-orange-400 hover:to-amber-500 shadow-orange-900/30',
    secondaryCta: 'border-orange-500/30 hover:border-orange-400/60 hover:bg-orange-500/10',
    closeHover: 'hover:bg-orange-500/15 hover:text-orange-100',
    hintChip: 'border-orange-500/30 bg-orange-950/35 text-orange-100',
    hintDot: 'bg-orange-400',
    formPanel: 'border-orange-500/18 bg-orange-950/10',
    linkMuted: 'text-gray-500 hover:text-orange-300'
  },
  SILVER: {
    showSparkles: false,
    stripeAnimate: false,
    borderGradient: 'from-slate-300/70 via-cyan-200/50 to-slate-600/80',
    shadowGlow: 'shadow-[0_0_80px_-22px_rgba(148,163,184,0.35)]',
    stripe: 'bg-gradient-to-r from-slate-300 via-slate-200 to-cyan-300/90',
    orb1: 'bg-cyan-400/18',
    orb2: 'bg-slate-400/20',
    headerBg: 'bg-gradient-to-br from-slate-900/90 via-zinc-900 to-zinc-950',
    eyebrow: 'text-cyan-200/90',
    price: 'text-slate-200',
    bulletMarker: 'marker:text-cyan-400/90',
    notesBox: 'border-cyan-500/20 bg-slate-900/50',
    notesLabel: 'text-cyan-500/80',
    primaryCta:
      'bg-gradient-to-r from-slate-200 via-white to-cyan-100 text-black hover:from-white hover:via-slate-100 hover:to-cyan-50 shadow-slate-900/40',
    secondaryCta: 'border-slate-500/40 hover:border-cyan-400/50 hover:bg-cyan-500/10',
    closeHover: 'hover:bg-slate-700/40 hover:text-cyan-100',
    hintChip: 'border-cyan-500/25 bg-slate-900/55 text-slate-100',
    hintDot: 'bg-cyan-400',
    formPanel: 'border-slate-500/20 bg-slate-900/25',
    linkMuted: 'text-gray-500 hover:text-cyan-300'
  },
  SPECIAL: {
    showSparkles: false,
    stripeAnimate: false,
    borderGradient: 'from-sky-400/85 via-blue-500/75 to-indigo-800/90',
    shadowGlow: 'shadow-[0_0_88px_-18px_rgba(56,189,248,0.4)]',
    stripe: 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500',
    orb1: 'bg-sky-500/28',
    orb2: 'bg-indigo-600/22',
    headerBg: 'bg-gradient-to-br from-blue-950/50 via-zinc-900/95 to-zinc-950',
    eyebrow: 'text-sky-300',
    price: 'text-sky-200',
    bulletMarker: 'marker:text-sky-400',
    notesBox: 'border-sky-500/28 bg-blue-950/30',
    notesLabel: 'text-sky-400/85',
    primaryCta:
      'bg-gradient-to-r from-sky-300 via-blue-400 to-indigo-400 text-black hover:from-sky-200 hover:via-blue-300 hover:to-indigo-300 shadow-blue-950/40',
    secondaryCta: 'border-sky-500/35 hover:border-sky-400/65 hover:bg-sky-500/10',
    closeHover: 'hover:bg-sky-500/15 hover:text-sky-100',
    hintChip: 'border-sky-500/30 bg-blue-950/40 text-sky-100',
    hintDot: 'bg-sky-400',
    formPanel: 'border-sky-500/20 bg-blue-950/12',
    linkMuted: 'text-gray-500 hover:text-sky-300'
  }
} as const

export type TierModalTheme = (typeof TIER_MODAL_THEMES)[keyof typeof TIER_MODAL_THEMES]

export function normalizeSponsorshipTierKey(type: string | null | undefined): string {
  const u = String(type ?? '').toUpperCase()
  if (u === 'PREMIUM') return 'PLATINUM'
  if (['EXCLUSIVE', 'PLATINUM', 'GOLD', 'SILVER', 'SPECIAL'].includes(u)) return u
  return 'DEFAULT'
}

export function getTierModalTheme(type: string | null | undefined): TierModalTheme {
  const key = normalizeSponsorshipTierKey(type) as keyof typeof TIER_MODAL_THEMES
  return TIER_MODAL_THEMES[key] ?? TIER_MODAL_THEMES.DEFAULT
}
