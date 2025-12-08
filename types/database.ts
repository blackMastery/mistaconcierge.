export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: 'customer' | 'admin' | 'super_admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: 'customer' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: 'customer' | 'admin' | 'super_admin'
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          sku: string
          description: string | null
          short_description: string | null
          base_price: number
          sale_price: number | null
          cost_price: number | null
          stock_quantity: number
          low_stock_threshold: number
          track_inventory: boolean
          allow_backorder: boolean
          status: 'draft' | 'active' | 'archived' | 'pre_order'
          is_featured: boolean
          is_new_arrival: boolean
          width: number | null
          height: number | null
          depth: number | null
          weight: number | null
          dimension_unit: string
          weight_unit: string
          meta_title: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          sku: string
          description?: string | null
          short_description?: string | null
          base_price: number
          sale_price?: number | null
          cost_price?: number | null
          stock_quantity?: number
          low_stock_threshold?: number
          track_inventory?: boolean
          allow_backorder?: boolean
          status?: 'draft' | 'active' | 'archived' | 'pre_order'
          is_featured?: boolean
          is_new_arrival?: boolean
          width?: number | null
          height?: number | null
          depth?: number | null
          weight?: number | null
          dimension_unit?: string
          weight_unit?: string
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          sku?: string
          description?: string | null
          short_description?: string | null
          base_price?: number
          sale_price?: number | null
          cost_price?: number | null
          stock_quantity?: number
          low_stock_threshold?: number
          track_inventory?: boolean
          allow_backorder?: boolean
          status?: 'draft' | 'active' | 'archived' | 'pre_order'
          is_featured?: boolean
          is_new_arrival?: boolean
          width?: number | null
          height?: number | null
          depth?: number | null
          weight?: number | null
          dimension_unit?: string
          weight_unit?: string
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          display_order: number
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt_text?: string | null
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          url?: string
          alt_text?: string | null
          display_order?: number
          is_primary?: boolean
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          display_order: number
          is_active: boolean
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          display_order?: number
          is_active?: boolean
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          display_order?: number
          is_active?: boolean
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          user_id: string | null
          status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          customer_email: string
          customer_name: string
          customer_phone: string | null
          shipping_address: Json
          billing_address: Json
          subtotal: number
          tax_amount: number
          shipping_cost: number
          discount_amount: number
          total_amount: number
          shipping_method: string | null
          tracking_number: string | null
          shipped_at: string | null
          delivered_at: string | null
          customer_notes: string | null
          admin_notes: string | null
          created_at: string
          updated_at: string
          cancelled_at: string | null
        }
        Insert: {
          id?: string
          order_number: string
          user_id?: string | null
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          shipping_address: Json
          billing_address: Json
          subtotal: number
          tax_amount?: number
          shipping_cost?: number
          discount_amount?: number
          total_amount: number
          shipping_method?: string | null
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          customer_notes?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
          cancelled_at?: string | null
        }
        Update: {
          id?: string
          order_number?: string
          user_id?: string | null
          status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          shipping_address?: Json
          billing_address?: Json
          subtotal?: number
          tax_amount?: number
          shipping_cost?: number
          discount_amount?: number
          total_amount?: number
          shipping_method?: string | null
          tracking_number?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          customer_notes?: string | null
          admin_notes?: string | null
          created_at?: string
          updated_at?: string
          cancelled_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          variant_id: string | null
          product_name: string
          product_sku: string
          variant_name: string | null
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          variant_id?: string | null
          product_name: string
          product_sku: string
          variant_name?: string | null
          quantity: number
          unit_price: number
          total_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          variant_id?: string | null
          product_name?: string
          product_sku?: string
          variant_name?: string | null
          quantity?: number
          unit_price?: number
          total_price?: number
          created_at?: string
        }
      }
      carts: {
        Row: {
          id: string
          user_id: string | null
          session_id: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          session_id?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          product_id: string
          variant_id: string | null
          quantity: number
          price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          product_id: string
          variant_id?: string | null
          quantity?: number
          price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          cart_id?: string
          product_id?: string
          variant_id?: string | null
          quantity?: number
          price?: number
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          order_id: string | null
          rating: number
          title: string | null
          comment: string | null
          is_verified_purchase: boolean
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          order_id?: string | null
          rating: number
          title?: string | null
          comment?: string | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          order_id?: string | null
          rating?: number
          title?: string | null
          comment?: string | null
          is_verified_purchase?: boolean
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          address_type: 'shipping' | 'billing'
          full_name: string
          phone: string | null
          address_line1: string
          address_line2: string | null
          city: string
          state: string
          postal_code: string
          country: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          address_type?: 'shipping' | 'billing'
          full_name: string
          phone?: string | null
          address_line1: string
          address_line2?: string | null
          city: string
          state: string
          postal_code: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          address_type?: 'shipping' | 'billing'
          full_name?: string
          phone?: string | null
          address_line1?: string
          address_line2?: string | null
          city?: string
          state?: string
          postal_code?: string
          country?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
