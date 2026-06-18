import './Sidebar.css'
import React from 'react'
import {Link} from 'react-router-dom'
import add_product from '../../Assets/Product_Cart.svg'
import list_product from '../../Assets/Product_list_icon.svg'

function Sidebar() {
  return (
    <div className='sidebar'>
      <Link to={'/dashboard'} style={{textDecoration : "none"}}>
         <div className='sidebar-item'>
            <img src={list_product} alt='icon'></img>
            <p>Dashboard</p>
         </div>
      </Link>
      <Link to={'/addproduct'} style={{textDecoration : "none"}}>
         <div className='sidebar-item'>
            <img src={add_product} alt='icon'></img>
            <p>Add Product</p>
         </div>
      </Link>
      <Link to={'/listproduct'} style={{textDecoration : "none"}}>
         <div className='sidebar-item'>
            <img src={list_product} alt='icon'></img>
            <p>Product List</p>
         </div>
      </Link>
      <Link to={'/updateproduct'} style={{textDecoration : "none"}}>
         <div className='sidebar-item'>
            <img src={list_product} alt='icon'></img>
            <p>Update Product</p>
         </div>
      </Link>
      <Link to={'/email-campaigns'} style={{textDecoration : "none"}}>
         <div className='sidebar-item'>
            <img src={list_product} alt='icon'></img>
            <p>Email Campaigns</p>
         </div>
      </Link>
    </div>
  )
}

export default Sidebar
