import './App.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setIsLogin } from './libs/UserToken/userSlice';

import Home from './Components/Home/Home';
import Layout from './Components/Layout/Layout';
import Login from './Components/Login/Login';
import ProductDetails from './Components/ProductDetails/ProductDetails';
import Register from './Components/Register/Register';
import Brands from './Components/Brands/Brands';
import WishList from './Components/wish list/WishList';
import Categories from './Components/Categories/Categories';
import Cart from './Components/Cart/Cart';
import ProtectedRoute from './Components/ProtectedRoute/ProtectedRoute';
import ForgotPassword from './Components/Authentication/ForgotPassword';
import VerifyPassword from './Components/Authentication/VerifyResetCode';
import ResetPassword from './Components/Authentication/ResetPassword';
import ChangePassword from './Components/Authentication/ChangePassword';
import AllOrders from './Components/allOrders/AllOrders';

function App() {
  const dispatch = useDispatch();

  const routers = createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        { path: '/', element: <ProtectedRoute><Home /></ProtectedRoute> },
        { path: '/register', element: <Register /> },
        { path: '/cart', element: <ProtectedRoute><Cart /></ProtectedRoute> },
        { path: '/wishlist', element: <ProtectedRoute><WishList /></ProtectedRoute> },
        { path: '/categories', element: <ProtectedRoute><Categories /></ProtectedRoute> },
        { path: '/brands', element: <ProtectedRoute><Brands /></ProtectedRoute> },
        { path: '/allorders', element: <ProtectedRoute><AllOrders /></ProtectedRoute> },
        { path: '/login', element: <Login /> },
        { path: '/forgot-password', element: <ForgotPassword /> },
        { path: '/verify-code', element: <VerifyPassword /> },
        { path: '/reset-password', element: <ResetPassword /> },
        { path: '/change-password', element: <ProtectedRoute><ChangePassword /></ProtectedRoute> },
        { path: '/productdetails/:id/:category', element: <ProtectedRoute><ProductDetails /></ProtectedRoute> },
      ],
    },
  ]);

  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    if (userToken) {
      dispatch(setIsLogin(userToken));
    }
  }, [dispatch]);

  return <RouterProvider router={routers} />;
}

export default App;
