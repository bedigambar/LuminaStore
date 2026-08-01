const express = require('express');
const router = express.Router();
const {
  placeOrder, getMyOrders, getOrder, getAllOrders,
  updateOrderStatus, getOrderStats,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/auth');

router.get('/stats', protect, admin, getOrderStats);
router.get('/mine', protect, getMyOrders);
router.get('/', protect, admin, getAllOrders);
router.post('/', protect, placeOrder);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
