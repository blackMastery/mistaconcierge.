import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

// Check if user is admin
async function checkAdminAuth() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { isAdmin: false, error: 'Unauthorized' }
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return { isAdmin: false, error: 'Forbidden' }
  }
  
  return { isAdmin: true }
}

// Sanitize numeric fields - convert empty strings to null (except base_price which is required)
function sanitizeNumericFields(data: any) {
  const optionalNumericFields = ['sale_price', 'width', 'height', 'depth', 'weight']
  const sanitized = { ...data }
  
  // Handle base_price separately (required field)
  if (sanitized.base_price === '' || sanitized.base_price === undefined) {
    sanitized.base_price = 0
  } else if (typeof sanitized.base_price === 'string') {
    const parsed = parseFloat(sanitized.base_price)
    sanitized.base_price = isNaN(parsed) ? 0 : parsed
  }
  
  // Handle optional numeric fields
  optionalNumericFields.forEach(field => {
    if (sanitized[field] === '' || sanitized[field] === undefined) {
      sanitized[field] = null
    } else if (typeof sanitized[field] === 'string') {
      const parsed = parseFloat(sanitized[field])
      sanitized[field] = isNaN(parsed) ? null : parsed
    }
  })
  
  return sanitized
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth()
    if (!auth.isAdmin) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const supabase = createServerClient()
    const body = await request.json()
    const { image_data, category_ids, ...productData } = body
    
    // Sanitize numeric fields
    const sanitizedData = sanitizeNumericFields(productData)
    
    // Validate required fields
    if (!sanitizedData.base_price || sanitizedData.base_price <= 0) {
      return NextResponse.json(
        { error: 'Base price is required and must be greater than 0' },
        { status: 400 }
      )
    }
    
    // Insert product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert(sanitizedData)
      .select()
      .single()
    
    if (productError) throw productError
    
    // Insert images
    if (image_data && image_data.length > 0) {
      const imageRecords = image_data.map((img: any) => ({
        product_id: product.id,
        url: img.url,
        alt_text: img.alt_text || productData.name,
        display_order: img.display_order ?? 0,
        is_primary: img.is_primary ?? false
      }))
      
      const { error: imagesError } = await supabase
        .from('product_images')
        .insert(imageRecords)
      
      if (imagesError) console.error('Error inserting images:', imagesError)
    }
    
    // Insert categories
    if (category_ids && category_ids.length > 0) {
      const categoryRecords = category_ids.map((catId: string) => ({
        product_id: product.id,
        category_id: catId
      }))
      
      const { error: categoriesError } = await supabase
        .from('product_categories')
        .insert(categoryRecords)
      
      if (categoriesError) console.error('Error inserting categories:', categoriesError)
    }
    
    return NextResponse.json({ data: product })
  } catch (error: any) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const searchParams = request.nextUrl.searchParams
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    
    let query = supabase
      .from('products')
      .select('*, product_images(url, is_primary)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)
    
    if (status) {
      query = query.eq('status', status)
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%`)
    }
    
    const { data, error, count } = await query
    
    if (error) throw error
    
    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error: any) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
