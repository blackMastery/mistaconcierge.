'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductImage {
  id: string
  url: string
  alt_text?: string | null
  is_primary?: boolean
}

interface ProductImageGalleryProps {
  images: ProductImage[]
  productName: string
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        <span className="text-gray-400">No Image Available</span>
      </div>
    )
  }

  const primaryImage = images.find(img => img.is_primary) || images[0]
  const currentImage = images[selectedIndex] || primaryImage

  const openLightbox = (index: number) => {
    setSelectedIndex(index)
    setIsLightboxOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setIsLightboxOpen(false)
    document.body.style.overflow = 'unset'
  }

  const navigateImage = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
    } else {
      setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowLeft') navigateImage('prev')
    if (e.key === 'ArrowRight') navigateImage('next')
  }

  return (
    <>
      <div className="space-y-4">
        {/* Main Image */}
        <div 
          className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-zoom-in group"
          onClick={() => openLightbox(0)}
        >
          <Image
            src={currentImage.url}
            alt={currentImage.alt_text || `${productName} - Main image`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Thumbnail Gallery */}
        {images.length > 1 && (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 gap-2 sm:gap-3">
            {images.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedIndex(index)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIndex === index
                    ? 'border-blue-600 ring-2 ring-blue-200'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  src={image.url}
                  alt={image.alt_text || `${productName} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 25vw, 20vw"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 p-2"
            aria-label="Close lightbox"
          >
            <X className="h-8 w-8" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigateImage('prev')
                }}
                className="absolute left-4 text-white hover:text-gray-300 z-10 p-2 bg-black/50 rounded-full"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  navigateImage('next')
                }}
                className="absolute right-4 text-white hover:text-gray-300 z-10 p-2 bg-black/50 rounded-full"
                aria-label="Next image"
              >
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          <div
            className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[selectedIndex].url}
              alt={images[selectedIndex].alt_text || `${productName} - Image ${selectedIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  )
}

