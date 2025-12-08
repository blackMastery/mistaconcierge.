import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/lib/api/products'
import { formatCurrency } from '@/lib/utils/currency'
import { Star } from 'lucide-react'

interface ProductPageProps {
  params: {
    slug: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0]
  const hasDiscount = product.sale_price && product.sale_price < product.base_price
  const displayPrice = hasDiscount ? product.sale_price : product.base_price
  const savings = hasDiscount ? product.base_price - product.sale_price : 0

  // Calculate average rating
  const avgRating = product.reviews?.length 
    ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length 
    : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt_text || product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No Image Available
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {product.product_images && product.product_images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.product_images.map((image: any, idx: number) => (
                <div key={image.id} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-75">
                  <Image
                    src={image.url}
                    alt={image.alt_text || `${product.name} ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            
            {/* Rating */}
            {product.reviews && product.reviews.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= avgRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({product.reviews.length} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-gray-900">
                {formatCurrency(displayPrice)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-2xl text-gray-500 line-through">
                    {formatCurrency(product.base_price)}
                  </span>
                  <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                    Save {formatCurrency(savings)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Short Description */}
          {product.short_description && (
            <p className="text-lg text-gray-700">{product.short_description}</p>
          )}

          {/* Stock Status */}
          <div className="border-t border-b py-4">
            {product.stock_quantity > 0 ? (
              <p className="text-green-600 font-medium">
                ✓ In Stock ({product.stock_quantity} available)
              </p>
            ) : product.status === 'pre_order' ? (
              <p className="text-blue-600 font-medium">
                Available for Pre-Order
              </p>
            ) : (
              <p className="text-red-600 font-medium">
                Out of Stock
              </p>
            )}
          </div>

          {/* Dimensions */}
          {(product.width || product.height || product.depth || product.weight) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-3">Specifications</h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {product.width && (
                  <>
                    <dt className="text-gray-600">Width:</dt>
                    <dd className="font-medium">{product.width} inches</dd>
                  </>
                )}
                {product.height && (
                  <>
                    <dt className="text-gray-600">Height:</dt>
                    <dd className="font-medium">{product.height} inches</dd>
                  </>
                )}
                {product.depth && (
                  <>
                    <dt className="text-gray-600">Depth:</dt>
                    <dd className="font-medium">{product.depth} inches</dd>
                  </>
                )}
                {product.weight && (
                  <>
                    <dt className="text-gray-600">Weight:</dt>
                    <dd className="font-medium">{product.weight} lbs</dd>
                  </>
                )}
              </dl>
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            disabled={product.stock_quantity === 0 && product.status !== 'pre_order'}
            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg"
          >
            {product.stock_quantity > 0 ? 'Add to Cart' : product.status === 'pre_order' ? 'Pre-Order Now' : 'Out of Stock'}
          </button>
        </div>
      </div>

      {/* Full Description */}
      {product.description && (
        <div className="mt-12 border-t pt-12">
          <h2 className="text-2xl font-bold mb-6">Product Description</h2>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
            {product.description}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="mt-12 border-t pt-12">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
          <div className="space-y-6">
            {product.reviews.map((review: any) => (
              <div key={review.id} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= review.rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium">{review.user?.full_name || 'Anonymous'}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.title && (
                  <h4 className="font-semibold mb-2">{review.title}</h4>
                )}
                {review.comment && (
                  <p className="text-gray-700">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
