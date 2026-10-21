import { useState, useEffect } from "react";

function AdminTables({ token }) {
  const [allTables, setAllTables] = useState([]);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState("");

  function fetchTablesList() {
    fetch("/api/tables")
      .then((res) => res.json())
      .then((data) => setAllTables(data))
      .catch(() => {});
  }

  useEffect(() => {
    fetchTablesList();
  }, []);

  function handleAddTable(e) {
    e.preventDefault();
    fetch("/api/tables", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ tableNumber: Number(newTableNumber), capacity: Number(newTableCapacity) })
    })
      .then((res) => res.json())
      .then(() => {
        setNewTableNumber("");
        setNewTableCapacity("");
        fetchTablesList();
      });
  }

  function handleDeleteTable(tableId) {
    if (!window.confirm("Delete this table?")) return;
    fetch(`/api/tables/${tableId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.json())
      .then(() => fetchTablesList());
  }

  return (
    <div>
      <h1>Manage Dining Tables</h1>

      <div className="card" style={{ padding: "16px", marginBottom: "20px" }}>
        <h3>Add Table</h3>
        <form onSubmit={handleAddTable} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <label>
            Table #
            <input
              type="number"
              value={newTableNumber}
              onChange={(e) => setNewTableNumber(e.target.value)}
              placeholder="e.g. 5"
              required
            />
          </label>
          <label>
            Capacity
            <input
              type="number"
              value={newTableCapacity}
              onChange={(e) => setNewTableCapacity(e.target.value)}
              placeholder="e.g. 4"
              required
            />
          </label>
          <button type="submit" className="btn">+ Add Table</button>
        </form>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Table Number</th>
            <th>Capacity</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {allTables.map((t) => (
            <tr key={t._id}>
              <td><strong>Table #{t.tableNumber}</strong></td>
              <td>{t.capacity} Seats</td>
              <td>
                <button type="button" className="btn btn-small btn-danger" onClick={() => handleDeleteTable(t._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminTables;
