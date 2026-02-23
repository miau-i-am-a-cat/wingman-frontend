# Wingman Labs - Custom Frontend

Complete custom HTML/CSS/JS frontend for Wingman Labs, connected to Shopify backend via Storefront API.

## ✅ Completed Features

### Header
- **Transparent on homepage** - Semi-transparent background with blur effect before scroll
- **Solid on scroll** - Transitions to solid background after scrolling 50px
- **Solid on other pages** - Always solid background on non-homepage pages
- **Fully functional cart** - Add/remove items, update quantities, checkout
- **Customer account** - Login/logout functionality
- **Mobile responsive** - Adapts to all screen sizes

### Cart System
- **Shopify Storefront API integration**
- **Persistent cart** - Survives page refreshes
- **Slide-out drawer** - Smooth animation
- **Real-time updates** - Instant quantity changes
- **Direct checkout** - Links to Shopify checkout

## 🗂️ File Structure

```
wingman-frontend/
├── index.html                    # Homepage (transparent header demo)
├── config.js                     # Shopify API configuration
├── README.md                     # This file
├── components/
│   └── header.html               # Reusable header component
└── assets/
    ├── css/
    │   └── header.css            # Header & cart styles
    └── js/
        └── header.js             # Cart & account functionality
```

## 🔧 Setup

### 1. Shopify API Credentials

Already configured in `config.js`:
- Domain: `wingman-labs.myshopify.com`
- Storefront Access Token: `6d2b1b56f5d725e6d618494391f6dc9b`
- Customer Account Token: `bc5bc84f-fbb7-4f3f-aace-97cc2c1282e7`

### 2. Deploy to Vercel

This repo is ready to connect to Vercel:

1. Go to [vercel.com](https://vercel.com)
2. Import `miau-i-am-a-cat/wingman-frontend`
3. Deploy (no build config needed - static site)
4. Custom domain: Point your domain DNS to Vercel

### 3. Connect to Shopify

After deploying to Vercel:

1. Shopify Admin → Online Store → Themes → Actions → Edit code
2. Create new snippet: `custom-header.liquid`
3. Paste header HTML from `components/header.html`
4. Include in `theme.liquid`: `{% render 'custom-header' %}`
5. Add CSS link: `<link rel="stylesheet" href="https://your-vercel-url/assets/css/header.css">`
6. Add JS links:
   ```liquid
   <script src="https://your-vercel-url/config.js"></script>
   <script src="https://your-vercel-url/assets/js/header.js"></script>
   ```

## 📋 Usage

### Adding the Header to a Page

**HTML (static pages):**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="assets/css/header.css">
</head>
<body>
  <!-- Copy header HTML from components/header.html -->
  
  <script src="config.js"></script>
  <script src="assets/js/header.js"></script>
</body>
</html>
```

**For homepage with transparent header:**
```html
<body class="homepage">
  <!-- Header will start transparent and become solid on scroll -->
</body>
```

**For all other pages:**
```html
<body>
  <!-- Header will be solid -->
</body>
```

### Adding Items to Cart (Product Pages)

```html
<button onclick="addItemToCart('gid://shopify/ProductVariant/VARIANT_ID', 1)">
  Add to Cart
</button>
```

Get variant IDs from Shopify GraphQL:
```graphql
{
  product(handle: "product-handle") {
    variants(first: 10) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
}
```

## 🎨 Customization

### Colors

Edit CSS variables in `assets/css/header.css`:
```css
:root {
  --black: #0a0a0a;
  --dark: #111;
  --dark-border: #222;
  --white: #fff;
  --gray: #666;
  --light-gray: #999;
}
```

### Transparent Header Settings

Adjust transparency and blur in `assets/css/header.css`:
```css
.header.transparent {
  background: rgba(17, 17, 17, 0.3);  /* Adjust opacity */
  backdrop-filter: blur(10px);         /* Adjust blur */
}
```

### Scroll Threshold

Change when header becomes solid in `assets/js/header.js`:
```javascript
if (currentScroll > 50) {  // Change 50 to desired pixel value
  header.classList.remove('transparent');
  header.classList.add('solid');
}
```

## 🚀 Next Steps

1. **Create product pages** - Build individual product detail pages
2. **Copy existing sections** - Port Shogun section HTML to full pages
3. **Global CSS** - Extract common styles into `global.css`
4. **Component system** - Break down sections into reusable components
5. **Shopping experience** - Add product images, size selectors, etc.

## 📱 Mobile Support

- Header automatically collapses navigation on mobile
- Cart drawer becomes full-width on mobile
- Touch-friendly button sizes
- Responsive typography

## 🔒 Security

- API credentials are public read-only tokens (safe for client-side)
- Customer tokens stored in localStorage (standard Shopify pattern)
- HTTPS required for production (Vercel provides free SSL)

## 🐛 Debugging

**Cart not loading?**
- Check browser console for API errors
- Verify Shopify API credentials in `config.js`
- Clear localStorage: `localStorage.clear()`

**Header not transparent?**
- Ensure `<body class="homepage">` is set
- Check CSS is loaded: view source and verify `<link>` tag

**Cart count not updating?**
- Refresh page to sync with localStorage
- Check network tab for GraphQL responses

## 📚 Resources

- [Shopify Storefront API Docs](https://shopify.dev/docs/api/storefront)
- [GraphQL Explorer](https://shopify.dev/docs/api/storefront/graphql-explorer)
- [Vercel Deployment Docs](https://vercel.com/docs)

---

Built with ❤️ for Wingman Labs
