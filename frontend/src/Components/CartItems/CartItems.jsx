import React, { useContext } from "react";
import "./CartItems.css";
import { ShopContext } from "../../Context/ShopContext";
import remove_icon from "../Assets/cart_cross_icon.png";
import { useNavigate } from "react-router-dom";

function CartItems() {
  const navigate = useNavigate();
  const { all_product, cartItems, removeCart, totalCart } =
    useContext(ShopContext);

  const handleClick = () => {
    localStorage.getItem("auth-token")
      ? navigate("/address")
      : navigate("/login");
  };

  return (
    <div className="cartItems">
      <div className="format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
      {all_product.map((product) => {
        if (cartItems[product.id] > 0) {
          return (
            <div key={product.id}>
              <div className="format format-main">
                <img
                  className="product-icon"
                  src={product.image}
                  alt={product.name}
                ></img>
                <p>{product.name}</p>
                <p>${product.new_price}</p>
                <button className="quantity">{cartItems[product.id]}</button>
                <p>${product.new_price * cartItems[product.id]}</p>
                <img
                  className="remove-icon"
                  src={remove_icon}
                  alt=""
                  onClick={() => {
                    removeCart(product.id);
                  }}
                ></img>
              </div>
              <hr />
            </div>
          );
        }
        return null;
      })}
      <div className="down">
        <div className="promocode">
          <p>Enter your promocode here</p>
          <div className="promobox">
            <input type="text" placeholder="Promo code"></input>
            <button>Submit</button>
          </div>
        </div>
        <div className="total">
          <h1>Cart Total</h1>
          <div>
            <div className="total-item">
              <p>Subtotal</p>
              <p>${totalCart()}</p>
            </div>
            <hr />
            <div className="total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="total-item">
              <h3>Total</h3>
              <p>${totalCart()}</p>
            </div>
          </div>
          <button onClick={handleClick}>PROCEED TO CHECKOUT</button>
        </div>
      </div>
    </div>
  );
}

export default CartItems;
