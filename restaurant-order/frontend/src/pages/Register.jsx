import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register({ onLogin }) {
  const [fullName, setFullName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [accountRole, setAccountRole] = useState("customer");
  const [registerError, setRegisterError] = useState("");
  const navigate = useNavigate();

  function handleRegisterSubmit(e) {
    e.preventDefault();
    setRegisterError("");

    fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fullName, email: userEmail, password: userPassword, role: accountRole })
    })
      .then((res) => {
        return res.json().then((data) => {
          if (!res.ok) throw new Error(data.message || "Registration failed");
          return data;
        });
      })
      .then((data) => {
        onLogin(data.token, data.user);
        if (data.user.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/menu");
        }
      })
      .catch((e) => setRegisterError(e.message));
  }

  return (
    <div className="form-page">
      <h1>Register Account</h1>
      <form className="form" onSubmit={handleRegisterSubmit}>
        {registerError && <p className="alert">{registerError}</p>}

        <label>
          Full Name
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="e.g. rahul@gmail.com"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            placeholder="Create password"
            required
          />
        </label>

        <label>
          Select Role
          <select value={accountRole} onChange={(e) => setAccountRole(e.target.value)}>
            <option value="customer">Customer</option>
            <option value="admin">Staff / Admin</option>
          </select>
        </label>

        <button type="submit" className="btn">
          Create Account
        </button>

        <p style={{ marginTop: "12px", fontSize: "14px", color: "var(--muted)" }}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;
