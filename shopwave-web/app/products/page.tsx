'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ProductCard from '@/components/product-card'
import Breadcrumbs from '@/components/breadcrumbs'
import CatalogToolbar from '@/components/catalog-toolbar'
import { useCart } from '@/components/cart-context'
import { filterProducts, sortProducts, SortOption } from '@/lib/catalog'
import { CATEGORIES, getProductsByCategory } from '@/lib/products'
import { Product } from '@/lib/types'

function ProductsContent() {
  const searchParams = useSearchParams()
  const { addItem } = useCart()
  const [category, setCategory] = useState('All')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortOption>('featured')
  const [addedId, setAddedId] = useState<string | null>(null)

  useEffect(() => {
    const cat = searchParams.get('cat')
    if (cat && CATEGORIES.includes(cat)) setCategory(cat)
    const q = searchParams.get('q')
    if (q) setQuery(q)
  }, [searchParams])

  const products = useMemo(() => {
    const byCat = getProductsByCategory(category)
    const filtered = filterProducts(byCat, query)
    return sortProducts(filtered, sort)
  }, [category, query, sort])

  const handleAdd = (product: Product) => {
    addItem(product, 1)
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1500)
  }

  return (
    <div className="page-container py-10 sm:py-14">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Products' }]} />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-indigo-600">Catalog</p>
          <h1 className="section-title mt-1">All products</h1>
          <p className="section-subtitle">
            Premium peripherals and desk gear, ready to ship
          </p>
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition ${
              category === cat
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <CatalogToolbar
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={setSort}
        resultCount={products.length}
      />

      {products.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <p className="text-lg font-semibold text-slate-900">No products found</p>
          <p className="mt-2 text-slate-500">Try a different search or category.</p>
          <Link href="/products" className="btn-primary mt-6 inline-flex">
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAdd}
              added={addedId === product.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="page-container py-10 text-slate-500">Loading products…</div>}>
      <ProductsContent />
    </Suspense>
  )
}
