import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import '../globals.css'

export const metadata = {
  title: 'Admin Panel - YourStore',
  description: 'Manage your e-commerce store',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirect=/admin')
  }
  
  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
