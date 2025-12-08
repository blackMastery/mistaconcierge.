import { createServerClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

export interface GetProductsFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  status?: string
  limit?: number
  offset?: number
  featured?: boolean
  newArrival?: boolean
}

export async function getProducts(filters?: GetProductsFilters) {
  const supabase = createServerClient()
  
  let query = supabase
    .from('products')
    .select(`
      *,
      product_images(url, alt_text, is_primary, display_order),
      product_categories(category:categories(id, name, slug))
    `)
    .eq('status', filters?.status || 'active')
    .order('created_at', { ascending: false })
  
  if (filters?.category) {
    query = query.eq('product_categories.category.slug', filters.category)
  }
  
  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }
  
  if (filters?.minPrice !== undefined) {
    query = query.gte('base_price', filters.minPrice)
  }
  
  if (filters?.maxPrice !== undefined) {
    query = query.lte('base_price', filters.maxPrice)
  }

  if (filters?.featured) {
    query = query.eq('is_featured', true)
  }

  if (filters?.newArrival) {
    query = query.eq('is_new_arrival', true)
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  
  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }
  
  const { data, error } = await query
  
  if (error) throw error
  return data
}

export async function getProductBySlug(slug: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images(id, url, alt_text, display_order, is_primary),
      product_categories(category:categories(id, name, slug)),
      reviews(
        id,
        rating,
        title,
        comment,
        created_at,
        user:profiles(full_name)
      )
    `)
    .eq('slug', slug)
    .eq('status', 'active')
    .eq('reviews.is_approved', true)
    .single()
  
  if (error) throw error
  return data
}

export async function getProductById(id: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images(id, url, alt_text, display_order, is_primary),
      product_categories(category:categories(id, name, slug))
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function createProduct(productData: ProductInsert) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('products')
    .insert(productData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateProduct(id: string, updates: ProductUpdate) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteProduct(id: string) {
  const supabase = createServerClient()
  
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return true
}

export async function getFeaturedProducts(limit: number = 8) {
  return getProducts({ featured: true, limit, status: 'active' })
}

export async function getNewArrivals(limit: number = 8) {
  return getProducts({ newArrival: true, limit, status: 'active' })
}

export async function getRelatedProducts(productId: string, categoryId: string, limit: number = 4) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images(url, alt_text, is_primary),
      product_categories!inner(category_id)
    `)
    .eq('status', 'active')
    .eq('product_categories.category_id', categoryId)
    .neq('id', productId)
    .limit(limit)
  
  if (error) throw error
  return data
}
