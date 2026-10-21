import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Cart({ cart, updateQuantity, removeFromCart, clearCart, user, token }) {
  const [tableOptions, setTableOptions] = useState([]);
  const [activeTableNum, setActiveTableNum] = useState("1");
  const [orderError, setOrderError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/tables")
      .then((res) => res.json())
      .then((data) => {
        setTableOptions(data);
        if (data.length > 0) setActiveTableNum(data[0].tableNumber);
      })
      .catch(() => {});
  }, []);

  const itemsSubtotal = cart.reduce((sum, dish) => sum + dish.price * dish.quantity, 0);
  const gstAmount = Math.round(itemsSubtotal * 0.05);
  const billGrandTotal = itemsSubtotal + gstAmount;

  function handlePlaceOrder() {
    if (!user) {
      navigate("/login");
      return;
    }
    if (cart.length === 0) return;

    setOrderError("");
    fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        tableNumber: Number(activeTableNum),
        items: cart.map((dish) => ({ menuItem: dish.menuItem, name: dish.name, quantity: dish.quantity }))
      })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to place order");
        return data;
      })
      .then((placedOrder) => {
        clearCart();
        navigate(`/orders/${placedOrder._id}`);
      })
      .catch((err) => setOrderError(err.message));
  }

  if (cart.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2>Your Cart is Empty</h2>
        <p>Add some food from our menu!</p>
        <Link to="/menu" className="btn">Go to Menu</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div className="page-head">
        <h1>Your Table Order</h1>
        <button type="button" className="btn btn-small btn-danger" onClick={clearCart}>
          Clear Cart
        </button>
      </div>

      {orderError && <p className="alert">{orderError}</p>}

      <table className="data-table" style={{ marginBottom: "20px" }}>
        <thead>
          <tr>
            <th>Dish</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((item) => (
            <tr key={item.menuItem}>
              <td>{item.name}</td>
              <td>₹{item.price}</td>
              <td>
                <button type="button" onClick={() => updateQuantity(item.menuItem, item.quantity - 1)}>-</button>
                <span style={{ margin: "0 8px" }}>{item.quantity}</span>
                <button type="button" onClick={() => updateQuantity(item.menuItem, item.quantity + 1)}>+</button>
              </td>
              <td>₹{item.price * item.quantity}</td>
              <td>
                <button type="button" className="btn btn-small btn-danger" onClick={() => removeFromCart(item.menuItem)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="card" style={{ padding: "20px" }}>
        <label>
          <strong>Select Dining Table:</strong>
          <select
            value={activeTableNum}
            onChange={(e) => setActiveTableNum(e.target.value)}
            style={{ width: "100%", margin: "8px 0 16px", padding: "8px" }}
          >
            {tableOptions.map((t) => (
              <option key={t._id} value={t.tableNumber}>
                Table #{t.tableNumber} (Capacity: {t.capacity})
              </option>
            ))}
          </select>
        </label>

        <p style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Subtotal:</span>
          <span>₹{itemsSubtotal}</span>
        </p>
        <p style={{ display: "flex", justifyContent: "space-between" }}>
          <span>GST (5%):</span>
          <span>₹{gstAmount}</span>
        </p>
        <h3 style={{ display: "flex", justifyContent: "space-between", margin: "10px 0" }}>
          <span>Grand Total:</span>
          <span>₹{billGrandTotal}</span>
        </h3>

        <button type="button" className="btn" style={{ width: "100%", marginTop: "12px" }} onClick={handlePlaceOrder}>
          {user ? "Place Order Now" : "Login to Place Order"}
        </button>
      </div>
    </div>
  );
}

export default Cart;
