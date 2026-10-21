import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function AdminDashboard({ token }) {
  const [dashboardMetrics, setDashboardMetrics] = useState(null);
  const [isMetricsLoading, setIsMetricsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setDashboardMetrics(data);
        setIsMetricsLoading(false);
      })
      .catch(() => setIsMetricsLoading(false));
  }, [token]);

  if (isMetricsLoading) return <h2>Loading Dashboard...</h2>;
  if (!dashboardMetrics) return <h2>No data available</h2>;

  return (
    <div>
      <div className="page-head">
        <h1>BabaKaDhaba Dashboard</h1>
        <div className="actions">
          <Link to="/admin/orders" className="btn btn-outline">Manage Orders</Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Today's Orders</div>
          <div className="value">{dashboardMetrics.todayOrdersCount}</div>
        </div>
        <div className="stat-card">
          <div className="label">Today's Revenue</div>
          <div className="value" style={{ color: "var(--success)" }}>₹{dashboardMetrics.todayRevenue}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Orders</div>
          <div className="value">{dashboardMetrics.totalOrdersAllTime}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Revenue</div>
          <div className="value">₹{dashboardMetrics.totalRevenueAllTime}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginTop: "20px" }}>
        <div className="card" style={{ padding: "16px" }}>
          <h2>Top 5 Selling Items</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Dish</th>
                <th>Qty Sold</th>
                <th>Sales</th>
              </tr>
            </thead>
            <tbody>
              {dashboardMetrics.topSellingItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.totalQuantity}</td>
                  <td>₹{item.totalSales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ padding: "16px" }}>
          <h2>Category Sales</h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {dashboardMetrics.categoryWiseSales.map((cat, index) => (
                <tr key={index}>
                  <td>{cat.category}</td>
                  <td>₹{cat.totalRevenue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
