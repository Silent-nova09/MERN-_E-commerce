import React, { useState } from 'react'
import './CSS/ForgotPassword.css'

function ForgotPassword() {

  const [Email,setemail] = useState('');

  const changeHandler = (e) =>{
      setemail(e.target.value);
  }

  const clickHandler = async() =>{
    await fetch('http://localhost:4000/forgotpassword',{
        method : 'POST',
        headers : {
          Accept : 'application/json',
          'Content-Type' : 'application/json',
        },
        body : JSON.stringify({"Email" : Email}),
      }).then((resp) =>resp.json())
      .then((data) =>{
        console.log(data);
        if(data.success){
            window.location.replace('/login')
        }
      })
  }

  return (
    <div className='forgot'>
        <h1>Forgot Password</h1>
        <hr/>
      <input className='forgot-input' onChange={changeHandler} type='email' placeholder='Enter email' name='email' value={Email}></input>
      <button onClick={clickHandler} className='forgot-btn'>Send Mail</button>
    </div>
  )
}

export default ForgotPassword
