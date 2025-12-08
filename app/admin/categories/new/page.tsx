import { createServerClient } from '@/lib/supabase/server'
import CategoryForm from '@/components/admin/CategoryForm'

export default async function NewCategoryPage() {
  const supabase = createServerClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', { ascending: true })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">New Category</h1>
        <p className="text-gray-600 mt-2">Create a new product category</p>
      </div>

      <CategoryForm categories={categories || []} />
    </div>
  )
}

