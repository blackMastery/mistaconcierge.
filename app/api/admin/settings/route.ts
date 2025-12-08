import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// GET all settings
export async function GET() {
  try {
    const supabase = createServerClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch all settings
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .order('category', { ascending: true })
      .order('key', { ascending: true })

    if (error) {
      console.error('Error fetching settings:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform settings array into object grouped by category
    const settingsByCategory = (settings || []).reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {}
      }
      acc[setting.category][setting.key] = {
        id: setting.id,
        value: setting.value,
        description: setting.description,
        updated_at: setting.updated_at,
        updated_by: setting.updated_by,
      }
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({ settings: settingsByCategory })
  } catch (error: any) {
    console.error('Error in GET /api/admin/settings:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

// UPDATE settings
export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient()

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Invalid settings data' }, { status: 400 })
    }

    // Update each setting
    const updates = []
    for (const [key, data] of Object.entries(settings)) {
      if (typeof data === 'object' && data !== null && 'value' in data) {
        const { value } = data as { value: any }
        
        // JSONB column accepts JavaScript objects/values directly
        // If value is a string that looks like JSON, parse it first
        let jsonValue = value
        if (typeof value === 'string') {
          try {
            // Try to parse if it's a JSON string
            jsonValue = JSON.parse(value)
          } catch {
            // If parsing fails, keep as string
            jsonValue = value
          }
        }

        const { error: updateError } = await supabase
          .from('settings')
          .update({
            value: jsonValue,
            updated_by: user.id,
          })
          .eq('key', key)

        if (updateError) {
          console.error(`Error updating setting ${key}:`, updateError)
          updates.push({ key, error: updateError.message })
        } else {
          updates.push({ key, success: true })
        }
      }
    }

    // Check if any updates failed
    const failedUpdates = updates.filter(u => !u.success)
    if (failedUpdates.length > 0) {
      return NextResponse.json(
        { error: 'Some settings failed to update', failed: failedUpdates },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Settings updated successfully' })
  } catch (error: any) {
    console.error('Error in PUT /api/admin/settings:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}

