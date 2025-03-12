import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const getToken = () => localStorage.getItem('userToken');

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const token = getToken();
    if (!token) throw new Error('No user token found. Please log in.');

    const response = await fetch('https://ecommerce.routemisr.com/api/v1/cart', {
      headers: { token: `${token}` },
    });

    if (!response.ok) throw new Error('Failed to fetch cart');

    return await response.json();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

export const removeFromCart = createAsyncThunk('cart/removeItem', async (productId: string, { rejectWithValue }) => {
  try {
    const token = getToken();
    if (!token) throw new Error('No user token found. Please log in.');

    const response = await fetch(`https://ecommerce.routemisr.com/api/v1/cart/${productId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', token: `${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || 'Failed to remove item from cart');
    }

    toast.success('Item removed from cart!');
    return productId;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

export const updateCartItem = createAsyncThunk('cart/updateItem', async (product: { id: string; count: number }, { rejectWithValue }) => {
  try {
    const token = getToken();
    if (!token) throw new Error('No user token found. Please log in.');

    const response = await fetch(`https://ecommerce.routemisr.com/api/v1/cart/${product.id}`, {
      method: 'PUT',
      body: JSON.stringify({ count: product.count }),
      headers: { 'Content-Type': 'application/json', token: `${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || 'Failed to update item in cart');
    }

    toast.success('Cart item updated!');
    return product;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

export const addToCart = createAsyncThunk('cart/addItem', async (productId: string, { rejectWithValue }) => {
  try {
    const token = getToken();
    if (!token) throw new Error('No user token found. Please log in.');

    const response = await fetch('https://ecommerce.routemisr.com/api/v1/cart', {
      method: 'POST',
      body: JSON.stringify({ productId }),
      headers: { 'Content-Type': 'application/json', token: `${token}` },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.message || 'Failed to add item to cart');
    }

    const data = await response.json();
    toast.success('Item added to cart!');
    return data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    toast.error(errorMessage);
    return rejectWithValue(errorMessage);
  }
});

interface CartItem {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
  };
  count: number;
  price: number;
}

interface CartState {
  items: CartItem[];
  cartId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  cartId: null,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload?.data?.products || [];
        state.cartId = action.payload?.data?.cartId || null;
        state.loading = false;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.product.id !== action.payload);
        state.loading = false;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.items = state.items.map(item => 
          item.product.id === action.payload.id ? { ...item, count: action.payload.count } : item
        );
        state.loading = false;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        const newItem = action.payload?.data;
        if (newItem) {
          state.items.push({
            product: newItem.product,
            count: newItem.count,
            price: newItem.price,
          });
        }
        state.loading = false;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default cartSlice.reducer;
