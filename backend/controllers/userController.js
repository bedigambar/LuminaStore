const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc   Get all users
// @route  GET /api/users
// @access Admin
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const total = await User.countDocuments();
  const users = await User.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

  res.json({ success: true, users, page, pages: Math.ceil(total / limit), total });
});

// @desc   Get user by ID
// @route  GET /api/users/:id
// @access Admin
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  res.json({ success: true, user });
});

// @desc   Update user role / status
// @route  PUT /api/users/:id
// @access Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  if (req.body.role !== undefined) user.role = req.body.role;
  if (req.body.isActive !== undefined) user.isActive = req.body.isActive;

  const updated = await user.save();
  res.json({ success: true, user: updated });
});

// @desc   Delete user
// @route  DELETE /api/users/:id
// @access Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) { res.status(404); throw new Error('User not found'); }
  await user.deleteOne();
  res.json({ success: true, message: 'User deleted' });
});

module.exports = { getUsers, getUser, updateUser, deleteUser };
