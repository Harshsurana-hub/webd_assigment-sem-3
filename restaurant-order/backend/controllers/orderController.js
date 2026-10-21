const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

exports.placeOrder = async (req, res) => {
  try {
    const { tableNumber, items } = req.body;

    let subtotal = 0;
    let itemList = [];

    for (let orderEntry of items) {
      let menuDoc = null;
      if (orderEntry.menuItem) {
        menuDoc = await MenuItem.findById(orderEntry.menuItem).catch(() => null);
      }
      if (!menuDoc && orderEntry.name) {
        menuDoc = await MenuItem.findOne({ name: orderEntry.name });
      }

      if (!menuDoc || !menuDoc.isAvailable) {
        return res.status(400).json({
          message: `${menuDoc ? menuDoc.name : (orderEntry.name || "Item")} is unavailable and cannot be ordered`
        });
      }

      subtotal += menuDoc.price * orderEntry.quantity;
      itemList.push({
        menuItem: menuDoc._id,
        name: menuDoc.name,
        quantity: orderEntry.quantity,
        price: menuDoc.price
      });
    }

    const taxAmount = Math.round(subtotal * 0.05);
    const totalWithTax = subtotal + taxAmount;

    const createdOrder = await Order.create({
      customer: req.user.userId,
      customerName: req.user.name,
      tableNumber,
      items: itemList,
      subtotal,
      gst: taxAmount,
      grandTotal: totalWithTax,
      status: "Placed"
    });

    res.json(createdOrder);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const userOrders = await Order.find({ customer: req.user.userId }).sort({ createdAt: -1 });
    res.json(userOrders);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const orderDoc = await Order.findById(req.params.id);
    if (!orderDoc) return res.status(404).json({ message: "Order not found" });
    res.json(orderDoc);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const targetOrder = await Order.findById(req.params.id);
    if (!targetOrder) return res.status(404).json({ message: "Order not found" });

    if (targetOrder.status !== "Placed") {
      return res.status(400).json({ message: "Cannot cancel order once it is preparing or served" });
    }

    targetOrder.status = "Cancelled";
    await targetOrder.save();
    res.json({ message: "Order cancelled", order: targetOrder });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orderRecords = await Order.find().sort({ createdAt: -1 });
    res.json(orderRecords);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(updatedOrder);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
