import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./RecommendedProducts.css";

function RecommendedProducts() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const authToken = localStorage.getItem("auth-token");

  useEffect(() => {
    if (!authToken) {
      setLoading(false);
      return;
    }

    let ignore = false;

    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:4000"}/recommendations`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "auth-token": authToken,
          },
        });

        const data = await response.json();

        if (ignore) {
          return;
        }

        if (!response.ok || !data?.success) {
          throw new Error(data?.errors || "Unable to load recommendations");
        }

        setRecommendations(
          Array.isArray(data.recommendations) ? data.recommendations : [],
        );
      } catch (requestError) {
        if (!ignore) {
          setError(requestError.message || "Unable to load recommendations");
          setRecommendations([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchRecommendations();

    return () => {
      ignore = true;
    };
  }, [authToken]);

  if (!authToken) {
    return null;
  }

  return (
    <section className="recommended-products">
      <div className="recommended-products-header">
        <div>
          <p className="recommended-products-kicker">AI Picks</p>
          <h2>Recommended For You</h2>
        </div>
      </div>

      {loading ? (
        <div className="recommended-products-state">Loading recommendations...</div>
      ) : null}

      {!loading && error ? (
        <div className="recommended-products-state">{error}</div>
      ) : null}

      {!loading && !error && recommendations.length > 0 ? (
        <div className="recommended-products-carousel">
          {recommendations.map((item) => (
            <Link
              key={item.productId}
              className="recommended-card"
              to={`/product/${item.productId}`}
              onClick={() => window.scrollTo(0, 0)}
            >
              <div className="recommended-card-imagewrap">
                <img src={item.image} alt={item.name} />
                <span className="recommended-card-score">{item.score}% Match</span>
              </div>
              <div className="recommended-card-body">
                <p className="recommended-card-category">{item.category}</p>
                <h3>{item.name}</h3>
                <p className="recommended-card-price">${item.new_price}</p>
                <p className="recommended-card-reason">"{item.reason}"</p>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default RecommendedProducts;
