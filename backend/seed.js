require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');

const products = [
  {
    name: 'Premium Wireless Headphones',
    description: 'Experience crystal-clear audio with our flagship noise-cancelling headphones. Features 40-hour battery life, premium drivers, and a foldable design perfect for travel.',
    price: 299.99,
    comparePrice: 399.99,
    category: 'Electronics',
    brand: 'SoundWave',
    stock: 45,
    featured: true,
    rating: 4.7,
    numReviews: 128,
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', public_id: 'seed_hp1' }],
    tags: ['audio', 'wireless', 'noise-cancelling'],
  },
  {
    name: 'Ultra-Slim Laptop Pro 15"',
    description: 'Power meets portability. This sleek laptop features a 12th-gen processor, 16GB RAM, 512GB NVMe SSD, and an IPS display with 100% sRGB coverage.',
    price: 1299.99,
    comparePrice: 1599.99,
    category: 'Electronics',
    brand: 'TechPro',
    stock: 20,
    featured: true,
    rating: 4.8,
    numReviews: 95,
    images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', public_id: 'seed_laptop1' }],
    tags: ['laptop', 'computer', 'work'],
  },
  {
    name: 'Smartwatch Series X',
    description: 'Track your fitness, manage notifications, and pay with your wrist. Features ECG monitoring, GPS, and a stunning AMOLED display.',
    price: 349.99,
    comparePrice: 449.99,
    category: 'Electronics',
    brand: 'WristTech',
    stock: 60,
    featured: true,
    rating: 4.5,
    numReviews: 213,
    images: [{ url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800', public_id: 'seed_sw1' }],
    tags: ['smartwatch', 'fitness', 'wearable'],
  },
  {
    name: 'Mechanical Gaming Keyboard',
    description: 'Tactile feedback meets aesthetics. RGB backlit mechanical keyboard with Cherry MX switches, aluminum frame, and per-key programmable macros.',
    price: 149.99,
    comparePrice: 199.99,
    category: 'Electronics',
    brand: 'KeyMaster',
    stock: 80,
    featured: false,
    rating: 4.6,
    numReviews: 87,
    images: [{ url: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800', public_id: 'seed_kb1' }],
    tags: ['keyboard', 'gaming', 'mechanical'],
  },
  {
    name: '4K Action Camera',
    description: 'Capture every adventure in stunning 4K at 60fps. Waterproof to 30m, 2-inch touchscreen, and built-in stabilization for silky smooth footage.',
    price: 399.99,
    comparePrice: 499.99,
    category: 'Electronics',
    brand: 'AdventureCam',
    stock: 35,
    featured: true,
    rating: 4.4,
    numReviews: 152,
    images: [{ url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800', public_id: 'seed_cam1' }],
    tags: ['camera', 'action', '4k'],
  },
  {
    name: 'Premium Running Shoes',
    description: 'Engineered for performance with responsive foam midsole, breathable mesh upper, and durable rubber outsole. Perfect for road running and everyday wear.',
    price: 129.99,
    comparePrice: 159.99,
    category: 'Sports',
    brand: 'SpeedFoot',
    stock: 100,
    featured: true,
    rating: 4.7,
    numReviews: 342,
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', public_id: 'seed_shoes1' }],
    tags: ['shoes', 'running', 'fitness'],
  },
  {
    name: 'Designer Leather Jacket',
    description: 'Crafted from genuine full-grain leather, this jacket features a classic biker silhouette with modern details. Ages beautifully for a unique patina over time.',
    price: 289.99,
    comparePrice: 349.99,
    category: 'Clothing',
    brand: 'UrbanLeather',
    stock: 25,
    featured: false,
    rating: 4.9,
    numReviews: 67,
    images: [{ url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800', public_id: 'seed_jacket1' }],
    tags: ['jacket', 'leather', 'fashion'],
  },
  {
    name: 'Yoga & Fitness Mat Pro',
    description: 'Non-slip, eco-friendly TPE yoga mat with alignment lines. 6mm thick for joint support, moisture-resistant, and includes carrying strap.',
    price: 49.99,
    comparePrice: 69.99,
    category: 'Sports',
    brand: 'ZenFit',
    stock: 150,
    featured: false,
    rating: 4.5,
    numReviews: 289,
    images: [{ url: 'https://images.unsplash.com/photo-1601925228786-ed08fda39f7f?w=800', public_id: 'seed_mat1' }],
    tags: ['yoga', 'fitness', 'mat'],
  },
  {
    name: 'Artisan Coffee Maker',
    description: 'Brew cafe-quality coffee at home. Features programmable timer, thermal carafe, bloom pause technology, and compatibility with specialty coffee grounds.',
    price: 199.99,
    comparePrice: 249.99,
    category: 'Home',
    brand: 'BrewMaster',
    stock: 40,
    featured: true,
    rating: 4.6,
    numReviews: 178,
    images: [{ url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800', public_id: 'seed_coffee1' }],
    tags: ['coffee', 'kitchen', 'appliance'],
  },
  {
    name: 'The Art of Coding',
    description: 'A comprehensive guide to writing clean, efficient, and maintainable code. Covers design patterns, algorithms, and best practices used by top engineers at leading tech companies.',
    price: 39.99,
    comparePrice: 54.99,
    category: 'Books',
    brand: 'TechPress',
    stock: 200,
    featured: false,
    rating: 4.8,
    numReviews: 543,
    images: [{ url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800', public_id: 'seed_book1' }],
    tags: ['coding', 'programming', 'education'],
  },
  {
    name: 'Wireless Charging Pad',
    description: 'Fast 15W wireless charging for Qi-compatible devices. Sleek aluminum design, LED indicator, anti-slip surface, and compatible with all major smartphones.',
    price: 34.99,
    comparePrice: 49.99,
    category: 'Electronics',
    brand: 'ChargeTech',
    stock: 120,
    featured: false,
    rating: 4.3,
    numReviews: 95,
    images: [{ url: 'https://images.unsplash.com/photo-1585338447937-7082f8fc763d?w=800', public_id: 'seed_charger1' }],
    tags: ['charging', 'wireless', 'accessories'],
  },
  {
    name: 'Smart Home Speaker',
    description: '360-degree premium sound with built-in voice assistant. Control your smart home, stream music, set reminders, and more  all hands-free.',
    price: 89.99,
    comparePrice: 119.99,
    category: 'Electronics',
    brand: 'SoundHome',
    stock: 75,
    featured: true,
    rating: 4.4,
    numReviews: 231,
    images: [{ url: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=800', public_id: 'seed_speaker1' }],
    tags: ['speaker', 'smart home', 'audio'],
  },
];

const seed = async () => {
  try {
    await connectDB();

    console.log('🌱 Seeding database...');

    
    await Product.deleteMany();
    await User.deleteMany();

    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@luminastore.com',
      password: 'admin123',
      role: 'admin',
    });

    
    const user = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'user',
    });

    
    for (const p of products) {
      await Product.create(p);
    }

    console.log(`✅ Seeded ${products.length} products`);
    console.log(`✅ Created admin: admin@luminastore.com / admin123`);
    console.log(`✅ Created user: john@example.com / password123`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
