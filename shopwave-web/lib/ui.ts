export const GRADIENTS: Record<string, string> = {
  Keyboards: 'from-indigo-500 via-indigo-600 to-violet-700',
  Mice: 'from-violet-500 via-purple-600 to-fuchsia-700',
  Audio: 'from-purple-500 via-violet-600 to-indigo-700',
  Hubs: 'from-blue-500 via-indigo-600 to-cyan-700',
}

export const CATEGORY_ACCENT: Record<string, string> = {
  Keyboards: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  Mice: 'bg-violet-50 text-violet-700 ring-violet-600/20',
  Audio: 'bg-purple-50 text-purple-700 ring-purple-600/20',
  Hubs: 'bg-blue-50 text-blue-700 ring-blue-600/20',
}

export const SHIPPING_FLAT = 5.99
export const FREE_SHIPPING_THRESHOLD = 100

export function calcShipping(subtotal: number) {
  return subtotal > FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}
