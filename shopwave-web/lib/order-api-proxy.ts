import { NextRequest, NextResponse } from 'next/server'

const HOP_BY_HOP_HEADERS = [
  'connection',
  'keep-alive',
  'transfer-encoding',
  'te',
  'trailer',
  'upgrade',
  'host',
] as const

const HOP_BY_HOP = new Set<string>(HOP_BY_HOP_HEADERS)

const SKIP_REQUEST_HEADERS = new Set<string>([
  ...HOP_BY_HOP_HEADERS,
  'cookie',
  'authorization',
  'x-forwarded-user',
  'x-forwarded-email',
])

const K8S_ORDER_API = 'http://order-service:8080'
const LOCAL_ORDER_API = 'http://localhost:8080'

/** Only these backends are used from shopwave-web (same as localhost port-forward behavior). */
function isAllowedOrderApiUrl(url: string, inK8s: boolean): boolean {
  try {
    const { hostname } = new URL(url)
    if (hostname === 'order-service') return true
    if (hostname.endsWith('.svc.cluster.local')) return true
    if (!inK8s && (hostname === 'localhost' || hostname === '127.0.0.1')) return true
    return false
  } catch {
    return false
  }
}

/**
 * Resolve order-service URL at request time.
 * In Kubernetes, always talk to the in-cluster Service — never the public https URL
 * (that would re-enter SSO and return "Redirecting to auth gateway").
 */
export function orderApiBase(): string {
  const inK8s = Boolean(process.env.KUBERNETES_SERVICE_HOST)
  const fallback = inK8s ? K8S_ORDER_API : LOCAL_ORDER_API
  const configured = (process.env.ORDER_API_URL || '').trim().replace(/\/$/, '')

  if (!configured || !isAllowedOrderApiUrl(configured, inK8s)) {
    if (configured && configured !== fallback) {
      console.warn(
        `[shopwave-web] ORDER_API_URL="${configured}" ignored; using ${fallback} (public URLs must not be used here)`
      )
    }
    return fallback
  }
  return configured
}

export function buildOrderApiTarget(path: string[] | undefined, search: string): string {
  const segment = path?.length ? path.join('/') : ''
  const suffix = segment ? `/${segment}` : ''
  return `${orderApiBase()}/api/v1/orders${suffix}${search}`
}

export async function proxyOrderApiRequest(
  request: NextRequest,
  path?: string[]
): Promise<NextResponse> {
  const target = buildOrderApiTarget(path, request.nextUrl.search)

  const headers = new Headers()
  request.headers.forEach((value, key) => {
    if (SKIP_REQUEST_HEADERS.has(key.toLowerCase())) return
    headers.set(key, value)
  })

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: 'manual',
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    init.body = await request.arrayBuffer()
  }

  const upstream = await fetch(target, init)
  const responseHeaders = new Headers()
  upstream.headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return
    responseHeaders.set(key, value)
  })

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  })
}
