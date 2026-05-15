export interface Product {
  id: string
  name: string
  category: string
  price: number
  description: string
  sku: string
  image: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface OrderRequest {
  customer_id: string
  items: Array<{
    product_id: string
    name: string
    quantity: number
    unit_price: number
  }>
}

export interface OrderResponse {
  order_id: string
  customer_id: string
  total: number
  status: string
  workflow_id: string
  created_at: string
}
