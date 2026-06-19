import React, { createContext, useCallback, useEffect, useState } from "react";

export const ShopContext = createContext(null);
const getDefaultCart = () => {
  let cart = {};
  for (let i = 0; i < 300 + 1; i++) {
    cart[i] = 0;
  }
  return cart;
};

const getDefaultWishlist = () => {
  let wishlist = {};
  for (let i = 0; i < 300 + 1; i++) {
    wishlist[i] = 0;
  }
  return wishlist;
};

const getDefaultorders = () => [];

const getDefaultWishlistIcon = () => {
  let wishlistIcon = {};
  for (let i = 0; i < 300 + 1; i++) {
    wishlistIcon[i] = 0;
  }
  return wishlistIcon;
};

function ShopContextProvider(props) {
  const [all_product, setAll_product] = useState([]);
  const [cartItems, setCartItems] = useState(getDefaultCart());
  const [wishlist, setwishlist] = useState(getDefaultWishlist());
  const [wishlistIcon, setwishlistIcon] = useState(getDefaultWishlistIcon);
  const [orderData, setorderdata] = useState(getDefaultorders);

  const refreshCart = useCallback(async () => {
    if (!localStorage.getItem("auth-token")) {
      setCartItems(getDefaultCart());
      return;
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:4000"}/getcart`, {
      method: "POST",
      headers: {
        Accept: "application/form-data",
        "auth-token": `${localStorage.getItem("auth-token")}`,
        "Content-Type": "application/json",
      },
      body: "",
    });

    const data = await response.json();
    setCartItems(data?.errors ? getDefaultCart() : data);
  }, []);

  const refreshWishlist = useCallback(async () => {
    if (!localStorage.getItem("auth-token")) {
      setwishlist(getDefaultWishlist());
      return;
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:4000"}/getwishlist`, {
      method: "POST",
      headers: {
        Accept: "application/form-data",
        "auth-token": `${localStorage.getItem("auth-token")}`,
        "Content-Type": "application/json",
      },
      body: "",
    });

    const data = await response.json();
    setwishlist(data?.errors ? getDefaultWishlist() : data);
  }, []);

  const refreshWishlistIcon = useCallback(async () => {
    if (!localStorage.getItem("auth-token")) {
      setwishlistIcon(getDefaultWishlistIcon());
      return;
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:4000"}/getwishlisticon`, {
      method: "POST",
      headers: {
        Accept: "application/form-data",
        "auth-token": `${localStorage.getItem("auth-token")}`,
        "Content-Type": "application/json",
      },
      body: "",
    });

    const data = await response.json();
    setwishlistIcon(data?.errors ? getDefaultWishlistIcon() : data);
  }, []);

  const refreshOrders = useCallback(async () => {
    if (!localStorage.getItem("auth-token")) {
      setorderdata([]);
      return;
    }

    const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:4000"}/getorders`, {
      method: "POST",
      headers: {
        Accept: "application/form-data",
        "auth-token": `${localStorage.getItem("auth-token")}`,
        "Content-Type": "application/json",
      },
      body: "",
    });

    const data = await response.json();
    setorderdata(Array.isArray(data?.orders) ? data.orders : []);
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL || "http://localhost:4000"}/allproducts`)
      .then((resp) => resp.json())
      .then((data) => setAll_product(data));

    if (localStorage.getItem("auth-token")) {
      refreshCart();
      refreshWishlist();
      refreshWishlistIcon();
      refreshOrders();
    }
  }, [refreshCart, refreshWishlist, refreshWishlistIcon, refreshOrders]);

  const addCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    if (localStorage.getItem("auth-token")) {
      fetch(`${process.env.REACT_APP_API_URL || "http://localhost:4000"}/addtocart`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "auth-token": `${localStorage.getItem("auth-token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: itemId }),
      }).catch((error) => console.log(error));
    }
  };

  const addWishlist = (itemId) => {
    setwishlist((prev) => ({ ...prev, [itemId]: 1 }));
    if (localStorage.getItem("auth-token")) {
      fetch(`${process.env.REACT_APP_API_URL || "http://localhost:4000"}/addtowishlist`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "auth-token": `${localStorage.getItem("auth-token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: itemId }),
      }).catch((error) => console.log(error));
    }
  };

  const addOrders = (itemId) => {
    console.log(itemId);
  };

  const addwishlistIcon = (itemId) => {
    setwishlistIcon((prev) => ({ ...prev, [itemId]: 1 }));
    if (localStorage.getItem("auth-token")) {
      fetch(`${process.env.REACT_APP_API_URL || "http://localhost:4000"}/addwishlisticon`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "auth-token": `${localStorage.getItem("auth-token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: itemId }),
      }).catch((error) => console.log(error));
    }
  };

  const deletewishlist = (itemId) => {
    setwishlist((prev) => ({ ...prev, [itemId]: 0 }));
    if (localStorage.getItem("auth-token")) {
      fetch(`${process.env.REACT_APP_API_URL || "http://localhost:4000"}/deletefromwishlist`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "auth-token": `${localStorage.getItem("auth-token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: itemId }),
      }).catch((error) => console.log(error));
    }
  };

  const deletewishlistIcon = (itemId) => {
    setwishlistIcon((prev) => ({ ...prev, [itemId]: 0 }));
    if (localStorage.getItem("auth-token")) {
      fetch(`${process.env.REACT_APP_API_URL || "http://localhost:4000"}/deletewishlisticon`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "auth-token": `${localStorage.getItem("auth-token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: itemId }),
      }).catch((error) => console.log(error));
    }
  };

  const removeCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
    if (localStorage.getItem("auth-token")) {
      fetch(`${process.env.REACT_APP_API_URL || "http://localhost:4000"}/removefromcart`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "auth-token": `${localStorage.getItem("auth-token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId: itemId }),
      }).catch((error) => console.log(error));
    }
  };

  const totalCart = () => {
    console.log(all_product);
    let total = 0;
    for (let i = 1; i < all_product.length + 1; i++) {
      if (cartItems[i] > 0) {
        total = total + all_product[i - 1].new_price * cartItems[i];
      }
    }
    return total;
  };

  const totalCount = () => {
    let count = 0;
    for (let i = 1; i < all_product.length + 1; i++) {
      count += cartItems[i];
    }
    return count;
  };

  const contextValue = {
    all_product,
    cartItems,
    wishlistIcon,
    wishlist,
    orderData,
    refreshCart,
    refreshOrders,
    addCart,
    addOrders,
    addWishlist,
    addwishlistIcon,
    removeCart,
    deletewishlist,
    deletewishlistIcon,
    totalCart,
    totalCount,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
}

export default ShopContextProvider;
