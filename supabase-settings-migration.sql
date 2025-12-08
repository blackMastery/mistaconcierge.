-- ============================================
-- SETTINGS TABLE MIGRATION
-- ============================================
-- Add this to your existing supabase-schema.sql or run separately

CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins can read all settings
CREATE POLICY "Admins can read settings"
  ON settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Admins can update settings
CREATE POLICY "Admins can update settings"
  ON settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Admins can insert settings
CREATE POLICY "Admins can insert settings"
  ON settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_settings_timestamp
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();

-- Insert default settings
INSERT INTO settings (key, value, category, description) VALUES
  -- Store Information
  ('store_name', '"MISTA Concierge Travel CO."', 'store', 'Store name'),
  ('store_email', '""', 'store', 'Store contact email'),
  ('store_phone', '""', 'store', 'Store contact phone'),
  ('store_address', '{}', 'store', 'Store physical address'),
  ('store_logo', '""', 'store', 'Store logo URL'),
  
  -- General Settings
  ('currency', '"USD"', 'general', 'Default currency'),
  ('timezone', '"America/New_York"', 'general', 'Store timezone'),
  ('date_format', '"MM/DD/YYYY"', 'general', 'Date format'),
  ('low_stock_threshold', '5', 'general', 'Default low stock threshold'),
  ('enable_wishlist', 'true', 'general', 'Enable wishlist feature'),
  
  -- Shipping
  ('free_shipping_threshold', '0', 'shipping', 'Free shipping threshold'),
  ('default_shipping_method', '""', 'shipping', 'Default shipping method'),
  ('processing_days', '1', 'shipping', 'Order processing days'),
  
  -- Payment
  ('payment_methods', '["stripe"]', 'payment', 'Enabled payment methods'),
  ('currency_symbol', '"$"', 'payment', 'Currency symbol'),
  
  -- Tax
  ('tax_enabled', 'true', 'tax', 'Enable tax calculation'),
  ('tax_rate', '0', 'tax', 'Default tax rate'),
  ('tax_inclusive', 'false', 'tax', 'Tax inclusive pricing'),
  
  -- Email
  ('order_confirmation_enabled', 'true', 'email', 'Send order confirmation emails'),
  ('shipping_notification_enabled', 'true', 'email', 'Send shipping notifications'),
  ('admin_notification_email', '""', 'email', 'Admin notification email'),
  
  -- SEO
  ('default_meta_title', '""', 'seo', 'Default meta title'),
  ('default_meta_description', '""', 'seo', 'Default meta description'),
  ('google_analytics_id', '""', 'seo', 'Google Analytics ID'),
  ('facebook_pixel_id', '""', 'seo', 'Facebook Pixel ID'),
  
  -- Inventory
  ('track_inventory', 'true', 'inventory', 'Track inventory globally'),
  ('allow_backorders', 'false', 'inventory', 'Allow backorders by default'),
  ('stock_alert_email', '""', 'inventory', 'Email for stock alerts'),
  
  -- Maintenance
  ('maintenance_mode', 'false', 'maintenance', 'Enable maintenance mode'),
  ('maintenance_message', '"We are currently performing maintenance. Please check back soon."', 'maintenance', 'Maintenance mode message')
ON CONFLICT (key) DO NOTHING;

