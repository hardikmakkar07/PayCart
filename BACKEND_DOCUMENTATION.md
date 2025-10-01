# PayCart - Backend & Integration Documentation

## 📋 Table of Contents
1. [Backend Overview](#backend-overview)
2. [Firebase Backend Architecture](#firebase-backend-architecture)
3. [Database Schema Design](#database-schema-design)
4. [Authentication System](#authentication-system)
5. [API Integration Layer](#api-integration-layer)
6. [Razorpay Payment Integration](#razorpay-payment-integration)
7. [Data Models & State Schema](#data-models--state-schema)
8. [Backend Security](#backend-security)
9. [Error Handling](#error-handling)
10. [Backend Flow Diagrams](#backend-flow-diagrams)

---

## 1. Backend Overview

### 1.1 Backend Architecture Type

PayCart uses a **Hybrid Backend Architecture**:

```
┌─────────────────────────────────────────────────────┐
│              BACKEND SERVICES LAYER                  │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │   Firebase   │  │  DummyJSON   │  │ Razorpay  │ │
│  │   (BaaS)     │  │  REST API    │  │  Payment  │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│         │                  │                │        │
│    Authentication      Product Data     Payments    │
│    User Management     Catalog          Gateway     │
│                                                       │
└─────────────────────────────────────────────────────┘
```

### 1.2 Backend Components

| Component | Type | Purpose | Technology |
|-----------|------|---------|------------|
| **Authentication** | BaaS | User auth & management | Firebase Auth |
| **Product API** | External REST | Product catalog | DummyJSON API |
| **Payment Gateway** | Third-party | Payment processing | Razorpay |
| **State Persistence** | Client-side | Cart & user data | Redux Store |
| **File Storage** | Static | Images, assets | Firebase Storage (optional) |

---

## 2. Firebase Backend Architecture

### 2.1 Firebase Configuration

```javascript
// firebase/firebase-config.jsx
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAzvAgfF19anahR2r3A9e_JvIrisBEP5FI",
    authDomain: "ecommerce-project-37733.firebaseapp.com",
    projectId: "ecommerce-project-37733",
    storageBucket: "ecommerce-project-37733.appspot.com",
    messagingSenderId: "777575350295",
    appId: "1:777575350295:web:65e868aaab1b16f47b1c52"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### 2.2 Firebase Services Used

#### **Firebase Authentication**
```
Service: Firebase Auth
Purpose: User authentication and session management
Methods Used:
  - createUserWithEmailAndPassword()
  - signInWithEmailAndPassword()
  - signOut()
  - onAuthStateChanged()
```

#### **Authentication Token Flow**
```
User Login
    ↓
Firebase Auth validates credentials
    ↓
Generates JWT (JSON Web Token)
    ↓
Token stored in browser (httpOnly cookie/localStorage)
    ↓
Token sent with protected requests
    ↓
Firebase validates token on each request
    ↓
Returns user data if valid
```

### 2.3 Firebase Auth Schema

Firebase automatically creates the following user structure:

```javascript
// Firebase User Object (Auto-generated)
{
  uid: "unique_user_id",           // Primary key
  email: "user@example.com",       // User email
  emailVerified: false,            // Email verification status
  displayName: null,               // User's display name
  photoURL: null,                  // Profile picture URL
  phoneNumber: null,               // Phone number
  disabled: false,                 // Account status
  metadata: {
    creationTime: "2023-10-01...", // Account creation
    lastSignInTime: "2023-10-01..." // Last login
  },
  providerData: [{                 // Auth providers
    uid: "user@example.com",
    email: "user@example.com",
    providerId: "password",        // password, google.com, etc.
    displayName: null,
    photoURL: null
  }],
  tokensValidAfterTime: "...",     // Security timestamp
  customClaims: {}                 // Custom user claims
}
```

### 2.4 User Data Flow in Application

```javascript
// How user data flows from Firebase to Redux

// 1. Firebase Auth Event Listener
onAuthStateChanged(auth, (currentUser) => {
  if (currentUser) {
    // User is signed in
    dispatch(userState({
      isLoggedIn: true,
      data: currentUser.providerData
    }))
  } else {
    // User is signed out
    dispatch(userState({
      isLoggedIn: false,
      data: []
    }))
  }
})

// 2. Redux stores minimal user data
{
  user: {
    isLoggedIn: true,
    userData: [{
      uid: "...",
      email: "user@example.com",
      providerId: "password"
    }]
  }
}
```

---

## 3. Database Schema Design

### 3.1 Current Implementation (Client-side)

PayCart currently uses **Redux as a temporary database** (client-side state):

```javascript
// Redux State serves as temporary database
{
  // Products "Table" (from API)
  product: {
    products: [
      {
        id: 1,
        title: "iPhone 9",
        description: "An apple mobile...",
        price: 549,
        discountPercentage: 12.96,
        rating: 4.69,
        stock: 94,
        brand: "Apple",
        category: "smartphones",
        thumbnail: "...",
        images: ["..."]
      }
    ]
  },

  // Cart "Table" (shopping cart)
  cart: {
    cartItems: {
      "1": {
        id: 1,
        title: "iPhone 9",
        price: 549,
        quantity: 2,
        thumbnail: "..."
      }
    },
    totalAmount: 1098,
    discountAmount: 142,
    finalAmount: 956
  },

  // Users "Table" (from Firebase)
  user: {
    isLoggedIn: true,
    userData: [{
      uid: "abc123",
      email: "user@example.com"
    }]
  }
}
```

### 3.2 Recommended Database Schema (Future Enhancement)

For production, here's the recommended **Firebase Firestore Schema**:

#### **Users Collection**
```javascript
// Collection: users
// Document ID: {userId}
{
  userId: "firebase_uid",
  email: "user@example.com",
  name: "John Doe",
  phone: "+1234567890",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  addresses: [
    {
      addressId: "addr_1",
      type: "shipping", // shipping, billing
      fullName: "John Doe",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
      isDefault: true
    }
  ],
  preferences: {
    currency: "USD",
    language: "en"
  }
}
```

#### **Products Collection** (if storing own products)
```javascript
// Collection: products
// Document ID: {productId}
{
  productId: "prod_123",
  title: "iPhone 14",
  description: "Latest iPhone...",
  price: 999.99,
  discountPercentage: 10,
  finalPrice: 899.99,
  rating: 4.5,
  reviewCount: 1250,
  stock: 50,
  brand: "Apple",
  category: "smartphones",
  subcategory: "flagship",
  images: [
    {
      url: "https://...",
      alt: "iPhone 14 front",
      isPrimary: true
    }
  ],
  specifications: {
    screen: "6.1 inch",
    processor: "A15 Bionic",
    ram: "6GB",
    storage: "128GB"
  },
  createdAt: Timestamp,
  updatedAt: Timestamp,
  isActive: true
}
```

#### **Orders Collection**
```javascript
// Collection: orders
// Document ID: {orderId}
{
  orderId: "order_abc123",
  userId: "firebase_uid",
  orderNumber: "ORD-2023-10-001",
  orderDate: Timestamp,
  
  status: "completed", // pending, processing, shipped, delivered, cancelled
  
  items: [
    {
      productId: "prod_123",
      title: "iPhone 14",
      price: 999.99,
      quantity: 1,
      discount: 100,
      finalPrice: 899.99,
      thumbnail: "https://..."
    }
  ],
  
  pricing: {
    subtotal: 1999.98,
    discount: 200,
    tax: 180,
    shipping: 0,
    total: 1979.98
  },
  
  shippingAddress: {
    fullName: "John Doe",
    address: "123 Main St",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "USA"
  },
  
  payment: {
    method: "razorpay",
    paymentId: "pay_xyz789",
    orderId: "order_xyz789",
    signature: "signature_hash",
    status: "success", // success, failed, pending
    paidAt: Timestamp
  },
  
  tracking: {
    carrier: "FedEx",
    trackingNumber: "123456789",
    estimatedDelivery: Timestamp
  },
  
  timeline: [
    {
      status: "placed",
      timestamp: Timestamp,
      note: "Order placed successfully"
    },
    {
      status: "confirmed",
      timestamp: Timestamp,
      note: "Payment confirmed"
    }
  ]
}
```

#### **Cart Collection** (Persistent Carts)
```javascript
// Collection: carts
// Document ID: {userId}
{
  userId: "firebase_uid",
  items: [
    {
      productId: "prod_123",
      quantity: 2,
      addedAt: Timestamp
    }
  ],
  updatedAt: Timestamp,
  expiresAt: Timestamp // Auto-delete after 30 days
}
```

#### **Reviews Collection**
```javascript
// Collection: reviews
// Document ID: {reviewId}
{
  reviewId: "rev_123",
  productId: "prod_123",
  userId: "firebase_uid",
  userName: "John D.",
  rating: 5,
  title: "Great product!",
  comment: "Excellent quality...",
  verified: true, // Verified purchase
  helpful: 45, // Helpful count
  images: ["https://..."],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 3.3 Data Relationships

```
Users (1) ──────────> (N) Orders
              has many

Users (1) ──────────> (N) Reviews
              writes many

Products (1) ────────> (N) Reviews
                receives many

Orders (N) ──────────> (N) Products
              contains many

Carts (1) ───────────> (N) Products
              contains many
```

### 3.4 Indexing Strategy (Firestore)

```javascript
// Recommended indexes for performance

// Orders Collection
{
  collection: "orders",
  fields: [
    { fieldPath: "userId", mode: "ASCENDING" },
    { fieldPath: "orderDate", mode: "DESCENDING" }
  ]
}

// Products Collection
{
  collection: "products",
  fields: [
    { fieldPath: "category", mode: "ASCENDING" },
    { fieldPath: "price", mode: "ASCENDING" }
  ]
}

// Reviews Collection
{
  collection: "reviews",
  fields: [
    { fieldPath: "productId", mode: "ASCENDING" },
    { fieldPath: "createdAt", mode: "DESCENDING" }
  ]
}
```

---

## 4. Authentication System

### 4.1 Authentication Methods

#### **Email/Password Authentication**

**Registration Flow:**
```javascript
// Backend: Firebase handles this
import { createUserWithEmailAndPassword } from 'firebase/auth';

const register = async (email, password) => {
  try {
    // 1. Firebase creates user account
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    
    // 2. Firebase returns user object
    const user = userCredential.user;
    
    // 3. Firebase automatically:
    //    - Hashes password (bcrypt)
    //    - Stores in secure backend
    //    - Generates auth token
    //    - Creates user record
    
    return user;
  } catch (error) {
    // Error codes from Firebase:
    // - auth/email-already-in-use
    // - auth/invalid-email
    // - auth/weak-password
    throw error;
  }
}
```

**Login Flow:**
```javascript
import { signInWithEmailAndPassword } from 'firebase/auth';

const login = async (email, password) => {
  try {
    // 1. Firebase validates credentials
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    
    // 2. Firebase returns:
    //    - User object
    //    - Auth token (JWT)
    //    - Refresh token
    
    const user = userCredential.user;
    
    // 3. Get ID token for API requests
    const token = await user.getIdToken();
    
    return { user, token };
  } catch (error) {
    // Error codes:
    // - auth/user-not-found
    // - auth/wrong-password
    // - auth/too-many-requests
    throw error;
  }
}
```

**Logout Flow:**
```javascript
import { signOut } from 'firebase/auth';

const logout = async () => {
  try {
    // Firebase:
    // 1. Invalidates current token
    // 2. Clears auth state
    // 3. Removes cookies/storage
    await signOut(auth);
  } catch (error) {
    throw error;
  }
}
```

### 4.2 Session Management

```javascript
// Real-time auth state listener
import { onAuthStateChanged } from 'firebase/auth';

// This runs automatically on:
// - App load
// - Login
// - Logout
// - Token refresh
onAuthStateChanged(auth, (currentUser) => {
  if (currentUser) {
    // User is authenticated
    // Token is valid
    console.log("User ID:", currentUser.uid);
    console.log("Email:", currentUser.email);
    
    // Update application state
    dispatch(userState({
      isLoggedIn: true,
      data: currentUser.providerData
    }));
  } else {
    // User is not authenticated
    // Token expired or invalid
    dispatch(userState({
      isLoggedIn: false,
      data: []
    }));
  }
});
```

### 4.3 Token-Based Authentication

**How Firebase Tokens Work:**

```
┌─────────────────────────────────────────┐
│  1. User logs in                         │
│  ↓                                       │
│  2. Firebase validates credentials       │
│  ↓                                       │
│  3. Firebase generates JWT               │
│     {                                    │
│       "iss": "firebase-project",         │
│       "aud": "firebase-project",         │
│       "auth_time": 1234567890,          │
│       "user_id": "abc123",              │
│       "sub": "abc123",                  │
│       "iat": 1234567890,                │
│       "exp": 1234571490,  // 1hr expiry │
│       "email": "user@example.com"       │
│     }                                    │
│  ↓                                       │
│  4. Token stored in browser              │
│  ↓                                       │
│  5. Sent with API requests               │
│     Authorization: Bearer <token>        │
│  ↓                                       │
│  6. Backend validates token              │
│  ↓                                       │
│  7. If expired, refresh automatically    │
└─────────────────────────────────────────┘
```

**Token Validation (Backend):**
```javascript
// If using custom backend with Firebase Admin SDK
import admin from 'firebase-admin';

const verifyToken = async (idToken) => {
  try {
    // Verify token with Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Returns:
    // {
    //   uid: "user_id",
    //   email: "user@example.com",
    //   iat: 123456789,
    //   exp: 123460389
    // }
    
    return decodedToken;
  } catch (error) {
    // Invalid token
    throw error;
  }
}
```

### 4.4 Password Security

**Firebase handles:**
- Password hashing (bcrypt with salt)
- Secure storage
- Password strength validation
- Brute force protection
- Account lockout after failed attempts

**Password Requirements:**
```javascript
// Minimum requirements (enforced by Firebase)
{
  minLength: 6,
  requireUppercase: false, // Can be customized
  requireLowercase: false,
  requireNumbers: false,
  requireSpecialChars: false
}

// Custom validation (client-side)
const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Minimum 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('At least one uppercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('At least one number');
  }
  
  return errors;
}
```

---

## 5. API Integration Layer

### 5.1 Product API (DummyJSON)

**API Structure:**
```
Base URL: https://dummyjson.com/

Endpoints Used:
├── GET /products
│   └── Get all products (limit=0 for all)
├── GET /products/{id}
│   └── Get single product details
├── GET /products/category/{category}
│   └── Get products by category
└── GET /products/search?q={query}
    └── Search products
```

**API Response Schema:**

```javascript
// GET /products
{
  products: [
    {
      id: 1,
      title: "iPhone 9",
      description: "An apple mobile which is nothing like apple",
      price: 549,
      discountPercentage: 12.96,
      rating: 4.69,
      stock: 94,
      brand: "Apple",
      category: "smartphones",
      thumbnail: "https://i.dummyjson.com/data/products/1/thumbnail.jpg",
      images: [
        "https://i.dummyjson.com/data/products/1/1.jpg",
        "https://i.dummyjson.com/data/products/1/2.jpg"
      ]
    }
  ],
  total: 100,
  skip: 0,
  limit: 30
}

// GET /products/{id}
{
  id: 1,
  title: "iPhone 9",
  description: "...",
  price: 549,
  discountPercentage: 12.96,
  rating: 4.69,
  stock: 94,
  brand: "Apple",
  category: "smartphones",
  thumbnail: "...",
  images: ["..."]
}
```

### 5.2 RTK Query API Layer

**API Slice Configuration:**
```javascript
// redux/slices/api/index.jsx
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const productsApi = createApi({
  reducerPath: "productApi",
  
  // Base configuration
  baseQuery: fetchBaseQuery({ 
    baseUrl: "https://dummyjson.com/",
    prepareHeaders: (headers) => {
      // Add auth headers if needed
      // const token = getState().user.token;
      // headers.set('authorization', `Bearer ${token}`);
      return headers;
    }
  }),
  
  // Cache configuration
  keepUnusedDataFor: 60, // Cache for 60 seconds
  refetchOnMountOrArgChange: 30, // Refetch if data older than 30s
  
  // API endpoints
  endpoints: (builder) => ({
    // Endpoint 1: Get all products
    getAllProducts: builder.query({
      query: () => "products/?limit=0",
      transformResponse: (response) => response.products,
      providesTags: ['Products']
    }),
    
    // Endpoint 2: Get product by ID
    getProductById: builder.query({
      query: (id) => `products/${id}`,
      providesTags: (result, error, id) => [{ type: 'Product', id }]
    }),
    
    // Endpoint 3: Get category products
    getAllCategoryProducts: builder.query({
      query: (category) => `products/category/${category}`,
      transformResponse: (response) => response.products
    })
  })
});

// Auto-generated hooks
export const {
  useGetAllProductsQuery,
  useGetProductByIdQuery,
  useGetAllCategoryProductsQuery
} = productsApi;
```

**API Caching Strategy:**

```javascript
// How RTK Query caches data

// First request - fetches from API
const { data, isLoading } = useGetAllProductsQuery();
// isLoading: true → Fetching...
// data: undefined

// After fetch completes
// isLoading: false
// data: [...products]
// STORED IN CACHE

// Second request (within 60s) - returns cached data
const { data, isLoading } = useGetAllProductsQuery();
// isLoading: false (instant)
// data: [...products] (from cache)
// NO API CALL MADE

// After 60s - refetches from API
// Fresh data fetched and cache updated
```

### 5.3 Manual API Integration (Alternative)

```javascript
// Used for dynamic category filtering
const fetchDataCategory = async (category) => {
  try {
    // 1. Make API request
    const response = await fetch(
      `https://dummyjson.com/products/category/${category}?limit=0`
    );
    
    // 2. Parse JSON
    const jsonData = await response.json();
    
    // 3. Update Redux store
    dispatch(addCategoryProducts({
      data: jsonData.products,
      isFirst: selectedCategories.length === 1
    }));
  } catch (error) {
    console.error('Error fetching data:', error);
    // Handle error (show toast, etc.)
  }
}
```

### 5.4 Search API Integration

```javascript
// Search implementation
const handleSearch = async (query) => {
  try {
    const response = await fetch(
      `https://dummyjson.com/products/search?q=${query}&limit=0`
    );
    const jsonData = await response.json();
    
    // Update products in Redux
    dispatch(addProducts(jsonData.products));
  } catch (error) {
    console.error('Search error:', error);
  }
}
```

---

## 6. Razorpay Payment Integration

### 6.1 Payment Gateway Architecture

```
┌─────────────────────────────────────────────────┐
│           PAYMENT FLOW ARCHITECTURE              │
├─────────────────────────────────────────────────┤
│                                                   │
│  Frontend (React)                                │
│       ↓                                          │
│  Load Razorpay SDK (CDN)                        │
│       ↓                                          │
│  Initialize Payment Options                      │
│       ↓                                          │
│  Open Razorpay Checkout Modal                   │
│       ↓                                          │
│  User enters payment details                     │
│       ↓                                          │
│  Razorpay Backend (PCI DSS Compliant)           │
│       ↓                                          │
│  Process Payment (Bank/Card/UPI)                │
│       ↓                                          │
│  Payment Success/Failure                         │
│       ↓                                          │
│  Callback to Frontend                            │
│       ↓                                          │
│  Verify Payment (Backend - Recommended)          │
│       ↓                                          │
│  Update Order Status                             │
│       ↓                                          │
│  Show Confirmation                               │
│                                                   │
└─────────────────────────────────────────────────┘
```

### 6.2 Razorpay Configuration

**Environment Configuration:**
```javascript
// Test Environment
const RAZORPAY_CONFIG = {
  mode: "test",
  keyId: "rzp_test_nrHrsMJkNeOshh",
  keySecret: "test_secret_key", // Never expose in frontend!
  webhookSecret: "webhook_secret"
}

// Production Environment (when live)
const RAZORPAY_CONFIG = {
  mode: "live",
  keyId: "rzp_live_xxxxxxxxx",
  keySecret: "live_secret_key", // Keep in backend only!
  webhookSecret: "webhook_secret"
}
```

### 6.3 Payment Implementation

**Frontend Integration:**
```javascript
// Step 1: Load Razorpay Script
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Step 2: Initialize Payment
const handlePayment = async (amount) => {
  // Load Razorpay SDK from CDN
  const res = await loadScript(
    "https://checkout.razorpay.com/v1/checkout.js"
  );
  
  if (!res) {
    alert("Razorpay SDK failed to load. Check your connection.");
    return;
  }
  
  // Payment options
  const options = {
    key: "rzp_test_nrHrsMJkNeOshh",
    amount: amount * 100, // Amount in paise (1 INR = 100 paise)
    currency: "INR",
    name: "PayCart",
    description: "Thank you for shopping with us",
    image: "/logo.png", // Your logo
    
    // Handler for successful payment
    handler: function (response) {
      // Payment successful
      const paymentId = response.razorpay_payment_id;
      const orderId = response.razorpay_order_id;
      const signature = response.razorpay_signature;
      
      // Verify payment on backend (recommended)
      verifyPayment(paymentId, orderId, signature);
      
      // Navigate to success page
      navigate(`/checkout/${paymentId}`);
    },
    
    // Prefill customer details
    prefill: {
      name: "Customer Name",
      email: "customer@example.com",
      contact: "9999999999"
    },
    
    // Theme customization
    theme: {
      color: "#000000"
    },
    
    // Modal settings
    modal: {
      ondismiss: function() {
        console.log("Payment cancelled by user");
      }
    }
  };
  
  // Create Razorpay instance and open modal
  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
}
```

### 6.4 Payment Verification (Backend)

**Recommended backend verification:**
```javascript
// Backend API endpoint (Node.js/Express example)
import crypto from 'crypto';

app.post('/api/verify-payment', async (req, res) => {
  const { 
    razorpay_payment_id, 
    razorpay_order_id, 
    razorpay_signature 
  } = req.body;
  
  // Create verification string
  const text = razorpay_order_id + "|" + razorpay_payment_id;
  
  // Generate signature
  const generated_signature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');
  
  // Verify signature
  if (generated_signature === razorpay_signature) {
    // Payment is genuine
    
    // Update order in database
    await db.collection('orders').doc(razorpay_order_id).update({
      'payment.status': 'success',
      'payment.paymentId': razorpay_payment_id,
      'payment.signature': razorpay_signature,
      'payment.verifiedAt': new Date(),
      'status': 'confirmed'
    });
    
    res.json({ success: true, verified: true });
  } else {
    // Payment verification failed
    res.status(400).json({ success: false, error: 'Invalid signature' });
  }
});
```

### 6.5 Payment States & Error Handling

**Payment States:**
```javascript
const PAYMENT_STATES = {
  INITIATED: 'initiated',       // Payment modal opened
  PROCESSING: 'processing',     // User entering details
  SUCCESS: 'success',          // Payment completed
  FAILED: 'failed',            // Payment failed
  CANCELLED: 'cancelled',      // User cancelled
  PENDING: 'pending'           // Awaiting confirmation
}
```

**Error Handling:**
```javascript
// Handle payment errors
const options = {
  // ... other options
  handler: function(response) {
    // Success handler
    handlePaymentSuccess(response);
  },
  modal: {
    ondismiss: function() {
      // User closed modal
      handlePaymentCancelled();
    },
    escape: false, // Prevent ESC key close
    backdropclose: false // Prevent backdrop click close
  }
}

// Error callback
paymentObject.on('payment.failed', function(response) {
  console.error('Payment failed:', response.error);
  
  // Error details
  const error = {
    code: response.error.code,
    description: response.error.description,
    source: response.error.source,
    step: response.error.step,
    reason: response.error.reason,
    metadata: response.error.metadata
  };
  
  // Show error to user
  showErrorMessage(error.description);
  
  // Log for debugging
  logPaymentError(error);
});
```

### 6.6 Payment Methods Supported

```javascript
// Razorpay supports multiple payment methods

const PAYMENT_METHODS = {
  card: {
    enabled: true,
    types: ['credit', 'debit'],
    networks: ['Visa', 'Mastercard', 'Maestro', 'RuPay']
  },
  netbanking: {
    enabled: true,
    banks: ['HDFC', 'ICICI', 'SBI', 'Axis', '...50+ banks']
  },
  wallet: {
    enabled: true,
    providers: ['Paytm', 'PhonePe', 'Amazon Pay', 'Mobikwik']
  },
  upi: {
    enabled: true,
    apps: ['Google Pay', 'PhonePe', 'Paytm', 'BHIM']
  },
  emi: {
    enabled: true,
    duration: [3, 6, 9, 12] // months
  },
  paylater: {
    enabled: true,
    providers: ['LazyPay', 'ZestMoney']
  }
}
```

### 6.7 Test Payment Credentials

**Test Cards:**
```javascript
// Always succeeds
{
  card: "4111 1111 1111 1111",
  cvv: "123",
  expiry: "12/25",
  cardHolder: "Test User"
}

// Triggers specific scenarios
{
  // Payment fails
  card: "4000 0000 0000 0002",
  
  // Requires authentication
  card: "4000 0027 6000 3184",
  
  // Insufficient funds
  card: "4000 0000 0000 9995"
}
```

**Test UPI:**
```
success@razorpay    → Success
failure@razorpay    → Failure
```

**Test Netbanking:**
```
Select any bank → Use credentials: test/test
```

### 6.8 Webhooks (Backend Integration)

**Webhook endpoint for payment events:**
```javascript
// Backend webhook handler
app.post('/api/razorpay-webhook', (req, res) => {
  // Verify webhook signature
  const webhookSignature = req.headers['x-razorpay-signature'];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  
  const generated_signature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  if (generated_signature === webhookSignature) {
    // Webhook is genuine
    const event = req.body.event;
    const payload = req.body.payload.payment.entity;
    
    switch(event) {
      case 'payment.authorized':
        // Payment authorized, capture it
        break;
      
      case 'payment.captured':
        // Payment successful
        updateOrderStatus(payload.order_id, 'paid');
        sendConfirmationEmail(payload);
        break;
      
      case 'payment.failed':
        // Payment failed
        updateOrderStatus(payload.order_id, 'failed');
        break;
      
      case 'refund.created':
        // Refund initiated
        handleRefund(payload);
        break;
    }
    
    res.json({ status: 'ok' });
  } else {
    res.status(400).json({ error: 'Invalid signature' });
  }
});
```

---

## 7. Data Models & State Schema

### 7.1 Product Data Model

```javascript
// Product interface/type
interface Product {
  // Primary
  id: number;
  title: string;
  description: string;
  
  // Pricing
  price: number;              // Current price
  discountPercentage: number; // Discount %
  originalPrice?: number;     // Calculated original price
  
  // Inventory
  stock: number;
  
  // Categorization
  category: string;
  brand: string;
  
  // Media
  thumbnail: string;
  images: string[];
  
  // Ratings
  rating: number;
  reviewCount?: number;
}

// Example
const product: Product = {
  id: 1,
  title: "iPhone 9",
  description: "An apple mobile which is nothing like apple",
  price: 549,
  discountPercentage: 12.96,
  stock: 94,
  category: "smartphones",
  brand: "Apple",
  thumbnail: "https://...",
  images: ["https://..."],
  rating: 4.69
}
```

### 7.2 Cart Data Model

```javascript
// Cart item interface
interface CartItem extends Product {
  quantity: number;
}

// Cart state interface
interface CartState {
  cartItems: {
    [productId: string]: CartItem
  };
  totalAmount: number;      // Sum of original prices
  discountAmount: number;   // Total discount
  finalAmount: number;      // Total after discount
}

// Example cart state
const cartState: CartState = {
  cartItems: {
    "1": {
      id: 1,
      title: "iPhone 9",
      price: 549,
      quantity: 2,
      // ... other product fields
    },
    "2": {
      id: 2,
      title: "MacBook Pro",
      price: 1999,
      quantity: 1,
      // ... other product fields
    }
  },
  totalAmount: 2647,      // (630 * 2) + 2299
  discountAmount: 551,    // (81 * 2) + 300
  finalAmount: 2096       // (549 * 2) + 1999
}
```

### 7.3 User Data Model

```javascript
// User interface
interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  providerId: string;
}

// User state interface
interface UserState {
  isLoggedIn: boolean;
  userData: User[];
}

// Example user state
const userState: UserState = {
  isLoggedIn: true,
  userData: [{
    uid: "firebase_uid_123",
    email: "user@example.com",
    displayName: "John Doe",
    photoURL: null,
    providerId: "password"
  }]
}
```

### 7.4 Order Data Model

```javascript
// Order interface (for future implementation)
interface Order {
  orderId: string;
  userId: string;
  orderNumber: string;
  orderDate: Date;
  
  items: OrderItem[];
  
  pricing: {
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
  };
  
  shippingAddress: Address;
  billingAddress: Address;
  
  payment: PaymentDetails;
  
  status: OrderStatus;
  
  createdAt: Date;
  updatedAt: Date;
}

// Order item
interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  discount: number;
  finalPrice: number;
  thumbnail: string;
}

// Payment details
interface PaymentDetails {
  method: 'razorpay' | 'cod' | 'card';
  paymentId: string;
  orderId: string;
  signature: string;
  status: 'pending' | 'success' | 'failed';
  paidAt?: Date;
}

// Order status
type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded';
```

---

## 8. Backend Security

### 8.1 Security Layers

```
┌─────────────────────────────────────────┐
│  Layer 1: Client-Side Security           │
│  - Input validation (Formik)             │
│  - XSS prevention (React escaping)       │
│  - CSRF tokens                           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Layer 2: Authentication Security        │
│  - Firebase JWT tokens                   │
│  - Token expiration (1 hour)             │
│  - Automatic refresh                     │
│  - Secure session management             │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Layer 3: API Security                   │
│  - HTTPS/TLS encryption                  │
│  - API key protection                    │
│  - Rate limiting                         │
│  - Request validation                    │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Layer 4: Payment Security               │
│  - PCI DSS compliant (Razorpay)          │
│  - No card data storage                  │
│  - Payment signature verification        │
│  - 3D Secure authentication              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│  Layer 5: Database Security              │
│  - Firestore security rules              │
│  - Row-level security                    │
│  - Encrypted at rest                     │
│  - Access control                        │
└─────────────────────────────────────────┘
```

### 8.2 Firebase Security Rules

**Firestore Security Rules (Recommended):**
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection
    match /users/{userId} {
      // Users can only read/write their own data
      allow read, write: if request.auth != null 
                         && request.auth.uid == userId;
    }
    
    // Orders collection
    match /orders/{orderId} {
      // Users can only read their own orders
      allow read: if request.auth != null 
                  && resource.data.userId == request.auth.uid;
      
      // Only authenticated users can create orders
      allow create: if request.auth != null 
                    && request.resource.data.userId == request.auth.uid;
      
      // Users cannot update or delete orders
      allow update, delete: if false;
    }
    
    // Products collection (read-only for all)
    match /products/{productId} {
      allow read: if true;  // Public read
      allow write: if false; // Only admin can write (via backend)
    }
    
    // Carts collection
    match /carts/{userId} {
      // Users can only access their own cart
      allow read, write: if request.auth != null 
                         && request.auth.uid == userId;
    }
    
    // Reviews collection
    match /reviews/{reviewId} {
      // Anyone can read reviews
      allow read: if true;
      
      // Only authenticated users can create reviews
      allow create: if request.auth != null;
      
      // Users can only update/delete their own reviews
      allow update, delete: if request.auth != null 
                            && resource.data.userId == request.auth.uid;
    }
  }
}
```

### 8.3 Environment Variables Security

**Secure configuration:**
```javascript
// .env file (NEVER commit to git)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_RAZORPAY_KEY_ID=your_razorpay_key

// Backend only (NEVER expose in frontend)
RAZORPAY_KEY_SECRET=your_secret_key
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
FIREBASE_ADMIN_SDK=service_account_key.json
```

**Access in code:**
```javascript
// Frontend (safe to expose)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // ... other config
}

// Backend only (NEVER in frontend)
const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
```

### 8.4 Input Validation & Sanitization

```javascript
// Email validation
const validateEmail = (email) => {
  const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return regex.test(email);
}

// Password validation
const validatePassword = (password) => {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*]/.test(password)
  };
}

// SQL Injection prevention (if using SQL database)
// Use parameterized queries
const query = 'SELECT * FROM users WHERE email = ?';
db.query(query, [userEmail]);

// XSS prevention (React handles this automatically)
// React escapes all values by default
const userInput = "<script>alert('xss')</script>";
<div>{userInput}</div> // Safe - renders as text, not HTML
```

---

## 9. Error Handling

### 9.1 API Error Handling

```javascript
// Centralized error handler
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    switch (error.response.status) {
      case 400:
        return 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'Access forbidden.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Check your connection.';
  } else {
    // Error in request setup
    return 'An unexpected error occurred.';
  }
}

// Usage in API call
try {
  const response = await fetch(url);
  if (!response.ok) throw new Error(response.statusText);
  const data = await response.json();
} catch (error) {
  const errorMessage = handleApiError(error);
  toast.error(errorMessage);
  console.error('API Error:', error);
}
```

### 9.2 Firebase Error Handling

```javascript
// Firebase auth error codes
const getAuthErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/email-already-in-use': 'Email already registered',
    'auth/invalid-email': 'Invalid email format',
    'auth/weak-password': 'Password must be at least 6 characters',
    'auth/user-not-found': 'No account found with this email',
    'auth/wrong-password': 'Incorrect password',
    'auth/too-many-requests': 'Too many attempts. Try again later',
    'auth/network-request-failed': 'Network error. Check connection',
    'auth/user-disabled': 'Account has been disabled',
    'auth/operation-not-allowed': 'Operation not allowed'
  };
  
  return errorMessages[errorCode] || 'Authentication error occurred';
}

// Usage
try {
  await signInWithEmailAndPassword(auth, email, password);
} catch (error) {
  const message = getAuthErrorMessage(error.code);
  toast.error(message);
}
```

### 9.3 Payment Error Handling

```javascript
// Razorpay error handling
paymentObject.on('payment.failed', function(response) {
  const error = response.error;
  
  // Log error details
  console.error('Payment Error:', {
    code: error.code,
    description: error.description,
    source: error.source,
    step: error.step,
    reason: error.reason
  });
  
  // User-friendly messages
  const errorMessages = {
    'BAD_REQUEST_ERROR': 'Invalid payment request',
    'GATEWAY_ERROR': 'Payment gateway error. Try again',
    'NETWORK_ERROR': 'Network issue. Check connection',
    'SERVER_ERROR': 'Server error. Try again later'
  };
  
  const message = errorMessages[error.code] || error.description;
  toast.error(message);
  
  // Save failed payment for retry
  saveFailedPayment({
    orderId: response.metadata.order_id,
    amount: response.metadata.amount,
    error: error
  });
});
```

---

## 10. Backend Flow Diagrams

### 10.1 Complete User Journey Flow

```
┌─────────────────────────────────────────────────┐
│                 USER VISITS SITE                 │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│          Browse Products (No Auth Required)      │
│  - DummyJSON API fetches products                │
│  - RTK Query caches data                         │
│  - Redux stores in product slice                 │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│              User Clicks "Add to Cart"          │
└────────────────────┬────────────────────────────┘
                     ↓
┌─────────────────────────────────────────────────┐
│            Check Authentication Status           │
│  - Redux user.isLoggedIn checked                 │
└────────────────────┬────────────────────────────┘
                     ↓
         ┌───────────┴───────────┐
         ↓                       ↓
    Not Logged In          Logged In
         ↓                       ↓
┌─────────────────┐     ┌─────────────────────┐
│ Redirect to     │     │ Add to Cart         │
│ Login Page      │     │ - Redux cart slice  │
└─────────┬───────┘     │ - Calculate totals  │
          ↓             └─────────┬───────────┘
┌─────────────────────┐           ↓
│  User Signs Up/In   │  ┌─────────────────────┐
│  - Firebase Auth    │  │ Continue Shopping   │
│  - Email/Password   │  │ or Proceed to Cart  │
│  - Token generated  │  └─────────┬───────────┘
│  - Redux updated    │            ↓
└─────────┬───────────┘  ┌─────────────────────┐
          ↓              │  View Cart          │
    [Loop back to        │  - Review items     │
     Add to Cart]        │  - Update quantities│
                         └─────────┬───────────┘
                                   ↓
                         ┌─────────────────────┐
                         │  Checkout Page      │
                         │  - Enter address    │
                         │  - Review order     │
                         └─────────┬───────────┘
                                   ↓
                         ┌─────────────────────┐
                         │  Initialize Payment │
                         │  - Load Razorpay    │
                         │  - Create options   │
                         └─────────┬───────────┘
                                   ↓
                         ┌─────────────────────┐
                         │  Razorpay Modal     │
                         │  - User pays        │
                         │  - 3D Secure auth   │
                         └─────────┬───────────┘
                                   ↓
                    ┌──────────────┴──────────────┐
                    ↓                             ↓
              Payment Success              Payment Failed
                    ↓                             ↓
        ┌─────────────────────┐      ┌──────────────────┐
        │ Verify Payment      │      │ Show Error       │
        │ - Check signature   │      │ - Retry option   │
        │ - Update order      │      └──────────────────┘
        └─────────┬───────────┘
                  ↓
        ┌─────────────────────┐
        │ Order Confirmation  │
        │ - Thank you page    │
        │ - Payment ID shown  │
        │ - Email sent        │
        └─────────────────────┘
```

### 10.2 Data Synchronization Flow

```
┌─────────────────────────────────────────────────┐
│              DATA SYNC ARCHITECTURE              │
└─────────────────────────────────────────────────┘

Firebase Auth          DummyJSON API         Razorpay
     ↓                      ↓                    ↓
onAuthStateChanged    RTK Query Fetch      Payment Handler
     ↓                      ↓                    ↓
Redux User Slice      Redux Product Slice   Payment Success
     ↓                      ↓                    ↓
   Update              Cache Products        Navigate
isLoggedIn              in Store            to Thankyou
     ↓                      ↓                    ↓
Protected Routes       Display in UI        Show Order
  Enabled              Components           Confirmation
```

### 10.3 State Management Flow

```
                    REDUX STORE (Single Source of Truth)
┌────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Product    │  │    Cart     │  │    User     │        │
│  │   Slice     │  │   Slice     │  │   Slice     │        │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘        │
│         │                │                │                │
│    products[]      cartItems{}      isLoggedIn            │
│                    totalAmount        userData[]           │
│                    finalAmount                            │
│                                                            │
└────────────────────────────────────────────────────────────┘
         ↑                  ↑                  ↑
         │                  │                  │
    Components         Components         Components
    useSelector        useSelector        useSelector
         │                  │                  │
    User Action        User Action        Firebase Event
         │                  │                  │
    dispatch()         dispatch()         auto dispatch
         │                  │                  │
    Reducers           Reducers           Reducers
    update state       update state       update state
```

---

## 11. Recommended Backend Enhancements

### 11.1 Move to Full Backend (Recommended for Production)

**Current**: Serverless (Firebase + External APIs)
**Recommended**: Node.js/Express + Firebase

```javascript
// Example Express.js backend structure

// Server setup
import express from 'express';
import cors from 'cors';
import admin from 'firebase-admin';

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Middleware: Verify Firebase token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// Protected route example
app.get('/api/user/orders', verifyToken, async (req, res) => {
  const userId = req.user.uid;
  
  const orders = await admin.firestore()
    .collection('orders')
    .where('userId', '==', userId)
    .get();
  
  res.json({ orders: orders.docs.map(doc => doc.data()) });
});

// Payment verification endpoint
app.post('/api/verify-payment', verifyToken, async (req, res) => {
  // Verify Razorpay signature
  // Update order in Firestore
  // Send confirmation email
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### 11.2 Implement Order Management System

```javascript
// Backend order creation
app.post('/api/orders/create', verifyToken, async (req, res) => {
  const { items, shippingAddress, amount } = req.body;
  const userId = req.user.uid;
  
  // 1. Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: amount * 100,
    currency: 'INR',
    receipt: `order_${Date.now()}`
  });
  
  // 2. Create order in Firestore
  const orderRef = await admin.firestore().collection('orders').add({
    userId,
    orderId: razorpayOrder.id,
    items,
    shippingAddress,
    amount,
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  res.json({
    orderId: razorpayOrder.id,
    orderRef: orderRef.id
  });
});
```

### 11.3 Implement Inventory Management

```javascript
// Backend stock management
app.post('/api/products/update-stock', async (req, res) => {
  const { productId, quantity } = req.body;
  
  const productRef = admin.firestore().collection('products').doc(productId);
  
  await admin.firestore().runTransaction(async (transaction) => {
    const product = await transaction.get(productRef);
    
    if (!product.exists) {
      throw new Error('Product not found');
    }
    
    const currentStock = product.data().stock;
    
    if (currentStock < quantity) {
      throw new Error('Insufficient stock');
    }
    
    transaction.update(productRef, {
      stock: currentStock - quantity
    });
  });
  
  res.json({ success: true });
});
```

---

## 12. Conclusion

### Backend Summary

PayCart's backend architecture is built on:

✅ **Firebase Authentication** - Secure user management
✅ **DummyJSON REST API** - Product catalog
✅ **Razorpay Payment Gateway** - Secure payments
✅ **Redux State Management** - Temporary data storage
✅ **RTK Query** - API caching & optimization

### Key Backend Features:

1. **Authentication**: JWT-based Firebase auth
2. **Data Storage**: Redux (client) + Firebase (users)
3. **Payment Processing**: Razorpay with signature verification
4. **API Integration**: RESTful APIs with caching
5. **Security**: Multi-layer security implementation

### Future Backend Enhancements:

- Move to Firestore for persistent storage
- Implement proper order management
- Add inventory tracking
- Email notifications
- Admin dashboard
- Analytics integration

---

**Documentation Version**: 1.0
**Last Updated**: October 2025
**Backend Stack**: Firebase + DummyJSON + Razorpay

