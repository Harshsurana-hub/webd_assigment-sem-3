import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function MenuForm({ initialValues, submitLabel, onSubmit }) {
  const [dishFormData, setDishFormData] = useState(
    initialValues || {
      name: "",
      category: "Starters",
      price: "",
      isVeg: true,
      isAvailable: true,
      image: "",
      description: ""
    }
  );

  useEffect(() => {
    if (initialValues) {
      setDishFormData(initialValues);
    }
  }, [initialValues]);

  function handleFieldChange(e) {
    const { name: fieldName, value: fieldValue, type: fieldType, checked: isChecked } = e.target;
    setDishFormData({
      ...dishFormData,
      [fieldName]: fieldType === "checkbox" ? isChecked : fieldValue
    });
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    onSubmit({
      ...dishFormData,
      price: Number(dishFormData.price)
    });
  }

  return (
    <form className="form" onSubmit={handleFormSubmit}>
      <label>
        Dish Name
        <input
          name="name"
          value={dishFormData.name}
          onChange={handleFieldChange}
          placeholder="e.g. Paneer Butter Masala"
          required
        />
      </label>

      <label>
        Category
        <select name="category" value={dishFormData.category} onChange={handleFieldChange}>
          <option value="Starters">Starters</option>
          <option value="Main Course">Main Course</option>
          <option value="Breads">Breads</option>
          <option value="Beverages">Beverages</option>
          <option value="Desserts">Desserts</option>
        </select>
      </label>

      <label>
        Price (₹)
        <input
          name="price"
          type="number"
          value={dishFormData.price}
          onChange={handleFieldChange}
          placeholder="e.g. 250"
          required
        />
      </label>

      <label style={{ flexDirection: "row", alignItems: "center", gap: "8px" }}>
        <input
          name="isVeg"
          type="checkbox"
          checked={dishFormData.isVeg}
          onChange={handleFieldChange}
        />
        <span>Pure Vegetarian</span>
      </label>

      <label style={{ flexDirection: "row", alignItems: "center", gap: "8px" }}>
        <input
          name="isAvailable"
          type="checkbox"
          checked={dishFormData.isAvailable}
          onChange={handleFieldChange}
        />
        <span>Available for Ordering</span>
      </label>

      <label>
        Image URL
        <input
          name="image"
          type="url"
          value={dishFormData.image}
          onChange={handleFieldChange}
          placeholder="https://..."
        />
      </label>

      <label>
        Description
        <textarea
          name="description"
          value={dishFormData.description}
          onChange={handleFieldChange}
          placeholder="Short details about the dish"
          rows="3"
        />
      </label>

      <div className="actions">
        <button type="submit" className="btn">
          {submitLabel}
        </button>
        <Link to="/menu" className="btn btn-outline">
          Cancel
        </Link>
      </div>
    </form>
  );
}

export default MenuForm;
