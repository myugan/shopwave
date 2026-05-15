/** Same-origin proxy; server forwards using ORDER_API_URL at runtime. */
const ORDER_API = '/api/orders'

function parseApiError(err: unknown, fallback: string): string {
  if (!err || typeof err !== 'object') return fallback
  const detail = (err as { detail?: unknown }).detail
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((d) =>
        typeof d === 'object' && d && 'msg' in d
          ? String((d as { msg: string }).msg)
          : String(d)
      )
      .join(', ')
  }
  return fallback
}

async function apiFetch(path: string, init?: RequestInit) {
  const url = path.startsWith('/') ? path : `${ORDER_API}/${path}`
  try {
    return await fetch(url, init)
  } catch {
    throw new Error(
      'Unable to reach the order service. Check that order-service is running and ORDER_API_URL is set.'
    )
  }
}

export async function createOrder(data: {
  customer_id: string
  items: Array<{ product_id: string; name: string; quantity: number; unit_price: number }>
}) {
  const res = await apiFetch(ORDER_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(parseApiError(err, 'Failed to create order'))
  }
  const order = await res.json()
  if (!order?.order_id) {
    throw new Error('Invalid response from order service')
  }
  return order
}

export async function getOrder(orderId: string) {
  const res = await apiFetch(`${ORDER_API}/${encodeURIComponent(orderId)}`, {
    cache: 'no-store',
  })
  if (!res.ok) throw new Error('Order not found')
  return res.json()
}

function assertNotAuthGateway(text: string): void {
  if (/redirecting to auth gateway/i.test(text) || /auth gateway/i.test(text)) {
    throw new Error(
      'Order API returned an auth-gateway page. Set ORDER_API_URL=http://order-service:8080 on shopwave-web (not your public https URL), and ensure your platform routes :443 to shopwave-web without SSO.'
    )
  }
}

export async function importOrders(yaml: string) {
  const res = await apiFetch(`${ORDER_API}/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-yaml' },
    body: yaml,
  })
  const text = await res.text()
  assertNotAuthGateway(text)
  if (!res.ok) {
    let message = `Import failed (${res.status})`
    try {
      message = parseApiError(JSON.parse(text) as object, message)
    } catch {
      if (text.trim()) message = text.slice(0, 300)
    }
    throw new Error(message)
  }
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new Error(
      'Order service did not return JSON. Check ORDER_API_URL and that you are hitting the storefront proxy.'
    )
  }
}
