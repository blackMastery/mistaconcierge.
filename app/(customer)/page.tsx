import Link from 'next/link'
import { getFeaturedProducts, getNewArrivals } from '@/lib/api/products'
import ProductGrid from '@/components/customer/ProductGrid'
import { ArrowRight } from 'lucide-react'

export default async function HomePage() {
  const [featuredProducts, newArrivals] = await Promise.all([
    getFeaturedProducts(8),
    getNewArrivals(8)
  ])

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Transform Your Bathroom
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Discover our premium collection of bathroom vanities, LED mirrors, and luxury fixtures. 
              Quality craftsmanship meets modern design.
            </p>
            <div className="flex gap-4">
              <Link 
                href="/products"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
              >
                Shop Now
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                href="/categories/new-arrivals"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                New Arrivals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/categories/single-vanities" className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video bg-gray-200"></div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600">
                    Single Vanities
                  </h3>
                  <p className="text-gray-600">
                    Perfect for smaller bathrooms and powder rooms
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/categories/double-vanities" className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video bg-gray-200"></div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600">
                    Double Vanities
                  </h3>
                  <p className="text-gray-600">
                    Spacious designs for master bathrooms
                  </p>
                </div>
              </div>
            </Link>

            <Link href="/categories/mirrors" className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                <div className="aspect-video bg-gray-200"></div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600">
                    LED Mirrors
                  </h3>
                  <p className="text-gray-600">
                    Modern illuminated mirrors with premium features
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <Link href="/products?featured=true" className="text-blue-600 hover:text-blue-700 font-medium">
                View All →
              </Link>
            </div>
            <ProductGrid products={featuredProducts} />
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals && newArrivals.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">New Arrivals</h2>
              <Link href="/categories/new-arrivals" className="text-blue-600 hover:text-blue-700 font-medium">
                View All →
              </Link>
            </div>
            <ProductGrid products={newArrivals} />
          </div>
        </section>
      )}

      {/* Why Choose Us */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="font-semibold mb-2">Free Shipping</h3>
              <p className="text-gray-600 text-sm">On orders over $500</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="font-semibold mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600 text-sm">Premium materials and craftsmanship</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-600 text-sm">Dedicated customer service team</p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">↩️</span>
              </div>
              <h3 className="font-semibold mb-2">Easy Returns</h3>
              <p className="text-gray-600 text-sm">30-day return policy</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
