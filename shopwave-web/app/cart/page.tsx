'use client'

import Link from 'next/link'
import ProductImage from '@/components/product-image'
import Breadcrumbs from '@/components/breadcrumbs'
import EmptyState from '@/components/empty-state'
import OrderSummaryCard from '@/components/order-summary-card'
import { useCart } from '@/components/cart-context'
import { formatPrice } from '@/lib/ui'

export default function CartPage() {
  const { items, updateQuantity, removeItem, total: subtotal, ready } = useCart()

  if (!ready) {
    return (
      <div className="page-container py-10">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-10 space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 animate-pulse rounded-2xl bg-slate-200/80" />
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="page-container">
        <EmptyState
          title="Your cart is empty"
          description="Looks like you haven't added anything yet. Explore our catalog and find your next favorite gadget."
        />
      </div>
    )
  }

  return (
    <div className="page-container py-10 sm:py-14">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Cart' }]} />
      <h1 className="section-title">Shopping cart</h1>
      <p className="section-subtitle">{items.length} unique items in your cart</p>
      <Link href="/products" className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-700">
        ← Continue shopping
      </Link>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
        <div className="space-y-4 lg:col-span-2">
          {items.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:gap-6 sm:p-5"
            >
              <Link href={`/products/${product.id}`} className="shrink-0 overflow-hidden rounded-xl">
                <ProductImage
                  src={product.image}
                  category={product.category}
                  name={product.name}
                  size="sm"
                  className="h-24 w-24 sm:h-28 sm:w-28"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="flex justify-between gap-2">
                  <div>
                    <Link
                      href={`/products/${product.id}`}
                      className="font-semibold text-slate-900 hover:text-indigo-600 line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <p className="mt-0.5 text-sm text-slate-500">{product.category}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(product.id)}
                    className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove item"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, Math.max(1, quantity - 1))}
                      className="flex h-9 w-9 items-center justify-center text-slate-600 hover:bg-slate-50"
                    >
                      −
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="flex h-9 w-9 items-center justify-center text-slate-600 hover:bg-slate-50"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-lg font-bold text-slate-900">
                    {formatPrice(product.price * quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <OrderSummaryCard items={items} subtotal={subtotal} />
      </div>
    </div>
  )
}
