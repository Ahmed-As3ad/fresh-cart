import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    isLogin: false,
    userToken: null,
    userData: null, 
  },
  reducers: {
    setIsLogin: (state, action) => {
      state.isLogin = true;
      state.userToken = action.payload.token;
      state.userData = action.payload.userData; 
    },
    logout: (state) => {
      state.isLogin = false;
      state.userToken = null;
      state.userData = null;
    },
  },
});

export const { setIsLogin, logout } = userSlice.actions;

export default userSlice.reducer;
