import React, { useContext } from "react";
import "./CSS/Checkout.css";
import { ShopContext } from "../Context/ShopContext";

function Checkout() {
  const { all_product, cartItems, totalCart } = useContext(ShopContext);

  const handleClick = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:4000"}/payment`, {
        method: "POST",
        headers: {
          "auth-token": `${localStorage.getItem("auth-token")}`,
          "Content-Type": "application/json",
        },
        mode: "cors",
        body: JSON.stringify({
          items: [
            {
              id: 1,
              quantity: 1,
              price: 100,
              name: "red",
            },
          ],
        }),
      });
      const data = await res.json();
      window.location = data.url;
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="checkout">
      <h2>Checkout before paying!!</h2>
      <div className="cformat-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
      </div>
      <hr />
      {all_product.map((product, i) => {
        if (cartItems[product.id] > 0) {
          return (
            <div>
              <div className="cformat cformat-main">
                <img className="cproduct-icon" src={product.image} alt=""></img>
                <p>{product.name}</p>
                <p>${product.new_price}</p>
                <button className="cquantity">{cartItems[product.id]}</button>
                <p>${product.new_price * cartItems[product.id]}</p>
              </div>
              <hr />
            </div>
          );
        }
        return null;
      })}
      <div className="total">
        <p>Cart Total ${totalCart()}</p>
      </div>
      <div className="cnext">
        <button onClick={handleClick} className="next">
          Place Your Order
        </button>
      </div>
    </div>
  );
}

export default Checkout;
