const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Venue name is required'],
    trim: true,
    maxlength: [200, 'Venue name must be at most 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description must be at most 2000 characters']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: [1, 'Capacity must be at least 1']
  },
  facilities: [{
    type: String,
    trim: true
  }],
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: [0, 'Hourly rate cannot be negative']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  imageUrl: {
    type: String,
    default: '/images/default-venue.jpg'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Venue', venueSchema);
