const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { getUsers, createUser, updateUser, deleteUser, getSystemAnalytics } = require('../controllers/adminController');

router.use(protect, authorize('admin'));
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/analytics', getSystemAnalytics);

module.exports = router;
