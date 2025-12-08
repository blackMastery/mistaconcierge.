import { notFound } from 'next/navigation'
import { getProductBySlug } from '@/lib/api/products'
import { formatCurrency } from '@/lib/utils/currency'
import { Star, Phone, Mail, MapPin } from 'lucide-react'
import ProductImageGallery from '@/components/customer/ProductImageGallery'
import WhatsAppButton from '@/components/customer/WhatsAppButton'
import { getStoreSettings } from '@/lib/api/settings'

interface ProductPageProps {
  params: {
    slug: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const [product, storeSettings] = await Promise.all([
    getProductBySlug(params.slug),
    getStoreSettings()
  ])

  if (!product) {
    notFound()
  }

  const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0]
  const hasDiscount = product.sale_price !== null && product.sale_price !== undefined && product.sale_price < product.base_price
  const displayPrice = hasDiscount && product.sale_price !== null ? product.sale_price : product.base_price
  const savings = hasDiscount && product.sale_price !== null ? product.base_price - product.sale_price : 0

  // Calculate average rating
  const avgRating = product.reviews?.length 
    ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length 
    : 0

  // Prepare WhatsApp message
  const whatsappMessage = `Hello! I'm interested in: ${product.name}${product.sku ? ` (SKU: ${product.sku})` : ''}`
  const whatsappNumber = (() => {
    const num = storeSettings.whatsapp_number || storeSettings.store_phone || ''
    if (typeof num === 'object') {
      return JSON.stringify(num)
    }
    return String(num)
  })()

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Images */}
        <div className="w-full">
          <ProductImageGallery 
            images={product.product_images || []} 
            productName={product.name}
          />
        </div>

        {/* Product Details */}
        <div className="space-y-4 sm:space-y-6">
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
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
              <h3 className="font-semibold mb-3 text-lg">Specifications</h3>
              <dl className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                {product.width && (
                  <>
                    <dt className="text-gray-600">Width:</dt>
                    <dd className="font-medium">
                      {typeof product.width === 'object' ? JSON.stringify(product.width) : product.width} inches
                    </dd>
                  </>
                )}
                {product.height && (
                  <>
                    <dt className="text-gray-600">Height:</dt>
                    <dd className="font-medium">
                      {typeof product.height === 'object' ? JSON.stringify(product.height) : product.height} inches
                    </dd>
                  </>
                )}
                {product.depth && (
                  <>
                    <dt className="text-gray-600">Depth:</dt>
                    <dd className="font-medium">
                      {typeof product.depth === 'object' ? JSON.stringify(product.depth) : product.depth} inches
                    </dd>
                  </>
                )}
                {product.weight && (
                  <>
                    <dt className="text-gray-600">Weight:</dt>
                    <dd className="font-medium">
                      {typeof product.weight === 'object' ? JSON.stringify(product.weight) : product.weight} lbs
                    </dd>
                  </>
                )}
              </dl>
            </div>
          )}

          {/* Contact Information & WhatsApp */}
          <div className="bg-blue-50 border border-blue-200 p-4 sm:p-6 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
            
            {/* Contact Details */}
            <div className="space-y-3 text-sm">
              {storeSettings.store_phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <a 
                    href={`tel:${typeof storeSettings.store_phone === 'string' ? storeSettings.store_phone : String(storeSettings.store_phone)}`}
                    className="text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    {typeof storeSettings.store_phone === 'object' 
                      ? JSON.stringify(storeSettings.store_phone) 
                      : String(storeSettings.store_phone)}
                  </a>
                </div>
              )}
              {storeSettings.store_email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
                  <a 
                    href={`mailto:${typeof storeSettings.store_email === 'string' ? storeSettings.store_email : String(storeSettings.store_email)}`}
                    className="text-gray-700 hover:text-blue-600 transition-colors break-all"
                  >
                    {typeof storeSettings.store_email === 'object' 
                      ? JSON.stringify(storeSettings.store_email) 
                      : String(storeSettings.store_email)}
                  </a>
                </div>
              )}
              {storeSettings.store_address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">
                    {typeof storeSettings.store_address === 'object' 
                      ?  'No address available'
                      : storeSettings.store_address}
                  </span>
                </div>
              )}
            </div>

            {/* WhatsApp Button */}
            {whatsappNumber && (
              <div className="pt-2">
                <WhatsAppButton
                  phoneNumber={whatsappNumber}
                  message={whatsappMessage}
                  variant="inline"
                  className="w-full sm:w-auto"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Description */}
      {product.description && (
        <div className="mt-8 sm:mt-12 border-t pt-8 sm:pt-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Product Description</h2>
          <div className="prose max-w-none text-gray-700 whitespace-pre-wrap text-sm sm:text-base">
            {product.description}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="mt-8 sm:mt-12 border-t pt-8 sm:pt-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Customer Reviews</h2>
          <div className="space-y-4 sm:space-y-6">
            {product.reviews.map((review: any) => (
              <div key={review.id} className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3">
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
                  <span className="font-medium text-sm sm:text-base">{review.user?.full_name || 'Anonymous'}</span>
                  <span className="text-xs sm:text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
                {review.title && (
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">{review.title}</h4>
                )}
                {review.comment && (
                  <p className="text-gray-700 text-sm sm:text-base">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Floating WhatsApp Button */}
      {whatsappNumber && (
        <div className="fixed bottom-6 right-6 z-40">
          <WhatsAppButton
            phoneNumber={whatsappNumber}
            message={whatsappMessage}
            variant="floating"
          />
        </div>
      )}
    </div>
  )
}
