const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

exports.getStats = async (req, res) => {
  try {
    const allValidOrders = await Order.find({ status: { $ne: "Cancelled" } });

    const currentDateStr = new Date().toDateString();
    const todaysOrders = allValidOrders.filter(ord => new Date(ord.createdAt).toDateString() === currentDateStr);
    const todaysRevenue = todaysOrders.reduce((acc, ord) => acc + ord.grandTotal, 0);

    const dishSalesMap = {};
    allValidOrders.forEach(ord => {
      ord.items.forEach(dish => {
        if (!dishSalesMap[dish.name]) {
          dishSalesMap[dish.name] = { name: dish.name, totalQuantity: 0, totalSales: 0 };
        }
        dishSalesMap[dish.name].totalQuantity += dish.quantity;
        dishSalesMap[dish.name].totalSales += dish.price * dish.quantity;
      });
    });

    const topDishes = Object.values(dishSalesMap)
      .sort((x, y) => y.totalQuantity - x.totalQuantity)
      .slice(0, 5);

    const allMenuItems = await MenuItem.find();
    const dishCategoryLookup = {};
    allMenuItems.forEach(item => { dishCategoryLookup[item.name] = item.category; });

    const catRevenueMap = {};
    allValidOrders.forEach(ord => {
      ord.items.forEach(dish => {
        const catName = dishCategoryLookup[dish.name] || "Other";
        catRevenueMap[catName] = (catRevenueMap[catName] || 0) + (dish.price * dish.quantity);
      });
    });

    const categoryRevenueList = Object.keys(catRevenueMap).map(category => ({
      category,
      totalRevenue: catRevenueMap[category]
    }));

    res.json({
      todayOrdersCount: todaysOrders.length,
      todayRevenue: todaysRevenue,
      totalOrdersAllTime: allValidOrders.length,
      totalRevenueAllTime: allValidOrders.reduce((acc, ord) => acc + ord.grandTotal, 0),
      topSellingItems: topDishes,
      categoryWiseSales: categoryRevenueList
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
