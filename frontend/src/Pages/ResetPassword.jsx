import React, { useState } from 'react'
import './CSS/ResetPassword.css'
import { useParams } from 'react-router-dom';

function ResetPassword() {

  const [newpassword,setnewpassword] = useState({
    new : "",
    confirm : ""
  });
  const {id} = useParams();

  const changeHandler = (e) =>{
    setnewpassword({...newpassword,[e.target.name] : e.target.value})
  }

  const clickHandler = async() =>{
    await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:4000"}/resetpassword/${id}`,{
        method : 'POST',
        headers : {
          Accept : 'application/json',
          'Content-Type' : 'application/json',
        },
        body : JSON.stringify({"new" : newpassword.new,"confirm" : newpassword.confirm}),
      }).then((resp) =>resp.json())
      .then((data) =>{
        console.log(data);
        if(data.success){
            window.location.replace('/login')
        }else{
            alert(data.errors);
        }
      })
  }

  return (
    <div className='reset'>
      <h1>Reset Password</h1>
      <hr/>
      <input className='reset-password' onChange={changeHandler} type='text' placeholder='Enter new password' name='new' value={newpassword.new}></input>
      <input className='reset-password' onChange={changeHandler} type='text' placeholder='Confirm new password' name='confirm' value={newpassword.confirm}></input>
      <button onClick={clickHandler} className='reset-btn'>Continue</button>
    </div>
  )
}

export default ResetPassword
