'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import Breadcrumbs from '@/components/breadcrumbs'
import OrderStatus from '@/components/order-status'

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderId = params.order_id as string
  const shortId = orderId.length > 12 ? `${orderId.slice(0, 8)}…` : orderId

  return (
    <div className="page-container py-12 sm:py-20">
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Products', href: '/products' },
          { label: 'Order confirmed' },
        ]}
      />
      <div className="mx-auto max-w-lg animate-slide-up">
        <div className="card-surface overflow-hidden">
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-10 text-center text-white">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">Thank you for your order!</h1>
            <p className="mt-2 text-emerald-100">
              Your order has been placed and is being processed.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            <p className="text-center text-sm text-slate-500">Order number</p>
            <p
              className="mt-2 text-center font-mono text-sm font-medium text-slate-800"
              title={orderId}
            >
              #{shortId}
            </p>

            <OrderStatus orderId={orderId} />

            <Link href="/products" className="btn-primary mt-8 w-full">
              Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
