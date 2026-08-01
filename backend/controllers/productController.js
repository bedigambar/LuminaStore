const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { cloudinary } = require('../middleware/upload');

// @desc   Get all products
// @route  GET /api/products
// @access Public
const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = { isActive: true };

  if (req.query.category) filter.category = req.query.category;
  if (req.query.brand) filter.brand = new RegExp(req.query.brand, 'i');
  if (req.query.featured) filter.featured = req.query.featured === 'true';

  if (req.query.minPrice || req.query.maxPrice) {
    filter.price = {};
    if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
  }

  if (req.query.minRating) {
    filter.rating = { $gte: parseFloat(req.query.minRating) };
  }

  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }

  // Build sort
  let sortBy = {};
  switch (req.query.sort) {
    case 'price_asc': sortBy = { price: 1 }; break;
    case 'price_desc': sortBy = { price: -1 }; break;
    case 'rating': sortBy = { rating: -1 }; break;
    case 'newest': sortBy = { createdAt: -1 }; break;
    case 'popular': sortBy = { numReviews: -1 }; break;
    default: sortBy = { createdAt: -1 };
  }

  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter).sort(sortBy).skip(skip).limit(limit);

  res.json({
    success: true,
    products,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

// @desc   Get single product
// @route  GET /api/products/:id
// @access Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('reviews.user', 'name avatar');

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, product });
});

// @desc   Create product
// @route  POST /api/products
// @access Admin
const createProduct = asyncHandler(async (req, res) => {
  const {
    name, description, price, comparePrice,
    category, brand, stock, featured, tags,
  } = req.body;

  const images = req.files
    ? req.files.map((f) => ({ url: f.path, public_id: f.filename }))
    : req.body.images
    ? JSON.parse(req.body.images)
    : [];

  const product = await Product.create({
    name, description, price, comparePrice,
    category, brand, stock, featured, tags, images,
  });

  res.status(201).json({ success: true, product });
});

// @desc   Update product
// @route  PUT /api/products/:id
// @access Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const {
    name, description, price, comparePrice,
    category, brand, stock, featured, tags, isActive,
  } = req.body;

  // If new images uploaded, add to existing
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((f) => ({ url: f.path, public_id: f.filename }));
    product.images.push(...newImages);
  }

  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = price;
  if (comparePrice !== undefined) product.comparePrice = comparePrice;
  if (category !== undefined) product.category = category;
  if (brand !== undefined) product.brand = brand;
  if (stock !== undefined) product.stock = stock;
  if (featured !== undefined) product.featured = featured;
  if (tags !== undefined) product.tags = tags;
  if (isActive !== undefined) product.isActive = isActive;

  const updated = await product.save();
  res.json({ success: true, product: updated });
});

// @desc   Delete product
// @route  DELETE /api/products/:id
// @access Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Delete images from Cloudinary
  for (const img of product.images) {
    if (img.public_id) {
      await cloudinary.uploader.destroy(img.public_id);
    }
  }

  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted' });
});

// @desc   Delete product image
// @route  DELETE /api/products/:id/images/:publicId
// @access Admin
const deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }

  const publicId = decodeURIComponent(req.params.publicId);
  await cloudinary.uploader.destroy(publicId);
  product.images = product.images.filter((img) => img.public_id !== publicId);
  await product.save();
  res.json({ success: true, product });
});

// @desc   Add review
// @route  POST /api/products/:id/reviews
// @access Private
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if already reviewed
  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  product.updateRating();
  await product.save();

  res.status(201).json({ success: true, message: 'Review added' });
});

// @desc   Get admin products (all, including inactive)
// @route  GET /api/products/admin
// @access Admin
const getAdminProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const total = await Product.countDocuments();
  const products = await Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

  res.json({ success: true, products, page, pages: Math.ceil(total / limit), total });
});

module.exports = {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, deleteProductImage, addReview, getAdminProducts,
};
