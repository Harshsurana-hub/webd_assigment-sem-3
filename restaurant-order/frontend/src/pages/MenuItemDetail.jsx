import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

function MenuItemDetail({ onAddToCart }) {
  const { id } = useParams();
  const [dishInfo, setDishInfo] = useState(null);
  const [isDishLoading, setIsDishLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/menu/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setDishInfo(data);
        setIsDishLoading(false);
      })
      .catch(() => setIsDishLoading(false));
  }, [id]);

  if (isDishLoading) return <h2>Loading...</h2>;
  if (!dishInfo) return <h2>Item not found</h2>;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <Link to="/menu" className="btn btn-small btn-outline" style={{ marginBottom: "16px" }}>
        ← Back to Menu
      </Link>

      <div className="card" style={{ padding: "20px" }}>
        {dishInfo.image && (
          <img
            src={dishInfo.image}
            alt={dishInfo.name}
            style={{ width: "100%", maxHeight: "280px", objectFit: "cover", borderRadius: "8px" }}
          />
        )}

        <h2>{dishInfo.name}</h2>
        <p style={{ color: "var(--muted)" }}>Category: {dishInfo.category}</p>
        <p>{dishInfo.isVeg ? "🌱 Vegetarian" : "🍗 Non-Vegetarian"}</p>
        <div className="price" style={{ fontSize: "22px", margin: "8px 0" }}>₹{dishInfo.price}</div>
        <p>{dishInfo.description}</p>

        <button
          type="button"
          className="btn"
          disabled={!dishInfo.isAvailable}
          onClick={() => {
            onAddToCart(dishInfo);
            alert(`Added ${dishInfo.name} to cart`);
          }}
        >
          {dishInfo.isAvailable ? "+ Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}

export default MenuItemDetail;
