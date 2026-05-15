import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="page-container flex flex-col items-center justify-center py-24 text-center">
      <p className="text-8xl font-bold text-indigo-100">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 max-w-md text-slate-500">
        The page you are looking for does not exist or may have been moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href="/" className="btn-primary">
          Go home
        </Link>
        <Link href="/products" className="btn-secondary">
          Browse products
        </Link>
      </div>
    </div>
  )
}
