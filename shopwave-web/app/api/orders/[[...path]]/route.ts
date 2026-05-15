import { NextRequest } from 'next/server'
import { proxyOrderApiRequest } from '@/lib/order-api-proxy'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type RouteContext = { params: { path?: string[] } }

async function handle(request: NextRequest, context: RouteContext) {
  return proxyOrderApiRequest(request, context.params.path)
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
