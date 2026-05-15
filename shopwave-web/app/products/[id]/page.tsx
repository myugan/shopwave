'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import ProductImage from '@/components/product-image'
import StarRating from '@/components/star-rating'
import TrustBadges from '@/components/trust-badges'
import Breadcrumbs from '@/components/breadcrumbs'
import RelatedProducts from '@/components/related-products'
import MobileBuyBar from '@/components/mobile-buy-bar'
import Toast from '@/components/toast'
import { getProduct, PRODUCTS } from '@/lib/products'
import { getRelatedProducts } from '@/lib/catalog'
import { PRODUCT_SPECS } from '@/lib/product-specs'
import { useCart } from '@/components/cart-context'
import { CATEGORY_ACCENT, formatPrice, FREE_SHIPPING_THRESHOLD } from '@/lib/ui'

const RATINGS: Record<string, number> = {
  prod_001: 4.8,
  prod_002: 4.7,
  prod_003: 4.6,
  prod_004: 4.9,
  prod_005: 4.5,
  prod_006: 4.4,
}

export default function ProductDetailPage() {
  const params = useParams()
  const id = params.id as string
  const product = getProduct(id)
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const [toast, setToast] = useState(false)
  const [addedRelatedId, setAddedRelatedId] = useState<string | null>(null)

  if (!product) {
    return (
      <div className="page-container py-20">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Products', href: '/products' }, { label: 'Not found' }]} />
        <div className="card-surface mt-8 p-12 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Product not found</h1>
          <p className="mt-2 text-slate-500">This item may have been discontinued.</p>
          <Link href="/products" className="btn-primary mt-6 inline-flex">
            Browse catalog
          </Link>
        </div>
      </div>
    )
  }

  const badgeClass = CATEGORY_ACCENT[product.category] || 'bg-slate-50 text-slate-600'
  const rating = RATINGS[product.id] ?? 4.5
  const specs = PRODUCT_SPECS[product.id] ?? []
  const related = getRelatedProducts(product, PRODUCTS)
  const lineTotal = product.price * quantity

  const handleAdd = () => {
    addItem(product, quantity)
    setAdded(true)
    setToast(true)
    setTimeout(() => {
      setAdded(false)
      setToast(false)
    }, 2200)
  }

  const handleRelatedAdd = (p: typeof product) => {
    addItem(p, 1)
    setAddedRelatedId(p.id)
    setTimeout(() => setAddedRelatedId(null), 1500)
  }

  return (
    <>
      <div className="page-container pb-28 pt-8 sm:pb-12 sm:pt-12">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Products', href: '/products' },
            { label: product.name },
          ]}
        />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 shadow-card">
            <ProductImage
              src={product.image}
              category={product.category}
              name={product.name}
              size="lg"
              priority
              className="aspect-square"
            />
          </div>

          <div className="lg:py-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${badgeClass}`}>
              {product.category}
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              {product.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <StarRating rating={rating} />
              <span className="text-sm text-emerald-600 font-medium">In stock — ships in 2 days</span>
            </div>

            <p className="mt-6 text-3xl font-bold text-slate-900">{formatPrice(product.price)}</p>
            {product.price >= FREE_SHIPPING_THRESHOLD && (
              <p className="mt-1 text-sm font-medium text-emerald-600">Qualifies for free shipping</p>
            )}

            <p className="mt-6 leading-relaxed text-slate-600">{product.description}</p>
            <p className="mt-4 text-sm text-slate-400">
              SKU: <span className="font-mono text-slate-500">{product.sku}</span>
            </p>

            <div className="mt-8 hidden flex-wrap items-center gap-4 border-t border-slate-100 pt-8 lg:flex">
              <QuantityControl quantity={quantity} setQuantity={setQuantity} />
              <button
                type="button"
                onClick={handleAdd}
                className={`btn-primary min-w-[220px] ${added ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
              >
                {added ? 'Added to cart ✓' : 'Add to cart'}
              </button>
              <Link href="/cart" className="btn-secondary">
                View cart
              </Link>
            </div>

            {specs.length > 0 && (
              <div className="mt-10">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Specifications</h2>
                <dl className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-slate-50/50">
                  {specs.map((row) => (
                    <div key={row.label} className="flex justify-between gap-4 px-4 py-3 text-sm">
                      <dt className="text-slate-500">{row.label}</dt>
                      <dd className="font-medium text-slate-900 text-right">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="mt-10">
              <TrustBadges compact />
            </div>
          </div>
        </div>

        <RelatedProducts products={related} onAddToCart={handleRelatedAdd} addedId={addedRelatedId} />
      </div>

      <MobileBuyBar price={lineTotal} added={added} onAdd={handleAdd} />
      <Toast message="Added to cart" visible={toast} />
    </>
  )
}

function QuantityControl({
  quantity,
  setQuantity,
}: {
  quantity: number
  setQuantity: (fn: (q: number) => number) => void
}) {
  return (
    <div className="flex items-center rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        className="flex h-11 w-11 items-center justify-center text-lg text-slate-600 hover:bg-slate-50 rounded-l-xl"
        aria-label="Decrease quantity"
      >
        −
      </button>
      <input
        type="number"
        min={1}
        max={10}
        value={quantity}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10)
          if (!isNaN(v)) setQuantity(() => Math.min(10, Math.max(1, v)))
        }}
        className="w-14 border-x border-slate-200 bg-transparent py-2 text-center text-sm font-semibold focus:outline-none"
        aria-label="Quantity"
      />
      <button
        type="button"
        onClick={() => setQuantity((q) => Math.min(10, q + 1))}
        className="flex h-11 w-11 items-center justify-center text-lg text-slate-600 hover:bg-slate-50 rounded-r-xl"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
