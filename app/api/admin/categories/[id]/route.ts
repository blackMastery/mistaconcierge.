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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    
    const { data: category, error } = await supabase
      .from('categories')
      .select(`
        *,
        parent:categories!categories_parent_id_fkey(id, name, slug),
        children:categories!categories_parent_id_fkey(id, name, slug)
      `)
      .eq('id', params.id)
      .single()
    
    if (error) throw error
    
    return NextResponse.json({ data: category })
  } catch (error: any) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch category' },
      { status: 500 }
    )
  }
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
    const { parent_id, display_order, is_active, ...categoryData } = body
    
    // Sanitize optional numeric fields
    const sanitizedData: any = {
      ...categoryData,
    }
    
    // Only update fields that are provided
    if (parent_id !== undefined) {
      sanitizedData.parent_id = parent_id === '' || parent_id === null ? null : parent_id
    }
    if (display_order !== undefined) {
      sanitizedData.display_order = display_order === '' ? 0 : parseInt(display_order) || 0
    }
    if (is_active !== undefined) {
      sanitizedData.is_active = is_active
    }
    
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .update(sanitizedData)
      .eq('id', params.id)
      .select()
      .single()
    
    if (categoryError) throw categoryError
    
    return NextResponse.json({ data: category })
  } catch (error: any) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update category' },
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
    
    // Check if category has children
    const { data: children } = await supabase
      .from('categories')
      .select('id')
      .eq('parent_id', params.id)
      .limit(1)
    
    if (children && children.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with child categories. Please delete or move children first.' },
        { status: 400 }
      )
    }
    
    // Check if category has products
    const { data: products } = await supabase
      .from('product_categories')
      .select('product_id')
      .eq('category_id', params.id)
      .limit(1)
    
    if (products && products.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with associated products. Please remove products from this category first.' },
        { status: 400 }
      )
    }
    
    // Delete category
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', params.id)
    
    if (deleteError) throw deleteError
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete category' },
      { status: 500 }
    )
  }
}

