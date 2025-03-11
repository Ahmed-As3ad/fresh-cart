import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
const getToken = () => localStorage.getItem('userToken');

export const fetchCart = createAsyncThunk('cart/fetchCart', async () => {
  const token = getToken();
  if (!token) throw new Error('No user token found. Please log in.');
  const response = await fetch('https://ecommerce.routemisr.com/api/v1/cart', {
    headers: { token: `${token}` },
  });
  if (!response.ok) throw new Error('Failed to fetch cart');
  return response.json();
});

export const removeFromCart = createAsyncThunk('cart/removeItem', async (productId) => {
  const token = getToken();
  if (!token) {
    throw new Error('No user token found. Please log in.');
  }

  const response = await fetch(`https://ecommerce.routemisr.com/api/v1/cart/${productId}`, {
    method: 'DELETE',
    headers: { 
      'Content-Type': 'application/json', 
      token: `${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage = errorData?.message || 'Failed to remove item from cart';
    throw new Error(errorMessage);
  }

  return productId;
});

export const updateCartItem = createAsyncThunk('cart/updateItem', async (product) => {
  const token = getToken();
  if (!token) {
    throw new Error('No user token found. Please log in.');
  }

  const response = await fetch(`https://ecommerce.routemisr.com/api/v1/cart/${product?.id}`, {
    method: 'PUT',
    body: JSON.stringify({ count: product?.count }),
    headers: {
      'Content-Type': 'application/json',
      token: `${token}`,
    },
  });

  if (!response?.ok) {
    const errorData = await response.json();
    const errorMessage = errorData?.message || 'Failed to update item in cart';
    throw new Error(errorMessage);
  }

  return product; 
});

export const addToCart = createAsyncThunk('cart/addItem', async (productId) => {
  const token = getToken();
  if (!token) {
    throw new Error('No user token found. Please log in.');
  }

  const response = await fetch('https://ecommerce.routemisr.com/api/v1/cart', {
    method: 'POST',
    body: JSON.stringify({ productId }),
    headers: {
      'Content-Type': 'application/json',
      token: `${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response?.json();
    const errorMessage = errorData?.message || 'Failed to add item to cart';
    throw new Error(errorMessage);
  }

  return response.json();
});


const initialState = {
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
        if (action?.payload?.data?.products) {
          state.items = action.payload.data.products
            .map((item) => {
              if (item?.product?.id) { 
                return {
                  product: item.product,
                  count: item.count,
                  price: item.price,
                };
              }
              return null;
            })
            .filter(item => item !== null); 
        } else {
          state.items = [];
        }
        state.cartId = action.payload.data.cartId;
        state.loading = false;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action?.error?.message;
      })
      

      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        const removedId = action?.payload;
        state.items = state?.items?.filter(item => item?.product?.id !== removedId);
        state.loading = false;
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action?.error?.message;
      })
      

      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const updatedItem = action?.payload;
        state.items = state?.items?.map(item =>
          item.product.id === updatedItem.id ? updatedItem : item
        );
        state.loading = false;
      })
      .addCase(updateCartItem?.rejected, (state, action) => {
        state.loading = false;
        state.error = action?.error?.message;
      })
      

      .addCase(addToCart?.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart?.fulfilled, (state, action) => {
        const newItem = action?.payload?.data;
        state.items.push({
          product: newItem?.product,
          count: newItem?.count,
          price: newItem?.price,
        });
        state.loading = false;
      })
      .addCase(addToCart?.rejected, (state, action) => {
        state.loading = false;
        state.error = action?.error?.message;
      });
  },
});

export default cartSlice.reducer;
