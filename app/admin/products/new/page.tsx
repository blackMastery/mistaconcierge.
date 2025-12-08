import { createServerClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/ProductForm'

export default async function NewProductPage() {
  const supabase = createServerClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Product</h1>
        <p className="text-gray-600 mt-2">Add a new product to your catalog</p>
      </div>

      <ProductForm categories={categories || []} />
    </div>
  )
}
