const Venue = require('../models/Venue');
const Booking = require('../models/Booking');
const VenueBlock = require('../models/VenueBlock');
const User = require('../models/User');

// ========================
// ADMIN DASHBOARD
// ========================

exports.getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [
      totalVenues,
      activeVenues,
      todaysEvents,
      upcomingEventsCount,
      pendingRequests,
      completedEvents,
      cancelledEvents,
      totalRevenueAgg,
      monthlyRevenueAgg,
      revenueByVenueAgg,
      venues
    ] = await Promise.all([
      Venue.countDocuments(),
      Venue.countDocuments({ status: 'active' }),
      Booking.find({
        eventDate: { $gte: today, $lt: tomorrow },
        status: { $in: ['approved', 'completed'] }
      }).populate('venue', 'name').populate('organiser', 'name email').sort({ startTime: 1 }).lean(),
      Booking.countDocuments({
        eventDate: { $gte: tomorrow },
        status: { $in: ['pending', 'approved'] }
      }),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Booking.aggregate([
        { $match: { status: { $in: ['approved', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Booking.aggregate([
        { $match: { status: { $in: ['approved', 'completed'] } } },
        {
          $group: {
            _id: { year: { $year: '$eventDate' }, month: { $month: '$eventDate' } },
            total: { $sum: '$totalAmount' },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': -1, '_id.month': -1 } },
        { $limit: 12 }
      ]),
      Booking.aggregate([
        { $match: { status: { $in: ['approved', 'completed'] } } },
        { $group: { _id: '$venue', total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } }
      ]),
      Venue.find({ status: 'active' }).lean()
    ]);

    // Populate venue names in revenue by venue
    const venueMap = {};
    venues.forEach(v => { venueMap[v._id.toString()] = v.name; });
    const revenueByVenue = revenueByVenueAgg.map(r => ({
      venueName: venueMap[r._id?.toString()] || 'Unknown',
      total: r.total,
      count: r.count
    }));

    // Calculate venue utilisation
    // Available hours: 14 hours/day (08:00 - 22:00), 30 days
    const availableHoursPerMonth = 14 * 30;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const monthlyBookings = await Booking.find({
      eventDate: { $gte: monthStart, $lte: monthEnd },
      status: { $in: ['approved', 'completed'] }
    }).lean();

    const utilisationData = venues.map(venue => {
      const venueBookings = monthlyBookings.filter(b => b.venue.toString() === venue._id.toString());
      let bookedMinutes = 0;
      for (const b of venueBookings) {
        const [sh, sm] = b.startTime.split(':').map(Number);
        const [eh, em] = b.endTime.split(':').map(Number);
        bookedMinutes += (eh * 60 + em) - (sh * 60 + sm);
      }
      const bookedHours = Math.round(bookedMinutes / 60 * 10) / 10;
      const utilisation = Math.round((bookedHours / availableHoursPerMonth) * 100 * 10) / 10;
      return {
        name: venue.name,
        bookedHours,
        availableHours: availableHoursPerMonth,
        utilisation: Math.min(utilisation, 100)
      };
    });

    const totalRevenue = totalRevenueAgg.length > 0 ? totalRevenueAgg[0].total : 0;

    // Monthly names
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = monthlyRevenueAgg.map(m => ({
      month: monthNames[m._id.month - 1] + ' ' + m._id.year,
      total: m.total,
      count: m.count
    }));

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      totalVenues,
      activeVenues,
      todaysEvents,
      upcomingEventsCount,
      pendingRequests,
      completedEvents,
      cancelledEvents,
      totalRevenue,
      monthlyRevenue,
      revenueByVenue,
      utilisationData,
      layout: 'layouts/admin'
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    req.session.error = 'Failed to load dashboard.';
    res.redirect('/');
  }
};

// ========================
// VENUE MANAGEMENT
// ========================

exports.listVenues = async (req, res) => {
  try {
    const venues = await Venue.find().sort({ createdAt: -1 }).lean();
    res.render('admin/venues', {
      title: 'Manage Venues',
      venues,
      layout: 'layouts/admin'
    });
  } catch (err) {
    console.error('Admin list venues error:', err);
    req.session.error = 'Failed to load venues.';
    res.redirect('/admin/dashboard');
  }
};

exports.getNewVenueForm = (req, res) => {
  res.render('admin/venue-form', {
    title: 'Add New Venue',
    venue: null,
    editing: false,
    layout: 'layouts/admin'
  });
};

exports.createVenue = async (req, res) => {
  try {
    const { name, description, capacity, facilities, hourlyRate, location, imageUrl, status } = req.body;

    const facilityArr = facilities
      ? (typeof facilities === 'string' ? facilities.split(',') : facilities).map(f => f.trim()).filter(Boolean)
      : [];

    const venue = new Venue({
      name: name?.trim(),
      description: description?.trim(),
      capacity: parseInt(capacity) || 0,
      facilities: facilityArr,
      hourlyRate: parseFloat(hourlyRate) || 0,
      location: location?.trim(),
      imageUrl: imageUrl?.trim() || '/images/default-venue.jpg',
      status: status || 'active'
    });

    await venue.save();
    req.session.success = 'Venue created successfully!';
    res.redirect('/admin/venues');
  } catch (err) {
    console.error('Create venue error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      req.session.error = messages.join(' ');
    } else {
      req.session.error = 'Failed to create venue.';
    }
    res.redirect('/admin/venues/new');
  }
};

exports.getEditVenueForm = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id).lean();
    if (!venue) {
      req.session.error = 'Venue not found.';
      return res.redirect('/admin/venues');
    }
    res.render('admin/venue-form', {
      title: `Edit ${venue.name}`,
      venue,
      editing: true,
      layout: 'layouts/admin'
    });
  } catch (err) {
    console.error('Edit venue form error:', err);
    req.session.error = 'Failed to load venue.';
    res.redirect('/admin/venues');
  }
};

exports.updateVenue = async (req, res) => {
  try {
    const { name, description, capacity, facilities, hourlyRate, location, imageUrl, status } = req.body;

    const facilityArr = facilities
      ? (typeof facilities === 'string' ? facilities.split(',') : facilities).map(f => f.trim()).filter(Boolean)
      : [];

    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      req.session.error = 'Venue not found.';
      return res.redirect('/admin/venues');
    }

    venue.name = name?.trim() || venue.name;
    venue.description = description?.trim() || venue.description;
    venue.capacity = parseInt(capacity) || venue.capacity;
    venue.facilities = facilityArr;
    venue.hourlyRate = parseFloat(hourlyRate) || venue.hourlyRate;
    venue.location = location?.trim() || venue.location;
    venue.imageUrl = imageUrl?.trim() || venue.imageUrl;
    venue.status = status || venue.status;

    await venue.save();
    req.session.success = 'Venue updated successfully!';
    res.redirect('/admin/venues');
  } catch (err) {
    console.error('Update venue error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      req.session.error = messages.join(' ');
    } else {
      req.session.error = 'Failed to update venue.';
    }
    res.redirect(`/admin/venues/${req.params.id}/edit`);
  }
};

exports.deleteVenue = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      req.session.error = 'Venue not found.';
      return res.redirect('/admin/venues');
    }

    // Check for active bookings
    const activeBookings = await Booking.countDocuments({
      venue: venue._id,
      status: { $in: ['pending', 'approved'] }
    });

    if (activeBookings > 0) {
      // Deactivate instead of delete
      venue.status = 'inactive';
      await venue.save();
      req.session.success = 'Venue deactivated (has active bookings). Active bookings need to be handled.';
    } else {
      await Venue.findByIdAndDelete(req.params.id);
      req.session.success = 'Venue deleted successfully!';
    }

    res.redirect('/admin/venues');
  } catch (err) {
    console.error('Delete venue error:', err);
    req.session.error = 'Failed to delete venue.';
    res.redirect('/admin/venues');
  }
};

// ========================
// BOOKING MANAGEMENT
// ========================

exports.listBookings = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status && ['pending', 'approved', 'rejected', 'cancelled', 'completed'].includes(status)) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('venue', 'name location')
      .populate('organiser', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    res.render('admin/bookings', {
      title: 'Manage Bookings',
      bookings,
      currentFilter: status || 'all',
      layout: 'layouts/admin'
    });
  } catch (err) {
    console.error('Admin list bookings error:', err);
    req.session.error = 'Failed to load bookings.';
    res.redirect('/admin/dashboard');
  }
};

exports.approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      req.session.error = 'Booking not found.';
      return res.redirect('/admin/bookings');
    }
    if (booking.status !== 'pending') {
      req.session.error = 'Only pending bookings can be approved.';
      return res.redirect('/admin/bookings');
    }
    booking.status = 'approved';
    await booking.save();
    req.session.success = 'Booking approved successfully!';
    res.redirect('/admin/bookings');
  } catch (err) {
    console.error('Approve booking error:', err);
    req.session.error = 'Failed to approve booking.';
    res.redirect('/admin/bookings');
  }
};

exports.rejectBooking = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      req.session.error = 'Booking not found.';
      return res.redirect('/admin/bookings');
    }
    if (booking.status !== 'pending') {
      req.session.error = 'Only pending bookings can be rejected.';
      return res.redirect('/admin/bookings');
    }
    if (!rejectionReason || !rejectionReason.trim()) {
      req.session.error = 'A rejection reason is required.';
      return res.redirect('/admin/bookings');
    }
    booking.status = 'rejected';
    booking.rejectionReason = rejectionReason.trim();
    await booking.save();
    req.session.success = 'Booking rejected.';
    res.redirect('/admin/bookings');
  } catch (err) {
    console.error('Reject booking error:', err);
    req.session.error = 'Failed to reject booking.';
    res.redirect('/admin/bookings');
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      req.session.error = 'Booking not found.';
      return res.redirect('/admin/bookings');
    }
    if (!['pending', 'approved'].includes(booking.status)) {
      req.session.error = 'This booking cannot be cancelled.';
      return res.redirect('/admin/bookings');
    }
    booking.status = 'cancelled';
    await booking.save();
    req.session.success = 'Booking cancelled successfully.';
    res.redirect('/admin/bookings');
  } catch (err) {
    console.error('Cancel booking error:', err);
    req.session.error = 'Failed to cancel booking.';
    res.redirect('/admin/bookings');
  }
};

exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      req.session.error = 'Booking not found.';
      return res.redirect('/admin/bookings');
    }
    if (booking.status !== 'approved') {
      req.session.error = 'Only approved bookings can be marked as completed.';
      return res.redirect('/admin/bookings');
    }
    booking.status = 'completed';
    await booking.save();
    req.session.success = 'Event marked as completed!';
    res.redirect('/admin/bookings');
  } catch (err) {
    console.error('Complete booking error:', err);
    req.session.error = 'Failed to complete booking.';
    res.redirect('/admin/bookings');
  }
};

// ========================
// VENUE BLOCKS
// ========================

exports.listBlocks = async (req, res) => {
  try {
    const blocks = await VenueBlock.find()
      .populate('venue', 'name')
      .sort({ startDateTime: -1 })
      .lean();

    const venues = await Venue.find({ status: 'active' }).sort({ name: 1 }).lean();

    res.render('admin/blocks', {
      title: 'Venue Blocks',
      blocks,
      venues,
      layout: 'layouts/admin'
    });
  } catch (err) {
    console.error('List blocks error:', err);
    req.session.error = 'Failed to load blocks.';
    res.redirect('/admin/dashboard');
  }
};

exports.createBlock = async (req, res) => {
  try {
    const { venue, startDateTime, endDateTime, reason } = req.body;

    if (!venue || !startDateTime || !endDateTime || !reason) {
      req.session.error = 'All fields are required.';
      return res.redirect('/admin/blocks');
    }

    const block = new VenueBlock({
      venue,
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      reason: reason.trim()
    });

    await block.save();
    req.session.success = 'Venue block created successfully!';
    res.redirect('/admin/blocks');
  } catch (err) {
    console.error('Create block error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      req.session.error = messages.join(' ');
    } else {
      req.session.error = 'Failed to create venue block.';
    }
    res.redirect('/admin/blocks');
  }
};

exports.deleteBlock = async (req, res) => {
  try {
    await VenueBlock.findByIdAndDelete(req.params.id);
    req.session.success = 'Block removed successfully.';
    res.redirect('/admin/blocks');
  } catch (err) {
    console.error('Delete block error:', err);
    req.session.error = 'Failed to remove block.';
    res.redirect('/admin/blocks');
  }
};
