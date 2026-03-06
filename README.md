# RevShop Frontend 🛍️

Angular 21 single-page application for the RevShop e-commerce platform. Provides a responsive interface for Buyers, Sellers, and Shippers with real-time notifications, product discovery, cart management, and order tracking.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Available Routes](#available-routes)
- [Key Features](#key-features)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 21 (Standalone Components) |
| Language | TypeScript 5.9 |
| Reactive | RxJS 7, Angular Signals |
| Styling | Vanilla CSS |
| HTTP | Angular HttpClient + Interceptors |
| Testing | Karma, Jasmine |
| Build | Angular CLI 21 |

---

## Prerequisites

- Node.js 20+
- npm 10+

---

## Getting Started

### 1. Install Dependencies

```bash
cd revshop-app
npm install
```

### 2. Start the Development Server

```bash
npm start
# or
ng serve
```

App runs at: **http://localhost:4200**

> The frontend proxies all `/api/*` requests to the backend at `http://localhost:8080`. Make sure the backend is running.

---

## Configuration

### API Proxy (`proxy.conf.json`)

All API calls from the frontend are proxied:

```json
{
  "/api": {
    "target": "http://localhost:8080",
    "secure": false,
    "changeOrigin": true
  }
}
```

No changes needed for local development. For production, update the `target` to your backend URL.

---

## Running Tests

```bash
# Run all tests in headless mode (CI-friendly)
npx ng test --watch=false --browsers=ChromeHeadless

# Run tests with live browser (watch mode)
ng test
```

**Test Coverage:** 282 tests across 39 spec files — all passing ✅

---

## Project Structure

```
src/app/
├── components/
│   ├── landing-page/           # Home page, featured products/categories
│   ├── products/               # Product list, product detail
│   ├── cart/                   # Shopping cart
│   ├── checkout/               # Checkout flow
│   ├── orders/                 # Order history, tracking modal
│   ├── dashboard/              # Buyer & Seller dashboards
│   ├── login/                  # Login, forgot password
│   ├── register/               # Registration form
│   ├── profile/                # User profile management
│   ├── favorites/              # Wishlist
│   ├── search-bar/             # Search component
│   ├── shipper-dashboard/      # Shipper delivery management
│   ├── shipper-login/          # Shipper login
│   ├── shipper-register/       # Shipper registration
│   └── shared/
│       ├── navbar/             # Navigation + notifications
│       ├── header/             # Page header
│       ├── footer/             # Footer
│       └── toast/              # Toast notification UI
│
├── services/
│   ├── auth.ts                 # Authentication + JWT storage
│   ├── product.ts              # Product CRUD + search/filter
│   ├── cart.ts                 # Cart management
│   ├── order.ts                # Order placement + history
│   ├── payment.service.ts      # Razorpay integration
│   ├── notification.service.ts # In-app notifications
│   ├── user.ts                 # User profile
│   ├── address.ts              # Address management
│   ├── category.ts             # Product categories
│   ├── review.ts               # Product reviews & ratings
│   ├── favorite.ts             # Wishlist
│   ├── shipper.service.ts      # Shipper operations
│   └── toast.ts                # Toast UI service
│
├── guards/
│   └── auth-guard.ts           # Route protection by role
│
├── services/
│   ├── auth-interceptor.ts     # Attaches JWT to requests
│   └── error.interceptor.ts    # Global error handling
│
└── models/
    └── api-response.model.ts   # Typed API response wrapper
```

---

## Available Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Landing page |
| `/login` | Public | Buyer/Seller login |
| `/register` | Public | Buyer/Seller registration |
| `/products` | Public | Product listing & search |
| `/products/:id` | Public | Product detail |
| `/cart` | Buyer | Shopping cart |
| `/checkout` | Buyer | Checkout & payment |
| `/orders` | Buyer | Order history |
| `/favorites` | Buyer | Wishlist |
| `/profile` | Logged In | User profile |
| `/dashboard` | Seller | Seller dashboard |
| `/shipper/login` | Public | Shipper login |
| `/shipper/dashboard` | Shipper | Delivery management |

---

## Key Features

- **JWT Authentication** — Token stored in localStorage, auto-attached via `AuthInterceptor`
- **Role-based Routing** — `AuthGuard` restricts routes by user role (BUYER / SELLER / SHIPPER)
- **Angular Signals** — Reactive state management using Angular's Signals API
- **Real-time Notifications** — Polling + `refresh$` subject for instant notification updates in the Navbar
- **Razorpay Integration** — Embedded Razorpay checkout widget in the payment flow
- **Product Sorting & Filtering** — Sort by price/name, filter by category and price range
- **Order Tracking** — Full status timeline with visual progress indicator
