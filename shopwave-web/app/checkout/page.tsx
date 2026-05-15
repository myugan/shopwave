'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import OrderSummaryCard from '@/components/order-summary-card'
import EmptyState from '@/components/empty-state'
import { useCart } from '@/components/cart-context'
import { createOrder } from '@/lib/api'

const COUNTRIES = [
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Japan',
]

const STEPS = ['Contact', 'Shipping', 'Payment']

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total: subtotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeStep, setActiveStep] = useState(0)

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    street: '',
    city: '',
    postcode: '',
    country: 'United States',
    cardNumber: '',
    expiry: '',
    cvv: '',
  })

  const setField = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    const required = [
      form.fullName,
      form.email,
      form.street,
      form.city,
      form.postcode,
      form.country,
      form.cardNumber,
      form.expiry,
      form.cvv,
    ]
    if (required.some((v) => !v.trim())) {
      setError('Please fill in all fields.')
      return
    }

    if (items.length === 0) {
      setError('Your cart is empty.')
      return
    }

    const invalid = items.some((i) => !i.product?.id || !i.product?.name || i.product.price <= 0)
    if (invalid) {
      setError('Some cart items are invalid. Remove them and add products again.')
      return
    }

    setLoading(true)
    try {
      const order = await createOrder({
        customer_id: form.email,
        items: items.map(({ product, quantity }) => ({
          product_id: product.id,
          name: product.name,
          quantity,
          unit_price: product.price,
        })),
      })
      clearCart()
      router.push(`/order-confirmation/${order.order_id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="page-container">
        <EmptyState title="Nothing to checkout" description="Add items to your cart first." />
      </div>
    )
  }

  return (
    <div className="page-container py-10 sm:py-14">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Cart', href: '/cart' },
          { label: 'Checkout' },
        ]}
      />
      <h1 className="section-title">Checkout</h1>
      <p className="section-subtitle">Secure checkout — demo environment only</p>

      <div className="mb-10 mt-8 flex items-center justify-center gap-2 sm:gap-4">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={() => setActiveStep(i)}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition sm:px-4 ${
                activeStep === i
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  activeStep === i ? 'bg-white/20' : 'bg-slate-100'
                }`}
              >
                {i + 1}
              </span>
              <span className="hidden sm:inline">{step}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className="hidden h-px w-8 bg-slate-200 sm:block" aria-hidden />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-5 lg:gap-12">
        <form onSubmit={handleSubmit} noValidate className="space-y-6 lg:col-span-3">
          <div className="card-surface p-6 sm:p-8">
            <section className={activeStep !== 0 ? 'hidden' : ''}>
                <h2 className="text-lg font-semibold text-slate-900">Contact information</h2>
                <p className="mt-1 text-sm text-slate-500">We&apos;ll send your receipt here</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Full name</label>
                    <input
                      type="text"
                      required
                      value={form.fullName}
                      onChange={(e) => setField('fullName', e.target.value)}
                      className="input-field"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setField('email', e.target.value)}
                      className="input-field"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="btn-primary mt-6 w-full sm:w-auto"
                >
                  Continue to shipping
                </button>
            </section>

            <section className={activeStep !== 1 ? 'hidden' : ''}>
              <h2 className="text-lg font-semibold text-slate-900">Shipping address</h2>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Street address</label>
                  <input
                    type="text"
                    required
                    value={form.street}
                    onChange={(e) => setField('street', e.target.value)}
                    className="input-field"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">City</label>
                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={(e) => setField('city', e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Postcode</label>
                    <input
                      type="text"
                      required
                      value={form.postcode}
                      onChange={(e) => setField('postcode', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Country</label>
                  <select
                    required
                    value={form.country}
                    onChange={(e) => setField('country', e.target.value)}
                    className="input-field"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setActiveStep(0)} className="btn-secondary">
                  Back
                </button>
                <button type="button" onClick={() => setActiveStep(2)} className="btn-primary">
                  Continue to payment
                </button>
              </div>
            </section>

            <section className={activeStep !== 2 ? 'hidden' : ''}>
              <h2 className="text-lg font-semibold text-slate-900">Payment</h2>
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p>Demo environment — do not enter real payment details</p>
              </div>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Card number</label>
                  <input
                    type="text"
                    placeholder="4242 4242 4242 4242"
                    value={form.cardNumber}
                    onChange={(e) => setField('cardNumber', e.target.value)}
                    className="input-field font-mono"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      placeholder="12/28"
                      value={form.expiry}
                      onChange={(e) => setField('expiry', e.target.value)}
                      className="input-field font-mono"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">CVV</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={form.cvv}
                      onChange={(e) => setField('cvv', e.target.value)}
                      className="input-field font-mono"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setActiveStep(1)} className="btn-secondary">
                  Back
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">
                  {loading ? 'Placing order...' : 'Place order'}
                </button>
              </div>
            </section>
          </div>
        </form>

        <div className="lg:col-span-2">
          <OrderSummaryCard items={items} subtotal={subtotal} showCheckoutButton={false} />
          <p className="mt-4 text-center text-xs text-slate-400">
            🔒 Secure checkout · 30-day returns
          </p>
        </div>
      </div>
    </div>
  )
}
