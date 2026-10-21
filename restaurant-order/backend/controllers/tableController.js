const Table = require("../models/Table");

exports.getAllTables = async (req, res) => {
  try {
    const allTables = await Table.find().sort({ tableNumber: 1 });
    res.json(allTables);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getTableById = async (req, res) => {
  try {
    const foundTable = await Table.findById(req.params.id);
    res.json(foundTable);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.createTable = async (req, res) => {
  try {
    const newTable = await Table.create(req.body);
    res.json(newTable);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.updateTable = async (req, res) => {
  try {
    const updatedTable = await Table.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTable);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.deleteTable = async (req, res) => {
  try {
    await Table.findByIdAndDelete(req.params.id);
    res.json({ message: "Table deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
