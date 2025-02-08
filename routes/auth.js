const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../utils/validationSchemas');
const validateRequest = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post(
  '/register', 
  registerValidation,
  validateRequest,
  authController.register
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login', 
  loginValidation,
  validateRequest,
  authController.login
);

// @route   GET /api/auth/validate
// @desc    Validate user token
// @access  Private
router.get(
  '/validate', 
  authMiddleware,
  async (req, res) => {
    try {
      // Fetch user details without password
      const user = await require('../models/User').findById(req.user)
        .select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ 
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar
        } 
      });
    } catch (error) {
      res.status(500).json({ 
        message: 'Server error during token validation', 
        error: error.message 
      });
    }
  }
);

// @route   POST /api/auth/forgot-password
// @desc    Initiate password reset
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Find user by email
    const user = await require('../models/User').findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    // Generate password reset token
    const resetToken = require('crypto').randomBytes(20).toString('hex');
    
    // Save reset token and expiration to user document
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    
    await user.save();

    // TODO: Send email with reset link
    // This would typically involve using a service like SendGrid, Nodemailer, etc.
    res.json({ message: 'Password reset link sent' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error initiating password reset', 
      error: error.message 
    });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    // Find user with valid reset token
    const user = await require('../models/User').findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    // Hash new password
    const salt = await require('bcryptjs').genSalt(10);
    const hashedPassword = await require('bcryptjs').hash(newPassword, salt);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error resetting password', 
      error: error.message 
    });
  }
});

module.exports = router;