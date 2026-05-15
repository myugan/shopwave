'use client'

import Image from 'next/image'
import { useState } from 'react'
import { GRADIENTS } from '@/lib/ui'

interface ProductImageProps {
  src: string
  category: string
  name: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
  priority?: boolean
}

export default function ProductImage({
  src,
  category,
  name,
  className = '',
  size = 'md',
  priority = false,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false)
  const gradient = GRADIENTS[category] || 'from-slate-500 to-slate-700'
  const sizes =
    size === 'lg'
      ? '(max-width: 1024px) 100vw, 50vw'
      : size === 'sm'
        ? '112px'
        : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'

  return (
    <div
      className={`relative w-full overflow-hidden bg-gradient-to-br ${gradient} ${className}`}
    >
      {!failed && src ? (
        <Image
          src={src}
          alt={name}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <span className="text-center text-sm font-medium text-white/90">{category}</span>
        </div>
      )}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
        aria-hidden
      />
    </div>
  )
}
