import { createServerClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/client'

export async function getOrCreateCart(userId?: string, sessionId?: string) {
  const supabase = userId ? createServerClient() : createClient()
  
  // Try to find existing cart
  let query = supabase
    .from('carts')
    .select(`
      *,
      cart_items(
        id,
        quantity,
        price,
        product:products(
          id,
          name,
          slug,
          base_price,
          sale_price,
          stock_quantity,
          product_images(url, alt_text, is_primary)
        ),
        variant:product_variants(id, name, price_adjustment)
      )
    `)
  
  if (userId) {
    query = query.eq('user_id', userId)
  } else if (sessionId) {
    query = query.eq('session_id', sessionId)
  }
  
  const { data: existingCart } = await query.single()
  
  if (existingCart) {
    return existingCart
  }
  
  // Create new cart
  const { data: newCart, error } = await supabase
    .from('carts')
    .insert({
      user_id: userId,
      session_id: sessionId,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    })
    .select()
    .single()
  
  if (error) throw error
  return newCart
}

export async function addToCart(
  cartId: string,
  productId: string,
  quantity: number,
  price: number,
  variantId?: string
) {
  const supabase = createClient()
  
  // Check if item already exists in cart
  const { data: existingItem } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('product_id', productId)
    .eq('variant_id', variantId || null)
    .single()
  
  if (existingItem) {
    // Update quantity
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity: existingItem.quantity + quantity })
      .eq('id', existingItem.id)
      .select()
      .single()
    
    if (error) throw error
    return data
  } else {
    // Add new item
    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        cart_id: cartId,
        product_id: productId,
        variant_id: variantId,
        quantity,
        price
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const supabase = createClient()
  
  if (quantity <= 0) {
    return removeFromCart(itemId)
  }
  
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('id', itemId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function removeFromCart(itemId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', itemId)
  
  if (error) throw error
  return true
}

export async function clearCart(cartId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId)
  
  if (error) throw error
  return true
}

export async function getCartTotal(cartId: string) {
  const supabase = createClient()
  
  const { data: items } = await supabase
    .from('cart_items')
    .select('quantity, price')
    .eq('cart_id', cartId)
  
  if (!items) return 0
  
  return items.reduce((total, item) => total + (item.quantity * item.price), 0)
}
