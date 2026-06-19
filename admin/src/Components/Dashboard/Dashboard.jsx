// import "./Dashboard.css";
// import React, { useEffect, useMemo, useState } from "react";

// const currencyFormatter = new Intl.NumberFormat("en-IN", {
//   style: "currency",
//   currency: "INR",
//   maximumFractionDigits: 0,
// });

// function Dashboard() {
//   const [dashboard, setDashboard] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchDashboard = async () => {
//       try {
//         setLoading(true);
//         setError("");
//         const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/admin/dashboard`);
//         if (!response.ok) {
//           throw new Error(
//             "Backend returned an error while loading dashboard data.",
//           );
//         }
//         const data = await response.json();

//         if (!data.success) {
//           throw new Error(data.errors || "Unable to load dashboard");
//         }

//         setDashboard(data);
//       } catch (fetchError) {
//         setError(fetchError.message || "Unable to load dashboard");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboard();
//   }, []);

//   const exportUrl = useMemo(
//     () => `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/admin/powerbi/sales?format=csv`,
//     [],
//   );

//   if (loading) {
//     return <div className="dashboard-shell">Loading dashboard...</div>;
//   }

//   if (error) {
//     return <div className="dashboard-shell dashboard-error">{error}</div>;
//   }

//   const totals = dashboard?.totals || {};
//   const salesTrend = dashboard?.salesTrend || [];
//   const topProducts = dashboard?.topProducts || [];
//   const revenueByCategory = dashboard?.revenueByCategory || [];
//   const lowStockAlerts = dashboard?.lowStockAlerts || [];
//   const maxTrendRevenue = Math.max(
//     ...salesTrend.map((item) => item.revenue),
//     1,
//   );
//   const maxCategoryRevenue = Math.max(
//     ...revenueByCategory.map((item) => item.revenue),
//     1,
//   );

//   return (
//     <div className="dashboard-shell">
//       <div className="dashboard-hero">
//         <div>
//           <p className="dashboard-kicker">Power BI Dashboard</p>
//           <h1>Sales and Inventory Command Center</h1>
//           <p className="dashboard-subtitle">
//             Revenue, orders, category mix, and low-stock risk based on recent
//             sales velocity.
//           </p>
//         </div>
//         <a
//           className="dashboard-export-btn"
//           href={exportUrl}
//           target="_blank"
//           rel="noreferrer"
//         >
//           Download Power BI CSV
//         </a>
//       </div>

//       <div className="dashboard-metrics">
//         <article className="metric-card">
//           <span>Total Revenue</span>
//           <strong>{currencyFormatter.format(totals.revenue || 0)}</strong>
//         </article>
//         <article className="metric-card">
//           <span>Total Orders</span>
//           <strong>{totals.orders || 0}</strong>
//         </article>
//         <article className="metric-card">
//           <span>Products</span>
//           <strong>{totals.products || 0}</strong>
//         </article>
//         <article className="metric-card">
//           <span>Units Sold</span>
//           <strong>{totals.unitsSold || 0}</strong>
//         </article>
//       </div>

//       <div className="dashboard-grid">
//         <section className="dashboard-panel">
//           <div className="panel-heading">
//             <h2>7-Day Sales Trend</h2>
//             <p>Revenue and order count by day</p>
//           </div>
//           <div className="trend-list">
//             {salesTrend.map((day) => (
//               <div className="trend-row" key={day.date}>
//                 <div className="trend-meta">
//                   <strong>{day.date}</strong>
//                   <span>{day.orders} orders</span>
//                 </div>
//                 <div className="trend-bar">
//                   <div
//                     className="trend-bar-fill"
//                     style={{
//                       width: `${(day.revenue / maxTrendRevenue) * 100}%`,
//                     }}
//                   />
//                 </div>
//                 <strong>{currencyFormatter.format(day.revenue || 0)}</strong>
//               </div>
//             ))}
//           </div>
//         </section>

//         <section className="dashboard-panel">
//           <div className="panel-heading">
//             <h2>Revenue by Category</h2>
//             <p>Good for Power BI pie or stacked bar visuals</p>
//           </div>
//           <div className="category-list">
//             {revenueByCategory.map((entry) => (
//               <div className="category-row" key={entry.category}>
//                 <div className="category-meta">
//                   <strong>{entry.category}</strong>
//                   <span>{entry.unitsSold} units sold</span>
//                 </div>
//                 <div className="trend-bar">
//                   <div
//                     className="category-bar-fill"
//                     style={{
//                       width: `${(entry.revenue / maxCategoryRevenue) * 100}%`,
//                     }}
//                   />
//                 </div>
//                 <strong>{currencyFormatter.format(entry.revenue || 0)}</strong>
//               </div>
//             ))}
//           </div>
//         </section>

//         <section className="dashboard-panel">
//           <div className="panel-heading">
//             <h2>Top Selling Products</h2>
//             <p>Sorted by units sold, with revenue attached</p>
//           </div>
//           <div className="product-table">
//             <div className="product-table-head">
//               <span>Product</span>
//               <span>Units</span>
//               <span>Revenue</span>
//             </div>
//             {topProducts.map((product) => (
//               <div className="product-table-row" key={product.productId}>
//                 <span>{product.name}</span>
//                 <span>{product.unitsSold}</span>
//                 <span>{currencyFormatter.format(product.revenue || 0)}</span>
//               </div>
//             ))}
//           </div>
//         </section>

//         <section className="dashboard-panel dashboard-alerts-panel">
//           <div className="panel-heading">
//             <h2>Low-Stock Alerts</h2>
//             <p>Triggered by stock level and recent sales velocity</p>
//           </div>
//           <div className="alerts-list">
//             {lowStockAlerts.length === 0 && (
//               <div className="alert-card alert-card-safe">
//                 <strong>No immediate stock risks</strong>
//                 <p>
//                   Current inventory is healthy based on the last 7 days of
//                   sales.
//                 </p>
//               </div>
//             )}
//             {lowStockAlerts.map((alert) => (
//               <article
//                 className={`alert-card alert-${alert.severity}`}
//                 key={alert.productId}
//               >
//                 <div className="alert-header">
//                   <strong>{alert.name}</strong>
//                   <span>{alert.severity} risk</span>
//                 </div>
//                 <p>{alert.reason}</p>
//                 <div className="alert-stats">
//                   <span>Stock: {alert.stock}</span>
//                   <span>7-day sales: {alert.unitsLast7Days}</span>
//                   <span>
//                     Stockout ETA:{" "}
//                     {alert.daysUntilStockout === null
//                       ? "No recent demand"
//                       : `${alert.daysUntilStockout} days`}
//                   </span>
//                 </div>
//               </article>
//             ))}
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

import "./Dashboard.css";
import React, { useEffect, useState } from "react";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/admin/dashboard`);

        if (!response.ok) {
          throw new Error(
            "Backend returned an error while loading dashboard data.",
          );
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.errors || "Unable to load dashboard");
        }

        setDashboard(data);
      } catch (fetchError) {
        setError(fetchError.message || "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="dashboard-shell">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-shell dashboard-error">{error}</div>;
  }

  const lowStockAlerts = dashboard?.lowStockAlerts || [];

  return (
    <div className="dashboard-shell">
      <div className="dashboard-hero">
        <div>
          <p className="dashboard-kicker">Power BI Analytics</p>
          <h1>Sales and Inventory Command Center</h1>
          <p className="dashboard-subtitle">
            Business intelligence powered by Power BI with real-time inventory
            monitoring from the ecommerce platform.
          </p>
        </div>
      </div>

      {/* POWER BI REPORT */}
      <section className="dashboard-panel">
        <div className="panel-heading">
          <h2>Business Analytics</h2>
          <p>
            Revenue trends, category performance, top products, and sales
            insights powered by Power BI.
          </p>
        </div>

        <iframe
          title="Ecommerce Power BI Dashboard"
          src="https://app.powerbi.com/reportEmbed?reportId=82761e94-e4f1-4e15-b321-2d047f3dd51e&autoAuth=true&ctid=f4669cc9-6065-4d34-9017-684988b21f7a"
          width="100%"
          height="900"
          frameBorder="0"
          allowFullScreen
          style={{
            border: "none",
            borderRadius: "12px",
            background: "#fff",
          }}
        />
      </section>

      {/* LOW STOCK ALERTS */}
      <section
        className="dashboard-panel dashboard-alerts-panel"
        style={{ marginTop: "24px" }}
      >
        <div className="panel-heading">
          <h2>Low Stock Alerts</h2>
          <p>
            Triggered by stock levels, sales velocity, and estimated stockout
            dates.
          </p>
        </div>

        <div className="alerts-list">
          {lowStockAlerts.length === 0 && (
            <div className="alert-card alert-card-safe">
              <strong>No immediate stock risks</strong>
              <p>
                Current inventory is healthy based on the last 7 days of sales.
              </p>
            </div>
          )}

          {lowStockAlerts.map((alert) => (
            <article
              className={`alert-card alert-${alert.severity}`}
              key={alert.productId}
            >
              <div className="alert-header">
                <strong>{alert.name}</strong>
                <span>{alert.severity} risk</span>
              </div>

              <p>{alert.reason}</p>

              <div className="alert-stats">
                <span>Stock: {alert.stock}</span>

                <span>7-Day Sales: {alert.unitsLast7Days}</span>

                <span>
                  Stockout ETA:{" "}
                  {alert.daysUntilStockout === null
                    ? "No recent demand"
                    : `${alert.daysUntilStockout} days`}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
