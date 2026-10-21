const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { auth, authorizeRoles } = require("../middleware/auth");

router.post("/", auth, orderController.placeOrder);
router.get("/my-orders", auth, orderController.getMyOrders);
router.patch("/:id/cancel", auth, orderController.cancelOrder);

router.get("/all", auth, authorizeRoles("admin"), orderController.getAllOrders);
router.patch("/:id/status", auth, authorizeRoles("admin"), orderController.updateOrderStatus);

router.get("/:id", auth, orderController.getOrderById);

module.exports = router;
