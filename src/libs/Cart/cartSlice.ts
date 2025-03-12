import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const getToken = () => localStorage.getItem('userToken');

export const addToCartAction = createAsyncThunk(
  'cart/addItem',
  async (productId: string, { rejectWithValue }) => {
    try {
      const token = getToken();
      if (!token) throw new Error('يجب تسجيل الدخول أولاً');

      const response = await fetch('https://ecommerce.routemisr.com/api/v1/cart', {
        method: 'POST',
        body: JSON.stringify({ productId }),
        headers: { 
          'Content-Type': 'application/json', 
          token: token 
        },
      });

      const data = await response.json();
      
      if (data.status !== "success") {
        throw new Error(data.message || "فشل في إضافة المنتج");
      }

      toast.success("تمت الإضافة إلى السلة بنجاح!");
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "خطأ غير معروف";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

interface CartItem {
  product: {
    id: string;
    title: string;
    price: number;
    imageCover: string;
  };
  count: number;
  price: number;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addToCartAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartAction.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addToCartAction.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default cartSlice.reducer;