-- ============================================
-- E-COMMERCE DATABASE SCHEMA
-- ============================================
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================
-- Supabase handles auth.users, we extend it with profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCT CATALOG
-- ============================================
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main products table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  
  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  cost_price DECIMAL(10,2),
  
  -- Inventory
  stock_quantity INT DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  track_inventory BOOLEAN DEFAULT true,
  allow_backorder BOOLEAN DEFAULT false,
  
  -- Product status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived', 'pre_order')),
  is_featured BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false,
  
  -- Dimensions (for vanities)
  width DECIMAL(10,2),
  height DECIMAL(10,2),
  depth DECIMAL(10,2),
  weight DECIMAL(10,2),
  dimension_unit TEXT DEFAULT 'inches',
  weight_unit TEXT DEFAULT 'lbs',
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Product images
CREATE TABLE product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  alt_text TEXT,
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product categories (many-to-many)
CREATE TABLE product_categories (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- Product variants (for color, finish, mirror type, etc.)
CREATE TABLE product_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  
  -- Variant-specific pricing
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  stock_quantity INT DEFAULT 0,
  
  -- Variant attributes stored as JSONB for flexibility
  attributes JSONB,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product attributes for filtering
CREATE TABLE attributes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'select' CHECK (type IN ('select', 'color', 'text', 'number')),
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE attribute_values (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  attribute_id UUID REFERENCES attributes(id) ON DELETE CASCADE NOT NULL,
  value TEXT NOT NULL,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CUSTOMERS & ADDRESSES
-- ============================================
CREATE TABLE addresses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  address_type TEXT DEFAULT 'shipping' CHECK (address_type IN ('shipping', 'billing')),
  
  full_name TEXT NOT NULL,
  phone TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT DEFAULT 'US',
  
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SHOPPING CART
-- ============================================
CREATE TABLE carts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT user_or_session CHECK (
    (user_id IS NOT NULL AND session_id IS NULL) OR
    (user_id IS NULL AND session_id IS NOT NULL)
  )
);

CREATE TABLE cart_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDERS & PAYMENTS
-- ============================================
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  
  -- Order status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'
  )),
  
  -- Customer information
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  
  -- Shipping address
  shipping_address JSONB NOT NULL,
  billing_address JSONB NOT NULL,
  
  -- Financial
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Shipping
  shipping_method TEXT,
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Notes
  customer_notes TEXT,
  admin_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ
);

CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  
  -- Snapshot of product at time of order
  product_name TEXT NOT NULL,
  product_sku TEXT NOT NULL,
  variant_name TEXT,
  
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  
  payment_method TEXT NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN (
    'pending', 'completed', 'failed', 'refunded'
  )),
  
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  
  -- External payment gateway reference
  transaction_id TEXT,
  payment_details JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REVIEWS & RATINGS
-- ============================================
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(product_id, user_id, order_id)
);

-- ============================================
-- COLLECTIONS
-- ============================================
CREATE TABLE collections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE collection_products (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  PRIMARY KEY (collection_id, product_id)
);

-- ============================================
-- DISCOUNTS & PROMOTIONS
-- ============================================
CREATE TABLE discount_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10,2) NOT NULL,
  
  min_purchase_amount DECIMAL(10,2),
  max_discount_amount DECIMAL(10,2),
  usage_limit INT,
  usage_count INT DEFAULT 0,
  
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX idx_products_status ON products(status) WHERE status = 'active';
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_new_arrival ON products(is_new_arrival) WHERE is_new_arrival = true;
CREATE INDEX idx_product_categories_category ON product_categories(category_id);
CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_reviews_product ON reviews(product_id) WHERE is_approved = true;
CREATE INDEX idx_addresses_user ON addresses(user_id);

-- Full-text search index
CREATE INDEX idx_products_search ON products USING GIN (
  to_tsvector('english', name || ' ' || COALESCE(description, ''))
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Products: Everyone can read active products
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (status = 'active');

-- Admins can manage products
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Orders: Users can see their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Admins can see all orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Reviews: Users can create reviews for their purchases
CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view approved reviews" ON reviews
  FOR SELECT USING (is_approved = true);

-- Addresses: Users can manage their own addresses
CREATE POLICY "Users can manage own addresses" ON addresses
  FOR ALL USING (auth.uid() = user_id);

-- Carts: Users can manage their own carts
CREATE POLICY "Users can manage own carts" ON carts
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Drop existing functions if they exist (to handle return type changes)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_order_number() CASCADE;
DROP FUNCTION IF EXISTS update_product_stock() CASCADE;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number = 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop sequence if it exists (will be recreated)
DROP SEQUENCE IF EXISTS order_number_seq CASCADE;

CREATE SEQUENCE order_number_seq;

DROP TRIGGER IF EXISTS set_order_number ON orders;
CREATE TRIGGER set_order_number BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Update product stock after order
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'processing' AND OLD.status = 'pending' THEN
    -- Decrease stock when order is confirmed
    UPDATE products
    SET stock_quantity = stock_quantity - (
      SELECT SUM(quantity)
      FROM order_items
      WHERE order_items.order_id = NEW.id
      AND order_items.product_id = products.id
    )
    WHERE id IN (
      SELECT product_id FROM order_items WHERE order_id = NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_stock_on_order_status ON orders;
CREATE TRIGGER update_stock_on_order_status AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_product_stock();
