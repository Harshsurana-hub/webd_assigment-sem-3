const mongoose = require('mongoose');

const venueBlockSchema = new mongoose.Schema({
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: [true, 'Venue is required']
  },
  startDateTime: {
    type: Date,
    required: [true, 'Start date/time is required']
  },
  endDateTime: {
    type: Date,
    required: [true, 'End date/time is required']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [500, 'Reason must be at most 500 characters']
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Validate end > start
venueBlockSchema.pre('validate', function(next) {
  if (this.endDateTime <= this.startDateTime) {
    this.invalidate('endDateTime', 'End date/time must be after start date/time');
  }
  next();
});

module.exports = mongoose.model('VenueBlock', venueBlockSchema);
