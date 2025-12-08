# E-commerce Platform - Next.js + Supabase

A complete, scalable e-commerce solution built with Next.js 14, Supabase, and TypeScript. Features a customer storefront and admin panel for managing products, orders, and customers.

## Features

### Customer Features
- 🛍️ Product browsing with categories and search
- 🔍 Product detail pages with images and specifications
- 🛒 Shopping cart functionality
- ⭐ Product reviews and ratings
- 📱 Responsive design for all devices
- 💳 Secure checkout process
- 📦 Order tracking

### Admin Features
- 📊 Dashboard with key metrics
- 📦 Product management (CRUD operations)
- 📂 Category management
- 🛒 Order management and fulfillment
- 👥 Customer management
- ⭐ Review moderation
- 📈 Inventory tracking

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Basic knowledge of React and Next.js

## Getting Started

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd ecommerce-app

# Install dependencies
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to find your credentials
3. Run the database schema:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy the contents of `supabase-schema.sql`
   - Paste and execute it

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Update with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 4. Create Your First Admin User

After setting up the database, you need to create an admin user:

1. Sign up through your application
2. Go to Supabase Dashboard > Table Editor > profiles
3. Find your user and change the `role` field to `admin` or `super_admin`

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the customer storefront.
Access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin).

## Project Structure

```
ecommerce-app/
├── app/
│   ├── (customer)/          # Customer-facing pages
│   │   ├── page.tsx         # Homepage
│   │   ├── products/        # Product pages
│   │   ├── cart/            # Shopping cart
│   │   └── checkout/        # Checkout process
│   ├── admin/               # Admin panel
│   │   ├── page.tsx         # Dashboard
│   │   ├── products/        # Product management
│   │   ├── orders/          # Order management
│   │   └── customers/       # Customer management
│   └── api/                 # API routes
├── components/
│   ├── customer/            # Customer components
│   ├── admin/               # Admin components
│   └── shared/              # Shared components
├── lib/
│   ├── supabase/            # Supabase clients
│   ├── api/                 # API functions
│   └── utils/               # Utility functions
└── types/
    └── database.ts          # Database types
```

## Database Schema

The database includes the following main tables:

- **profiles**: User profiles and roles
- **products**: Product catalog
- **product_images**: Product images
- **product_categories**: Product categorization
- **categories**: Product categories
- **orders**: Customer orders
- **order_items**: Order line items
- **carts**: Shopping carts
- **cart_items**: Cart contents
- **reviews**: Product reviews
- **addresses**: Customer addresses

## Key Features Implementation

### Row Level Security (RLS)

The database uses Supabase RLS policies to ensure:
- Customers can only see their own orders and addresses
- Only admins can manage products and view all orders
- Public users can view active products

### Image Handling

Product images are stored with URLs. For production:
1. Use Supabase Storage for image uploads
2. Configure the image upload component
3. Update the `product_images` table with storage URLs

### Payment Integration

To add payment processing:
1. Install Stripe: `npm install stripe @stripe/stripe-js`
2. Add Stripe keys to `.env.local`
3. Create payment API routes in `app/api/payments/`
4. Integrate with checkout flow

### Email Notifications

To add email notifications:
1. Install email service (e.g., Resend): `npm install resend`
2. Add API key to `.env.local`
3. Create email templates
4. Send emails on order creation/updates

## Customization

### Branding

Update these files to customize branding:
- `components/customer/Header.tsx` - Logo and navigation
- `components/customer/Footer.tsx` - Footer content
- `tailwind.config.js` - Colors and theme
- `app/(customer)/layout.tsx` - Metadata

### Categories

Add your product categories:
1. Go to Supabase Dashboard > Table Editor > categories
2. Insert your category data with slug and name
3. Update navigation in Header component

### Product Fields

To add custom product fields:
1. Update database schema in `supabase-schema.sql`
2. Add fields to `types/database.ts`
3. Update `components/admin/ProductForm.tsx`
4. Update product display components

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

```bash
# Or use Vercel CLI
npm install -g vercel
vercel
```

### Database Backup

Regularly backup your Supabase database:
1. Go to Supabase Dashboard > Database
2. Use the backup feature or pg_dump

## Performance Optimization

- Enable ISR for product pages
- Implement Redis caching for frequently accessed data
- Use CDN for images (Cloudflare, Vercel Edge)
- Enable database query caching
- Implement lazy loading for images

## Security Considerations

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- Always validate user input on the server
- Use RLS policies for data access control
- Implement rate limiting for API routes
- Sanitize user-generated content

## Troubleshooting

### "Failed to fetch" errors
- Check if Supabase URL and keys are correct
- Verify RLS policies aren't blocking queries
- Check browser console for detailed errors

### Admin access denied
- Verify user role is set to 'admin' in profiles table
- Check authentication is working
- Clear browser cache and cookies

### Images not loading
- Verify image URLs are accessible
- Check Next.js image configuration
- Update `next.config.js` domains whitelist

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use this project for commercial purposes.

## Support

For issues and questions:
- Check the documentation
- Review Supabase docs: https://supabase.com/docs
- Review Next.js docs: https://nextjs.org/docs

## Roadmap

- [ ] Advanced search and filters
- [ ] Product variants (size, color)
- [ ] Wishlist functionality
- [ ] Product recommendations
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Email marketing integration
- [ ] Inventory alerts
- [ ] Bulk product import/export
- [ ] Mobile app (React Native)
