const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/userController');
const { auth, requireRole } = require('../middleware/auth');

router.get('/', auth, requireRole('admin'), getAllUsers);
router.get('/:id', auth, getUserById);
router.put('/:id', auth, updateUser);
router.delete('/:id', auth, requireRole('admin'), deleteUser);

module.exports = router;
