const express = require("express");
const router = express.Router();
const tableController = require("../controllers/tableController");
const { auth, authorizeRoles } = require("../middleware/auth");

router.get("/", tableController.getAllTables);
router.get("/:id", tableController.getTableById);

router.post("/", auth, authorizeRoles("admin"), tableController.createTable);
router.put("/:id", auth, authorizeRoles("admin"), tableController.updateTable);
router.delete("/:id", auth, authorizeRoles("admin"), tableController.deleteTable);

module.exports = router;
