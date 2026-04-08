const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} = require('../controllers/productController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/categories', getCategories);
router.get('/', getAllProducts);
router.get('/:id', getProductById);

router.post('/', auth, requireRole('admin'), createProduct);
router.put('/:id', auth, requireRole('admin'), updateProduct);
router.delete('/:id', auth, requireRole('admin'), deleteProduct);

module.exports = router;
