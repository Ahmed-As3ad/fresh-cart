import { configureStore } from '@reduxjs/toolkit';
import userReducer from './UserToken/userSlice';
import cartReducer from './Cart/cartSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    cart: cartReducer,
  },
});