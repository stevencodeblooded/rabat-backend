const Contribution = require('../models/Contribution');
const User = require('../models/User');

exports.createContribution = async (req, res) => {
  try {
    const { title, description, category, latitude, longitude } = req.body;

    // Validate input
    if (!title || !description || !category || !latitude || !longitude) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Create new contribution
    const newContribution = new Contribution({
      title,
      description,
      category,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      user: req.user // Ensure user is set by authentication middleware
    });

    // Save contribution
    const contribution = await newContribution.save();

    // Optionally populate user if needed
    await contribution.populate('user', 'name');

    res.status(201).json(contribution);
  } catch (error) {
    console.error('Contribution creation error:', error);
    res.status(500).json({ 
      message: 'Error creating contribution', 
      error: error.message 
    });
  }
};

exports.getContributions = async (req, res) => {
  try {
    const { category, lat, lng, radius } = req.query;

    let filter = {};

    // Filter by category if provided
    if (category) {
      filter.category = category;
    }

    // Geospatial query if location and radius provided
    if (lat && lng && radius) {
      filter.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius)
        }
      };
    }

    const contributions = await Contribution.find(filter)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(contributions);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching contributions', 
      error: error.message 
    });
  }
};

exports.getUserContributions = async (req, res) => {
  try {
    // Filter contributions specifically for the logged-in user
    const contributions = await Contribution.find({ user: req.user })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    res.json(contributions);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching user contributions', 
      error: error.message 
    });
  }
};