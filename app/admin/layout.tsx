import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/Sidebar'
import '../globals.css'

export const metadata = {
  title: 'Admin Panel - MISTA Concierge Travel CO.',
  description: 'Manage your travel services',
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
  
  if (!profile || !['admin', 'super_admin'].includes((profile as { role?: string }).role || '')) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 overflow-auto lg:ml-0">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </div>
    </div>
  )
}
