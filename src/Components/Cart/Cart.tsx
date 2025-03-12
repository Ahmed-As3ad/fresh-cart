import { useContext, useEffect, useState } from "react";
import { ContextCart } from "../../Context/ContextCart.tsx";
import toast, { Toaster } from "react-hot-toast";
import { ContextPay } from "../../Context/ContextPayProvider.tsx";
import { useFormik } from "formik";
import { motion } from "framer-motion";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem, Select, InputLabel, FormControl, Box, Typography, IconButton, Grid } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { Add, Remove, ShoppingCart } from '@mui/icons-material';

export default function Cart() {
  let { getProductsCart, deleteProductCart, updateProductCart, setCart, cart } = useContext(ContextCart);
  let { checkOutSession } = useContext(ContextPay);
  const [productsCart, setProductsCart] = useState(null);
  const [isCheckOut, setIsCheckOut] = useState(false);

  let formik = useFormik({
    initialValues: {
      floating_details: "",
      floating_phone: "",
      floating_city: "",
    },
    onSubmit: () => handleCheckOut(cart.data?._id, "http://localhost:5173"),
  });

  async function getItems() {
    try {
      let response = await getProductsCart();
      setProductsCart(response?.data);
    } catch (error) {
      toast.error("Failed to load cart items.");
    }
  }

  async function deleteItem(productId) {
    try {
      let response = await deleteProductCart(productId);
      if (response?.status === 200) {
        setProductsCart(response?.data);
        setCart(response?.data);
        toast.success("Product deleted successfully!");
      }
    } catch (error) {
      toast.error("Failed to delete product.");
    }
  }

  async function updateItems(productId: number, count: number) {
    if (count < 1) return;
    try {
      const response = await updateProductCart(productId, count);
      setProductsCart(response?.data);
      toast.success("Quantity updated!");
    } catch (error) {
      toast.error("Failed to update quantity.");
    }
  }

  async function handleCheckOut(cartId: number, url: string) {
    if (!cartId) return toast.error("Cart ID is missing.");
    try {
      const { data } = await checkOutSession(cartId, url, formik.values);
      if (data.status === "success") {
        toast.success("Redirecting to payment...");
        window.location.href = data.session.url;
      }
    } catch (error) {
      toast.error("Checkout failed. Please try again.");
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
            {productsCart?.data?.products?.filter(Boolean).map((product: any) => (
              <TableRow key={product?.product?.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                <TableCell align="center">
                  <img
                    src={product?.product?.imageCover || "fallback-image.jpg"}
                    alt={product?.product?.title || "Product Image"}
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '8px' }}
                  />
                </TableCell>
                <TableCell align="center" sx={{ color: 'text.primary', fontWeight: 500 }}>
                  {product?.product?.title || "No Title"}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => product.count > 1 && updateItems(product?.product?.id, (product.count ?? 1) - 1)}
                      color="primary"
                      disabled={product.count <= 1}
                    >
                      <Remove />
                    </IconButton>
                    <TextField
                      value={product?.count ?? 0}
                      disabled
                      inputProps={{ style: { textAlign: "center" } }}
                      variant="outlined"
                      size="small"
                      sx={{ width: 50 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => updateItems(product?.product?.id, (product.count ?? 0) + 1)}
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
                  <IconButton
                    onClick={() => deleteItem(product?.product?.id)}
                    color="error"
                    size="large"
                    sx={{ padding: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button
          onClick={() => setIsCheckOut(!isCheckOut)}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': { backgroundColor: 'primary.dark' },
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <ShoppingCart /> Proceed to Checkout
        </Button>

        <Typography variant="h6" color="textSecondary" sx={{ fontWeight: 600 }}>
          Total: ${productsCart?.data?.totalCartPrice || 0}
        </Typography>
      </Box>

      {isCheckOut && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
              <TextField label="Address" name="floating_details" value={formik.values.floating_details} onChange={formik.handleChange} fullWidth required />
              <TextField label="Phone number" name="floating_phone" value={formik.values.floating_phone} onChange={formik.handleChange} fullWidth required />
              <FormControl fullWidth required>
                <InputLabel>City</InputLabel>
                <Select name="floating_city" value={formik.values.floating_city} onChange={formik.handleChange}>
                  <MenuItem value="Cairo">Cairo</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Button type="submit" variant="contained" color="primary" fullWidth>Confirm Order</Button>
          </form>
        </motion.div>
      )}
    </Box>
  );
}
