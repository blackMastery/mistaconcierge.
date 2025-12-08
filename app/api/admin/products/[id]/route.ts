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

// Sanitize numeric fields - convert empty strings to null (base_price can be updated but should remain a number)
function sanitizeNumericFields(data: any) {
  const optionalNumericFields = ['sale_price', 'width', 'height', 'depth', 'weight']
  const sanitized = { ...data }
  
  // Handle base_price separately (if provided, must be a valid number)
  if (sanitized.base_price !== undefined) {
    if (sanitized.base_price === '') {
      // Don't update base_price if empty string is sent
      delete sanitized.base_price
    } else if (typeof sanitized.base_price === 'string') {
      const parsed = parseFloat(sanitized.base_price)
      if (!isNaN(parsed)) {
        sanitized.base_price = parsed
      } else {
        delete sanitized.base_price
      }
    }
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Update product
    const { data: product, error: productError } = await supabase
      .from('products')
      .update(sanitizedData)
      .eq('id', params.id)
      .select()
      .single()
    
    if (productError) throw productError
    
    // Update images if provided
    if (image_data !== undefined) {
      // Get existing images to delete from storage if needed
      const { data: existingImages } = await supabase
        .from('product_images')
        .select('path')
        .eq('product_id', params.id)
      
      // Delete existing images from database
      await supabase
        .from('product_images')
        .delete()
        .eq('product_id', params.id)
      
      // Note: We don't delete from storage here to avoid accidental deletions
      // Storage cleanup can be handled separately if needed
      
      // Insert new images
      if (image_data && image_data.length > 0) {
        const imageRecords = image_data.map((img: any) => ({
          product_id: params.id,
          url: img.url,
          alt_text: img.alt_text || productData.name,
          display_order: img.display_order ?? 0,
          is_primary: img.is_primary ?? false
        }))
        
        const { error: imagesError } = await supabase
          .from('product_images')
          .insert(imageRecords)
        
        if (imagesError) console.error('Error updating images:', imagesError)
      }
    }
    
    // Update categories if provided
    if (category_ids !== undefined) {
      // Delete existing categories
      await supabase
        .from('product_categories')
        .delete()
        .eq('product_id', params.id)
      
      // Insert new categories
      if (category_ids && category_ids.length > 0) {
        const categoryRecords = category_ids.map((catId: string) => ({
          product_id: params.id,
          category_id: catId
        }))
        
        const { error: categoriesError } = await supabase
          .from('product_categories')
          .insert(categoryRecords)
        
        if (categoriesError) console.error('Error updating categories:', categoriesError)
      }
    }
    
    return NextResponse.json({ data: product })
  } catch (error: any) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await checkAdminAuth()
    if (!auth.isAdmin) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const supabase = createServerClient()
    
    // Delete product (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', params.id)
    
    if (deleteError) throw deleteError
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete product' },
      { status: 500 }
    )
  }
}

