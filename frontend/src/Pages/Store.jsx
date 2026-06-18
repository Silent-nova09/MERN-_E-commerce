import React from 'react'
import Hero from '../Components/Hero/Hero'
import Popular from '../Components/Popular/Popular'
import RecommendedProducts from '../Components/RecommendedProducts/RecommendedProducts'
import Offers from '../Components/Offers/Offer'
import NewCollections from '../Components/NewCollections/NewCollections'
import Newsletter from '../Components/Newsletter/Newsletter'

function Store() {
  return (
    <div>
      <Hero/>
      <Popular/>
      <RecommendedProducts/>
      <Offers />
      <NewCollections/>
      <Newsletter/>
    </div>
  )
}

export default Store
