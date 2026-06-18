import "./App.css";
import Navbar from "./Components/Navbar/Navbar";
import Admin from "./Pages/Admin/Admin";
import OwnerLogin from "./Pages/OwnerLogin/OwnerLogin";
import { Navigate, Route, Routes } from "react-router-dom";
import { useState } from "react";

function App() {
  const [owner, setOwner] = useState(() => {
    const token = localStorage.getItem("owner-token");
    const profile = localStorage.getItem("owner-profile");
    if (!token || !profile) return null;
    try {
      return JSON.parse(profile);
    } catch (error) {
      localStorage.removeItem("owner-token");
      localStorage.removeItem("owner-profile");
      return null;
    }
  });

  const logout = () => {
    localStorage.removeItem("owner-token");
    localStorage.removeItem("owner-profile");
    setOwner(null);
  };

  if (!owner) {
    return (
      <Routes>
        <Route path="*" element={<OwnerLogin onLogin={setOwner} />} />
      </Routes>
    );
  }

  return (
    <div>
      <Navbar owner={owner} onLogout={logout} />
      <Routes>
        <Route path="/*" element={<Admin />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
}

export default App;
