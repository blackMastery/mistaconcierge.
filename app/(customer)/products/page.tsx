import { getProducts } from '@/lib/api/products'
import ProductGrid from '@/components/customer/ProductGrid'

interface ProductsPageProps {
  searchParams: {
    category?: string
    search?: string
    minPrice?: string
    maxPrice?: string
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const products = await getProducts({
    category: searchParams.category,
    search: searchParams.search,
    minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
    status: 'active'
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Products</h1>
        <p className="text-gray-600">
          Showing {products?.length || 0} products
        </p>
      </div>

      {/* Filters can be added here */}
      <div className="flex gap-8">
        {/* Sidebar for filters - can be expanded later */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="font-semibold mb-4">Filters</h2>
            {/* Add filter components here */}
            <p className="text-sm text-gray-500">Coming soon...</p>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <ProductGrid 
            products={products || []} 
            emptyMessage="No products found matching your criteria"
          />
        </div>
      </div>
    </div>
  )
}
