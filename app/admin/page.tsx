import { createServerClient } from '@/lib/supabase/server'
import { Package } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = createServerClient()

  // Fetch dashboard stats
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })

  const stats = [
    {
      name: 'Total Products',
      value: totalProducts || 0,
      icon: Package,
      color: 'bg-blue-500',
      link: '/admin/products'
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            href={stat.link}
            className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg flex-shrink-0`}>
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
