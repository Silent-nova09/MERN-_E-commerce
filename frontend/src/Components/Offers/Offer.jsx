import React from 'react';
import { Link } from 'react-router-dom';
import './Offer.css';
import exclusive_image from '../Assets/exclusive_image.png';

function Offer() {
  return (
    <div className='offers'>
      <div className='offers-left'>
          <p className='offers-kicker'>Offers For You</p>
          <h1>Recommended</h1>
          <h1>Products For You</h1>
          <p className='offers-copy'>Wishlist offers, smart picks, and top discounts in one place</p>
          <Link to='/offers-for-you'>Check Now</Link>
      </div>
      <div className='offers-right'>
          <img src={exclusive_image} alt='offers'></img>
      </div>
    </div>
  )
}

export default Offer
