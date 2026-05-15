import Link from 'next/link'
import Logo from '@/components/logo'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="page-container py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              Premium tech, delivered fast. Curated keyboards, mice, audio, and desk accessories for creators and builders.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Shop</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
              <li><Link href="/products" className="hover:text-indigo-600">All products</Link></li>
              <li><Link href="/products" className="hover:text-indigo-600">Keyboards</Link></li>
              <li><Link href="/products" className="hover:text-indigo-600">Mice</Link></li>
              <li><Link href="/products" className="hover:text-indigo-600">Audio</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Support</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-600">Shipping & returns</a></li>
              <li><a href="#" className="hover:text-indigo-600">Warranty</a></li>
              <li><a href="#" className="hover:text-indigo-600">Contact</a></li>
              <li><a href="#" className="hover:text-indigo-600">FAQ</a></li>
              <li><Link href="/orders/import" className="hover:text-indigo-600">Bulk import</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Company</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-500">
              <li><a href="#" className="hover:text-indigo-600">About</a></li>
              <li><a href="#" className="hover:text-indigo-600">Careers</a></li>
              <li><a href="#" className="hover:text-indigo-600">Privacy</a></li>
              <li><a href="#" className="hover:text-indigo-600">Terms</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-8 text-sm text-slate-400 sm:flex-row">
          <p>© 2024 ShopWave. All rights reserved.</p>
          <p className="text-slate-400">Premium tech, delivered fast</p>
        </div>
      </div>
    </footer>
  )
}
