import React, { useEffect, useState } from "react";
import Item from "../Components/Items/Item";
import "./CSS/OffersForYou.css";

function OffersForYou() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchOffers = async () => {
      try {
        setLoading(true);
        setError("");

        const headers = {
          Accept: "application/json",
        };

        const token = localStorage.getItem("auth-token");
        if (token) {
          headers["auth-token"] = token;
        }

        const response = await fetch("http://localhost:4000/offers-for-you", {
          headers,
        });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.errors || "Unable to load offers");
        }

        if (!ignore) {
          setProducts(Array.isArray(data.products) ? data.products : []);
        }
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || "Unable to load offers");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchOffers();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="offers-page">
      <div className="offers-page-header">
        <p>Offers For You</p>
        <h1>Recommended products for you</h1>
      </div>

      {loading && <p className="offers-page-state">Loading offers...</p>}
      {error && <p className="offers-page-state offers-page-error">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p className="offers-page-state">No offer products found yet.</p>
      )}

      <div className="offers-page-grid">
        {products.map((item) => (
          <div className="offers-page-card" key={item.id}>
            <div className="offers-page-badges">
              {item.discountPercent > 0 && (
                <span>{item.discountPercent}% off</span>
              )}
              {item.wishedByUser && <span>From wishlist</span>}
              {item.recommended && <span>Recommended</span>}
            </div>
            <Item
              id={item.id}
              name={item.name}
              image={item.image}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          </div>
        ))}
      </div>
    </main>
  );
}

export default OffersForYou;
