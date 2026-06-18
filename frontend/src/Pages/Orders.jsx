import React, { useContext, useEffect } from "react";
import { ShopContext } from "../Context/ShopContext";
import "./CSS/Orders.css";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount || 0);

const formatDate = (date) =>
  date
    ? new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(date))
    : "";

const OrderPage = () => {
  const { orderData, refreshOrders } = useContext(ShopContext);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  return (
    <div className="orders-page">
      <h1>Your Orders</h1>
      <div className="orders-container">
        {orderData.length === 0 ? (
          <p className="orders-empty">No orders found.</p>
        ) : (
          orderData.map((order) => (
            <div className="order-card" key={order.orderId || order._id}>
              <div className="order-header">
                <div>
                  <p className="order-id">Order #{order.orderId}</p>
                  <p className="order-date">{formatDate(order.orderDate)}</p>
                </div>
                <div className="order-summary">
                  <span className="items-status">
                    Status - {order.paymentStatus || "completed"}
                  </span>
                  <strong>{formatCurrency(order.totalAmount)}</strong>
                </div>
              </div>

              {order.shippingAddress && (
                <p className="order-address">
                  {[
                    order.shippingAddress.name,
                    order.shippingAddress.street,
                    order.shippingAddress.city,
                    order.shippingAddress.state,
                    order.shippingAddress.zip,
                    order.shippingAddress.country,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              )}

              <div className="order-items">
                {(order.items || []).map((item) => (
                  <div className="items" key={`${order.orderId}-${item.productId}`}>
                    <img className="items-image" src={item.image} alt={item.name} />
                    <div className="items-body">
                      <p className="items-name">{item.name}</p>
                      <p className="items-price">
                        {formatCurrency(item.price)} x {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderPage;
