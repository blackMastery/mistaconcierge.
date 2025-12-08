'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface DeleteProductButtonProps {
  productId: string
  productName: string
}

export default function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete product')
      }

      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Failed to delete product')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
      title="Delete product"
    >
      <Trash2 className="h-5 w-5" />
    </button>
  )
}

