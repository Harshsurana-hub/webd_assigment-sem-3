const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue',
    required: [true, 'Venue is required']
  },
  organiser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Organiser is required']
  },
  eventName: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true,
    maxlength: [200, 'Event name must be at most 200 characters']
  },
  eventDescription: {
    type: String,
    trim: true,
    maxlength: [2000, 'Event description must be at most 2000 characters']
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be in HH:MM format']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be in HH:MM format']
  },
  attendees: {
    type: Number,
    required: [true, 'Attendee count is required'],
    min: [1, 'Attendee count must be at least 1']
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason must be at most 500 characters']
  }
}, {
  timestamps: true
});

// Validate end time > start time
bookingSchema.pre('validate', function(next) {
  if (this.startTime && this.endTime && this.startTime >= this.endTime) {
    this.invalidate('endTime', 'End time must be after start time');
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
