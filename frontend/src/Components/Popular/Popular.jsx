import React, { useEffect, useState } from 'react';
import './Popular.css';
import Item from '../Items/Item';

const categoryLabels = {
  women: 'Women',
  men: 'Men',
  kid: 'Kids',
};

function Popular() {

  const [popular,setpopular] = useState({})

  useEffect(() =>{
    fetch('http://localhost:4000/popular')
    .then((resp) =>resp.json())
    .then((data) =>setpopular(data));
  },[])

  return (
    <div className='popular'>
       {Object.entries(categoryLabels).map(([category, label]) => (
        <section className='popular-category' key={category}>
          <h1>POPULAR IN {label.toUpperCase()}</h1>
          <hr/>
          <div className='popular-item'>
            {(popular[category] || []).map((item) =>{
                return <Item key={item.id} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price}/>
            })}
          </div>
        </section>
       ))}
    </div>
  )
}

export default Popular
