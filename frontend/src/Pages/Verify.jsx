import React, { useState } from 'react'
import '../Pages/CSS/Verify.css'

function Verify() {

  const [formData,setFormData] = useState({
    email : "",
    otp : "",
  })

  const changeHandler = (e) =>{
    setFormData({...formData,[e.target.name] : e.target.value});
  }

  const handleClick = async() =>{
      console.log("verification",formData);
      let responseData;
      if(localStorage.getItem('auth-token')){
      await fetch('http://localhost:4000/verify',{
        method : 'POST',
        headers : {
          Accept : 'application/form-data',
          'auth-token' : `${localStorage.getItem('auth-token')}`,
          'Content-Type' : 'application/json',
        },
        body : JSON.stringify(formData),
      }).then((resp) =>resp.json())
      .then((data) =>responseData=data)
      if(responseData.success){
        window.location.replace("/");
      }else{
        alert(responseData.errors);
      }
    }
  }

  return (
    <div className='verify'>
      <h1>Verify your Email</h1>
      <hr/>
      <div className='verification'>
          <input className='verify-otp' onChange={changeHandler} placeholder='Enter OTP' type='text' name='otp' value={formData.otp}></input>
          <button onClick={handleClick} className='verify-button'>Continue</button>
      </div>
    </div>
  )
}

export default Verify
