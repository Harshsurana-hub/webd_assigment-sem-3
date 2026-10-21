import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function MyOrders({ token }) {
  const [orderList, setOrderList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  function fetchMyOrders() {
    if (!token) {
      setIsLoading(false);
      return;
    }
    fetch("/api/orders/my-orders", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        setOrderList(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }

  useEffect(() => {
    fetchMyOrders();
  }, [token]);

  function handleCancelOrder(orderId) {
    if (!window.confirm("Cancel this order?")) return;
    fetch(`/api/orders/${orderId}/cancel`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message || "Order cancelled");
        fetchMyOrders();
      });
  }

  if (!token) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2>Please Login</h2>
        <p>You need to login to view your orders.</p>
        <Link to="/login" className="btn">Login</Link>
      </div>
    );
  }

  if (isLoading) return <h2>Loading orders...</h2>;

  return (
    <div>
      <div className="page-head">
        <h1>My Orders</h1>
        <Link to="/menu" className="btn btn-outline">+ Order Food</Link>
      </div>

      {orderList.length === 0 ? (
        <p>No orders placed yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {orderList.map((order) => (
            <div key={order._id} className="card" style={{ padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>Table #{order.tableNumber}</h3>
                <span className={`badge badge-status status-${order.status}`}>{order.status}</span>
              </div>

              <ul>
                {order.items.map((item, i) => (
                  <li key={i}>{item.name} x {item.quantity} - ₹{item.price * item.quantity}</li>
                ))}
              </ul>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong>Total: ₹{order.grandTotal}</strong>
                <div className="actions">
                  <Link to={`/orders/${order._id}`} className="btn btn-small btn-outline">View Bill</Link>
                  {order.status === "Placed" && (
                    <button type="button" className="btn btn-small btn-danger" onClick={() => handleCancelOrder(order._id)}>
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyOrders;
