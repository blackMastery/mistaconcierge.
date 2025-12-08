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

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const searchParams = request.nextUrl.searchParams
    const includeInactive = searchParams.get('include_inactive') === 'true'
    
    let query = supabase
      .from('categories')
      .select(`
        *,
        parent:categories!categories_parent_id_fkey(id, name, slug),
        children:categories!categories_parent_id_fkey(id, name, slug)
      `)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true })
    
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json({ data })
  } catch (error: any) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth()
    if (!auth.isAdmin) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const supabase = createServerClient()
    const body = await request.json()
    const { parent_id, display_order, is_active, ...categoryData } = body
    
    // Sanitize optional numeric fields
    const sanitizedData = {
      ...categoryData,
      parent_id: parent_id === '' || parent_id === null ? null : parent_id,
      display_order: display_order === '' || display_order === undefined ? 0 : parseInt(display_order) || 0,
      is_active: is_active !== undefined ? is_active : true,
    }
    
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .insert(sanitizedData)
      .select()
      .single()
    
    if (categoryError) throw categoryError
    
    return NextResponse.json({ data: category })
  } catch (error: any) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create category' },
      { status: 500 }
    )
  }
}

