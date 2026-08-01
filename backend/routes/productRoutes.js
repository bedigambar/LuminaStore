const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, deleteProductImage, addReview, getAdminProducts,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', getProducts);
router.get('/admin', protect, admin, getAdminProducts);
router.get('/:id', getProduct);
router.post('/', protect, admin, upload.array('images', 5), createProduct);
router.put('/:id', protect, admin, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.delete('/:id/images/:publicId', protect, admin, deleteProductImage);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
