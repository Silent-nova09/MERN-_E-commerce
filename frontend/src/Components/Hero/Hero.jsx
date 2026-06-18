import './Hero.css';
import React from 'react';
import hand_icon from '../Assets/hand_icon.png';
import arrow_icon from '../Assets/arrow.png';
import hero_icon from '../Assets/hero_store.png';

function Hero() {
  const scrollToLatestCollection = () => {
    document
      .getElementById('new-collections')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className='hero'>
      <div className='hero-left'>
         <h2>STORE PICKS UPDATED DAILY</h2>
         <div>
            <div className='hero-hand-icon'>
                 <p>new</p>
                 <img src={hand_icon} alt='hand-icon'></img>
            </div>
            <p>Store</p>
            <p>Collection</p>
         </div>
         <button className='hero-latest-btn' onClick={scrollToLatestCollection}>
            <div>Latest Collection</div>
            <img src={arrow_icon} alt='arrow_icon'></img>
         </button>
      </div>
      <div className='hero-right'>
         <img src={hero_icon} alt='hero'></img>
      </div>
    </div>
  )
}

export default Hero
