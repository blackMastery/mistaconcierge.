import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'

interface EditProductPageProps {
  params: { id: string }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const supabase = createServerClient()

  const [
    { data: product },
    { data: categories }
  ] = await Promise.all([
    supabase
      .from('products')
      .select(`
        *,
        product_images(id, url, alt_text, display_order, is_primary),
        product_categories(category_id)
      `)
      .eq('id', params.id)
      .single(),
    supabase
      .from('categories')
      .select('id, name')
      .order('name')
  ])

  if (!product) {
    notFound()
  }

  // Transform product data for the form
  const productAny = product as any
  const productForForm = {
    ...productAny,
    product_categories: productAny.product_categories || [],
    product_images: productAny.product_images || []
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-600 mt-2">Update product information</p>
      </div>

      <ProductForm product={productForForm} categories={categories || []} />
    </div>
  )
}

