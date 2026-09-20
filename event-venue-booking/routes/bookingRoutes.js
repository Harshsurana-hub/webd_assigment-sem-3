const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { requireAuth } = require('../middleware/auth');
const { requireOrganiser } = require('../middleware/role');

router.get('/new/:venueId', requireAuth, requireOrganiser, bookingController.getBookingForm);
router.post('/', requireAuth, requireOrganiser, bookingController.createBooking);
router.post('/:id/cancel', requireAuth, requireOrganiser, bookingController.cancelBooking);
router.get('/alternatives/:venueId', requireAuth, requireOrganiser, bookingController.getAlternatives);

module.exports = router;
