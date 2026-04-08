const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  assignDriver,
  getAvailableDrivers,
} = require('../controllers/orderController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/drivers', auth, requireRole('admin'), getAvailableDrivers);
router.get('/', getAllOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);

router.patch('/:id/status', auth, requireRole('admin', 'driver'), updateOrderStatus);
router.patch('/:id/assign-driver', auth, requireRole('admin'), assignDriver);

module.exports = router;
