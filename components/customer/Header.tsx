'use client'

import Link from 'next/link'
import { ShoppingCart, User, Search, Menu } from 'lucide-react'
import { useState } from 'react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-900">
            YourStore
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            <Link
              href="/account"
              className="hidden md:flex items-center gap-2 text-gray-700 hover:text-blue-600"
            >
              <User className="h-6 w-6" />
              <span className="text-sm">Account</span>
            </Link>

            <Link
              href="/cart"
              className="relative flex items-center gap-2 text-gray-700 hover:text-blue-600"
            >
              <ShoppingCart className="h-6 w-6" />
              <span className="hidden md:inline text-sm">Cart</span>
              {/* Cart count badge */}
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8 py-3 border-t">
          <Link href="/products" className="text-gray-700 hover:text-blue-600 font-medium">
            All Products
          </Link>
          <Link href="/categories/single-vanities" className="text-gray-700 hover:text-blue-600">
            Single Vanities
          </Link>
          <Link href="/categories/double-vanities" className="text-gray-700 hover:text-blue-600">
            Double Vanities
          </Link>
          <Link href="/categories/mirrors" className="text-gray-700 hover:text-blue-600">
            LED Mirrors
          </Link>
          <Link href="/categories/new-arrivals" className="text-gray-700 hover:text-blue-600">
            New Arrivals
          </Link>
          <Link href="/categories/sale" className="text-red-600 hover:text-red-700 font-medium">
            Sale
          </Link>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <Link href="/products" className="text-gray-700 hover:text-blue-600">
                All Products
              </Link>
              <Link href="/categories/single-vanities" className="text-gray-700 hover:text-blue-600">
                Single Vanities
              </Link>
              <Link href="/categories/double-vanities" className="text-gray-700 hover:text-blue-600">
                Double Vanities
              </Link>
              <Link href="/categories/mirrors" className="text-gray-700 hover:text-blue-600">
                LED Mirrors
              </Link>
              <Link href="/categories/new-arrivals" className="text-gray-700 hover:text-blue-600">
                New Arrivals
              </Link>
              <Link href="/account" className="text-gray-700 hover:text-blue-600">
                My Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
