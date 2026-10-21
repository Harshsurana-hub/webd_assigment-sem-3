import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login({ onLogin }) {
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  function handleLoginSubmit(e) {
    e.preventDefault();
    setLoginError("");

    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, password: userPassword })
    })
      .then((res) => {
        return res.json().then((data) => {
          if (!res.ok) throw new Error(data.message || "Login failed");
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
      .catch((e) => setLoginError(e.message));
  }

  return (
    <div className="form-page">
      <h1>Account Login</h1>
      <form className="form" onSubmit={handleLoginSubmit}>
        {loginError && <p className="alert">{loginError}</p>}

        <label>
          Email
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            placeholder="Enter password"
            required
          />
        </label>

        <button type="submit" className="btn">
          Login
        </button>

        <p style={{ marginTop: "12px", fontSize: "14px", color: "var(--muted)" }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
