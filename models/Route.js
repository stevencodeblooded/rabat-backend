const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  theme: {
    type: String,
    enum: ['history', 'culture', 'nature', 'gastronomy'],
    required: true
  },
  startLocation: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  points: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true
      },
      coordinates: {
        type: [Number],
        required: true
      }
    }
  }],
  distance: {
    type: Number,
    default: 0
  },
  estimatedTime: {
    type: String
  },
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

RouteSchema.index({ startLocation: '2dsphere' });

module.exports = mongoose.model('Route', RouteSchema);