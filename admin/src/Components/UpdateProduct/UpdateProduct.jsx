import { useState } from 'react'
import './UpdateProduct.css'
import React from 'react'

function UpdateProduct() {
  
  const [product,setproduct] = useState({
    id : "",
    options : "",
    newvalue : "",
  })

  const changeHandler = (e) =>{
     setproduct({...product,[e.target.name] : e.target.value});
  }  

  const handleClick = async() =>{
    await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:4000"}/updateproduct`,{
        method : 'POST',
        headers : {
          Accept : 'application/json',
          'Content-Type' : 'application/json'
        },
        body : JSON.stringify({"id" : product.id,"options" : product.options,"newvalue" : product.newvalue}),
      }).then(resp =>resp.json())
      .then((data) => {
        if(data.success){
            alert("Updated Successfully")
        }else{
            alert("Try again");
        }
      });
  }

  return (
    <div className='update'>
        <h1>Update Product</h1>
      <div className='update-items'>
        <input onChange={changeHandler} placeholder='Enter ID' className='update-input' type='text' name='id'></input>
      </div>
      <div className='selector'>
        <select style={{height : 40}} onChange={changeHandler} name='options'>
            <option value='name'>Title</option>
            <option value='category'>Category</option>
            <option value='old_price'>Old-price</option>
            <option value='new_price'>New-price</option>
        </select>
      </div>
      <input onChange={changeHandler} placeholder='Enter the new value' className='update-input update-val' type='text' name='newvalue'></input>
      <button onClick={handleClick} className='update-btn'>Submit</button>
    </div>
  )
}

export default UpdateProduct
