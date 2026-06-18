import React, { useState } from 'react';
import './Description.css';

function Description() {
  const [review, setReview] = useState(false);

  const handleClick = (e) => {
    const name = e.currentTarget.getAttribute('name');
    if (name === 'description') {
      setReview(false);
    } else if (name === 'review') {
      setReview(true);
    }
  };

  // const handleCheck = (e) =>{
  //   const name = e.currentTarget.getAttribute('name');
  //   if(name )
  // }

  return (
    <div className='description'>
      <div className='navigator'>
        <div
          name='description'
          className={`nav-box ${!review ? 'active' : ''}`}
          onClick={handleClick}
        >
          Description
        </div>
        <div
          name='review'
          className={`nav-box ${review ? 'active' : ''}`}
          onClick={handleClick}
        >
          Reviews
        </div>
      </div>
      {!review ? (
        <div className='descriptionbox'>
          <p>
            Lorem ipsum dolor, sit amet consectetur adipisicing elit. Inventore
            natus impedit quos praesentium omnis vitae ipsum dicta maxime corrupti
            eum molestiae, animi officia ullam? Ipsa eligendi quos quisquam impedit!
            Beatae? Reprehenderit autem exercitationem sapiente obcaecati consequuntur
            dicta a harum mollitia voluptatem iste dolor,
          </p>
          <p>
            Accusamus commodi odit, totam est reiciendis minima officiis delectus id
            libero eum incidunt alias velit possimus fugiat, cumque aliquid aliquam
            iusto excepturi impedit ad magni eaque repellat voluptas. Non, eum.
          </p>
        </div>
      ) : (
        <div className='descriptionbox'>
          <p className='heading'>Give your rating here</p>
          <div className='star-body'>
            {/* <p name='1' className='star' onClick={handleCheck}>★</p>
            <p name='2' className='star' onClick={handleCheck}>★</p>
            <p name='3' className='star' onClick={handleCheck}>★</p>
            <p name='4' className='star' onClick={handleCheck}>★</p>
            <p name='5' className='star' onClick={handleCheck}>★</p> */}
            <p>hello</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Description;
