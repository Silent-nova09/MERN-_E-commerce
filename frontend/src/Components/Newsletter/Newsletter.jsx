import './Newsletter.css';
import React, { useState } from 'react'

function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const subscribe = async (e) => {
    e.preventDefault();
    setStatus('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/subscribe', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.errors || 'Subscription failed');
      }

      setEmail('');
      setStatus('Subscribed successfully.');
    } catch (error) {
      setStatus(error.message || 'Unable to subscribe right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='newsletter'>
      <h1>Get Exclusive Offers On Your Email</h1>
      <p>Subscribe to our newsletter and stay updated</p>
      <form onSubmit={subscribe}>
        <input
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        ></input>
        <button disabled={loading}>{loading ? 'Saving...' : 'Subscribe'}</button>
      </form>
      {status && <p className='newsletter-status'>{status}</p>}
    </div>
  )
}

export default Newsletter
