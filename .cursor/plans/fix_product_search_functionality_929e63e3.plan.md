---
name: Fix Product Search Functionality
overview: The search input in the Header component is not functional. It needs to capture user input and navigate to the products page with search query parameters. The backend already supports search, so we just need to wire up the frontend.
todos: []
---

# Fix Product Search Functionality

## Overview

The search input in the Header component currently has no functionality. Users can type but nothing happens. The products page and API already support search via query parameters, so we need to connect the search input to navigate to the products page with the search query.

## Implementation Steps

### 1. Update Header Component

- **File**: `components/customer/Header.tsx`
- Add state management for the search query using `useState`
- Add form submission handler that navigates to `/products?search={query}`
- Wrap the search input in a form element
- Handle Enter key submission
- Use Next.js `useRouter` for navigation or form action
- Optionally add a submit button for better UX
- Ensure the search works on both desktop and mobile views

### 2. Test Search Functionality

- Verify that typing and submitting navigates to products page
- Verify that search query appears in URL
- Verify that products are filtered correctly based on search term
- Test on both desktop and mobile views

## Technical Details

The search will:

- Use Next.js router to navigate to `/products?search={query}`
- The products page already reads `searchParams.search` and passes it to `getProducts()`
- The `getProducts()` function in `lib/api/products.ts` already handles search with: `query.or(\`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%\`)`
- Search will match product names and descriptions (case-insensitive)

## Files to Modify

- `components/customer/Header.tsx` - Add search functionality with form submission and navigation