# Quick Setup Guide

Follow these steps to get your e-commerce platform running in 15 minutes.

## Step 1: Install Dependencies (2 minutes)

```bash
cd ecommerce-app
npm install
```

## Step 2: Create Supabase Project (3 minutes)

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - Name: "My Ecommerce Store"
   - Database Password: Create a strong password
   - Region: Choose closest to you
4. Click "Create new project" and wait 2 minutes

## Step 3: Set Up Database (5 minutes)

1. In your Supabase dashboard, click "SQL Editor" in the left sidebar
2. Click "New Query"
3. Open `supabase-schema.sql` from your project
4. Copy ALL the contents
5. Paste into the SQL Editor
6. Click "Run" (bottom right)
7. You should see "Success. No rows returned"

## Step 4: Configure Environment Variables (2 minutes)

1. In Supabase dashboard, go to Settings > API
2. Copy these values:
   - Project URL
   - `anon` `public` key
   - `service_role` `secret` key

3. In your project, copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

4. Open `.env.local` and paste your values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 5: Start Development Server (1 minute)

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) - you should see the homepage!

## Step 6: Create Admin User (2 minutes)

### Option A: Manual (Recommended for development)

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add user" > "Create new user"
3. Fill in:
   - Email: admin@example.com
   - Password: your_password
   - Auto Confirm User: ✓ checked
4. Click "Create user"
5. Go to Table Editor > profiles
6. Find your user and edit the row
7. Change `role` from `customer` to `admin`
8. Click Save

### Option B: Sign Up (Production)

1. Visit your site's signup page
2. Create an account
3. Manually update the role in Supabase (steps 5-7 above)

## Step 7: Access Admin Panel

1. Go to [http://localhost:3000/admin](http://localhost:3000/admin)
2. Log in with your admin credentials
3. Start adding products!

## Initial Data Setup

### Create Categories

1. Go to Supabase Dashboard > Table Editor > categories
2. Click "Insert" > "Insert row"
3. Add these categories:

```
Name: Single Vanities
Slug: single-vanities
Description: Perfect for smaller bathrooms
Display Order: 1
Is Active: true
```

```
Name: Double Vanities  
Slug: double-vanities
Description: Spacious designs for master bathrooms
Display Order: 2
Is Active: true
```

```
Name: LED Mirrors
Slug: mirrors
Description: Modern illuminated mirrors
Display Order: 3
Is Active: true
```

### Add Your First Product

1. Go to [http://localhost:3000/admin/products](http://localhost:3000/admin/products)
2. Click "Add Product"
3. Fill in the form:
   - Name: "Modern 48\" White Vanity with LED Mirror"
   - SKU: Will auto-generate
   - Base Price: 899.99
   - Stock: 50
   - Description: Add a detailed description
   - Select relevant categories
   - Status: Active
4. Click "Create Product"

## Common Issues & Solutions

### "Failed to fetch" errors
**Problem**: Can't connect to Supabase
**Solution**: 
- Double-check your `.env.local` file has correct values
- Make sure you copied the values from Settings > API
- Restart your dev server after changing env variables

### Can't access admin panel
**Problem**: Redirected to homepage
**Solution**:
- Verify your user's role is set to `admin` in the profiles table
- Log out and log back in
- Clear browser cookies

### Database schema errors
**Problem**: SQL errors when running schema
**Solution**:
- Make sure you copied the ENTIRE `supabase-schema.sql` file
- Check for any existing tables that might conflict
- Try running in a fresh Supabase project

### Images not showing
**Problem**: Product images don't display
**Solution**:
- For development, you can use external image URLs (e.g., Unsplash)
- For production, set up Supabase Storage:
  1. Go to Storage in Supabase dashboard
  2. Create a bucket called "products"
  3. Make it public
  4. Upload images there

## Next Steps

### Customize Your Store

1. **Branding**: Update logo and colors in:
   - `components/customer/Header.tsx`
   - `tailwind.config.js`

2. **Add More Products**: Use the admin panel to build your catalog

3. **Configure Shipping**: Update checkout flow in `app/(customer)/checkout/`

4. **Add Payment Gateway**: 
   - Install Stripe: `npm install stripe @stripe/stripe-js`
   - Follow Stripe integration guide

### Deploy to Production

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables
5. Deploy!

## Tips for Success

- **Start Small**: Add 5-10 products to test everything works
- **Test Checkout**: Complete a test order before going live
- **Backup Database**: Export your database regularly
- **Use Real Images**: High-quality images increase sales by 50%+
- **SEO**: Fill in meta titles and descriptions for all products

## Getting Help

- Check the main README.md for detailed documentation
- Review Supabase docs: https://supabase.com/docs
- Check Next.js docs: https://nextjs.org/docs

## Production Checklist

Before launching:
- [ ] All environment variables set correctly
- [ ] Database backed up
- [ ] At least 20 products added
- [ ] Categories organized
- [ ] Test order completed successfully
- [ ] Payment gateway configured and tested
- [ ] Shipping rates configured
- [ ] Email notifications working
- [ ] Mobile responsive (test on phone)
- [ ] SEO metadata filled in
- [ ] Privacy policy & terms added
- [ ] Contact information updated
- [ ] Google Analytics added
- [ ] Domain name configured
- [ ] SSL certificate active

Congratulations! Your e-commerce platform is ready to launch! 🚀
