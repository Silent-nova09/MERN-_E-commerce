import React from 'react'

function Payment() {

  const checkout = async()=>{
    try{
        const res = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:4000"}/payment`,{
            method:"POST",
            headers:{
                "auth-token": `${localStorage.getItem("auth-token")}`,
                "Content-Type":"application/json",
            },
            mode:"cors",
            body:JSON.stringify({
                items:[
                    {
                        id:1,
                        quantity:1,
                        price:100,
                        name:"red"
                    },
                ]
            })
        });
        const data = await res.json();
        window.location = data.url;
    }catch(error){
        console.log(error);
    }
  }

  return (
    <div className='payment'>
      <button onClick={checkout}>check</button>
    </div>
  )
}

export default Payment
