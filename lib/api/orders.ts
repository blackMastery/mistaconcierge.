import { createServerClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type Order = Database['public']['Tables']['orders']['Row']
type OrderInsert = Database['public']['Tables']['orders']['Insert']
type OrderUpdate = Database['public']['Tables']['orders']['Update']

export interface CreateOrderData {
  user_id?: string
  customer_email: string
  customer_name: string
  customer_phone?: string
  shipping_address: any
  billing_address: any
  items: Array<{
    product_id: string
    variant_id?: string
    product_name: string
    product_sku: string
    variant_name?: string
    quantity: number
    unit_price: number
  }>
  subtotal: number
  tax_amount?: number
  shipping_cost?: number
  discount_amount?: number
  customer_notes?: string
}

export async function createOrder(orderData: CreateOrderData) {
  const supabase = createServerClient()
  
  const total_amount = 
    orderData.subtotal +
    (orderData.tax_amount || 0) +
    (orderData.shipping_cost || 0) -
    (orderData.discount_amount || 0)
  
  // Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: orderData.user_id,
      customer_email: orderData.customer_email,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      shipping_address: orderData.shipping_address,
      billing_address: orderData.billing_address,
      subtotal: orderData.subtotal,
      tax_amount: orderData.tax_amount || 0,
      shipping_cost: orderData.shipping_cost || 0,
      discount_amount: orderData.discount_amount || 0,
      total_amount: total_amount,
      customer_notes: orderData.customer_notes,
      status: 'pending'
    } as OrderInsert)
    .select()
    .single()
  
  if (orderError) throw orderError
  
  // Create order items
  const orderItems = orderData.items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    product_name: item.product_name,
    product_sku: item.product_sku,
    variant_name: item.variant_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total_price: item.unit_price * item.quantity
  }))
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
  
  if (itemsError) throw itemsError
  
  return order
}

export async function getOrderById(orderId: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        id,
        product_id,
        product_name,
        product_sku,
        variant_name,
        quantity,
        unit_price,
        total_price,
        product:products(slug, product_images(url, is_primary))
      )
    `)
    .eq('id', orderId)
    .single()
  
  if (error) throw error
  return data
}

export async function getOrderByNumber(orderNumber: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        id,
        product_id,
        product_name,
        product_sku,
        variant_name,
        quantity,
        unit_price,
        total_price,
        product:products(slug, product_images(url, is_primary))
      )
    `)
    .eq('order_number', orderNumber)
    .single()
  
  if (error) throw error
  return data
}

export async function getUserOrders(userId: string) {
  const supabase = createServerClient()
  
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        id,
        product_name,
        quantity,
        unit_price,
        total_price
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getAllOrders(filters?: {
  status?: string
  limit?: number
  offset?: number
}) {
  const supabase = createServerClient()
  
  let query = supabase
    .from('orders')
    .select(`
      *,
      order_items(count)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
  
  if (filters?.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }
  
  if (filters?.offset) {
    query = query.range(
      filters.offset,
      filters.offset + (filters.limit || 20) - 1
    )
  }
  
  const { data, error, count } = await query
  
  if (error) throw error
  return { data, count }
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  additionalData?: {
    tracking_number?: string
    admin_notes?: string
  }
) {
  const supabase = createServerClient()
  
  const updateData: OrderUpdate = {
    status,
    ...additionalData
  }
  
  if (status === 'shipped' && !additionalData?.tracking_number) {
    updateData.shipped_at = new Date().toISOString()
  }
  
  if (status === 'delivered') {
    updateData.delivered_at = new Date().toISOString()
  }
  
  if (status === 'cancelled') {
    updateData.cancelled_at = new Date().toISOString()
  }
  
  const { data, error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('id', orderId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function getOrderStats() {
  const supabase = createServerClient()
  
  const { data: stats, error } = await supabase.rpc('get_order_stats')
  
  if (error) {
    // Fallback if RPC doesn't exist
    const { data: orders } = await supabase
      .from('orders')
      .select('status, total_amount, created_at')
    
    if (!orders) return null
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return {
      total_orders: orders.length,
      pending_orders: orders.filter(o => o.status === 'pending').length,
      processing_orders: orders.filter(o => o.status === 'processing').length,
      total_revenue: orders.reduce((sum, o) => sum + Number(o.total_amount), 0),
      today_orders: orders.filter(o => new Date(o.created_at) >= today).length
    }
  }
  
  return stats
}
