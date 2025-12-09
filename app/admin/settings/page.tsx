'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface SettingValue {
  id?: string
  value: any
  description?: string
  updated_at?: string
  updated_by?: string
}

interface SettingsData {
  [category: string]: {
    [key: string]: SettingValue
  }
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/settings')
      if (!response.ok) {
        throw new Error('Failed to fetch settings')
      }
      const data = await response.json()
      setSettings(data.settings || {})
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: {
          ...prev[category]?.[key],
          value,
        },
      },
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setSaveStatus('idle')
      setError(null)

      // Prepare settings for API (flatten structure)
      const settingsToUpdate: Record<string, { value: any }> = {}
      Object.entries(settings).forEach(([category, categorySettings]) => {
        Object.entries(categorySettings).forEach(([key, setting]) => {
          // Parse JSON strings back to values for API
          let value = setting.value
          if (typeof value === 'string') {
            try {
              value = JSON.parse(value)
            } catch {
              // Keep as string if not valid JSON
            }
          }
          settingsToUpdate[key] = { value }
        })
      })

      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings: settingsToUpdate }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save settings')
      }

      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (err: any) {
      setError(err.message)
      setSaveStatus('error')
      console.error('Error saving settings:', err)
    } finally {
      setSaving(false)
    }
  }


  const getSettingValue = (category: string, key: string, defaultValue: any = '') => {
    return settings[category]?.[key]?.value ?? defaultValue
  }

  const parseJsonValue = (value: any): any => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }
    return value
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your store configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
        >
          {saving ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-5 w-5" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {saveStatus === 'success' && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <p className="text-green-800">Settings saved successfully!</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Store Information */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Store Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Store Name</label>
              <input
                type="text"
                value={parseJsonValue(getSettingValue('store', 'store_name', ''))}
                onChange={(e) => updateSetting('store', 'store_name', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Store Email</label>
              <input
                type="email"
                value={parseJsonValue(getSettingValue('store', 'store_email', ''))}
                onChange={(e) => updateSetting('store', 'store_email', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Store Phone</label>
              <input
                type="tel"
                value={parseJsonValue(getSettingValue('store', 'store_phone', ''))}
                onChange={(e) => updateSetting('store', 'store_phone', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
              <input
                type="tel"
                value={parseJsonValue(getSettingValue('store', 'whatsapp_number', ''))}
                onChange={(e) => updateSetting('store', 'whatsapp_number', e.target.value)}
                placeholder="e.g., +1234567890"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +1 for US)</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Store Address</label>
              <textarea
                value={parseJsonValue(getSettingValue('store', 'store_address', ''))}
                onChange={(e) => updateSetting('store', 'store_address', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Store physical address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Store Logo URL</label>
              <input
                type="url"
                value={parseJsonValue(getSettingValue('store', 'store_logo', ''))}
                onChange={(e) => updateSetting('store', 'store_logo', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">General Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Currency</label>
              <select
                value={parseJsonValue(getSettingValue('general', 'currency', 'USD'))}
                onChange={(e) => updateSetting('general', 'currency', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD (C$)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Timezone</label>
              <select
                value={parseJsonValue(getSettingValue('general', 'timezone', 'America/New_York'))}
                onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Low Stock Threshold</label>
              <input
                type="number"
                min="0"
                value={parseJsonValue(getSettingValue('general', 'low_stock_threshold', 5))}
                onChange={(e) => updateSetting('general', 'low_stock_threshold', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date Format</label>
              <select
                value={parseJsonValue(getSettingValue('general', 'date_format', 'MM/DD/YYYY'))}
                onChange={(e) => updateSetting('general', 'date_format', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enable_wishlist"
                checked={parseJsonValue(getSettingValue('general', 'enable_wishlist', true))}
                onChange={(e) => updateSetting('general', 'enable_wishlist', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="enable_wishlist" className="text-sm font-medium">
                Enable Wishlist Feature
              </label>
            </div>
          </div>
        </div>

        {/* Shipping Settings */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Shipping & Delivery</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Free Shipping Threshold ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={parseJsonValue(getSettingValue('shipping', 'free_shipping_threshold', 0))}
                onChange={(e) => updateSetting('shipping', 'free_shipping_threshold', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Processing Days</label>
              <input
                type="number"
                min="0"
                value={parseJsonValue(getSettingValue('shipping', 'processing_days', 1))}
                onChange={(e) => updateSetting('shipping', 'processing_days', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Payment Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Currency Symbol</label>
              <input
                type="text"
                value={parseJsonValue(getSettingValue('payment', 'currency_symbol', '$'))}
                onChange={(e) => updateSetting('payment', 'currency_symbol', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Tax Settings */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Tax Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="tax_enabled"
                checked={parseJsonValue(getSettingValue('tax', 'tax_enabled', true))}
                onChange={(e) => updateSetting('tax', 'tax_enabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="tax_enabled" className="text-sm font-medium">
                Enable Tax Calculation
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Default Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={parseJsonValue(getSettingValue('tax', 'tax_rate', 0))}
                onChange={(e) => updateSetting('tax', 'tax_rate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="tax_inclusive"
                checked={parseJsonValue(getSettingValue('tax', 'tax_inclusive', false))}
                onChange={(e) => updateSetting('tax', 'tax_inclusive', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="tax_inclusive" className="text-sm font-medium">
                Tax Inclusive Pricing
              </label>
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Email Notifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="shipping_notification_enabled"
                checked={parseJsonValue(getSettingValue('email', 'shipping_notification_enabled', true))}
                onChange={(e) => updateSetting('email', 'shipping_notification_enabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="shipping_notification_enabled" className="text-sm font-medium">
                Send Shipping Notifications
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Admin Notification Email</label>
              <input
                type="email"
                value={parseJsonValue(getSettingValue('email', 'admin_notification_email', ''))}
                onChange={(e) => updateSetting('email', 'admin_notification_email', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* SEO Settings */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">SEO & Marketing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Default Meta Title</label>
              <input
                type="text"
                value={parseJsonValue(getSettingValue('seo', 'default_meta_title', ''))}
                onChange={(e) => updateSetting('seo', 'default_meta_title', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Google Analytics ID</label>
              <input
                type="text"
                value={parseJsonValue(getSettingValue('seo', 'google_analytics_id', ''))}
                onChange={(e) => updateSetting('seo', 'google_analytics_id', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Default Meta Description</label>
              <textarea
                value={parseJsonValue(getSettingValue('seo', 'default_meta_description', ''))}
                onChange={(e) => updateSetting('seo', 'default_meta_description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Facebook Pixel ID</label>
              <input
                type="text"
                value={parseJsonValue(getSettingValue('seo', 'facebook_pixel_id', ''))}
                onChange={(e) => updateSetting('seo', 'facebook_pixel_id', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Inventory Settings */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Inventory Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="track_inventory"
                checked={parseJsonValue(getSettingValue('inventory', 'track_inventory', true))}
                onChange={(e) => updateSetting('inventory', 'track_inventory', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="track_inventory" className="text-sm font-medium">
                Track Inventory Globally
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allow_backorders"
                checked={parseJsonValue(getSettingValue('inventory', 'allow_backorders', false))}
                onChange={(e) => updateSetting('inventory', 'allow_backorders', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="allow_backorders" className="text-sm font-medium">
                Allow Backorders by Default
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock Alert Email</label>
              <input
                type="email"
                value={parseJsonValue(getSettingValue('inventory', 'stock_alert_email', ''))}
                onChange={(e) => updateSetting('inventory', 'stock_alert_email', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Maintenance Mode */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Maintenance Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="maintenance_mode"
                checked={parseJsonValue(getSettingValue('maintenance', 'maintenance_mode', false))}
                onChange={(e) => updateSetting('maintenance', 'maintenance_mode', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="maintenance_mode" className="text-sm font-medium">
                Enable Maintenance Mode
              </label>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Maintenance Message</label>
              <textarea
                value={parseJsonValue(getSettingValue('maintenance', 'maintenance_message', ''))}
                onChange={(e) => updateSetting('maintenance', 'maintenance_message', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

