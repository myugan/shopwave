const BADGES = [
  {
    title: 'Free shipping',
    desc: 'On orders over $100',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    ),
  },
  {
    title: '2-day delivery',
    desc: 'Fast in-stock dispatch',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    ),
  },
  {
    title: '2-year warranty',
    desc: 'On all ShopWave gear',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    ),
  },
  {
    title: '30-day returns',
    desc: 'Hassle-free policy',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    ),
  },
]

export default function TrustBadges({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid gap-4 ${compact ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
      {BADGES.map((badge) => (
        <div
          key={badge.title}
          className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {badge.icon}
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">{badge.title}</p>
            <p className="text-xs text-slate-500">{badge.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
