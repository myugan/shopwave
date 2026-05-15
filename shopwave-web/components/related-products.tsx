import ProductCard from '@/components/product-card'
import { Product } from '@/lib/types'

interface RelatedProductsProps {
  products: Product[]
  onAddToCart: (product: Product) => void
  addedId?: string | null
}

export default function RelatedProducts({ products, onAddToCart, addedId }: RelatedProductsProps) {
  if (products.length === 0) return null

  return (
    <section className="mt-16 border-t border-slate-200 pt-12">
      <h2 className="section-title">You may also like</h2>
      <p className="section-subtitle">More from this category</p>
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            added={addedId === product.id}
          />
        ))}
      </div>
    </section>
  )
}
