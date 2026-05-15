import Link from 'next/link'
import { CartItem } from '@/lib/types'
import { calcShipping, formatPrice } from '@/lib/ui'

interface OrderSummaryCardProps {
  items: CartItem[]
  subtotal: number
  showCheckoutButton?: boolean
  checkoutLabel?: string
}

export default function OrderSummaryCard({
  items,
  subtotal,
  showCheckoutButton = true,
  checkoutLabel = 'Proceed to checkout',
}: OrderSummaryCardProps) {
  const shipping = calcShipping(subtotal)
  const total = subtotal + shipping
  const itemCount = items.reduce((n, i) => n + i.quantity, 0)

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm lg:sticky lg:top-24">
      <h2 className="text-lg font-semibold text-slate-900">Order summary</h2>
      <p className="mt-1 text-sm text-slate-500">
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </p>

      {items.length > 0 && (
        <ul className="mt-5 max-h-48 space-y-3 overflow-y-auto border-b border-slate-100 pb-5 text-sm">
          {items.map(({ product, quantity }) => (
            <li key={product.id} className="flex justify-between gap-3">
              <span className="text-slate-600 line-clamp-2">
                {product.name}
                <span className="text-slate-400"> × {quantity}</span>
              </span>
              <span className="shrink-0 font-medium text-slate-900">
                {formatPrice(product.price * quantity)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 space-y-2.5 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span className="font-medium text-slate-900">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Shipping</span>
          <span className="font-medium">
            {shipping === 0 ? (
              <span className="text-emerald-600">Free</span>
            ) : (
              formatPrice(shipping)
            )}
          </span>
        </div>
        {subtotal > 0 && subtotal < 100 && (
          <p className="text-xs text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2">
            Add {formatPrice(100 - subtotal)} more for free shipping
          </p>
        )}
        <div className="flex justify-between border-t border-slate-100 pt-3 text-base font-semibold text-slate-900">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {showCheckoutButton && (
        <Link
          href="/checkout"
          className="mt-6 flex w-full items-center justify-center rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-700"
        >
          {checkoutLabel}
        </Link>
      )}
    </div>
  )
}
