'use client'

import Link from 'next/link'
import ProductImage from '@/components/product-image'
import StarRating from '@/components/star-rating'
import { Product } from '@/lib/types'
import { CATEGORY_ACCENT, formatPrice, FREE_SHIPPING_THRESHOLD } from '@/lib/ui'

const RATINGS: Record<string, number> = {
  prod_001: 4.8,
  prod_002: 4.7,
  prod_003: 4.6,
  prod_004: 4.9,
  prod_005: 4.5,
  prod_006: 4.4,
}

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  added?: boolean
}

export default function ProductCard({ product, onAddToCart, added }: ProductCardProps) {
  const badgeClass = CATEGORY_ACCENT[product.category] || 'bg-slate-50 text-slate-600 ring-slate-600/20'
  const rating = RATINGS[product.id] ?? 4.5
  const freeShip = product.price >= FREE_SHIPPING_THRESHOLD

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card transition duration-300 hover:-translate-y-1 hover:border-indigo-200/60 hover:shadow-card-hover">
      <Link href={`/products/${product.id}`} className="relative block">
        <ProductImage
          src={product.image}
          category={product.category}
          name={product.name}
          className="aspect-[4/3] transition duration-500 group-hover:scale-[1.02]"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${badgeClass}`}
        >
          {product.category}
        </span>
        {freeShip && (
          <span className="absolute right-3 top-3 rounded-full bg-emerald-600/90 px-2 py-0.5 text-xs font-medium text-white">
            Free ship
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <StarRating rating={rating} />
        <Link href={`/products/${product.id}`} className="mt-2">
          <h3 className="font-semibold text-slate-900 transition group-hover:text-indigo-600 line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{product.description}</p>

        <div className="mt-4 flex items-end justify-between gap-2">
          <p className="text-xl font-bold text-slate-900">{formatPrice(product.price)}</p>
          <div className="flex gap-2">
            <Link
              href={`/products/${product.id}`}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              View
            </Link>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                onAddToCart(product)
              }}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 hover:bg-indigo-700'
              }`}
            >
              {added ? '✓' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
