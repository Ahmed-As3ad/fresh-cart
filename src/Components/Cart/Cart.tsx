import { useContext, useEffect, useState } from "react";
import { ContextCart } from "../../Context/ContextCart.tsx";
import toast, { Toaster } from "react-hot-toast";
import { ContextPay } from "../../Context/ContextPay.tsx";
import { useFormik } from "formik";
import { motion } from "framer-motion";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem, Select, InputLabel, FormControl, Box, Typography, IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { Add, Remove } from '@mui/icons-material';

export default function Cart() {
  const cartContext = useContext(ContextCart);
  const payContext = useContext(ContextPay);

  if (!cartContext || !payContext) {
    return <Typography align="center" color="error">Error: Context not available!</Typography>;
  }

  const { getProductsCart, deleteProductCart, updateProductCart, setCart, cart } = cartContext;

  const [productsCart, setProductsCart] = useState<any>(null);
  const [isCheckOut, setIsCheckOut] = useState(false);

  let formik = useFormik({
    initialValues: {
      floating_details: "",
      floating_phone: "",
      floating_city: "",
    },
    onSubmit: () => {
      if (!cart?.data?._id) {
        toast.error("Cart ID is missing. Please reload the page.");
        return;
      }
      handleCheckOut(cart.data._id, "http://localhost:5173");
    },
  });

  async function getItems() {
    try {
      const response = await getProductsCart();
      if (response?.data) {
        setCart(response.data);
        setProductsCart(response.data);
      }
    } catch (error) {
      toast.error("Failed to load cart items.");
    }
  }
  

  async function deleteItem(productId: string) {
    try {
      await deleteProductCart(productId);
      getItems();
    } catch (error) {
      toast.error("Failed to delete product.");
    }
  }

  async function updateItems(productId: string, count: number) {
    if (count < 1) return;
  
    try {
      const response = await updateProductCart(productId, count);
  
      setCart((prevCart) => {
        if (!prevCart?.products) return prevCart;
  
        const updatedCart = {
          ...prevCart,
          products: prevCart.products.map((item) =>
            item.product.id === productId ? { ...item, count } : item
          ),
        };
  
        return updatedCart;
      });
  
      setProductsCart((prevProducts) => {
        if (!prevProducts?.products) return prevProducts;
  
        return {
          ...prevProducts,
          products: prevProducts.products.map((item) =>
            item.product.id === productId ? { ...item, count } : item
          ),
        };
      });
  
    } catch (error) {
      toast.error("Failed to update quantity.");
    }
  }
  

  async function handleCheckOut(cartId: string, url: string) {
    try {
      const token = localStorage.getItem("userToken"); 
  
      if (!token) {
        toast.error("You are not logged in. Please log in first.");
        return;
      }
  
      const response = await fetch(
       " https://ecommerce.routemisr.com/api/v1/orders/checkout-session/${cartId}?url=${url}",
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            token: `ّ${token}`,
          },
          body: JSON.stringify({
            shippingAddress: {
              details: formik.values.floating_details.trim(),
              phone: formik.values.floating_phone.trim(),
              city: formik.values.floating_city.trim(),
            },
          }),
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(`Server Error: ${data.message || "Unknown error"}`);
      }
      
  
      if (data.status === "success") {
        toast.success("Redirecting to payment...");
        window.open(data.session.url, "_blank");
      } else {
        toast.error(`Checkout failed: ${data.message || "Unknown error"}`);
      }
      
    } catch (error) {
      console.error("❌ Checkout Error:", error);
      toast.error("Checkout request failed. Please try again.");
    }
  }
  
  
  

  useEffect(() => {
    getItems();
  }, []);

  return (
    <Box sx={{ width: '90%', margin: 'auto', padding: 4, backgroundColor: 'white', borderRadius: 2, boxShadow: 3 }}>
      <Toaster position="top-center" reverseOrder={false} />
      <Typography variant="h4" align="center" color="primary" gutterBottom>
        Your Shopping Cart
      </Typography>

      <TableContainer sx={{ marginBottom: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Image</TableCell>
              <TableCell align="center">Product</TableCell>
              <TableCell align="center">Qty</TableCell>
              <TableCell align="center">Price</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {productsCart?.products?.map((product: any) => (
              product?.product ? (
                <TableRow key={product.product.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                  <TableCell align="center">
                    <img
                      src={product.product.imageCover || "fallback-image.jpg"}
                      alt={product.product.title || "Product Image"}
                      style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '8px' }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ color: 'text.primary', fontWeight: 500 }}>
                    {product.product.title || "No Title"}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                      <IconButton
                        size="small"
                        onClick={() => product.count > 1 && updateItems(product.product.id, product.count - 1)}
                        color="primary"
                        disabled={product.count <= 1}
                      >
                        <Remove />
                      </IconButton>
                      <TextField
                        value={product.count ?? 0}
                        disabled
                        inputProps={{ style: { textAlign: "center" } }}
                        variant="outlined"
                        size="small"
                        sx={{ width: 50 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => updateItems(product.product.id, product.count + 1)}
                        color="primary"
                      >
                        <Add />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    ${((product?.price ?? 0) * (product?.count ?? 0)).toFixed(2)}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => deleteItem(product.product.id)} color="error" size="large" sx={{ padding: 1 }}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ) : null
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {isCheckOut && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
              <TextField label="Address" name="floating_details" value={formik.values.floating_details} onChange={formik.handleChange} fullWidth required />
              <TextField label="Phone number" name="floating_phone" value={formik.values.floating_phone} onChange={formik.handleChange} fullWidth required />
              <FormControl fullWidth variant="outlined" required>
                <InputLabel>City</InputLabel>
                <Select
                  name="floating_city"
                  value={formik.values.floating_city}
                  onChange={formik.handleChange}
                  label="City"
                >
                  <MenuItem value="">Select a City</MenuItem>
                  <MenuItem value="Alexandria">Alexandria</MenuItem>
                  <MenuItem value="Aswan">Aswan</MenuItem>
                  <MenuItem value="Cairo">Cairo</MenuItem>
                  <MenuItem value="Giza">Giza</MenuItem>
                  <MenuItem value="Luxor">Luxor</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Button type="submit" variant="contained" color="primary" fullWidth>Confirm Order</Button>
          </form>
        </motion.div>
      )}

      <Button variant="contained" sx={{ mt: 2,  backgroundColor: isCheckOut ? "#B71C1C" : "green" }} fullWidth onClick={() => setIsCheckOut(!isCheckOut)}>
        {isCheckOut ? "Cancel Checkout" : "Proceed to Checkout"}
      </Button>
    </Box>
  );
}