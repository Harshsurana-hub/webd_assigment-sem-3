import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MenuForm from "../components/MenuForm";

function AdminMenuEdit({ token }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [existingDishData, setExistingDishData] = useState(null);
  const [isDishLoading, setIsDishLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/menu/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setExistingDishData(data);
        setIsDishLoading(false);
      })
      .catch(() => setIsDishLoading(false));
  }, [id]);

  function handleUpdateDish(dishPayload) {
    fetch(`/api/menu/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(dishPayload)
    })
      .then((res) => res.json())
      .then(() => navigate("/menu"));
  }

  if (isDishLoading) return <h2>Loading...</h2>;
  if (!existingDishData) return <h2>Dish not found</h2>;

  return (
    <div className="form-page">
      <h1>Edit Dish</h1>
      <MenuForm
        initialValues={existingDishData}
        submitLabel="Update Dish"
        onSubmit={handleUpdateDish}
      />
    </div>
  );
}

export default AdminMenuEdit;
