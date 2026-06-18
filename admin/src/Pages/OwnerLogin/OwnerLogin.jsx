import React, { useState } from "react";
import "./OwnerLogin.css";
import navlogo from "../../Assets/nav-logo.svg";

function OwnerLogin({ onLogin }) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const changeHandler = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError("");
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:4000/ownerlogin", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem("owner-token", data.token);
        localStorage.setItem("owner-profile", JSON.stringify(data.owner));
        onLogin(data.owner);
      } else {
        setError(data.errors || "Invalid owner credentials");
      }
    } catch (error) {
      setError("Unable to reach the backend. Please make sure it is running.");
    }

    setLoading(false);
  };

  return (
    <div className="owner-login-page">
      <form className="owner-login-card" onSubmit={submitHandler}>
        <img
          src={navlogo}
          alt="Shopsy Admin"
          className="owner-login-logo"
        ></img>
        <div>
          <p className="owner-login-kicker">Owner access</p>
          <h1>Sign in to Admin Panel</h1>
        </div>
        <label>
          Username
          <input
            name="username"
            value={credentials.username}
            onChange={changeHandler}
            placeholder="Enter owner username"
            autoComplete="username"
            required
          />
        </label>
        <label>
          Password
          <input
            name="password"
            value={credentials.password}
            onChange={changeHandler}
            placeholder="Enter password"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        {error && <p className="owner-login-error">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default OwnerLogin;
