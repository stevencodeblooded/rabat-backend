const Route = require('../models/Route');
const turf = require('@turf/turf');

exports.generateRoute = async (req, res) => {
  try {
    const { theme, startLocation } = req.body;

    // Mock points generation logic (you'd replace this with more sophisticated routing)
    const points = generateThematicPoints(theme, startLocation);

    // Calculate total distance
    const routeLinestring = turf.lineString(points.map(p => p.location.coordinates));
    const distance = turf.length(routeLinestring, { units: 'kilometers' });

    const newRoute = new Route({
      user: req.user,
      title: `${theme.charAt(0).toUpperCase() + theme.slice(1)} Route`,
      theme,
      startLocation: {
        type: 'Point',
        coordinates: startLocation
      },
      points,
      distance,
      estimatedTime: calculateEstimatedTime(distance)
    });

    const route = await newRoute.save();

    res.status(201).json(route);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error generating route', 
      error: error.message 
    });
  }
};

// Helper function to generate points based on theme
function generateThematicPoints(theme, startLocation) {
  // This is a mock implementation - in a real app, you'd have a database of points
  const themePoints = {
    history: [
      { 
        name: 'Kasbah of the Udayas', 
        description: 'Historic fortress in Rabat',
        location: {
          type: 'Point',
          coordinates: [-6.8333, 34.0167]
        }
      },
      { 
        name: 'Hassan Tower', 
        description: 'Iconic historical monument',
        location: {
          type: 'Point',
          coordinates: [-6.8294, 34.0209]
        }
      }
    ],
    culture: [
      { 
        name: 'Mohammed VI Museum of Modern and Contemporary Art', 
        description: 'Showcase of Moroccan art',
        location: {
          type: 'Point',
          coordinates: [-6.8333, 34.0233]
        }
      }
    ],
    nature: [
      { 
        name: 'Rabat Botanical Garden', 
        description: 'Lush green space in the city',
        location: {
          type: 'Point',
          coordinates: [-6.8472, 34.0209]
        }
      }
    ],
    gastronomy: [
      { 
        name: 'Medina Market', 
        description: 'Traditional market with local cuisine',
        location: {
          type: 'Point',
          coordinates: [-6.8261, 34.0233]
        }
      }
    ]
  };

  return themePoints[theme].slice(0, 3);
}

// Helper function to estimate route time
function calculateEstimatedTime(distance) {
  // Assume average walking speed of 5 km/h
  const hours = distance / 5;
  const hours_int = Math.floor(hours);
  const minutes = Math.round((hours - hours_int) * 60);
  
  return hours_int > 0 
    ? `${hours_int} hour${hours_int > 1 ? 's' : ''} ${minutes} minutes`
    : `${minutes} minutes`;
}

exports.getSavedRoutes = async (req, res) => {
  try {
    const routes = await Route.find({ 
      $or: [
        { user: req.user },
        { savedBy: req.user }
      ]
    }).sort({ createdAt: -1 });

    res.json(routes);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching routes', 
      error: error.message 
    });
  }
};