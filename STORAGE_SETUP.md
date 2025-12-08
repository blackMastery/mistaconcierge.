# Supabase Storage Setup Guide

This guide will help you set up Supabase Storage for product image uploads.

## Step 1: Create the Storage Bucket

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Click on **Storage** in the left sidebar
4. Click **New bucket**
5. Configure the bucket:
   - **Name**: `product-images` (must match exactly)
   - **Public bucket**: ✅ **Enable this** (checked)
   - **File size limit**: 5 MB (or your preferred limit)
   - **Allowed MIME types**: Leave empty (or specify: `image/jpeg,image/png,image/webp,image/gif`)
6. Click **Create bucket**

## Step 2: Configure Storage Policies (Optional but Recommended)

If you want to use RLS policies instead of the admin client, you can set up policies:

### Option A: Using SQL Editor (Recommended for Production)

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this SQL to create policies:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = 'products'
);

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = 'products'
);

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = 'products'
);

-- Allow public read access
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');
```

### Option B: Using Dashboard (Simpler)

1. Go to **Storage** > **Policies** tab
2. Click on the `product-images` bucket
3. Add policies manually:
   - **INSERT**: Allow authenticated users
   - **SELECT**: Allow public (for viewing images)
   - **UPDATE**: Allow authenticated users
   - **DELETE**: Allow authenticated users

## Step 3: Verify Setup

1. Try uploading an image through the admin panel
2. Check the Storage > `product-images` bucket to see if files appear
3. Verify images are accessible via public URLs

## Troubleshooting

### Error: "Bucket not found"
- Make sure the bucket name is exactly `product-images` (case-sensitive)
- Check that the bucket was created successfully in the Storage dashboard

### Error: "Row-level security policy violation"
- The code uses the admin client which bypasses RLS
- If you still see this error, check your `.env.local` file has `SUPABASE_SERVICE_ROLE_KEY` set
- Make sure the service role key is correct (from Settings > API)

### Images not displaying
- Verify the bucket is set to **Public**
- Check that the public URL is accessible
- Ensure CORS is configured if accessing from different domains

### File size errors
- Default limit is 5MB per file
- You can increase this in bucket settings or update the validation in the code

## Security Notes

- The current implementation uses the admin client (service role key) which bypasses RLS
- This is fine for admin-only uploads, but ensure your API routes have proper authentication
- For production, consider implementing more granular storage policies based on user roles

## Next Steps

Once storage is set up:
1. Test image uploads in the admin panel
2. Verify images appear in product listings
3. Check that primary image selection works correctly
4. Test image deletion functionality

