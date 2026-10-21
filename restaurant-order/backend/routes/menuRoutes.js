const express = require("express");
const router = express.Router();
const menuController = require("../controllers/menuController");
const { auth, authorizeRoles } = require("../middleware/auth");

router.get("/", menuController.getAllMenuItems);
router.get("/categories", menuController.getCategories);
router.get("/:id", menuController.getMenuItemById);

router.post("/", auth, authorizeRoles("admin"), menuController.createMenuItem);
router.put("/:id", auth, authorizeRoles("admin"), menuController.updateMenuItem);
router.patch("/:id/toggle", auth, authorizeRoles("admin"), menuController.toggleAvailability);
router.delete("/:id", auth, authorizeRoles("admin"), menuController.deleteMenuItem);

module.exports = router;
