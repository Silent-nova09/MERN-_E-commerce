import "./EmailCampaigns.css";
import React, { useEffect, useMemo, useState } from "react";

const initialNewsletter = {
  subject: "",
  message: "",
};

const initialOffer = {
  subject: "",
  message: "",
  discountPercent: 10,
};

function EmailCampaigns() {
  const [overview, setOverview] = useState({
    subscriberCount: 0,
    products: [],
    campaigns: [],
  });
  const [newsletter, setNewsletter] = useState(initialNewsletter);
  const [offer, setOffer] = useState(initialOffer);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState("");
  const [status, setStatus] = useState("");

  const topWishlisted = useMemo(
    () => overview.products.filter((product) => product.wishlistCount > 0),
    [overview.products],
  );

  const selectedRecipientCount = useMemo(() => {
    return selectedProducts.reduce((sum, productId) => {
      const product = overview.products.find((item) => item.id === productId);
      return sum + (product?.wishlistCount || 0);
    }, 0);
  }, [overview.products, selectedProducts]);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:4000/admin/email/overview");
      const data = await response.json();
      if (!data.success) throw new Error(data.errors || "Unable to load emails");
      setOverview(data);
    } catch (error) {
      setStatus(error.message || "Unable to load email campaign data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const toggleProduct = (id) => {
    setSelectedProducts((current) =>
      current.includes(id)
        ? current.filter((productId) => productId !== id)
        : [...current, id],
    );
  };

  const sendNewsletter = async (e) => {
    e.preventDefault();
    setStatus("");
    setSending("newsletter");

    try {
      const response = await fetch(
        "http://localhost:4000/admin/email/send-newsletter",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newsletter),
        },
      );
      const data = await response.json();
      if (!data.success) throw new Error(data.errors || "Newsletter failed");
      setNewsletter(initialNewsletter);
      setStatus(`Newsletter sent to ${data.sent} subscribers.`);
      await fetchOverview();
    } catch (error) {
      setStatus(error.message || "Unable to send newsletter.");
    } finally {
      setSending("");
    }
  };

  const sendWishlistOffer = async (e) => {
    e.preventDefault();
    setStatus("");
    setSending("offer");

    try {
      const response = await fetch(
        "http://localhost:4000/admin/email/send-wishlist-offer",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...offer,
            productIds: selectedProducts,
          }),
        },
      );
      const data = await response.json();
      if (!data.success) throw new Error(data.errors || "Offer email failed");
      setOffer(initialOffer);
      setSelectedProducts([]);
      setStatus(`Wishlist offer sent to ${data.sent} users.`);
      await fetchOverview();
    } catch (error) {
      setStatus(error.message || "Unable to send wishlist offer.");
    } finally {
      setSending("");
    }
  };

  return (
    <div className="email-campaigns">
      <div className="email-campaigns-header">
        <div>
          <p>Email Campaigns</p>
          <h1>Send Offers</h1>
        </div>
        <div className="email-campaigns-count">
          <span>{overview.subscriberCount}</span>
          <p>Subscribers</p>
        </div>
      </div>

      {loading && <p className="email-campaigns-status">Loading campaign data...</p>}
      {status && <p className="email-campaigns-status">{status}</p>}

      <div className="email-campaigns-grid">
        <form className="email-campaigns-panel" onSubmit={sendNewsletter}>
          <h2>Normal Email</h2>
          <label>
            Subject
            <input
              value={newsletter.subject}
              onChange={(e) =>
                setNewsletter({ ...newsletter, subject: e.target.value })
              }
              placeholder="Weekend sale is live"
              required
            />
          </label>
          <label>
            Message
            <textarea
              value={newsletter.message}
              onChange={(e) =>
                setNewsletter({ ...newsletter, message: e.target.value })
              }
              placeholder="Tell all subscribers about your new offers."
              required
            />
          </label>
          <button disabled={sending === "newsletter"}>
            {sending === "newsletter" ? "Sending..." : "Send to Subscribers"}
          </button>
        </form>

        <form className="email-campaigns-panel" onSubmit={sendWishlistOffer}>
          <h2>Wishlisted Product Offer</h2>
          <label>
            Discount Percent
            <input
              type="number"
              min="1"
              max="90"
              value={offer.discountPercent}
              onChange={(e) =>
                setOffer({ ...offer, discountPercent: e.target.value })
              }
              required
            />
          </label>
          <label>
            Subject
            <input
              value={offer.subject}
              onChange={(e) => setOffer({ ...offer, subject: e.target.value })}
              placeholder="Your wishlisted item is on sale"
              required
            />
          </label>
          <label>
            Message
            <textarea
              value={offer.message}
              onChange={(e) => setOffer({ ...offer, message: e.target.value })}
              placeholder="A product you liked now has a limited-time discount."
              required
            />
          </label>
          <div className="email-campaigns-products">
            {topWishlisted.length === 0 && (
              <p>No wishlisted products found yet.</p>
            )}
            {topWishlisted.map((product) => (
              <label className="email-campaigns-product" key={product.id}>
                <input
                  type="checkbox"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => toggleProduct(product.id)}
                />
                <img src={product.image} alt={product.name} />
                <span>
                  <strong>{product.name}</strong>
                  <small>{product.wishlistCount} wishlist users</small>
                </span>
              </label>
            ))}
          </div>
          <button disabled={sending === "offer" || selectedProducts.length === 0}>
            {sending === "offer"
              ? "Sending..."
              : `Apply Offer and Notify ${selectedRecipientCount}`}
          </button>
        </form>
      </div>

      <div className="email-campaigns-history">
        <h2>Recent Campaigns</h2>
        {overview.campaigns.length === 0 && <p>No emails sent yet.</p>}
        {overview.campaigns.map((campaign) => (
          <div className="email-campaigns-history-row" key={campaign._id}>
            <span>{campaign.type}</span>
            <strong>{campaign.subject}</strong>
            <p>{campaign.sentCount}/{campaign.recipientCount} sent</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmailCampaigns;
