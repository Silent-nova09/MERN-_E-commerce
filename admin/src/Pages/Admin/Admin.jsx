import React from "react";
import "./Admin.css";
import Sidebar from "../../Components/Sidebar/Sidebar.jsx";
import { Routes, Route } from "react-router-dom";
import Addproduct from "../../Components/Addproduct/Addproduct.jsx";
import Listproduct from "../../Components/Listproduct/Listproduct.jsx";
import UpdateProduct from "../../Components/UpdateProduct/UpdateProduct.jsx";
import Dashboard from "../../Components/Dashboard/Dashboard.jsx";
import EmailCampaigns from "../../Components/EmailCampaigns/EmailCampaigns.jsx";
import { Navigate } from "react-router-dom";

function Admin() {
  return (
    <div className="admin">
      <Sidebar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />}></Route>
        <Route path="/dashboard" element={<Dashboard />}></Route>
        <Route path="/addproduct" element={<Addproduct />}></Route>
        <Route path="/listproduct" element={<Listproduct />}></Route>
        <Route path="/updateproduct" element={<UpdateProduct />} />
        <Route path="/email-campaigns" element={<EmailCampaigns />} />
      </Routes>
    </div>
  );
}

export default Admin;
