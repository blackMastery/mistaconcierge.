'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { slugify, generateSKU } from '@/lib/utils/slugify'

interface Category {
  id: string
  name: string
}

interface ProductImage {
  id?: string
  url: string
  alt_text?: string
  display_order: number
  is_primary: boolean
  file?: File
  path?: string
}

interface ProductFormProps {
  product?: any
  categories: Category[]
}

export default function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingImages, setUploadingImages] = useState(false)
  
  // Initialize images from product data, sorted by display_order
  const initialImages: ProductImage[] = product?.product_images
    ?.sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
    .map((img: any) => ({
      id: img.id,
      url: img.url,
      alt_text: img.alt_text,
      display_order: img.display_order ?? 0,
      is_primary: img.is_primary ?? false,
      path: img.path
    })) || []

  const [images, setImages] = useState<ProductImage[]>(initialImages)
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
    category_ids: product?.product_categories?.map((pc: any) => pc.category_id) || []
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
      
      // Prepare image data for API
      const imageData = images.map((img, index) => ({
        url: img.url,
        alt_text: img.alt_text || formData.name,
        display_order: index,
        is_primary: img.is_primary
      }))
      
      // Convert empty strings to null for numeric fields (except base_price which is required)
      const cleanedData = {
        ...formData,
        base_price: parseFloat(formData.base_price as string) || 0,
        sale_price: formData.sale_price === '' ? null : (formData.sale_price ? parseFloat(formData.sale_price as string) : null),
        width: formData.width === '' ? null : (formData.width ? parseFloat(formData.width as string) : null),
        height: formData.height === '' ? null : (formData.height ? parseFloat(formData.height as string) : null),
        depth: formData.depth === '' ? null : (formData.depth ? parseFloat(formData.depth as string) : null),
        weight: formData.weight === '' ? null : (formData.weight ? parseFloat(formData.weight as string) : null),
        image_data: imageData
      }
      
      const response = await fetch(endpoint, {
        method: product ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData)
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

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploadingImages(true)
    const newImages: ProductImage[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
        if (!validTypes.includes(file.type)) {
          alert(`${file.name} is not a valid image file. Only JPEG, PNG, WebP, and GIF are allowed.`)
          continue
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
          alert(`${file.name} exceeds 5MB limit.`)
          continue
        }

        // Create preview URL
        const previewUrl = URL.createObjectURL(file)

        // Upload to Supabase Storage
        const uploadFormData = new FormData()
        uploadFormData.append('file', file)

        const response = await fetch('/api/admin/products/upload-image', {
          method: 'POST',
          body: uploadFormData
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || 'Failed to upload image')
        }

        const { url, path } = await response.json()

        newImages.push({
          url,
          path,
          alt_text: formData.name || file.name,
          display_order: images.length + newImages.length,
          is_primary: images.length === 0 && newImages.length === 0,
          file
        })
      }

      // Update images state
      setImages(prev => {
        const updated = [...prev, ...newImages]
        // Ensure only one primary image
        if (newImages.length > 0 && updated.some(img => img.is_primary)) {
          return updated
        }
        return updated
      })
    } catch (error: any) {
      console.error('Error uploading images:', error)
      alert(error.message || 'Failed to upload images')
    } finally {
      setUploadingImages(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = images[index]
    const wasPrimary = imageToRemove.is_primary

    // If deleting a newly uploaded image (not yet saved to DB), remove from storage
    if (imageToRemove.path && !imageToRemove.id) {
      try {
        const response = await fetch(`/api/admin/products/upload-image?path=${encodeURIComponent(imageToRemove.path)}`, {
          method: 'DELETE'
        })
        if (!response.ok) {
          console.error('Failed to delete image from storage')
        }
      } catch (error) {
        console.error('Error deleting image from storage:', error)
      }
    }

    // Remove from state
    const newImages = images.filter((_, i) => i !== index)

    // If we removed the primary image and there are other images, set the first one as primary
    if (wasPrimary && newImages.length > 0) {
      newImages[0].is_primary = true
    }

    // Update display orders
    newImages.forEach((img, i) => {
      img.display_order = i
    })

    setImages(newImages)
  }

  const handleSetPrimaryImage = (index: number) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      is_primary: i === index
    })))
  }

  const handleImageAltTextChange = (index: number, altText: string) => {
    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, alt_text: altText } : img
    ))
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

      {/* Product Images */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Product Images</h2>
        
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            multiple
            onChange={(e) => handleImageUpload(e.target.files)}
            className="hidden"
            id="image-upload"
            disabled={uploadingImages}
          />
          <label
            htmlFor="image-upload"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {uploadingImages ? 'Uploading...' : 'Upload Images'}
          </label>
          <p className="text-sm text-gray-500 mt-2">
            Upload multiple images. Select one as the primary/preview image. Max 5MB per image.
          </p>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className={`relative group border-2 rounded-lg overflow-hidden ${
                  image.is_primary ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                }`}
              >
                <div className="aspect-square bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.alt_text || `Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {image.is_primary && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Primary
                  </div>
                )}

                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    {!image.is_primary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(index)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                        title="Set as primary"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="p-2 bg-white">
                  <input
                    type="text"
                    value={image.alt_text || ''}
                    onChange={(e) => handleImageAltTextChange(index, e.target.value)}
                    placeholder="Alt text"
                    className="w-full text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length === 0 && !uploadingImages && (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>No images uploaded yet</p>
          </div>
        )}
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
          disabled={loading || uploadingImages}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Saving...' : uploadingImages ? 'Uploading Images...' : product ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  )
}
