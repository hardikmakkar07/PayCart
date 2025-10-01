# PayCart - Quick Start Guide

Get PayCart running on your local machine in 5 minutes!

## 🚀 Quick Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open Browser
Navigate to: `http://localhost:5173`

**That's it!** The app is now running with demo data from DummyJSON API.

## 🎯 Testing the Application

### 1. Browse Products
- The homepage displays products from DummyJSON API
- Use the search bar to find products
- Filter by categories using the sidebar
- Sort products by price or rating

### 2. User Registration
- Click "Login" → "Create a free account"
- Fill in the registration form
- Email and password are validated
- Firebase handles authentication

### 3. Shopping Flow
1. **Browse** → Click on any product to view details
2. **Add to Cart** → Select quantity and add to cart (requires login)
3. **View Cart** → Click the cart icon in navbar
4. **Checkout** → Click "Proceed to Checkout"
5. **Payment** → Fill shipping details and click "Make payment"

### 4. Test Payment (Razorpay Test Mode)
The app uses Razorpay test mode. Use these test card details:

**Test Card Numbers:**
- Success: `4111 1111 1111 1111`
- CVV: Any 3 digits (e.g., `123`)
- Expiry: Any future date (e.g., `12/25`)
- Name: Any name

**Alternative Test Methods:**
- UPI: `success@razorpay`
- Netbanking: Select any bank and use credentials `test/test`

## 📱 Features You Can Test

### ✅ Product Management
- [x] Product listing with infinite scroll
- [x] Category filtering (20+ categories)
- [x] Search functionality
- [x] Sort by price/rating
- [x] Product detail view

### ✅ Shopping Cart
- [x] Add/Remove items
- [x] Update quantities
- [x] Price calculations
- [x] Discount display
- [x] Persistent cart (Redux)

### ✅ User Authentication
- [x] Email/Password signup
- [x] User login
- [x] Session management
- [x] Protected routes

### ✅ Checkout & Payment
- [x] Razorpay integration
- [x] Order confirmation
- [x] Payment tracking

## 🔑 Default Configuration

The app comes pre-configured with:

**Firebase** (Demo Project)
- Authentication enabled
- Test mode configuration
- Ready to use out of the box

**Razorpay** (Test Mode)
- Test Key ID: `rzp_test_nrHrsMJkNeOshh`
- All payments are test transactions
- No real money is charged

**API**
- Products from DummyJSON
- No API key required
- 100+ products across 20+ categories

## 🛠️ Customization

### Use Your Own Firebase Project
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Update `src/firebase/firebase-config.jsx` with your credentials:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Use Your Own Razorpay Account
1. Sign up at [razorpay.com](https://razorpay.com)
2. Get your Key ID from the dashboard
3. Update line 41 in `src/screens/Checkout.jsx`:
```javascript
key: "your_razorpay_key_id"
```

## 🎨 UI Customization

### Branding
- Logo: Update SVG in `src/components/Navbar.jsx` and `src/components/Footer.jsx`
- App Name: Already set to "PayCart"
- Colors: Modify `tailwind.config.js`

### Theme Colors
The app uses Tailwind's default palette. To customize:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
        secondary: '#your-color',
      }
    }
  }
}
```

## 📊 Build for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

The build outputs to the `dist/` directory.

## 🐛 Common Issues

### Port Already in Use
```bash
# Use a different port
npm run dev -- --port 3000
```

### Firebase Auth Errors
- Ensure Firebase Authentication is enabled
- Check if Email/Password provider is activated
- Verify Firebase config is correct

### Razorpay Not Loading
- Check internet connection (Razorpay script loads from CDN)
- Verify the test key is correct
- Open browser console for error messages

### Products Not Loading
- Check internet connection
- DummyJSON API might be down (rare)
- Open Network tab in DevTools to inspect API calls

## 📚 Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/       # Page components
├── redux/         # State management
│   ├── slices/    # Redux slices
│   └── store.jsx  # Redux store
├── firebase/      # Firebase config
├── App.jsx        # Main app
└── main.jsx       # Entry point
```

## 🔗 Useful Links

- [React Documentation](https://react.dev)
- [Redux Toolkit](https://redux-toolkit.js.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Firebase Docs](https://firebase.google.com/docs)
- [Razorpay Docs](https://razorpay.com/docs)

## 💡 Tips

1. **Development**: Use React DevTools and Redux DevTools extensions
2. **Debugging**: Check browser console for errors
3. **State**: Use Redux DevTools to inspect state changes
4. **API**: Use Network tab to monitor API calls
5. **Styling**: Use Tailwind's IntelliSense in VS Code

## 🎓 Learning Path

1. Start with browsing products (no login required)
2. Create a user account to test authentication
3. Add items to cart to see Redux in action
4. Complete a test purchase to see Razorpay integration
5. Explore the code to understand the architecture

## ✨ Next Steps

- Customize the branding
- Add your own Firebase project
- Configure your Razorpay account
- Deploy to production (Vercel, Netlify, etc.)
- Add more features (see README.md for ideas)

---

Happy coding! 🚀 If you run into issues, check the README.md for detailed documentation.

