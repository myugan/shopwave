import { Product } from './types'

export function productImagePath(id: string) {
  return `/products/${id}.jpg`
}

export const PRODUCTS: Product[] = [
  {
    id: 'prod_001',
    name: 'MechKey Pro 87',
    category: 'Keyboards',
    price: 129.99,
    description: 'Tenkeyless mechanical keyboard with Cherry MX switches. Aluminium frame, RGB backlight, USB-C detachable cable. Built for long typing sessions with a satisfying tactile response.',
    sku: 'MK-PRO-87-BLK',
    image: productImagePath('prod_001'),
  },
  {
    id: 'prod_002',
    name: 'AeroGlide X Mouse',
    category: 'Mice',
    price: 79.99,
    description: 'Lightweight wireless gaming mouse. 26000 DPI optical sensor, 70 hour battery life, under 60g. Ultra-low latency 2.4GHz wireless connection.',
    sku: 'AG-X-MOUSE-WHT',
    image: productImagePath('prod_002'),
  },
  {
    id: 'prod_003',
    name: 'WaveHub 7-Port USB-C',
    category: 'Hubs',
    price: 49.99,
    description: '7-port USB-C hub with 100W passthrough charging, 4K HDMI output, SD and microSD card readers. Plug and play, no drivers required.',
    sku: 'WH-7PORT-USBC',
    image: productImagePath('prod_003'),
  },
  {
    id: 'prod_004',
    name: 'StudioPods ANC',
    category: 'Audio',
    price: 199.99,
    description: 'True wireless earbuds with active noise cancellation. 32 hour total battery life, Bluetooth 5.3, IPX5 water resistance. Crystal clear call quality.',
    sku: 'SP-ANC-BLK',
    image: productImagePath('prod_004'),
  },
  {
    id: 'prod_005',
    name: 'MechKey Compact 65',
    category: 'Keyboards',
    price: 99.99,
    description: '65% layout mechanical keyboard. Hot-swap switches, gasket mount for quiet typing, pre-lubed stabilisers. Available with linear or tactile switches.',
    sku: 'MK-65-SLVR',
    image: productImagePath('prod_005'),
  },
  {
    id: 'prod_006',
    name: 'TrackPad Pro',
    category: 'Mice',
    price: 59.99,
    description: 'Large format wireless trackpad. Multi-touch gestures, 3 month battery life per charge. Works seamlessly with Windows and macOS.',
    sku: 'TP-PRO-SLV',
    image: productImagePath('prod_006'),
  },
]

export const CATEGORIES = ['All', 'Keyboards', 'Mice', 'Audio', 'Hubs']

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}

export function getProductsByCategory(category: string): Product[] {
  if (category === 'All') return PRODUCTS
  return PRODUCTS.filter((p) => p.category === category)
}
