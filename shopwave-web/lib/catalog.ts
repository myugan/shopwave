import { Product } from './types'

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name'

export function filterProducts(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase()
  if (!q) return products
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
  )
}

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const list = [...products]
  switch (sort) {
    case 'price-asc':
      return list.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return list.sort((a, b) => b.price - a.price)
    case 'name':
      return list.sort((a, b) => a.name.localeCompare(b.name))
    default:
      return list
  }
}

export function getRelatedProducts(product: Product, all: Product[], limit = 3): Product[] {
  return all.filter((p) => p.category === product.category && p.id !== product.id).slice(0, limit)
}
