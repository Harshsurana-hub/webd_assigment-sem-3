const MenuItem = require("../models/MenuItem");

exports.getAllMenuItems = async (req, res) => {
  try {
    const dishList = await MenuItem.find();
    res.json(dishList);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categoryList = await MenuItem.distinct("category");
    res.json(categoryList);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getMenuItemById = async (req, res) => {
  try {
    const dishDoc = await MenuItem.findById(req.params.id);
    if (!dishDoc) return res.status(404).json({ message: "Item not found" });
    res.json(dishDoc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.createMenuItem = async (req, res) => {
  try {
    const dishDoc = await MenuItem.create(req.body);
    res.json(dishDoc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const dishDoc = await MenuItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(dishDoc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.toggleAvailability = async (req, res) => {
  try {
    const dishDoc = await MenuItem.findById(req.params.id);
    dishDoc.isAvailable = !dishDoc.isAvailable;
    await dishDoc.save();
    res.json(dishDoc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Menu item deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
