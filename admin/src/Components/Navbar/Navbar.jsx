import './Navbar.css';
import React, { useState } from 'react'
import navlogo from '../../Assets/nav-logo.svg'

function Navbar({ owner, onLogout }) {
  const [open,setOpen] = useState(false)
  const displayName = owner?.name || owner?.username || 'Owner'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className='navbar'>
      <img src={navlogo} alt='logo' className='nav-logo'></img>
      <div className='owner-menu'>
        <button onClick={() => setOpen(!open)} className='owner-menu-trigger'>
          <span className='owner-avatar'>{initial}</span>
          <span className='owner-summary'>
            <strong>{displayName}</strong>
            <small>{owner?.role || 'owner'}</small>
          </span>
        </button>
        {open && (
          <div className='owner-dropdown'>
            <p>Signed in as <strong>{owner?.username}</strong></p>
            <button onClick={onLogout}>Logout</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Navbar
