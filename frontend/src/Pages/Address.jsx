// // AddressForm.jsx
import React, { useState, useContext } from "react";
import "./CSS/Address.css";
import { ShopContext } from "../Context/ShopContext";

const AddressForm = () => {
  const { all_product, cartItems } = useContext(ShopContext);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [address, setAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress({ ...address, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // const itemList = Object.keys(cartItems).filter(itemId => cartItems[itemId] > 0);
    let items = [];

    all_product.forEach((product) => {
      if (cartItems[product.id] > 0) {
        items.push({
          id: product.id,
          name: product.name,
          price: product.new_price,
          quantity: cartItems[product.id],
          image: product.image,
        });
      }
    });

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:4000"}/payment`, {
        method: "POST",
        headers: {
          "auth-token": `${localStorage.getItem("auth-token")}`,
          "Content-Type": "application/json",
        },
        mode: "cors",
        body: JSON.stringify({ items, address }),
      });
      const data = await res.json();
      if (!data.success || !data.url) {
        setError(data.error || "Unable to start payment.");
        setIsSubmitting(false);
        return;
      }
      window.location = data.url;
    } catch (error) {
      console.log(error);
      setError("Unable to start payment.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="address-form-container">
      <h2>Shipping Address</h2>
      <form onSubmit={handleSubmit} className="address-form">
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={address.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="street">Street Address</label>
          <input
            type="text"
            id="street"
            name="street"
            value={address.street}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="city">City</label>
          <input
            type="text"
            id="city"
            name="city"
            value={address.city}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="state">State</label>
          <input
            type="text"
            id="state"
            name="state"
            value={address.state}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="zip">ZIP Code</label>
          <input
            type="text"
            id="zip"
            name="zip"
            value={address.zip}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="country">Country</label>
          <input
            type="text"
            id="country"
            name="country"
            value={address.country}
            onChange={handleChange}
            required
          />
        </div>
        <button
          type="submit"
          onSubmit={(e) => handleSubmit(e)}
          className="submit-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Redirecting..." : "Proceed to Payment"}
        </button>
        {error && <p className="address-error">{error}</p>}
      </form>
    </div>
  );
};

export default AddressForm;
