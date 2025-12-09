import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { formatCurrency } from '@/lib/utils/currency'
import { Plus, Edit, Package } from 'lucide-react'
import DeleteProductButton from '@/components/admin/DeleteProductButton'

export default async function AdminProductsPage() {
  const supabase = createServerClient()

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images(url, is_primary)
    `)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Manage your product catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          <span>Add Product</span>
        </Link>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {products && products.length > 0 ? (
          (products as any[]).map((product: any) => {
            const primaryImage = product.product_images?.find((img: any) => img.is_primary)
            const hasDiscount = product.sale_price && product.sale_price < product.base_price
            const displayPrice = hasDiscount ? product.sale_price : product.base_price

            return (
              <div key={product.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex gap-4">
                  {primaryImage && (
                    <img
                      src={primaryImage.url}
                      alt={product.name}
                      className="h-20 w-20 rounded object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                    <p className="text-sm text-gray-500 truncate">{product.slug}</p>
                    <div className="mt-2 space-y-1">
                      <div className="text-sm">
                        <span className="text-gray-600">SKU: </span>
                        <span className="font-medium">{product.sku}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Price: </span>
                        <span className="font-medium text-gray-900">{formatCurrency(displayPrice)}</span>
                        {hasDiscount && (
                          <span className="text-xs text-gray-500 line-through ml-2">
                            {formatCurrency(product.base_price)}
                          </span>
                        )}
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Stock: </span>
                        <span className={`font-medium ${
                          product.stock_quantity === 0
                            ? 'text-red-600'
                            : product.stock_quantity < product.low_stock_threshold
                            ? 'text-yellow-600'
                            : 'text-gray-900'
                        }`}>
                          {product.stock_quantity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          product.status === 'active' ? 'bg-green-100 text-green-800' :
                          product.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          product.status === 'pre_order' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="text-blue-600 hover:text-blue-700 p-2"
                      title="Edit product"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <DeleteProductButton
                      productId={product.id}
                      productName={product.name}
                    />
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <div className="flex flex-col items-center">
              <Package className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">No products yet</p>
              <p className="text-sm mt-1">Get started by creating your first product</p>
              <Link
                href="/admin/products/new"
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Product
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products && products.length > 0 ? (
                (products as any[]).map((product: any) => {
                  const primaryImage = product.product_images?.find((img: any) => img.is_primary)
                  const hasDiscount = product.sale_price && product.sale_price < product.base_price
                  const displayPrice = hasDiscount ? product.sale_price : product.base_price

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {primaryImage && (
                            <img
                              src={primaryImage.url}
                              alt={product.name}
                              className="h-12 w-12 rounded object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {product.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(displayPrice)}
                        </div>
                        {hasDiscount && (
                          <div className="text-xs text-gray-500 line-through">
                            {formatCurrency(product.base_price)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${
                          product.stock_quantity === 0
                            ? 'text-red-600 font-semibold'
                            : product.stock_quantity < product.low_stock_threshold
                            ? 'text-yellow-600 font-semibold'
                            : 'text-gray-900'
                        }`}>
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          product.status === 'active' ? 'bg-green-100 text-green-800' :
                          product.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                          product.status === 'pre_order' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="text-blue-600 hover:text-blue-700"
                            title="Edit product"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <DeleteProductButton
                            productId={product.id}
                            productName={product.name}
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Package className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium">No products yet</p>
                      <p className="text-sm mt-1">Get started by creating your first product</p>
                      <Link
                        href="/admin/products/new"
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Create Product
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
