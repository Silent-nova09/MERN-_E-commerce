import './Wishlist.css'
import React, { useContext } from 'react'
import Item from '../Items/Item'
import { ShopContext } from '../../Context/ShopContext';

function Wishlist() {
  const {all_product,wishlist} = useContext(ShopContext);

//   useEffect(() =>{
      
//   },[])

  return (
    <div className='wishlist'>
       <h1>Wishlist</h1>
       <hr/>
       <div className='wishlist-item'>
        {all_product.map((item,i) =>{
            if(wishlist[item.id] === 1){
                return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price}/>
            }
            return null;
        })}
       </div>
    </div>
  )
}

export default Wishlist 
