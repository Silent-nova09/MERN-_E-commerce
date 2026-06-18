import React, { useEffect, useState } from 'react'
import './NewCollections.css'
import Item from '../Items/Item'

function NewCollections() {

  const [newcollections,setnewcollections] = useState([]);

  useEffect(() =>{
    fetch('http://localhost:4000/newcollection')
    .then((resp) =>resp.json())
    .then((data) =>setnewcollections(data));
  },[])

  return (
    <div className='new-collections' id='new-collections'>
      <h1>NEW COLLECTIONS</h1>
      <hr/>
      <div className='collections'>
        {newcollections.map((item,i) =>{
            return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price}/>
        })}
      </div>
    </div>
  )
}

export default NewCollections
