import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

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
  
  if (!profile) {
    return { isAdmin: false, error: 'Forbidden' }
  }
  
  const role = (profile as { role?: string }).role
  if (role !== 'admin' && role !== 'super_admin') {
    return { isAdmin: false, error: 'Forbidden' }
  }
  
  return { isAdmin: true, userId: user.id }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAdminAuth()
    if (!auth.isAdmin) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `products/${fileName}`

    // Upload to Supabase Storage using admin client (bypasses RLS)
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      
      // If bucket doesn't exist, provide helpful error message
      if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('404')) {
        return NextResponse.json(
          { 
            error: 'Storage bucket not found. Please create a bucket named "product-images" in your Supabase Storage dashboard.',
            details: 'Go to Supabase Dashboard > Storage > Create Bucket > Name: "product-images" > Public: Yes'
          },
          { status: 404 }
        )
      }
      
      return NextResponse.json(
        { error: 'Failed to upload image: ' + uploadError.message },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('product-images')
      .getPublicUrl(filePath)

    return NextResponse.json({
      url: urlData.publicUrl,
      path: filePath
    })
  } catch (error: any) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload image' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await checkAdminAuth()
    if (!auth.isAdmin) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')

    if (!path) {
      return NextResponse.json(
        { error: 'No file path provided' },
        { status: 400 }
      )
    }

    // Delete from Supabase Storage using admin client (bypasses RLS)
    const { error: deleteError } = await supabaseAdmin.storage
      .from('product-images')
      .remove([path])

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete image: ' + deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete image' },
      { status: 500 }
    )
  }
}

