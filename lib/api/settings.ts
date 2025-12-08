import { createServerClient } from '@/lib/supabase/server'

export async function getStoreSettings() {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('settings')
    .select('key, value, category')
    .eq('category', 'store')
  
  if (error) {
    console.error('Error fetching store settings:', error)
    return {}
  }
  
  const settings: Record<string, any> = {}
  if (data && Array.isArray(data)) {
    data.forEach((setting: any) => {
      try {
        settings[setting.key] = JSON.parse(setting.value as string)
      } catch {
        settings[setting.key] = setting.value
      }
    })
  }
  
  return settings
}

