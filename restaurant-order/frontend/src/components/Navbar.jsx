import { NavLink, Link, useNavigate } from "react-router-dom";

function Navbar({ user, onLogout, cartCount }) {
  const navigate = useNavigate();

  function logoutUser() {
    onLogout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <Link to="/menu" className="brand">
        🍽️ BabaKaDhaba
      </Link>

      <nav>
        <NavLink to="/menu">Menu</NavLink>
        <NavLink to="/cart">Cart {cartCount > 0 ? `(${cartCount})` : "(0)"}</NavLink>
        <NavLink to="/my-orders">My Orders</NavLink>

        {user && user.role === "admin" && (
          <>
            <NavLink to="/admin/dashboard">Dashboard</NavLink>
            <NavLink to="/admin/orders">Manage Orders</NavLink>
            <NavLink to="/admin/tables">Tables</NavLink>
            <NavLink to="/admin/menu/new">+ Add Dish</NavLink>
          </>
        )}

        {user ? (
          <div className="actions" style={{ marginLeft: "12px" }}>
            <span className="user-badge">
              <strong>{user.name}</strong>
              <span className="role-tag">{user.role}</span>
            </span>
            <button
              type="button"
              className="btn btn-small btn-outline"
              onClick={logoutUser}
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="actions" style={{ marginLeft: "12px" }}>
            <NavLink to="/login" className="btn btn-small btn-outline">
              Login
            </NavLink>
            <NavLink to="/register" className="btn btn-small">
              Register
            </NavLink>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
