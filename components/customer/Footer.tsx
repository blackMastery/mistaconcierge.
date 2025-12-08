import Link from 'next/link'
import { Facebook, Instagram, Twitter } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">MISTA Concierge Travel CO.</h3>
            <p className="text-sm mb-4">
              Mista Concierge Travel Company is a specialty travel and leisure provider specializing in Caribbean and Latin America travel. Experience solo, private or guided vacation offerings with a full concierge level service.
            </p>
            <p className="text-sm text-gray-400 mb-4">
              Lot 10 Lusignan Public Rd, ECD
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-white">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-white font-semibold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/products" className="hover:text-white">All Products</Link></li>
              <li><Link href="/categories/single-vanities" className="hover:text-white">Single Vanities</Link></li>
              <li><Link href="/categories/double-vanities" className="hover:text-white">Double Vanities</Link></li>
              <li><Link href="/categories/mirrors" className="hover:text-white">LED Mirrors</Link></li>
              <li><Link href="/categories/new-arrivals" className="hover:text-white">New Arrivals</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link href="/shipping" className="hover:text-white">Shipping Info</Link></li>
              <li><Link href="/returns" className="hover:text-white">Returns & Exchanges</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/track-order" className="hover:text-white">Track Order</Link></li>
            </ul>
          </div>

          {/* My Account */}
          <div>
            <h4 className="text-white font-semibold mb-4">My Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/account" className="hover:text-white">My Account</Link></li>
              <li><Link href="/account/orders" className="hover:text-white">Order History</Link></li>
              <li><Link href="/account/addresses" className="hover:text-white">Addresses</Link></li>
              <li><Link href="/cart" className="hover:text-white">Shopping Cart</Link></li>
              <li><Link href="/account/wishlist" className="hover:text-white">Wishlist</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; {new Date().getFullYear()} MISTA Concierge Travel CO. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
