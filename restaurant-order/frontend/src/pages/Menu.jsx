import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Menu({ user, token, cart, onAddToCart }) {
  const [dishList, setDishList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  function fetchMenuItems() {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data) => {
        setDishList(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const filteredDishes = dishList.filter((dish) => {
    const matchesSearchQuery = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || dish.category === selectedCategory;
    const matchesVegFilter = !isVegOnly || dish.isVeg;
    return matchesSearchQuery && matchesCategory && matchesVegFilter;
  });

  function handleDeleteDish(dishId) {
    if (!window.confirm("Delete this dish?")) return;
    fetch(`/api/menu/${dishId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then(() => fetchMenuItems());
  }

  function handleToggleAvailability(dishId) {
    fetch(`/api/menu/${dishId}/toggle`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then(() => fetchMenuItems());
  }

  if (isLoading) return <h2>Loading Menu...</h2>;

  return (
    <div>
      <div className="page-head">
        <h1>BabaKaDhaba Menu</h1>
        {user && user.role === "admin" && (
          <Link to="/admin/menu/new" className="btn">+ Add Dish</Link>
        )}
      </div>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search food..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="all">All Categories</option>
          <option value="Starters">Starters</option>
          <option value="Main Course">Main Course</option>
          <option value="Breads">Breads</option>
          <option value="Beverages">Beverages</option>
          <option value="Desserts">Desserts</option>
        </select>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={isVegOnly}
            onChange={(e) => setIsVegOnly(e.target.checked)}
          />
          <span>Veg Only</span>
        </label>
      </div>

      <div className="grid">
        {filteredDishes.map((dish) => {
          const cartItemMatch = cart.find((c) => c.menuItem === dish._id);

          return (
            <div key={dish._id} className="card">
              {dish.image && (
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="card-img"
                  onError={(e) => (e.target.style.display = "none")}
                />
              )}

              <h2>
                <Link to={`/menu/${dish._id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  {dish.name}
                </Link>
                <span className={`badge ${dish.isVeg ? "badge-veg" : "badge-nonveg"}`}>
                  {dish.isVeg ? "● Veg" : "▲ Non-Veg"}
                </span>
              </h2>

              <p style={{ color: "var(--muted)", margin: "0 0 6px" }}>{dish.category}</p>
              <div className="price">₹{dish.price}</div>
              {dish.description && <p className="desc">{dish.description}</p>}

              {!dish.isAvailable && (
                <p><span className="badge badge-unavailable">Out of Stock</span></p>
              )}

              <div className="actions" style={{ marginTop: "auto" }}>
                {user && user.role === "admin" ? (
                  <>
                    <Link to={`/admin/menu/${dish._id}/edit`} className="btn btn-small btn-outline">Edit</Link>
                    <button type="button" className="btn btn-small btn-outline" onClick={() => handleToggleAvailability(dish._id)}>
                      {dish.isAvailable ? "Stock Out" : "Stock In"}
                    </button>
                    <button type="button" className="btn btn-small btn-danger" onClick={() => handleDeleteDish(dish._id)}>
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <Link to={`/menu/${dish._id}`} className="btn btn-small btn-outline">Details</Link>
                    <button
                      type="button"
                      className="btn btn-small"
                      disabled={!dish.isAvailable}
                      onClick={() => onAddToCart(dish)}
                    >
                      {!dish.isAvailable ? "Out of Stock" : cartItemMatch ? `In Cart (${cartItemMatch.quantity}) +` : "+ Add"}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Menu;
