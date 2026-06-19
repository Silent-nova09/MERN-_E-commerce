import React, { useState } from 'react'
import './CSS/LoginSignup.css'
import { Link } from 'react-router-dom'

function LoginSignup() {

  const [state,setstate] = useState("Login")

  const login = async()=>{
     console.log("login fn",formData);
     let responseData;
    await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:4000"}/login`,{
      method : 'POST',
      headers : {
        Accept : 'application/form-data',
        'Content-Type' : 'application/json',
      },
      body : JSON.stringify(formData),
    }).then((resp) =>resp.json())
    .then((data) =>{responseData = data})
    if(responseData.success){
      localStorage.setItem('auth-token',responseData.token)
      if(responseData.verify){
        window.location.replace("/verify")
      }else{
        window.location.replace("/");
      }
    }else{
      alert(responseData.errors)
    }
  }

  const signup = async()=>{
    console.log("signup fn",formData);
    let responseData;
    await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:4000"}/signup`,{
      method : 'POST',
      headers : {
        Accept : 'application/form-data',
        'Content-Type' : 'application/json',
      },
      body : JSON.stringify(formData),
    }).then((resp) =>resp.json())
    .then((data) =>{responseData = data})
    if(responseData.success){
      localStorage.setItem('auth-token',responseData.token)
      window.location.replace("/verify");
    }else{
      alert(responseData.errors)
    }
  }

  const [formData,setFormData] = useState({
    username : "",
    email : "",
    password : ""
  })

  const changeHandler = (e)=>{
     setFormData({...formData,[e.target.name]:e.target.value})
  }

  return (
    <div className='loginsignup'>
      <div className='loginsignup-container'>
        <h1>{state}</h1>
        <div className='loginsignup-fields'>
          {state==="Sign Up"?<><input name='username' value={formData.username} onChange={changeHandler} type='text' placeholder='Your Name'></input> 
          <input name='email' value={formData.email} onChange={changeHandler} type='email' placeholder='Email Address'></input>
          <input name='password' value={formData.password} onChange={changeHandler} type='password' placeholder='Password'></input></>
          : <>
          <input name='email' value={formData.email} onChange={changeHandler} type='email' placeholder='Email Address'></input>
          <input name='password' value={formData.password} onChange={changeHandler} type='password' placeholder='Password'></input>
          <Link to='/ForgotPassword'><span className='update'>forgot password?</span></Link>
          </>}
          
        </div>
        <button onClick={() =>{state==="Login"?login():signup()}}>Continue</button>
        {state==="Sign Up"?
        <p className='loginsignup-login'>Already have an account? <span onClick={() =>setstate("Login")}>Login</span></p>
        :<p className='loginsignup-login'>Create an account? <span onClick={() =>setstate("Sign Up")}>Sign Up</span></p>}
        <div className='loginsignup-agree'>
          <input type='checkbox' name='' id=''></input>
          <p>By continuing, i agree to the terms of use & privacy policy</p>
        </div>
      </div>
    </div>
  )
}

export default LoginSignup
