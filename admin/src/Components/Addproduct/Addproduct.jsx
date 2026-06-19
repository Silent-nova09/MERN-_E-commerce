import './Addproduct.css'
import React, { useState } from 'react'
import upload_area from '../../Assets/upload_area.svg'

function Addproduct() {
  const [image,setimage] = useState(false);
  const [productDetails,setproductDetails] = useState({
    name : "",
    new_price : "",
    old_price : "",
    category : "women",
    stock : "",
    image : "",
    description : ""
  });

  const imageHandler = (e) =>{
    setimage(e.target.files[0]);
  }

  const changeHandler = (e) =>{
    setproductDetails({...productDetails,[e.target.name] : e.target.value});
  }

  const Add_product = async() =>{
    console.log(productDetails);
    let product = productDetails;
    let responseData;
    let formdata = new FormData();
    formdata.append('product',image)

    await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/upload`,{
      method : 'POST',
      headers : {
        accept : 'application/json',
      },
      body : formdata,
    }).then((resp) => resp.json()).then((data) =>{responseData = data})

    if(responseData.success){
      product.image = responseData.image_url;
      console.log(product);
      await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/addproduct`,{
        method : 'POST',
        headers : {
          accept : 'application/json',
          'Content-Type' : 'application/json',
        },
        body : JSON.stringify(product),
      }).then((resp) => resp.json()).then((data) =>{
        data.success ? alert("Successfully added") : alert("Failed! Please try again")
      })

    }
  }

  return (
    <div className='addproduct'>
      <div className='addproduct-itemfield'>
        <p>Product title</p>
        <input onChange={changeHandler} type='text' name='name' placeholder='Type here'></input>
      </div>
      <div className='addproduct-price'>
        <div className='addproduct-itemfield'>
            <p>Price</p>
            <input onChange={changeHandler} type='text' name='old_price' placeholder='Type here'></input>
        </div>
        <div className='addproduct-itemfield'>
            <p>Offer Price</p>
            <input onChange={changeHandler} type='text' name='new_price' placeholder='Type here'></input>
        </div>
      </div>
      <div className='addproduct-itemfield'>
        <p>Product Category</p>
        <select onChange={changeHandler} name='category' className='addproduct-selector'>
            <option value='women'>Women</option>
            <option value='men'>Men</option>
            <option value='kid'>Kids</option>
        </select>
      </div>
      <div className='addproduct-itemfield addproduct-stock-field'>
        <p>Available Stock</p>
        <input onChange={changeHandler} type='number' min='0' name='stock' placeholder='Enter stock quantity'></input>
      </div>
      <div className='addproduct-itemfield'>
        <p>Product Description</p>
        <textarea onChange={changeHandler} name='description' placeholder='Write product details'></textarea>
      </div>
      <div className='addproduct-itemfield'>
        <label htmlFor='file-input'>
            <img src={image ? URL.createObjectURL(image): upload_area} className='addproduct-thumnail-img'></img>
        </label>
        <input onChange={imageHandler} type='file' name='image' id='file-input' hidden></input>
      </div>
      <button onClick={() => Add_product()} className='addproduct-btn'>ADD</button>
    </div>
  )
}

export default Addproduct
