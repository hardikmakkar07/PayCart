# PayCart - System Architecture Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Architecture Pattern](#architecture-pattern)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Data Flow](#data-flow)
6. [Component Architecture](#component-architecture)
7. [State Management](#state-management)
8. [Routing System](#routing-system)
9. [Authentication Flow](#authentication-flow)
10. [API Integration](#api-integration)
11. [Payment Integration](#payment-integration)
12. [Security Architecture](#security-architecture)

---

## 1. Overview

PayCart is a **modern, full-stack e-commerce web application** built using a **component-based architecture** with React.js. It follows the **Flux architecture pattern** through Redux for predictable state management and implements a **modular, scalable structure**.

### Key Architectural Principles:
- **Separation of Concerns**: Clear separation between UI, business logic, and state
- **Unidirectional Data Flow**: Redux enforces one-way data flow
- **Component Reusability**: DRY principle with reusable components
- **Single Source of Truth**: Centralized state in Redux store
- **Declarative UI**: React's declarative approach for predictable rendering

---

## 2. Architecture Pattern

### 2.1 Overall Pattern: **MVC-like with Flux**

```
┌─────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │         React Components (Views)                 │   │
│  │  - Screens (Pages)                               │   │
│  │  - Components (Reusable UI)                      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           ↕️
┌─────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT LAYER                │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Redux Store (Single Source of Truth)     │   │
│  │  - Product Slice                                 │   │
│  │  - Cart Slice                                    │   │
│  │  │  - User Slice                                 │   │
│  │  - RTK Query (API Slice)                         │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           ↕️
┌─────────────────────────────────────────────────────────┐
│                      SERVICE LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐   │
│  │   Firebase   │  │  DummyJSON   │  │  Razorpay   │   │
│  │     Auth     │  │     API      │  │   Payment   │   │
│  └──────────────┘  └──────────────┘  └─────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Design Patterns Used:

1. **Container/Presentational Pattern**
   - Screens = Smart containers with business logic
   - Components = Presentational components for UI

2. **Redux Slice Pattern**
   - Modular state management
   - Each feature has its own slice

3. **Higher-Order Component (HOC) Pattern**
   - ProtectedRoute wraps components needing auth

4. **Provider Pattern**
   - Redux Provider wraps entire app
   - Context for global state access

5. **Middleware Pattern**
   - Redux middleware for async operations
   - RTK Query for API caching

---

## 3. Technology Stack

### 3.1 Frontend Core
```javascript
{
  "React": "18.2.0",           // UI Library
  "React Router DOM": "6.11.2", // Client-side routing
  "Redux Toolkit": "1.9.5",     // State management
  "RTK Query": "included",      // Data fetching & caching
}
```

### 3.2 Styling & UI
```javascript
{
  "Tailwind CSS": "3.3.2",      // Utility-first CSS
  "PostCSS": "8.4.24",          // CSS processing
  "Autoprefixer": "10.4.14",    // Browser compatibility
  "Lucide React": "0.240.0",    // Icon library
}
```

### 3.3 Backend Services
```javascript
{
  "Firebase": "9.22.2",         // Authentication & Backend
  "DummyJSON API": "REST",      // Product data
  "Razorpay": "Web SDK",        // Payment gateway
}
```

### 3.4 Form & Validation
```javascript
{
  "Formik": "2.4.1",           // Form management
  "React Toastify": "9.1.3",   // Notifications
}
```

### 3.5 Build Tools
```javascript
{
  "Vite": "4.3.9",             // Build tool & dev server
  "ESLint": "8.38.0",          // Code linting
}
```

---

## 4. Folder Structure

```
PayCart-main/
│
├── public/                      # Static assets
│   ├── favicon.svg             # App icon
│   └── vite.svg                # Vite logo
│
├── src/
│   ├── components/             # Reusable UI Components
│   │   ├── Navbar.jsx          # Global navigation
│   │   ├── Footer.jsx          # Global footer
│   │   ├── ProductCards.jsx    # Product display card
│   │   ├── CheckoutProductCard.jsx
│   │   ├── ShoppingCartProductCard.jsx
│   │   ├── OrderDetailscard.jsx
│   │   ├── ProductLists.jsx    # Product grid container
│   │   ├── ProductPagination.jsx
│   │   ├── ProductSkeletonLoader.jsx
│   │   ├── ProductDetailsSkeleton.jsx
│   │   └── FormErrorMessage.jsx
│   │
│   ├── screens/                # Page-level components
│   │   ├── ProductDisplay.jsx  # Main products page
│   │   ├── ProductDetails.jsx  # Single product view
│   │   ├── ShoppingCart.jsx    # Cart management
│   │   ├── Checkout.jsx        # Checkout & payment
│   │   ├── Thankyou.jsx        # Order confirmation
│   │   ├── login.jsx           # Login page
│   │   ├── SignUp.jsx          # Registration page
│   │   ├── Main.jsx            # Unused (OpenAI demo)
│   │   └── protected_route/
│   │       └── ProtectedRoute.jsx  # Auth guard
│   │
│   ├── redux/                  # State management
│   │   ├── store.jsx           # Redux store config
│   │   └── slices/
│   │       ├── products/
│   │       │   └── index.jsx   # Product state & actions
│   │       ├── cart/
│   │       │   └── index.jsx   # Cart state & actions
│   │       ├── user/
│   │       │   └── index.jsx   # User auth state
│   │       └── api/
│   │           └── index.jsx   # RTK Query API
│   │
│   ├── firebase/               # Firebase configuration
│   │   └── firebase-config.jsx # Firebase setup
│   │
│   ├── App.jsx                 # Root component with routes
│   ├── MainNavigation.jsx      # Navigation wrapper
│   ├── AuthRoute.jsx           # Auth routing logic
│   ├── main.jsx                # App entry point
│   ├── index.css               # Global styles
│   └── App.css                 # App-specific styles
│
├── index.html                  # HTML template
├── package.json                # Dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
├── postcss.config.js           # PostCSS configuration
├── .gitignore                  # Git ignore rules
├── README.md                   # Project documentation
├── QUICKSTART.md               # Quick setup guide
└── ARCHITECTURE.md             # This file
```

---

## 5. Data Flow

### 5.1 Unidirectional Data Flow (Redux)

```
┌──────────────┐
│   User       │
│   Action     │ (e.g., Click "Add to Cart")
└──────┬───────┘
       ↓
┌──────────────────────┐
│   Component          │
│   Dispatches Action  │ dispatch(addToCart(...))
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│   Redux Action       │ { type: 'cart/addToCart', payload: {...} }
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│   Reducer            │ Updates state immutably
│   (Cart Slice)       │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│   Redux Store        │ New state stored
│   (Single Source)    │
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│   Selector           │ useSelector(state => state.cart)
└──────┬───────────────┘
       ↓
┌──────────────────────┐
│   Component          │ Re-renders with new data
│   Re-render          │
└──────────────────────┘
```

### 5.2 API Data Flow (RTK Query)

```
Component Request
       ↓
RTK Query Hook (useGetAllProductsQuery)
       ↓
Check Cache (if exists, return cached)
       ↓
Fetch from API (DummyJSON)
       ↓
Store in Cache
       ↓
Return to Component
       ↓
Component Renders Data
```

---

## 6. Component Architecture

### 6.1 Component Hierarchy

```
App (Root)
├── MainNavigation
│   └── App Routes
│       ├── Navbar (Global)
│       ├── ProductDisplay (Page)
│       │   ├── ProductLists
│       │   │   └── ProductCards (multiple)
│       │   └── Category Filters
│       ├── ProductDetails (Page)
│       │   └── Product Info + Add to Cart
│       ├── ShoppingCart (Protected Page)
│       │   └── ShoppingCartProductCard (multiple)
│       ├── Checkout (Protected Page)
│       │   └── CheckoutProductCard (multiple)
│       ├── Thankyou (Protected Page)
│       │   └── OrderDetailscard (multiple)
│       ├── Login (Page)
│       ├── SignUp (Page)
│       └── Footer (Global)
```

### 6.2 Component Types

#### **Smart Components (Containers)**
- Located in `/screens`
- Manage state and logic
- Connect to Redux
- Handle API calls
- Examples: `ProductDisplay.jsx`, `ShoppingCart.jsx`

```javascript
// Smart Component Example
function ProductDisplay() {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.product.products);
  
  // Business logic here
  const fetchData = async () => { ... }
  
  return <ProductLists products={products} />
}
```

#### **Presentational Components (UI)**
- Located in `/components`
- Pure UI rendering
- Receive data via props
- No Redux connection
- Examples: `ProductCards.jsx`, `Footer.jsx`

```javascript
// Presentational Component Example
function ProductCards({ item, handleClick }) {
  return (
    <div onClick={handleClick}>
      <img src={item.thumbnail} />
      <h3>{item.title}</h3>
    </div>
  )
}
```

---

## 7. State Management

### 7.1 Redux Store Structure

```javascript
{
  product: {
    products: [],              // All products
  },
  cart: {
    cartItems: {},            // { productId: { ...product, quantity } }
    totalAmount: 0,           // Original total
    discountAmount: 0,        // Total discount
    finalAmount: 0            // Final price after discount
  },
  user: {
    userData: [],             // User profile data
    isLoggedIn: false         // Auth status
  },
  productApi: {
    queries: {},              // RTK Query cache
    mutations: {}
  }
}
```

### 7.2 Redux Slices

#### **Product Slice** (`redux/slices/products`)
```javascript
Actions:
- addProducts(products)           // Set all products
- addCategoryProducts(data)       // Add category products
- removeCategoryProducts(category)// Remove category
- sortByLowToHigh()              // Sort ascending
- sortByHighToLow()              // Sort descending
- sortByRating()                 // Sort by rating
```

#### **Cart Slice** (`redux/slices/cart`)
```javascript
Actions:
- addToCart({ id, data, quantity, amounts })
- removeCartItem({ id })
- increaseCartItem({ id })
- decreaseCartItem({ id })

State Updates:
- Calculates totals, discounts, final amounts
- Maintains cart object by product ID
```

#### **User Slice** (`redux/slices/user`)
```javascript
Actions:
- loginUser(userData)            // Login user
- logoutUser()                   // Logout user
- userState({ isLoggedIn, data })// Set auth state

Used for:
- Authentication status
- Protected route access
- User profile data
```

#### **API Slice** (`redux/slices/api`)
```javascript
Endpoints:
- getAllProducts()               // Fetch all products
- getAllCategoryProducts(category)
- getProductById(id)

Features:
- Automatic caching
- Refetching strategies
- Loading states
```

### 7.3 State Update Flow Example

**Adding Product to Cart:**
```javascript
// 1. User clicks "Add to Cart"
<button onClick={() => addItemToCart(item)}>

// 2. Component dispatches action
const dispatch = useDispatch();
dispatch(addToCart({
  id: item.id,
  data: item,
  quantity: 1,
  totalAmount: calculatedTotal,
  discountAmount: calculatedDiscount,
  finalAmount: calculatedFinal
}));

// 3. Reducer updates state
addToCart: (state, action) => {
  state.cartItems[action.payload.id] = {
    ...action.payload.data,
    quantity: action.payload.quantity
  };
  state.totalAmount += action.payload.totalAmount;
  state.finalAmount += action.payload.finalAmount;
}

// 4. Component re-renders with new state
const cartItems = useSelector((state) => state.cart.cartItems);
```

---

## 8. Routing System

### 8.1 Route Structure

```javascript
<Routes>
  // Public Routes
  <Route path="/" element={<Navigate to="/page/1" />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<SignUp />} />
  
  // Product Routes
  <Route path="/page/:page_number" element={
    <><Navbar /><ProductDisplay /><Footer /></>
  } />
  <Route path="/page/product_detail/:id" element={
    <><Navbar /><ProductDetails /><Footer /></>
  } />
  
  // Protected Routes (Require Auth)
  <Route path="/page/cart" element={
    <><Navbar /><ProtectedRoute component={ShoppingCart} /><Footer /></>
  } />
  <Route path="/checkout" element={
    <><Navbar /><ProtectedRoute component={Checkout} /><Footer /></>
  } />
  <Route path="/checkout/:payment_id" element={
    <><Navbar /><ProtectedRoute component={Thankyou} /><Footer /></>
  } />
  
  // Catch-all
  <Route path="/*" element={<Navigate to="/page/1" />} />
</Routes>
```

### 8.2 Protected Route Implementation

```javascript
function ProtectedRoute({ user, component: Component }) {
  if (!user) {
    return <Navigate to="/login" replace />
  }
  return <Component />
}
```

**How it works:**
1. Check if user is authenticated
2. If not → Redirect to login
3. If yes → Render the component

---

## 9. Authentication Flow

### 9.1 Firebase Authentication Architecture

```
┌─────────────────┐
│  User Action    │ (Click Login/Signup)
└────────┬────────┘
         ↓
┌─────────────────────────────┐
│  Form Component             │
│  (Formik validation)        │
└────────┬────────────────────┘
         ↓
┌─────────────────────────────┐
│  Firebase Auth Method       │
│  - signInWithEmailAndPassword
│  - createUserWithEmailAndPassword
└────────┬────────────────────┘
         ↓
┌─────────────────────────────┐
│  Firebase Backend           │
│  - Validates credentials    │
│  - Returns user token       │
└────────┬────────────────────┘
         ↓
┌─────────────────────────────┐
│  onAuthStateChanged         │
│  - Listens for auth changes │
└────────┬────────────────────┘
         ↓
┌─────────────────────────────┐
│  Redux User Slice           │
│  - Updates isLoggedIn       │
│  - Stores user data         │
└────────┬────────────────────┘
         ↓
┌─────────────────────────────┐
│  Protected Routes Unlock    │
│  - Cart, Checkout accessible│
└─────────────────────────────┘
```

### 9.2 Authentication Lifecycle

**Sign Up Flow:**
```javascript
// 1. User submits form
onSubmit: (values) => {
  register(values.email, values.password)
}

// 2. Create user in Firebase
const user = await createUserWithEmailAndPassword(
  auth, email, password
)

// 3. Auto-login via onAuthStateChanged
onAuthStateChanged(auth, (currentUser) => {
  if (currentUser) {
    dispatch(userState({
      isLoggedIn: true,
      data: currentUser.providerData
    }))
  }
})
```

**Login Flow:**
```javascript
// 1. User submits credentials
const userCredential = await signInWithEmailAndPassword(
  auth, email, password
)

// 2. Dispatch to Redux
dispatch(loginUser(user.providerData))

// 3. Navigate to products
navigate("/page/1")
```

**Logout Flow:**
```javascript
// 1. Sign out from Firebase
await signOut(auth)

// 2. Redux updates automatically via onAuthStateChanged
// 3. Redirect to login
navigate("/login")
```

---

## 10. API Integration

### 10.1 RTK Query Setup

```javascript
// redux/slices/api/index.jsx
export const productsApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "https://dummyjson.com/"
  }),
  endpoints: (builder) => ({
    getAllProducts: builder.query({
      query: () => "products/?limit=0"
    }),
    getProductById: builder.query({
      query: (id) => `products/${id}`
    }),
    getAllCategoryProducts: builder.query({
      query: (category) => `products/${category}`
    })
  })
})
```

### 10.2 API Usage in Components

```javascript
// Using RTK Query hooks
const { data, error, isLoading } = useGetAllProductsQuery()

// Benefits:
// - Automatic caching
// - Loading states
// - Error handling
// - Refetch strategies
// - Polling support
```

### 10.3 Manual API Calls (Alternative)

```javascript
// Used in ProductDisplay for category filtering
const fetchDataCategory = async () => {
  const response = await fetch(
    `https://dummyjson.com/products/category/${category}`
  )
  const jsonData = await response.json()
  dispatch(addCategoryProducts({ data: jsonData.products }))
}
```

---

## 11. Payment Integration

### 11.1 Razorpay Architecture

```
┌─────────────────────────┐
│  User Fills Checkout    │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│  Click "Make Payment"   │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│  Load Razorpay Script   │ (CDN)
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│  Initialize Razorpay    │
│  - Amount               │
│  - Key ID               │
│  - Currency             │
│  - Handler callback     │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│  Razorpay Modal Opens   │
│  (User enters payment)  │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│  Payment Success        │
│  - Returns payment_id   │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│  Handler Callback       │
│  - Navigate to thankyou │
│  - Pass payment_id      │
└───────────┬─────────────┘
            ↓
┌─────────────────────────┐
│  Order Confirmation     │
│  - Display order details│
└─────────────────────────┘
```

### 11.2 Razorpay Implementation

```javascript
// 1. Load Razorpay SDK
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// 2. Initialize payment
const handlePayment = async (amount) => {
  const res = await loadScript(
    "https://checkout.razorpay.com/v1/checkout.js"
  )
  
  const options = {
    key: "rzp_test_nrHrsMJkNeOshh",
    currency: "INR",
    amount: amount,
    name: "PayCart",
    description: "Thank you for purchasing",
    handler: function(response) {
      // Success callback
      navigate(`/checkout/${response.razorpay_payment_id}`)
    }
  }
  
  const paymentObject = new window.Razorpay(options)
  paymentObject.open()
}
```

---

## 12. Security Architecture

### 12.1 Security Layers

```
┌─────────────────────────────────────┐
│  1. Client-Side Security             │
│  - Protected Routes (Auth Check)     │
│  - Form Validation (Formik)          │
│  - Input Sanitization                │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  2. Firebase Authentication          │
│  - Secure token-based auth           │
│  - Password hashing (auto)           │
│  - Session management                │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  3. Payment Security                 │
│  - Razorpay PCI DSS compliant        │
│  - No card data stored locally       │
│  - Encrypted transactions            │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  4. HTTPS/SSL (Production)           │
│  - Encrypted data transfer           │
│  - Secure API calls                  │
└─────────────────────────────────────┘
```

### 12.2 Protected Route Security

```javascript
// Access Control Flow
User attempts to access /cart
       ↓
Check auth state (Redux)
       ↓
If not authenticated → Redirect to /login
If authenticated → Render component
```

### 12.3 Form Validation Security

```javascript
// Formik validation prevents malicious input
const validate = (values) => {
  const errors = {}
  
  // Email validation
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email'
  }
  
  // Password strength
  if (values.password.length < 8) {
    errors.password = 'Must be 8+ characters'
  }
  
  return errors
}
```

---

## 13. Performance Optimizations

### 13.1 Implemented Optimizations

1. **Redux Toolkit**
   - Immer for immutable updates (no manual copying)
   - Automatic action creator generation
   - DevTools integration for debugging

2. **RTK Query**
   - Automatic caching (reduces API calls)
   - Deduplication of requests
   - Normalized cache updates

3. **React Optimizations**
   - Functional components (lighter than classes)
   - Hooks for efficient state management
   - Key props for efficient list rendering

4. **Vite Build Tool**
   - Fast HMR (Hot Module Replacement)
   - Optimized production builds
   - Tree-shaking (removes unused code)

5. **Lazy Loading**
   - Infinite scroll for products
   - Images load on demand

6. **Tailwind CSS**
   - Purges unused CSS in production
   - Minimal CSS bundle size

### 13.2 Performance Flow

```
User loads page
     ↓
Vite serves optimized bundle
     ↓
React hydrates DOM
     ↓
Redux initializes state
     ↓
RTK Query checks cache
     ↓
If cached → instant display
If not → fetch & cache
     ↓
Components render with data
```

---

## 14. Deployment Architecture

### 14.1 Production Build Process

```
npm run build
     ↓
Vite optimization
- Tree shaking
- Code splitting
- Minification
- Asset optimization
     ↓
dist/ folder created
     ↓
Deploy to hosting
- Vercel
- Netlify
- Firebase Hosting
```

### 14.2 Environment Configuration

```javascript
Development:
- Vite dev server (localhost:5173)
- Hot Module Replacement
- Source maps for debugging
- Test API keys

Production:
- Optimized static files
- CDN delivery
- Compressed assets
- Production API keys
```

---

## 15. Key Architectural Decisions

### 15.1 Why Redux Toolkit?
- **Simplified Redux**: Less boilerplate than classic Redux
- **Built-in Tools**: Immer, Thunk, DevTools
- **RTK Query**: Replaces Redux-Saga/Thunk for API calls
- **Type Safety**: Better TypeScript support (future-proof)

### 15.2 Why Vite over Create React App?
- **Speed**: 10-100x faster HMR
- **Modern**: ES modules, native ESM
- **Optimized**: Better production builds
- **Flexibility**: Better plugin ecosystem

### 15.3 Why Firebase?
- **Quick Setup**: Authentication in minutes
- **Scalability**: Google infrastructure
- **Real-time**: Can add real-time features
- **Free Tier**: Generous limits for development

### 15.4 Why Tailwind CSS?
- **Utility-First**: Rapid development
- **Customizable**: Easy theming
- **Performance**: Purges unused CSS
- **Consistency**: Design system built-in

---

## 16. Extension Points

### 16.1 How to Add New Features

**Add a new product feature:**
1. Create reducer in `redux/slices/products`
2. Add action to slice
3. Dispatch from component
4. Access via useSelector

**Add a new page:**
1. Create component in `screens/`
2. Add route in `App.jsx`
3. Link from navigation

**Add new API endpoint:**
1. Add endpoint to RTK Query slice
2. Export hook
3. Use hook in component

### 16.2 Potential Enhancements

```
Current → Future
─────────────────────────────────
Local State → Database (Firestore)
Test Payments → Live Razorpay
Static Products → Admin Dashboard
Client Auth → JWT + Backend
Single Currency → Multi-currency
Basic Search → Elasticsearch
No Analytics → Google Analytics
```

---

## 17. Troubleshooting Architecture

### 17.1 Common Issues & Solutions

**Blank Screen:**
- Check: Browser console for errors
- Check: Redux state in DevTools
- Check: API responses in Network tab

**Auth Not Working:**
- Check: Firebase config credentials
- Check: onAuthStateChanged listener
- Check: Redux user slice updates

**Payment Failing:**
- Check: Razorpay script loaded
- Check: Test key validity
- Check: Amount format (paise, not rupees)

**State Not Updating:**
- Check: Action dispatched correctly
- Check: Reducer returns new state
- Check: Component using useSelector

---

## 18. Conclusion

PayCart implements a **modern, scalable architecture** following industry best practices:

✅ **Modular**: Clear separation of concerns
✅ **Maintainable**: Easy to understand and extend  
✅ **Performant**: Optimized for speed
✅ **Secure**: Multiple security layers
✅ **Scalable**: Can handle growth

The architecture allows for:
- Easy feature additions
- Simple debugging
- Team collaboration
- Future enhancements

---

**Architecture Version**: 1.0  
**Last Updated**: October 2025  
**Maintained By**: PayCart Team

