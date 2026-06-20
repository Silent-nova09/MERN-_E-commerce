import React, { useContext } from "react";
import "./Item.css";
import { Link } from "react-router-dom";
import { ShopContext } from "../../Context/ShopContext";
import wishlist_before from "../Assets/wishlist_before.jpg";
import wishlist_after from "../Assets/wishlist_after.jpg";
import { useNavigate } from "react-router-dom";

function Item(props) {
  const navigate = useNavigate();
  const {
    wishlistIcon,
    addWishlist,
    addwishlistIcon,
    deletewishlist,
    deletewishlistIcon,
  } = useContext(ShopContext);

  const handleclick1 = (id) => {
    window.scrollTo();
    deletewishlist(id);
    deletewishlistIcon(id);
  };

  const handleclick2 = (id) => {
    addWishlist(id);
    addwishlistIcon(id);
  };

  return (
    <div className="item">
      <Link
        to={`/product/${props.id}`}
        onClick={() => {
          window.scrollTo(0, 0);
        }}
      >
        <img src={props.image} alt={props.name}></img>
      </Link>
      <p>{props.name}</p>
      <div className="item-prices">
        <div className="item-price-new">
          <p>${props.new_price}</p>
        </div>
        <div className="item-price-old">
          <p>${props.old_price}</p>
        </div>
        {wishlistIcon[`${props.id}`] === 1 ? (
          <img
            onClick={() => {
              handleclick1(`${props.id}`);
            }}
            className="item-wishlist"
            src={wishlist_after}
            alt="Remove from wishlist"
          ></img>
        ) : (
          <img
            onClick={() => {
              localStorage.getItem("auth-token")
                ? handleclick2(`${props.id}`)
                : navigate("/login");
            }}
            className="item-wishlist"
            src={wishlist_before}
            alt="Add to wishlist"
          ></img>
        )}
      </div>
    </div>
  );
}

export default Item;
