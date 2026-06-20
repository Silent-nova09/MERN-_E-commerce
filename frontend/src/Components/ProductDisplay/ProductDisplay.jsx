import React, { useContext } from "react";
import "./ProductDisplay.css";
import star_icon from "../Assets/star_icon.png";
import star_dull_icon from "../Assets/star_dull_icon.png";
import { ShopContext } from "../../Context/ShopContext";
import wishlist_before from "../Assets/wishlist_before.jpg";
import wishlist_after from "../Assets/wishlist_after.jpg";
import { useNavigate } from "react-router-dom";

function ProductDisplay(props) {
  const navigate = useNavigate();
  const { product } = props;
  const {
    wishlistIcon,
    addCart,
    addWishlist,
    addwishlistIcon,
    deletewishlist,
    deletewishlistIcon,
  } = useContext(ShopContext);

  const handleclick1 = (id) => {
    deletewishlist(id);
    deletewishlistIcon(id);
  };

  const handleclick2 = (id) => {
    addWishlist(id);
    addwishlistIcon(id);
  };

  return (
    <div className="productdisplay">
      <div className="productdisplay-left">
        <div className="productdisplay-img-list">
          <img src={product.image} alt={product.name}></img>
          <img src={product.image} alt={product.name}></img>
          <img src={product.image} alt={product.name}></img>
          <img src={product.image} alt={product.name}></img>
        </div>
        <div className="productdisplay-img">
          <img className="productdisplay-main-img" src={product.image} alt={product.name}></img>
          {wishlistIcon[product.id] === 1 ? (
            <img
              onClick={() => {
                handleclick1(product.id);
              }}
              className="productdisplay-wishlist"
              src={wishlist_after}
              alt="Remove from wishlist"
            ></img>
          ) : (
            <img
              onClick={() => {
                localStorage.getItem("auth-token")
                  ? handleclick2(product.id)
                  : navigate("/login");
              }}
              className="productdisplay-wishlist"
              src={wishlist_before}
              alt="Add to wishlist"
            ></img>
          )}
        </div>
      </div>
      <div className="productdisplay-right">
        <h1>{product.name}</h1>
        <div className="productdisplay-right-star">
          <img src={star_icon} alt="star"></img>
          <img src={star_icon} alt="star"></img>
          <img src={star_icon} alt="star"></img>
          <img src={star_icon} alt="star"></img>
          <img src={star_dull_icon} alt="dull_star"></img>
          <p>(122)</p>
        </div>
        <div className="productdisplay-right-prices">
          <div className="productdisplay-right-new-price">
            ${product.new_price}
          </div>
          <div className="productdisplay-right-old-price">
            ${product.old_price}
          </div>
        </div>
        <div className="productdisplay-right-description">
          {product.description ||
            "A comfortable everyday style made for easy pairing, clean layering, and all-day wear."}
        </div>
        <div className="productdisplay-right-size">
          <h1>Select size</h1>
          <div className="productdisplay-right-sizes">
            <div>S</div>
            <div>M</div>
            <div>L</div>
            <div>XL</div>
            <div>XXL</div>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.getItem("auth-token")
              ? addCart(product.id)
              : navigate("/login");
          }}
        >
          ADD TO CART
        </button>
        <p className="productdisplay-right-category">
          <span>Category :</span>Women, T-shirt, Crop-top
        </p>
        <p className="productdisplay-right-category">
          <span>Category :</span>Modern, Latest
        </p>
      </div>
    </div>
  );
}

export default ProductDisplay;
