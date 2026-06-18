import "./Listproduct.css";
import React, { useEffect, useState } from "react";
import cross_icon from "../../Assets/cross_icon.png";

function Listproduct() {
  const [allproducts, setAllproducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    old_price: "",
    new_price: "",
    category: "women",
    stock: "",
    rating: "",
    image: "",
    description: "",
  });

  const fetchInfo = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("http://localhost:4000/allproducts");
      if (!response.ok) {
        throw new Error("Backend returned an error while loading products.");
      }
      const data = await response.json();
      setAllproducts(data);
    } catch (fetchError) {
      setError(
        fetchError.message ||
          "Unable to reach the backend. Make sure the server is running on port 4000.",
      );
      setAllproducts([]);
    } finally {
      setLoading(false);
    }
  };

  const remove_product = async (id) => {
    await fetch("http://localhost:4000/deleteproduct", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: id }),
    });
    await fetchInfo();
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || "",
      old_price: product.old_price || "",
      new_price: product.new_price || "",
      category: product.category || "women",
      stock: product.stock || "",
      rating: product.rating || "",
      image: product.image || "",
      description: product.description || "",
    });
  };

  const closeEdit = () => {
    setEditingProduct(null);
  };

  const changeHandler = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:4000/updateproduct", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: editingProduct.id,
        updates: editForm,
      }),
    });
    const data = await response.json();
    if (data.success) {
      await fetchInfo();
      closeEdit();
    } else {
      alert(data.errors || "Update failed. Please try again.");
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  return (
    <div className="listproduct">
      <h1>All Products List</h1>
      {loading && <p className="listproduct-status">Loading products...</p>}
      {error && <p className="listproduct-status listproduct-error">{error}</p>}
      <div className="listproduct-format-main">
        <p>Product</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Stock</p>
        <p>Rating</p>
        <p>Actions</p>
      </div>
      <div className="listproduct-allproducts">
        <hr />
        {!loading && !error && allproducts.length === 0 && (
          <p className="listproduct-status">No products found.</p>
        )}
        {allproducts.map((product, index) => {
          return (
            <>
              <div
                key={index}
                className="listproduct-format-main listproduct-format"
              >
                <img
                  src={product.image}
                  alt=""
                  className="listproduct-product-icon"
                ></img>
                <p>{product.name}</p>
                <p>${product.old_price}</p>
                <p>${product.new_price}</p>
                <p>{product.category}</p>
                <p>{product.stock}</p>
                <p>{product.rating}</p>
                <div className="listproduct-actions">
                  <button
                    onClick={() => openEdit(product)}
                    className="listproduct-edit-btn"
                  >
                    Edit
                  </button>
                  <img
                    onClick={() => remove_product(product.id)}
                    className="listproduct-remove-icon"
                    src={cross_icon}
                    alt=""
                  ></img>
                </div>
              </div>
              <hr />
            </>
          );
        })}
      </div>
      {editingProduct && (
        <div className="editproduct-overlay">
          <form className="editproduct-panel" onSubmit={saveEdit}>
            <div className="editproduct-header">
              <div>
                <p>Editing product #{editingProduct.id}</p>
                <h2>Update Product Details</h2>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                className="editproduct-close"
              >
                Close
              </button>
            </div>
            <div className="editproduct-grid">
              <label>
                Product title
                <input
                  name="name"
                  value={editForm.name}
                  onChange={changeHandler}
                  required
                />
              </label>
              <label>
                Category
                <select
                  name="category"
                  value={editForm.category}
                  onChange={changeHandler}
                >
                  <option value="women">Women</option>
                  <option value="men">Men</option>
                  <option value="kid">Kids</option>
                </select>
              </label>
              <label>
                Old price
                <input
                  name="old_price"
                  type="number"
                  step="0.01"
                  value={editForm.old_price}
                  onChange={changeHandler}
                  required
                />
              </label>
              <label>
                New price
                <input
                  name="new_price"
                  type="number"
                  step="0.01"
                  value={editForm.new_price}
                  onChange={changeHandler}
                  required
                />
              </label>
              <label>
                Stock
                <input
                  name="stock"
                  type="number"
                  value={editForm.stock}
                  onChange={changeHandler}
                  required
                />
              </label>
              <label>
                Rating
                <input
                  name="rating"
                  type="number"
                  step="0.1"
                  value={editForm.rating}
                  onChange={changeHandler}
                  required
                />
              </label>
              <label className="editproduct-wide">
                Image URL
                <input
                  name="image"
                  value={editForm.image}
                  onChange={changeHandler}
                  required
                />
              </label>
              <label className="editproduct-wide">
                Description
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={changeHandler}
                  placeholder="Write product details"
                ></textarea>
              </label>
            </div>
            <div className="editproduct-preview">
              <img src={editForm.image} alt="" />
              <div>
                <h3>{editForm.name}</h3>
                <p>{editForm.category}</p>
                <strong>${editForm.new_price}</strong>
              </div>
            </div>
            <div className="editproduct-footer">
              <button
                type="button"
                onClick={closeEdit}
                className="editproduct-cancel"
              >
                Cancel
              </button>
              <button type="submit" className="editproduct-save">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Listproduct;
