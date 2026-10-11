// backend/routes/user.js
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/user/profile/:userId
// @desc    Fetch active user profile status from database
router.get('/profile/:userId', async (req, res) => {
  try {
    const userDoc = await User.findOne({ User_id: req.params.userId });
    if (!userDoc) return res.status(404).json({ message: "User session document profile not found" });
    res.status(200).json(userDoc);
  } catch (error) {
    res.status(500).json({ message: "Server connection failure", error: error.message });
  }
});

// @route   PUT /api/user/profile/:userId
// @desc    Update editable member variables inside user database table
router.put('/profile/:userId', async (req, res) => {
  try {
    const { firstName, lastName, phoneNo, address } = req.body;
    const updatedUser = await User.findOneAndUpdate(
      { User_id: req.params.userId },
      { $set: { firstName, lastName, phoneNo, address } },
      { new: true }
    );
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile constraints", error: error.message });
  }
});

export default router;
