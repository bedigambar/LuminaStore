# LuminaStore E-Commerce Store

A full-stack, production-ready e-commerce application built with the MERN stack (MongoDB, Express, React, Node.js).

## Tech Stack
- **Frontend**: React 18, Vite, React Router v6, Context API, Vanilla CSS (Dark Theme), Lucide Icons, Recharts, Stripe Elements
- **Backend**: Node.js, Express, MongoDB/Mongoose, JWT Authentication, Multer + Cloudinary (Image Uploads), Stripe API

## Features
- **User Authentication**: JWT-based login, registration, and role management (Admin/User).
- **Product Management**: Filter, sort, search, pagination, and review system.
- **Shopping Cart**: Fully functional cart with local storage persistence.
- **Checkout Flow**: Integrated with Stripe for secure card payments.
- **Admin Dashboard**: Analytics, order management, user management, and product CRUD with image uploads to Cloudinary.
- **Responsive Design**: Modern, glassmorphism-inspired dark theme UI optimized for all devices.

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB connection string (Atlas or local)
- Stripe account (for payments)
- Cloudinary account (for image hosting)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file (you can copy `.env.example`):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   JWT_REFRESH_SECRET=your_jwt_refresh_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   CLIENT_URL=http://localhost:5173
   ```
4. Seed the database (creates admin, demo user, and 12 sample products):
   ```bash
   npm run seed
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
   ```
4. Start the Vite dev server:
   ```bash
   npm run dev
   ```

### 4. Test Accounts (if seeded)
- **Admin**: `admin@luminastore.com` / `admin123`
- **User**: `john@example.com` / `password123`

---

## Deployment (Railway & Vercel)

1. **Backend (Railway)**
   - Connect your GitHub repo to Railway.
   - Set the root directory to `/backend`.
   - Add all environment variables from your `.env` file.
   - Add `npm start` as the start command.

2. **Frontend (Vercel)**
   - Connect your GitHub repo to Vercel.
   - Set the framework preset to `Vite`.
   - Set the root directory to `/frontend`.
   - Add the `VITE_API_URL` pointing to your deployed Railway URL.
   - Add your `VITE_STRIPE_PUBLIC_KEY`.
