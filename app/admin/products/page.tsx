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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">Manage your product catalog</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                products.map((product) => {
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
