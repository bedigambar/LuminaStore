const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const SHIPPING_THRESHOLD = 50;
const SHIPPING_RATE = 9.99;
const TAX_RATE = 0.08;

// @desc   Place order
// @route  POST /api/orders
// @access Private
const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, paymentResult } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // Build order items + check stock
  const orderItems = [];
  for (const item of cart.items) {
    const product = await Product.findById(item.product._id);
    if (!product || product.stock < item.quantity) {
      res.status(400);
      throw new Error(`${item.name} is out of stock`);
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price: product.price,
      quantity: item.quantity,
    });

    // Reduce stock
    product.stock -= item.quantity;
    await product.save();
  }

  const itemsPrice = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingPrice = itemsPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;
  const taxPrice = parseFloat((itemsPrice * TAX_RATE).toFixed(2));
  const totalPrice = parseFloat((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  const order = await Order.create({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod: paymentMethod || 'stripe',
    paymentResult,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    isPaid: paymentResult ? true : false,
    paidAt: paymentResult ? new Date() : undefined,
  });

  // Clear cart
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  res.status(201).json({ success: true, order });
});

// @desc   Get my orders
// @route  GET /api/orders/mine
// @access Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('orderItems.product', 'name images');

  res.json({ success: true, orders });
});

// @desc   Get single order
// @route  GET /api/orders/:id
// @access Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('orderItems.product', 'name images');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Users can only see their own orders; admins can see all
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Access denied');
  }

  res.json({ success: true, order });
});

// @desc   Get all orders (admin)
// @route  GET /api/orders
// @access Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'name email');

  res.json({ success: true, orders, page, pages: Math.ceil(total / limit), total });
});

// @desc   Update order status
// @route  PUT /api/orders/:id/status
// @access Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }
  if (status === 'cancelled') {
    // Restore stock
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }
  }

  const updated = await order.save();
  res.json({ success: true, order: updated });
});

// @desc   Admin order stats
// @route  GET /api/orders/stats
// @access Admin
const getOrderStats = asyncHandler(async (req, res) => {
  const [stats] = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
        totalOrders: { $sum: 1 },
        avgOrderValue: { $avg: '$totalPrice' },
      },
    },
  ]);

  const statusCounts = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const monthlyRevenue = await Order.aggregate([
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);

  res.json({ success: true, stats, statusCounts, monthlyRevenue });
});

module.exports = {
  placeOrder, getMyOrders, getOrder, getAllOrders,
  updateOrderStatus, getOrderStats,
};
