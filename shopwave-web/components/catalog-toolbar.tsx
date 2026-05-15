'use client'

import { SortOption } from '@/lib/catalog'

interface CatalogToolbarProps {
  query: string
  onQueryChange: (q: string) => void
  sort: SortOption
  onSortChange: (s: SortOption) => void
  resultCount: number
}

export default function CatalogToolbar({
  query,
  onQueryChange,
  sort,
  onSortChange,
  resultCount,
}: CatalogToolbarProps) {
  return (
    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1 max-w-md">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search products…"
          className="input-field pl-11"
          aria-label="Search products"
        />
      </div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-slate-500 whitespace-nowrap">
          {resultCount} {resultCount === 1 ? 'result' : 'results'}
        </span>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="input-field w-auto min-w-[160px] py-2"
          aria-label="Sort products"
        >
          <option value="featured">Featured</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>
    </div>
  )
}
