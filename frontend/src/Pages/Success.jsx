import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import tick_mark from '../Components/Assets/tick_mark.webp';
import './CSS/Success.css';
import { ShopContext } from '../Context/ShopContext';

const Success = () => {
    const { refreshCart, refreshOrders } = useContext(ShopContext);

    useEffect(() => {
        refreshOrders();
        refreshCart();
    }, [refreshCart, refreshOrders]);

    return (
        <div className="success-container">
            <div className="success-message">
                <img src={tick_mark} className='success-img' alt='Payment successful'></img>
                <h1>Thank you for your purchase!</h1>
                <p>Your order has been placed successfully.</p>
            </div>
            <Link to="/orders" className="home-button">View Orders</Link>
        </div>
    );
};

export default Success;
