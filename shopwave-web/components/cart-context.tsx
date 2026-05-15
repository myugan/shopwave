'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { CartItem, Product } from '@/lib/types'
import { getProduct } from '@/lib/products'

interface CartContextType {
  items: CartItem[]
  ready: boolean
  addItem: (product: Product, quantity: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | null>(null)

function normalizeCartItem(item: CartItem): CartItem | null {
  const catalog = getProduct(item.product?.id)
  if (!catalog) return null
  const qty = Math.min(99, Math.max(1, Number(item.quantity) || 1))
  return { product: catalog, quantity: qty }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('shopwave-cart')
      if (saved) {
        const parsed: CartItem[] = JSON.parse(saved)
        const restored = parsed
          .map(normalizeCartItem)
          .filter((i): i is CartItem => i !== null)
        setItems(restored)
      }
    } catch {
      localStorage.removeItem('shopwave-cart')
    } finally {
      setReady(true)
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    localStorage.setItem('shopwave-cart', JSON.stringify(items))
  }, [items, ready])

  const addItem = (product: Product, quantity: number) => {
    const qty = Math.min(99, Math.max(1, quantity))
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(99, i.quantity + qty) }
            : i
        )
      }
      return [...prev, { product, quantity: qty }]
    })
  }

  const removeItem = (productId: string) =>
    setItems((prev) => prev.filter((i) => i.product.id !== productId))

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId)
      return
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId
          ? { ...i, quantity: Math.min(99, quantity) }
          : i
      )
    )
  }

  const clearCart = () => setItems([])

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        ready,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
