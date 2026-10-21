import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Menu from "./pages/Menu";
import MenuItemDetail from "./pages/MenuItemDetail";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import OrderDetail from "./pages/OrderDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminMenuNew from "./pages/AdminMenuNew";
import AdminMenuEdit from "./pages/AdminMenuEdit";
import AdminTables from "./pages/AdminTables";
import AdminOrders from "./pages/AdminOrders";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("cart") || "[]"));
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user") || "null"));

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  function login(newToken, newUser) {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
  }

  function logout() {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  function addToCart(dishItem) {
    if (!dishItem.isAvailable) {
      alert("This item is currently out of stock");
      return;
    }
    const foundDish = cart.find((dish) => dish.menuItem === dishItem._id);
    if (foundDish) {
      setCart(cart.map((dish) => (dish.menuItem === dishItem._id ? { ...dish, quantity: dish.quantity + 1 } : dish)));
    } else {
      setCart([...cart, { menuItem: dishItem._id, name: dishItem.name, price: dishItem.price, category: dishItem.category, quantity: 1 }]);
    }
  }

  function updateQuantity(menuItemId, newQty) {
    if (newQty <= 0) {
      setCart(cart.filter((dish) => dish.menuItem !== menuItemId));
    } else {
      setCart(cart.map((dish) => (dish.menuItem === menuItemId ? { ...dish, quantity: newQty } : dish)));
    }
  }

  function removeFromCart(menuItemId) {
    setCart(cart.filter((dish) => dish.menuItem !== menuItemId));
  }

  function clearCart() {
    setCart([]);
  }

  const totalCartCount = cart.reduce((acc, dish) => acc + dish.quantity, 0);

  return (
    <>
      <Navbar user={user} onLogout={logout} cartCount={totalCartCount} />

      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/menu" />} />
          <Route path="/menu" element={<Menu user={user} token={token} cart={cart} onAddToCart={addToCart} />} />
          <Route path="/menu/:id" element={<MenuItemDetail onAddToCart={addToCart} />} />
          <Route path="/cart" element={<Cart cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} clearCart={clearCart} user={user} token={token} />} />
          <Route path="/my-orders" element={<MyOrders token={token} />} />
          <Route path="/orders/:id" element={<OrderDetail token={token} user={user} />} />
          <Route path="/login" element={<Login onLogin={login} />} />
          <Route path="/register" element={<Register onLogin={login} />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute user={user} role="admin"><AdminDashboard token={token} /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute user={user} role="admin"><AdminOrders token={token} /></ProtectedRoute>} />
          <Route path="/admin/tables" element={<ProtectedRoute user={user} role="admin"><AdminTables token={token} /></ProtectedRoute>} />
          <Route path="/admin/menu/new" element={<ProtectedRoute user={user} role="admin"><AdminMenuNew token={token} /></ProtectedRoute>} />
          <Route path="/admin/menu/:id/edit" element={<ProtectedRoute user={user} role="admin"><AdminMenuEdit token={token} /></ProtectedRoute>} />
          <Route path="*" element={<h2>Page Not Found</h2>} />
        </Routes>
      </main>
    </>
  );
}

export default App;
