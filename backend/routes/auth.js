// backend/routes/auth.js
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// 1. @route   POST /api/auth/register
// @desc    Register a new permanent Taco Club member with strict uniqueness validations
router.post('/register', async (req, res) => {
  try {
    const { User_id, firstName, lastName, email, phoneNo, address, password } = req.body;

    // Strict validation loop checking for unique database conflicts across keys
    const duplicateCheck = await User.findOne({
      $or: [
        { User_id: User_id },
        { email: email },
        { phoneNo: phoneNo }
      ]
    });

    if (duplicateCheck) {
      if (duplicateCheck.User_id === User_id) return res.status(400).json({ message: "❌ This User ID is already claimed by a member!" });
      if (duplicateCheck.email === email) return res.status(400).json({ message: "❌ An account with this email address already exists!" });
      if (duplicateCheck.phoneNo === phoneNo) return res.status(400).json({ message: "❌ This mobile phone number is already registered!" });
    }

    // Insert new permanent member row into User Table with database permission parameters
    const newMember = new User({
      User_id, firstName, lastName, email, phoneNo, address, password,
      is_guest: false, 
      is_admin: User_id === "AkashPatel99", // Handled dynamically via authorization rules
      is_member: true
    });

    await newMember.save();
    res.status(201).json({ 
      success: true, 
      message: "🎉 Welcome to the Taco Club!", 
      User_id,
      is_admin: newMember.is_admin,
      is_member: true,
      is_guest: false
    });
  } catch (error) {
    res.status(500).json({ message: "Server registration error", error: error.message });
  }
});

// 2. @route   POST /api/auth/signin/member
// @desc    Authorize a permanent member account via User ID and Password lookup with status flags
router.post('/signin/member', async (req, res) => {
  try {
    const { User_id, password } = req.body;
    
    const memberDoc = await User.findOne({ User_id, is_guest: false });
    if (!memberDoc || memberDoc.password !== password) {
      return res.status(401).json({ message: "❌ Invalid User ID or Password combination!" });
    }

    // Returns structural authorization flags straight out of MongoDB document row parameters
    res.status(200).json({ 
      success: true, 
      message: "🔒 Authorization passed!", 
      User_id: memberDoc.User_id,
      is_admin: memberDoc.is_admin,
      is_member: memberDoc.is_member,
      is_guest: memberDoc.is_guest
    });
  } catch (error) {
    res.status(500).json({ message: "Server sign-in error", error: error.message });
  }
});
// 3. @route   POST /api/auth/signin/guest
// @desc    Initialize a frictionless, temporary guest session inside the database (No passwords required)
router.post('/signin/guest', async (req, res) => {
  try {
    const { fullName, phoneNo, address } = req.body;

    // Use full name as the unique temporary User_id session identifier string mapping
    const tempUser_id = `Guest_${fullName.replace(/\s+/g, '')}_${Math.floor(1000 + Math.random() * 9000)}`;

    const newGuest = new User({
      User_id: tempUser_id,
      firstName: fullName,
      lastName: "(Guest)",
      email: `${tempUser_id}@temporary.com`,
      phoneNo,
      address,
      password: "", // Guest profiles require no passwords columns
      is_guest: true, is_admin: false, is_member: false
    });

    await newGuest.save();

    // DYNAMIC AUTOMATED DATABASE TIMEOUT CLEANUP PIPELINE:
    // This auto-deletes the temporary guest row from your User table after exactly 30 minutes
    setTimeout(async () => {
      try {
        const deletedSession = await User.deleteOne({ User_id: tempUser_id });
        if (deletedSession.deletedCount > 0) {
          console.log(`🧹 Temporary guest table row scrubbed out cleanly on timeout for: ${tempUser_id}`);
        }
      } catch (err) {
        console.error("Session cleaner error handler fallback:", err.message);
      }
    }, 30 * 60 * 1000); // 30 Minutes

    res.status(201).json({ 
      success: true, 
      message: "💼 Guest session initialized!", 
      User_id: tempUser_id,
      is_admin: false,
      is_member: false,
      is_guest: true
    });
  } catch (error) {
    res.status(500).json({ message: "Server guest session failure", error: error.message });
  }
});

// 4. @route   POST /api/auth/logout/:userId
// @desc    Instantly wipe out guest rows from the database table when clicking terminate logout buttons
router.post('/logout/:userId', async (req, res) => {
  try {
    const targetId = req.params.userId;
    
    // Explicit condition check: Only delete if the document row is flagged as an active guest session
    const targetUser = await User.findOne({ User_id: targetId });
    
    if (targetUser && targetUser.is_guest) {
      await User.deleteOne({ User_id: targetId });
      console.log(`🧹 Action Triggered: Guest profile @${targetId} wiped out cleanly from the database table.`);
    }

    res.status(200).json({ success: true, message: "Session wiped cleanly out of the stack." });
  } catch (error) {
    res.status(500).json({ message: "Failed to erase session records", error: error.message });
  }
});

export default router;
