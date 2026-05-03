const User = require('../models/User');
const Content = require('../models/Content');
const Module = require('../models/Module');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');

// @desc Get all users
// @route GET /api/admin/users
const getUsers = async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json(users);
};

// @desc Create user (admin)
// @route POST /api/admin/users
const createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'User already exists' });
  const user = await User.create({ name, email, password, role });
  res.status(201).json({ _id: user._id, name: user.name, email: user.email, role: user.role });
};

// @desc Update user
// @route PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { name, email, role, isActive } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (role) user.role = role;
  if (typeof isActive === 'boolean') user.isActive = isActive;
  await user.save();
  res.json({ _id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive });
};

// @desc Delete user
// @route DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  await user.deleteOne();
  res.json({ message: 'User removed' });
};

// @desc Get system analytics
// @route GET /api/admin/analytics
const getSystemAnalytics = async (req, res) => {
  const [totalUsers, totalContent, totalModules, totalQuizzes, totalResults] = await Promise.all([
    User.countDocuments(),
    Content.countDocuments(),
    Module.countDocuments(),
    Quiz.countDocuments(),
    Result.countDocuments(),
  ]);

  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  const recentUsers = await User.find().select('-password').sort({ createdAt: -1 }).limit(5);

  res.json({
    totalUsers,
    totalContent,
    totalModules,
    totalQuizzes,
    totalResults,
    usersByRole,
    recentUsers,
  });
};

module.exports = { getUsers, createUser, updateUser, deleteUser, getSystemAnalytics };
