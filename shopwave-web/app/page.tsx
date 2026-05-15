'use client'

import { useState } from 'react'
import Link from 'next/link'
import ProductCard from '@/components/product-card'
import Toast from '@/components/toast'
import TrustBadges from '@/components/trust-badges'
import { useCart } from '@/components/cart-context'
import { CATEGORIES, PRODUCTS } from '@/lib/products'
import { Product } from '@/lib/types'
import { GRADIENTS } from '@/lib/ui'

export default function HomePage() {
  const { addItem } = useCart()
  const [toast, setToast] = useState(false)

  const handleAdd = (product: Product) => {
    addItem(product, 1)
    setToast(true)
    setTimeout(() => setToast(false), 2200)
  }

  const featured = PRODUCTS.slice(0, 3)

  return (
    <div>
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-700 to-slate-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.04%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
        <div className="page-container relative py-20 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              New arrivals — Spring collection
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Premium tech,
              <br />
              <span className="bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                delivered fast
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-indigo-100/90">
              Shop the latest keyboards, mice, audio gear and accessories — built for creators who care about craft.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/products"
                className="btn-primary min-w-[160px] bg-white text-indigo-700 shadow-lg hover:bg-indigo-50 hover:text-indigo-800"
              >
                Shop now
              </Link>
              <a
                href="#featured"
                className="btn-secondary border-white/30 bg-transparent text-white hover:border-white/50 hover:bg-white/10"
              >
                View featured
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container relative z-10 -mt-8 pb-4">
        <TrustBadges />
      </section>

      <section id="featured" className="page-container py-16 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="section-title">Featured products</h2>
            <p className="section-subtitle">Hand-picked bestsellers from our catalog</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            View all →
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={handleAdd} />
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200/80 bg-white py-16 sm:py-20">
        <div className="page-container">
          <h2 className="section-title text-center">Shop by category</h2>
          <p className="section-subtitle text-center">Find the right gear for your setup</p>
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {CATEGORIES.filter((c) => c !== 'All').map((cat) => {
              const gradient = GRADIENTS[cat] || 'from-slate-500 to-slate-700'
              return (
                <Link
                  key={cat}
                  href={`/products?cat=${encodeURIComponent(cat)}`}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 text-white shadow-lg transition hover:scale-[1.02] hover:shadow-xl`}
                >
                  <p className="text-lg font-bold">{cat}</p>
                  <p className="mt-1 text-sm text-white/80">Explore →</p>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="bg-slate-900 py-16 text-white">
        <div className="page-container text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">Built for your desk, delivered fast</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Join thousands of creators who trust ShopWave for keyboards, mice, and audio that lasts.
          </p>
          <Link href="/products" className="btn-primary mt-8 inline-flex bg-indigo-500 hover:bg-indigo-400">
            Start shopping
          </Link>
        </div>
      </section>

      <Toast message="Added to cart" visible={toast} />
    </div>
  )
}
