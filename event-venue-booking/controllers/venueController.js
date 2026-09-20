const Venue = require('../models/Venue');
const Booking = require('../models/Booking');
const VenueBlock = require('../models/VenueBlock');

// Helper: convert HH:MM to minutes from midnight
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Helper: check if two time ranges overlap
function timesOverlap(start1, end1, start2, end2) {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return s1 < e2 && s2 < e1;
}

// GET /venues — Organiser venue search
exports.listVenues = async (req, res) => {
  try {
    const { name, capacity, facility, date, startTime, endTime, maxRate } = req.query;

    // Build base query
    const query = { status: 'active' };

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    if (capacity) {
      query.capacity = { $gte: parseInt(capacity) || 0 };
    }
    if (facility) {
      query.facilities = { $in: [facility] };
    }
    if (maxRate) {
      query.hourlyRate = { $lte: parseFloat(maxRate) || Infinity };
    }

    let venues = await Venue.find(query).sort({ name: 1 }).lean();

    // If date and time filters are provided, filter out unavailable venues
    if (date && startTime && endTime) {
      const filterDate = new Date(date);
      const filterDateStr = filterDate.toISOString().split('T')[0];

      // Get all bookings for this date (active ones)
      const bookings = await Booking.find({
        eventDate: {
          $gte: new Date(filterDateStr + 'T00:00:00.000Z'),
          $lt: new Date(filterDateStr + 'T23:59:59.999Z')
        },
        status: { $in: ['pending', 'approved'] }
      }).lean();

      // Get all blocks that overlap with this date/time
      const blockStart = new Date(filterDateStr + 'T' + startTime + ':00.000Z');
      const blockEnd = new Date(filterDateStr + 'T' + endTime + ':00.000Z');

      const blocks = await VenueBlock.find({
        startDateTime: { $lt: blockEnd },
        endDateTime: { $gt: blockStart }
      }).lean();

      const blockedVenueIds = new Set(blocks.map(b => b.venue.toString()));

      venues = venues.filter(venue => {
        const venueId = venue._id.toString();

        // Check if venue is blocked
        if (blockedVenueIds.has(venueId)) return false;

        // Check if venue has overlapping bookings
        const venueBookings = bookings.filter(b => b.venue.toString() === venueId);
        for (const booking of venueBookings) {
          if (timesOverlap(startTime, endTime, booking.startTime, booking.endTime)) {
            return false;
          }
        }

        return true;
      });
    }

    // Get all unique facilities for filter dropdown
    const allFacilities = await Venue.distinct('facilities');

    res.render('organiser/venues', {
      title: 'Browse Venues',
      venues,
      filters: { name, capacity, facility, date, startTime, endTime, maxRate },
      allFacilities,
      layout: 'layouts/main'
    });
  } catch (err) {
    console.error('List venues error:', err);
    req.session.error = 'Failed to load venues.';
    res.redirect('/');
  }
};

// GET /venues/:id — Venue details
exports.getVenueDetails = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id).lean();
    if (!venue) {
      req.session.error = 'Venue not found.';
      return res.redirect('/venues');
    }

    // Get upcoming bookings for this venue (to show availability)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookings = await Booking.find({
      venue: venue._id,
      eventDate: { $gte: today },
      status: { $in: ['pending', 'approved'] }
    }).sort({ eventDate: 1, startTime: 1 }).lean();

    // Get upcoming blocks
    const blocks = await VenueBlock.find({
      venue: venue._id,
      endDateTime: { $gte: today }
    }).sort({ startDateTime: 1 }).lean();

    res.render('organiser/venue-details', {
      title: venue.name,
      venue,
      bookings,
      blocks,
      layout: 'layouts/main'
    });
  } catch (err) {
    console.error('Venue details error:', err);
    req.session.error = 'Failed to load venue details.';
    res.redirect('/venues');
  }
};
