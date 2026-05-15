import Link from 'next/link'

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`group flex items-center gap-2.5 ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md shadow-indigo-600/30 transition group-hover:shadow-lg group-hover:shadow-indigo-600/40">
        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
          <path d="M4 14c0-4 2.5-8 8-8s8 4 8 8-2 6-8 6-8-2-8-6z" opacity="0.9" />
          <path d="M6 16c2 2 4 3 6 3s4-1 6-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <span className="text-xl font-bold tracking-tight text-slate-900">
        Shop<span className="text-indigo-600">Wave</span>
      </span>
    </Link>
  )
}
