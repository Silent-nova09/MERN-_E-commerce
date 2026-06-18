import React, { useContext } from "react";
import { ShopContext } from "../Context/ShopContext";
import { useParams } from "react-router-dom";
import Breadcrums from "../Components/Breadcrums/Breadcrums";
import ProductDisplay from "../Components/ProductDisplay/ProductDisplay";
import Description from "../Components/Description/Description";
import RelatedProduct from "../Components/RelatedProducts/RelatedProduct";

function Product() {
  const { all_product } = useContext(ShopContext);
  const { productId } = useParams();
  const product = all_product.find((e) => e.id === Number(productId));

  if (!product) {
    return <div className="product-loading">Loading product...</div>;
  }

  return (
    <div>
      <Breadcrums product={product} />
      <ProductDisplay product={product} />
      <Description />
      <RelatedProduct />
    </div>
  );
}

export default Product;
