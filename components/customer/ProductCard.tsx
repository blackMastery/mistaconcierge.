'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/currency'

interface ProductImage {
  url: string
  alt_text: string | null
  is_primary: boolean
}

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    base_price: number
    sale_price: number | null
    stock_quantity: number
    status: string
    product_images: ProductImage[]
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0]
  const hasDiscount = product.sale_price !== null && product.sale_price !== undefined && product.sale_price < product.base_price
  const displayPrice = hasDiscount && product.sale_price !== null ? product.sale_price : product.base_price
  const isPreOrder = product.status === 'pre_order'
  const isOutOfStock = product.stock_quantity === 0

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow overflow-hidden">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt_text || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isPreOrder && (
              <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded">
                Pre-Order
              </span>
            )}
            {hasDiscount && !isOutOfStock && (
              <span className="bg-red-600 text-white text-xs font-medium px-2 py-1 rounded">
                Sale
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-gray-800 text-white text-xs font-medium px-2 py-1 rounded">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
          
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              {formatCurrency(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(product.base_price)}
              </span>
            )}
          </div>
          
          {isPreOrder && (
            <p className="mt-2 text-sm text-blue-600">
              Available for pre-order
            </p>
          )}

          {isOutOfStock && !isPreOrder && (
            <p className="mt-2 text-sm text-red-600">
              Currently unavailable
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
