const User = require('../models/User');

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user)
      .select('-password')
      .populate('contributions');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching profile', 
      error: error.message 
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { name, bio, location, interests } = req.body;

    // Validate interests input
    const sanitizedInterests = interests.map(interest => ({
      id: interest.id || generateUniqueId(), // Generate ID if not provided
      name: interest.name.trim()
    })).filter(interest => interest.name); // Remove empty interests

    const updatedUser = await User.findByIdAndUpdate(
      req.user, 
      { 
        name, 
        bio, 
        location, 
        interests: sanitizedInterests 
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error updating profile', 
      error: error.message 
    });
  }
};


function generateUniqueId() {
  return Math.random().toString(36).substring(2, 9);
}