import './App.css';
import Navbar from './Components/Navbar/Navbar';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Store from './Pages/Store';
import ShopCategory from './Pages/ShopCategory';
import Product from './Pages/Product';
import  Cart from './Pages/Cart';
import LoginSignup from './Pages/LoginSignup';
import Footer from './Components/Footer/Footer';
import men_banner from './Components/Assets/banner_mens.png';
import women_banner from './Components/Assets/banner_women.png';
import kids_banner from './Components/Assets/banner_kids.png';
import WishlistedItems from './Pages/WishlistedItems';
import Verify from './Pages/Verify';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import AddressForm from './Pages/Address';
import Success from './Pages/Success';
import Orders from './Pages/Orders';
import OffersForYou from './Pages/OffersForYou';

function App() {
  return (
    <div>
      <BrowserRouter>
         <Navbar/>
         <Routes>
           <Route path='/' element={<Store/>}/>
           <Route path='/mens' element={<ShopCategory banner={men_banner} category='men'/>}/>
           <Route path='/womens' element={<ShopCategory banner={women_banner} category='women'/>}/>
           <Route path='/kids' element={<ShopCategory banner={kids_banner} category='kid'/>}/>
           <Route path='/product' element={<Product/>}>
             <Route path=':productId' element={<Product/>} />
           </Route>
           <Route path='/cart' element={<Cart/>}/>
           <Route path='/wishlist' element={<WishlistedItems/>}/>
           <Route path='/login' element={<LoginSignup/>}/>
           <Route path='/ForgotPassword' element={<ForgotPassword />}/>
           <Route path='/verify' element={<Verify/>}/>
           <Route path='/reset-password/:id' element={<ResetPassword/>}/>
           <Route path='/address' element={<AddressForm/>}/>
           <Route path='/success' element={<Success/>}/>
           <Route path='/orders' element={<Orders/>}/>
           <Route path='/offers-for-you' element={<OffersForYou/>}/>
           {/* <Route path='/failure' element={<Failure/>}/> */}
         </Routes>
         <Footer/>
      </BrowserRouter>
    </div>
  );
}

export default App;
