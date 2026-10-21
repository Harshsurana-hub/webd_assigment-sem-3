import { useNavigate } from "react-router-dom";
import MenuForm from "../components/MenuForm";

function AdminMenuNew({ token }) {
  const navigate = useNavigate();

  function handleCreateDish(dishPayload) {
    fetch("/api/menu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(dishPayload)
    })
      .then((res) => res.json())
      .then(() => navigate("/menu"));
  }

  return (
    <div className="form-page">
      <h1>Add New Dish</h1>
      <MenuForm submitLabel="Save Dish" onSubmit={handleCreateDish} />
    </div>
  );
}

export default AdminMenuNew;
