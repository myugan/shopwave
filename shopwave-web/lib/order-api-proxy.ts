import { NextRequest, NextResponse } from 'next/server'

const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'transfer-encoding',
  'te',
  'trailer',
  'upgrade',
  'host',
])

/** Backend base URL — read at request time from Kubernetes / container env. */
export function orderApiBase(): string {
  const base = process.env.ORDER_API_URL || 'http://localhost:8080'
  return base.replace(/\/$/, '')
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
    if (HOP_BY_HOP.has(key.toLowerCase())) return
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
