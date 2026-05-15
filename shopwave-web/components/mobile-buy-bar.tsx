'use client'

import { formatPrice } from '@/lib/ui'

interface MobileBuyBarProps {
  price: number
  added: boolean
  onAdd: () => void
}

export default function MobileBuyBar({ price, added, onAdd }: MobileBuyBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 p-4 backdrop-blur-md lg:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-slate-500">Total</p>
          <p className="text-lg font-bold text-slate-900">{formatPrice(price)}</p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className={`btn-primary flex-1 max-w-[200px] ${
            added ? 'bg-emerald-600 hover:bg-emerald-700' : ''
          }`}
        >
          {added ? 'Added ✓' : 'Add to cart'}
        </button>
      </div>
    </div>
  )
}
