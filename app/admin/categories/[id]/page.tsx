import { createServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CategoryForm from '@/components/admin/CategoryForm'

interface EditCategoryPageProps {
  params: { id: string }
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const supabase = createServerClient()

  const [
    { data: category },
    { data: categories }
  ] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('id', params.id)
      .single(),
    supabase
      .from('categories')
      .select('id, name, slug')
      .order('name', { ascending: true })
  ])

  if (!category) {
    notFound()
  }

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Category</h1>
        <p className="text-gray-600 mt-2">Update category information</p>
      </div>

      <CategoryForm category={category} categories={categories || []} />
    </div>
  )
}

