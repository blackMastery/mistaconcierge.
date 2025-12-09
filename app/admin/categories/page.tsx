import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { Plus, Edit, FolderTree } from 'lucide-react'
import DeleteCategoryButton from '@/components/admin/DeleteCategoryButton'

export default async function AdminCategoriesPage() {
  const supabase = createServerClient()

  // Fetch all categories without relationship syntax
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching categories:', error)
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-2">Manage your product categories</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold">Error loading categories</p>
          <p className="text-red-600 text-sm mt-1">{error.message}</p>
        </div>
      </div>
    )
  }

  // Define category type
  type Category = {
    id: string
    name: string
    slug: string
    parent_id: string | null
    display_order: number
    is_active: boolean
    description?: string | null
    image_url?: string | null
    meta_title?: string | null
    meta_description?: string | null
    created_at: string
    updated_at: string
  }

  type CategoryWithParent = Category & {
    parent?: { id: string; name: string } | null
  }

  // Manually join parent data
  const allCategoriesData = (categories || []) as Category[]
  const categoriesWithParent: CategoryWithParent[] = allCategoriesData.map(category => {
    const parent = category.parent_id 
      ? allCategoriesData.find(cat => cat.id === category.parent_id)
      : null
    
    return {
      ...category,
      parent: parent ? { id: parent.id, name: parent.name } : null
    }
  })

  // Organize categories into flat tree structure with levels

  const getCategoryLevel = (category: CategoryWithParent, allCategories: CategoryWithParent[]): number => {
    if (!category?.parent_id) return 0
    const parent = allCategories.find(cat => cat?.id === category.parent_id)
    if (!parent) return 0
    return 1 + getCategoryLevel(parent, allCategories)
  }

  const categoriesWithLevels = categoriesWithParent
    .map(cat => {
      const level = getCategoryLevel(cat, categoriesWithParent)
      return {
        ...cat,
        level
      }
    })
    .sort((a, b) => {
    // Sort by level first, then by display_order, then by name
    if (a.level !== b.level) return a.level - b.level
    if (a.display_order !== b.display_order) return a.display_order - b.display_order
    return a.name.localeCompare(b.name)
  })

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-2">Manage your product categories</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus className="h-5 w-5" />
          <span>Add Category</span>
        </Link>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {categories && categories.length > 0 ? (
          categoriesWithLevels.map((category) => (
            <div key={category.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div
                      style={{ paddingLeft: `${Math.min(category.level * 16, 32)}px` }}
                      className="flex items-center gap-2"
                    >
                      {category.level > 0 && (
                        <span className="text-gray-400 text-sm">└─</span>
                      )}
                      <h3 className="font-medium text-gray-900 truncate">{category.name}</h3>
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  <div className="mt-2 space-y-1">
                    <div className="text-sm">
                      <span className="text-gray-600">Slug: </span>
                      <span className="font-medium">{category.slug}</span>
                    </div>
                    {category.parent && (
                      <div className="text-sm">
                        <span className="text-gray-600">Parent: </span>
                        <span className="font-medium">{category.parent.name}</span>
                      </div>
                    )}
                    <div className="text-sm">
                      <span className="text-gray-600">Order: </span>
                      <span className="font-medium">{category.display_order}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        category.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Link
                    href={`/admin/categories/${category.id}`}
                    className="text-blue-600 hover:text-blue-700 p-2"
                    title="Edit category"
                  >
                    <Edit className="h-5 w-5" />
                  </Link>
                  <DeleteCategoryButton
                    categoryId={category.id}
                    categoryName={category.name}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <div className="flex flex-col items-center">
              <FolderTree className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">No categories yet</p>
              <p className="text-sm mt-1">Get started by creating your first category</p>
              <Link
                href="/admin/categories/new"
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Category
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Parent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories && categories.length > 0 ? (
                categoriesWithLevels.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          style={{ paddingLeft: `${category.level * 24}px` }}
                          className="flex items-center gap-2"
                        >
                          {category.level > 0 && (
                            <span className="text-gray-400">└─</span>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">
                              {category.name}
                            </div>
                            {category.description && (
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {category.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {category.slug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {category.parent ? (
                        <span className="text-gray-600">{category.parent.name}</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {category.display_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        category.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/categories/${category.id}`}
                          className="text-blue-600 hover:text-blue-700"
                          title="Edit category"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <DeleteCategoryButton
                          categoryId={category.id}
                          categoryName={category.name}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <FolderTree className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium">No categories yet</p>
                      <p className="text-sm mt-1">Get started by creating your first category</p>
                      <Link
                        href="/admin/categories/new"
                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Create Category
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

