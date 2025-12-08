'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { slugify, generateSKU } from '@/lib/utils/slugify'

interface Category {
  id: string
  name: string
}

interface ProductFormProps {
  product?: any
  categories: Category[]
}

export default function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    sku: product?.sku || '',
    description: product?.description || '',
    short_description: product?.short_description || '',
    base_price: product?.base_price || '',
    sale_price: product?.sale_price || '',
    stock_quantity: product?.stock_quantity || 0,
    status: product?.status || 'draft',
    is_featured: product?.is_featured || false,
    is_new_arrival: product?.is_new_arrival || false,
    width: product?.width || '',
    height: product?.height || '',
    depth: product?.depth || '',
    weight: product?.weight || '',
    category_ids: product?.product_categories?.map((pc: any) => pc.category_id) || [],
    image_urls: product?.product_images?.map((img: any) => img.url) || []
  })

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: slugify(name),
      sku: product?.sku || generateSKU(name)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const endpoint = product 
        ? `/api/admin/products/${product.id}`
        : '/api/admin/products'
      
      const response = await fetch(endpoint, {
        method: product ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save product')
      }

      router.push('/admin/products')
      router.refresh()
    } catch (error: any) {
      console.error('Error saving product:', error)
      alert(error.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryToggle = (categoryId: string) => {
    const ids = formData.category_ids.includes(categoryId)
      ? formData.category_ids.filter(id => id !== categoryId)
      : [...formData.category_ids, categoryId]
    setFormData({ ...formData, category_ids: ids })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Product Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Slug *</label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">SKU *</label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Short Description</label>
          <textarea
            value={formData.short_description}
            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            placeholder="Brief description for product listings"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Full Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={6}
            placeholder="Detailed product description"
          />
        </div>
      </div>

      {/* Pricing & Inventory */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Pricing & Inventory</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Base Price ($) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Sale Price ($)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.sale_price}
              onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Stock Quantity *</label>
            <input
              type="number"
              min="0"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>
      </div>

      {/* Dimensions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Dimensions</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Width (in)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.width}
              onChange={(e) => setFormData({ ...formData, width: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Height (in)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Depth (in)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.depth}
              onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Weight (lbs)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((category) => (
            <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.category_ids.includes(category.id)}
                onChange={() => handleCategoryToggle(category.id)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">{category.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status & Features */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Status & Features</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="pre_order">Pre-Order</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          <div className="flex gap-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Featured Product</span>
            </label>
            
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_new_arrival}
                onChange={(e) => setFormData({ ...formData, is_new_arrival: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium">New Arrival</span>
            </label>
          </div>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  )
}
