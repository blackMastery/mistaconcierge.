# Quick Reference Guide

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
# Run in Supabase SQL Editor
-- View all tables
SELECT * FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS policies
SELECT * FROM pg_policies;

-- View all products
SELECT * FROM products;
```

## Code Snippets

### Adding a New Product Programmatically

```typescript
import { createProduct } from '@/lib/api/products'

const newProduct = await createProduct({
  name: "Modern 60\" Double Vanity",
  slug: "modern-60-double-vanity",
  sku: "VAN-60-MOD-001",
  description: "Spacious double vanity with modern design",
  base_price: 1299.99,
  stock_quantity: 25,
  status: 'active',
  is_featured: true
})
```

### Fetching Products with Filters

```typescript
import { getProducts } from '@/lib/api/products'

// Get featured products
const featured = await getProducts({ 
  featured: true, 
  limit: 8 
})

// Search products
const searchResults = await getProducts({ 
  search: 'vanity',
  status: 'active' 
})

// Filter by price range
const filtered = await getProducts({
  minPrice: 500,
  maxPrice: 1500,
  category: 'single-vanities'
})
```

### Creating an Order

```typescript
import { createOrder } from '@/lib/api/orders'

const order = await createOrder({
  customer_email: 'customer@example.com',
  customer_name: 'John Doe',
  shipping_address: {
    full_name: 'John Doe',
    address_line1: '123 Main St',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country: 'US'
  },
  billing_address: { /* same structure */ },
  items: [
    {
      product_id: 'product-uuid',
      product_name: 'Modern Vanity',
      product_sku: 'VAN-001',
      quantity: 1,
      unit_price: 899.99
    }
  ],
  subtotal: 899.99,
  tax_amount: 72.00,
  shipping_cost: 50.00
})
```

### Managing Cart

```typescript
import { addToCart, getOrCreateCart } from '@/lib/api/cart'

// Get or create cart
const cart = await getOrCreateCart(userId)

// Add item to cart
await addToCart(
  cart.id,
  productId,
  quantity,
  price
)
```

## Database Queries

### Get Low Stock Products

```sql
SELECT id, name, sku, stock_quantity
FROM products
WHERE stock_quantity < low_stock_threshold
AND status = 'active'
ORDER BY stock_quantity ASC;
```

### Get Best Selling Products

```sql
SELECT 
  p.id,
  p.name,
  COUNT(oi.id) as order_count,
  SUM(oi.quantity) as total_sold,
  SUM(oi.total_price) as revenue
FROM products p
JOIN order_items oi ON p.id = oi.product_id
GROUP BY p.id, p.name
ORDER BY total_sold DESC
LIMIT 10;
```

### Get Orders by Status

```sql
SELECT 
  status,
  COUNT(*) as count,
  SUM(total_amount) as total_revenue
FROM orders
GROUP BY status;
```

### Get Customer Order History

```sql
SELECT 
  o.order_number,
  o.created_at,
  o.status,
  o.total_amount,
  COUNT(oi.id) as item_count
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.user_id = 'user-uuid'
GROUP BY o.id
ORDER BY o.created_at DESC;
```

## Supabase Policies

### Allow users to read their own orders

```sql
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);
```

### Allow admins to manage products

```sql
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );
```

## Component Examples

### Simple Product Filter

```tsx
'use client'

import { useState } from 'react'

export default function ProductFilters({ onFilter }) {
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">
          Min Price
        </label>
        <input
          type="number"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Max Price
        </label>
        <input
          type="number"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg"
        />
      </div>
      <button
        onClick={() => onFilter({ minPrice, maxPrice })}
        className="w-full bg-blue-600 text-white py-2 rounded-lg"
      >
        Apply Filters
      </button>
    </div>
  )
}
```

### Order Status Badge

```tsx
export function OrderStatusBadge({ status }: { status: string }) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    refunded: 'bg-gray-100 text-gray-800'
  }

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
```

## Environment Variables

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# Optional - Stripe Payment
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Optional - Email (Resend)
RESEND_API_KEY=re_xxx
FROM_EMAIL=noreply@yourstore.com

# App Config
NEXT_PUBLIC_SITE_URL=https://yourstore.com
NEXT_PUBLIC_SITE_NAME=Your Store Name
```

## Common Customizations

### Change Primary Color

In `tailwind.config.js`:

```javascript
colors: {
  primary: {
    50: '#f0f9ff',
    500: '#0ea5e9',  // Change this
    600: '#0284c7',  // And this
  }
}
```

### Add Custom Product Field

1. Update database:
```sql
ALTER TABLE products ADD COLUMN material TEXT;
```

2. Update types in `types/database.ts`:
```typescript
material: string | null
```

3. Update form in `components/admin/ProductForm.tsx`:
```tsx
<input
  type="text"
  value={formData.material}
  onChange={(e) => setFormData({...formData, material: e.target.value})}
/>
```

### Add Category Image

1. Update navigation in `components/customer/Header.tsx`
2. Fetch categories with images:
```typescript
const { data } = await supabase
  .from('categories')
  .select('*')
  .eq('is_active', true)
  .order('display_order')
```

## Testing Checklist

### Before Launch
- [ ] Create test admin account
- [ ] Add 5+ test products
- [ ] Test product creation/editing
- [ ] Test product images display
- [ ] Complete a test order
- [ ] Test order status updates
- [ ] Verify email notifications work
- [ ] Test on mobile device
- [ ] Check all links work
- [ ] Test search functionality
- [ ] Verify cart persists
- [ ] Test user registration/login
- [ ] Check admin dashboard loads
- [ ] Verify RLS policies work

### Performance Checks
- [ ] Images are optimized
- [ ] Page load time < 3 seconds
- [ ] No console errors
- [ ] Database queries are efficient
- [ ] Caching is enabled

## Useful Supabase CLI Commands

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Generate TypeScript types
supabase gen types typescript --linked > types/database.ts

# Run migrations
supabase db push

# Reset database (CAREFUL!)
supabase db reset
```

## API Route Examples

### Custom Product Search API

Create `app/api/search/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')
  
  const supabase = createServerClient()
  const { data } = await supabase
    .from('products')
    .select('*')
    .textSearch('name', query)
    .limit(10)
  
  return NextResponse.json({ results: data })
}
```

### Webhook Handler (Stripe Example)

Create `app/api/webhooks/stripe/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'payment_intent.succeeded') {
      // Handle successful payment
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}
```

## Deployment Checklist

### Pre-Deployment
- [ ] Update `.env` with production values
- [ ] Set up production database
- [ ] Configure domain name
- [ ] Set up SSL certificate
- [ ] Add Google Analytics
- [ ] Configure error tracking (Sentry)
- [ ] Set up backups

### Vercel Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Environment Variables in Vercel
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add all variables from `.env.local`

## Security Best Practices

1. **Never expose service role key to client**
2. **Always use RLS policies**
3. **Validate all user input**
4. **Use HTTPS in production**
5. **Enable 2FA for admin accounts**
6. **Regular security audits**
7. **Keep dependencies updated**

---

**Pro Tip**: Bookmark this file for quick access to common tasks!
