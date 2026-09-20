const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
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

// Helper: format currency to Indian Rupees
function formatCurrency(amount) {
  return '₹' + amount.toLocaleString('en-IN');
}

// GET /bookings/new/:venueId — Booking form
exports.getBookingForm = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.venueId).lean();
    if (!venue) {
      req.session.error = 'Venue not found.';
      return res.redirect('/venues');
    }
    if (venue.status !== 'active') {
      req.session.error = 'This venue is currently inactive.';
      return res.redirect('/venues');
    }

    res.render('organiser/booking-form', {
      title: `Book ${venue.name}`,
      venue,
      layout: 'layouts/main'
    });
  } catch (err) {
    console.error('Booking form error:', err);
    req.session.error = 'Failed to load booking form.';
    res.redirect('/venues');
  }
};

// POST /bookings — Create booking
exports.createBooking = async (req, res) => {
  try {
    const { venueId, eventName, eventDescription, attendees, eventDate, startTime, endTime } = req.body;

    // Validate required fields
    if (!venueId || !eventName || !attendees || !eventDate || !startTime || !endTime) {
      req.session.error = 'All required fields must be filled.';
      return res.redirect(`/bookings/new/${venueId}`);
    }

    // Get venue
    const venue = await Venue.findById(venueId);
    if (!venue) {
      req.session.error = 'Venue not found.';
      return res.redirect('/venues');
    }

    // Check venue status
    if (venue.status !== 'active') {
      req.session.error = 'This venue is currently inactive and cannot be booked.';
      return res.redirect('/venues');
    }

    // Validate time range
    if (startTime >= endTime) {
      req.session.error = 'End time must be after start time.';
      return res.redirect(`/bookings/new/${venueId}`);
    }

    // Validate date is not in the past
    const bookingDate = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (bookingDate < today) {
      req.session.error = 'Cannot book a venue for a past date.';
      return res.redirect(`/bookings/new/${venueId}`);
    }

    // Validate capacity
    const attendeeCount = parseInt(attendees);
    if (attendeeCount > venue.capacity) {
      req.session.error = `Attendee count (${attendeeCount}) exceeds venue capacity (${venue.capacity}).`;
      return res.redirect(`/bookings/new/${venueId}`);
    }

    // Check for venue blocks
    const dateStr = bookingDate.toISOString().split('T')[0];
    const blockCheckStart = new Date(dateStr + 'T' + startTime + ':00.000Z');
    const blockCheckEnd = new Date(dateStr + 'T' + endTime + ':00.000Z');

    const conflictingBlocks = await VenueBlock.find({
      venue: venueId,
      startDateTime: { $lt: blockCheckEnd },
      endDateTime: { $gt: blockCheckStart }
    });

    if (conflictingBlocks.length > 0) {
      req.session.error = 'This venue is unavailable due to maintenance/blocking during the selected time.';
      // Find alternatives
      return res.redirect(`/bookings/new/${venueId}?error=blocked&date=${eventDate}&startTime=${startTime}&endTime=${endTime}`);
    }

    // *** CRITICAL: Check for overlapping bookings ***
    const existingBookings = await Booking.find({
      venue: venueId,
      eventDate: {
        $gte: new Date(dateStr + 'T00:00:00.000Z'),
        $lt: new Date(dateStr + 'T23:59:59.999Z')
      },
      status: { $in: ['pending', 'approved'] }
    });

    for (const existing of existingBookings) {
      if (timesOverlap(startTime, endTime, existing.startTime, existing.endTime)) {
        req.session.error = 'This venue is already booked for the selected time slot.';
        return res.redirect(`/bookings/new/${venueId}?error=overlap&date=${eventDate}&startTime=${startTime}&endTime=${endTime}`);
      }
    }

    // Calculate total amount
    const durationHours = (timeToMinutes(endTime) - timeToMinutes(startTime)) / 60;
    const totalAmount = Math.round(durationHours * venue.hourlyRate * 100) / 100;

    // Create booking
    const booking = new Booking({
      venue: venueId,
      organiser: req.session.userId,
      eventName: eventName.trim(),
      eventDescription: eventDescription ? eventDescription.trim() : '',
      eventDate: bookingDate,
      startTime,
      endTime,
      attendees: attendeeCount,
      totalAmount,
      status: 'pending'
    });

    await booking.save();

    req.session.success = `Booking request submitted successfully! Total: ${formatCurrency(totalAmount)}`;
    return res.redirect('/my-bookings');
  } catch (err) {
    console.error('Create booking error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      req.session.error = messages.join(' ');
    } else {
      req.session.error = 'Failed to create booking. Please try again.';
    }
    return res.redirect(`/bookings/new/${req.body.venueId || ''}`);
  }
};

// GET /my-bookings — Organiser booking history
exports.myBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { organiser: req.session.userId };

    if (status && ['pending', 'approved', 'rejected', 'cancelled', 'completed'].includes(status)) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('venue', 'name location imageUrl')
      .sort({ createdAt: -1 })
      .lean();

    res.render('organiser/bookings', {
      title: 'My Bookings',
      bookings,
      currentFilter: status || 'all',
      layout: 'layouts/main'
    });
  } catch (err) {
    console.error('My bookings error:', err);
    req.session.error = 'Failed to load bookings.';
    res.redirect('/venues');
  }
};

// POST /bookings/:id/cancel — Organiser cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      req.session.error = 'Booking not found.';
      return res.redirect('/my-bookings');
    }

    // Verify ownership
    if (booking.organiser.toString() !== req.session.userId.toString()) {
      req.session.error = 'Access denied.';
      return res.redirect('/my-bookings');
    }

    // Can only cancel pending or approved bookings
    if (!['pending', 'approved'].includes(booking.status)) {
      req.session.error = 'This booking cannot be cancelled.';
      return res.redirect('/my-bookings');
    }

    booking.status = 'cancelled';
    await booking.save();

    req.session.success = 'Booking cancelled successfully.';
    return res.redirect('/my-bookings');
  } catch (err) {
    console.error('Cancel booking error:', err);
    req.session.error = 'Failed to cancel booking.';
    res.redirect('/my-bookings');
  }
};

// GET /bookings/alternatives/:venueId — Alternative venue suggestions
exports.getAlternatives = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.query;
    const venueId = req.params.venueId;

    const venue = await Venue.findById(venueId).lean();
    if (!venue) {
      req.session.error = 'Venue not found.';
      return res.redirect('/venues');
    }

    if (!date || !startTime || !endTime) {
      return res.redirect(`/venues/${venueId}`);
    }

    const dateStr = new Date(date).toISOString().split('T')[0];

    // Find alternative venues available at same time
    const allVenues = await Venue.find({ status: 'active', _id: { $ne: venueId } }).lean();

    const bookingsOnDate = await Booking.find({
      eventDate: {
        $gte: new Date(dateStr + 'T00:00:00.000Z'),
        $lt: new Date(dateStr + 'T23:59:59.999Z')
      },
      status: { $in: ['pending', 'approved'] }
    }).lean();

    const blockCheckStart = new Date(dateStr + 'T' + startTime + ':00.000Z');
    const blockCheckEnd = new Date(dateStr + 'T' + endTime + ':00.000Z');

    const blocksOnDate = await VenueBlock.find({
      startDateTime: { $lt: blockCheckEnd },
      endDateTime: { $gt: blockCheckStart }
    }).lean();

    const blockedVenueIds = new Set(blocksOnDate.map(b => b.venue.toString()));

    const alternativeVenues = allVenues.filter(v => {
      if (blockedVenueIds.has(v._id.toString())) return false;

      const venueBookings = bookingsOnDate.filter(b => b.venue.toString() === v._id.toString());
      for (const b of venueBookings) {
        if (timesOverlap(startTime, endTime, b.startTime, b.endTime)) {
          return false;
        }
      }
      return true;
    }).map(v => {
      const durationHours = (timeToMinutes(endTime) - timeToMinutes(startTime)) / 60;
      return {
        ...v,
        estimatedTotal: Math.round(durationHours * v.hourlyRate * 100) / 100
      };
    });

    // Find alternative time slots for the requested venue
    const venueBookings = bookingsOnDate
      .filter(b => b.venue.toString() === venueId)
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    const venueBlocks = blocksOnDate.filter(b => b.venue.toString() === venueId);

    // Compute busy slots (bookings + blocks combined)
    const busySlots = [];
    for (const b of venueBookings) {
      busySlots.push({ start: b.startTime, end: b.endTime });
    }
    for (const bl of venueBlocks) {
      const blDate = new Date(bl.startDateTime);
      const blEndDate = new Date(bl.endDateTime);
      const blStart = String(blDate.getUTCHours()).padStart(2, '0') + ':' + String(blDate.getUTCMinutes()).padStart(2, '0');
      const blEnd = String(blEndDate.getUTCHours()).padStart(2, '0') + ':' + String(blEndDate.getUTCMinutes()).padStart(2, '0');
      busySlots.push({ start: blStart, end: blEnd });
    }
    busySlots.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

    const requestedDuration = timeToMinutes(endTime) - timeToMinutes(startTime);
    const alternativeSlots = [];
    const dayStart = 8 * 60; // 08:00
    const dayEnd = 22 * 60;  // 22:00

    // Find free gaps
    let cursor = dayStart;
    for (const slot of busySlots) {
      const slotStart = timeToMinutes(slot.start);
      const slotEnd = timeToMinutes(slot.end);
      if (cursor < slotStart) {
        const gap = slotStart - cursor;
        if (gap >= requestedDuration) {
          const altStart = cursor;
          const altEnd = cursor + requestedDuration;
          if (altEnd <= dayEnd) {
            alternativeSlots.push({
              startTime: `${String(Math.floor(altStart / 60)).padStart(2, '0')}:${String(altStart % 60).padStart(2, '0')}`,
              endTime: `${String(Math.floor(altEnd / 60)).padStart(2, '0')}:${String(altEnd % 60).padStart(2, '0')}`
            });
          }
        }
      }
      if (slotEnd > cursor) cursor = slotEnd;
    }
    // Check gap after last busy slot
    if (cursor + requestedDuration <= dayEnd) {
      alternativeSlots.push({
        startTime: `${String(Math.floor(cursor / 60)).padStart(2, '0')}:${String(cursor % 60).padStart(2, '0')}`,
        endTime: `${String(Math.floor((cursor + requestedDuration) / 60)).padStart(2, '0')}:${String((cursor + requestedDuration) % 60).padStart(2, '0')}`
      });
    }

    res.render('organiser/booking-form', {
      title: `Book ${venue.name}`,
      venue,
      showAlternatives: true,
      alternativeVenues,
      alternativeSlots,
      requestedDate: date,
      requestedStartTime: startTime,
      requestedEndTime: endTime,
      layout: 'layouts/main'
    });
  } catch (err) {
    console.error('Alternatives error:', err);
    req.session.error = 'Failed to load alternatives.';
    res.redirect('/venues');
  }
};

// GET /organiser/dashboard
exports.organiserDashboard = async (req, res) => {
  try {
    const userId = req.session.userId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [totalBookings, pendingBookings, approvedBookings, upcomingEvents, todaysEvents] = await Promise.all([
      Booking.countDocuments({ organiser: userId }),
      Booking.countDocuments({ organiser: userId, status: 'pending' }),
      Booking.countDocuments({ organiser: userId, status: 'approved' }),
      Booking.find({
        organiser: userId,
        status: 'approved',
        eventDate: { $gte: today }
      }).populate('venue', 'name location').sort({ eventDate: 1, startTime: 1 }).limit(5).lean(),
      Booking.find({
        organiser: userId,
        status: 'approved',
        eventDate: { $gte: today, $lt: tomorrow }
      }).populate('venue', 'name location').sort({ startTime: 1 }).lean()
    ]);

    res.render('organiser/dashboard', {
      title: 'Dashboard',
      totalBookings,
      pendingBookings,
      approvedBookings,
      upcomingEvents,
      todaysEvents,
      layout: 'layouts/main'
    });
  } catch (err) {
    console.error('Organiser dashboard error:', err);
    req.session.error = 'Failed to load dashboard.';
    res.redirect('/venues');
  }
};
