import './Navbar.css';
import React, { useContext, useRef, useState } from 'react';
import Logo from '../Assets/logo.png'
import cart_icon from '../Assets/cart_icon.png';
import { Link } from 'react-router-dom';
import { ShopContext } from '../../Context/ShopContext';
import nav_dropdown from '../Assets/drop_down.webp';
import wishlist from '../Assets/wishlist.jpg';
import order_icon from '../Assets/order.jpg';

function Navbar() {

  const [menu,setMenu] = useState("store");
  const {totalCount} = useContext(ShopContext);
  const menuref = useRef();

  const dropdown_toggle = (e)=>{
    menuref.current.classList.toggle('nav-menu-visible');
    e.target.classList.toggle('open');
  }

  return (
    <div className='navbar'>
      <div className='nav-logo'>
        <img src={Logo} alt='Logo'></img>
        <p>Shopsy</p>
      </div>
      <img className='nav-dropdown' onClick={dropdown_toggle} src={nav_dropdown} alt='menu'></img>
      <ul ref={menuref} className='nav-menu'>
        <li onClick={() => setMenu("store")}><Link style={{textDecoration : 'none'}} to='/'>Store</Link>{menu === "store" ? <hr/> : <></>}</li>
        <li onClick={() => setMenu("men")}><Link style={{textDecoration : 'none'}} to='/mens'>Men</Link>{menu === "men" ? <hr/> : <></>}</li>
        <li onClick={() => setMenu("women")}><Link style={{textDecoration : 'none'}} to='/womens'>Women</Link>{menu === "women" ? <hr/> : <></>}</li>
        <li onClick={() => setMenu("kids")}><Link style={{textDecoration : 'none'}} to='kids'>Kids</Link>{menu === "kids" ? <hr/> : <></>}</li>
      </ul>
      <div className='nav-login-cart'>
        {localStorage.getItem('auth-token') ? <button onClick={() =>{localStorage.removeItem('auth-token');window.location.replace("/")}}>Logout</button> : <Link style={{textDecoration : 'none'}} to='/login'><button>Login</button></Link>}
        <Link style={{textDecoration : 'none'}} to='/wishlist'><img className='wishlist_icon' src={wishlist} alt='Wishlist'></img></Link>
        <Link style={{textDecoration : 'none'}} to='/orders'><img className='wishlist_icon' src={order_icon} alt='Wishlist'></img></Link>
        <Link style={{textDecoration : 'none'}} to='/cart'><img src={cart_icon} alt='Cart'></img></Link>
        <div className="nav-cart-count">{totalCount()}</div>
      </div>
    </div>
  )
}

export default Navbar
