const express = require('express');
const router = express.Router();
const venueController = require('../controllers/venueController');
const { requireAuth } = require('../middleware/auth');
const { requireOrganiser } = require('../middleware/role');

router.get('/', requireAuth, venueController.listVenues);
router.get('/:id', requireAuth, venueController.getVenueDetails);

module.exports = router;
