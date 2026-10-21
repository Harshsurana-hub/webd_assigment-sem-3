const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { auth, authorizeRoles } = require("../middleware/auth");

router.get("/stats", auth, authorizeRoles("admin"), dashboardController.getStats);

module.exports = router;
