import { useContext, useEffect, useState } from "react";
import { ContextCart } from "../../Context/ContextCart.tsx";
import toast, { Toaster } from "react-hot-toast";
import { ContextPay } from "../../Context/ContextPay.tsx";
import { useFormik } from "formik";
import { motion } from "framer-motion";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem, Select, InputLabel, FormControl, Box, Typography, IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { Add, Remove } from '@mui/icons-material';

// 1. تعريف الأنواع بشكل دقيق
interface Product {
  id: string;
  title: string;
  imageCover: string;
  price: number;
}

interface CartItem {
  product: Product;
  count: number;
  price: number;
}

interface CartData {
  _id?: string;
  data?: {
    products?: CartItem[];
    _id?: string;
    cartOwner?: string;
    totalCartPrice?: number;
  };
  status?: string;
  numOfCartItems?: number;
}

export default function Cart() {
  const cartContext = useContext(ContextCart);
  const payContext = useContext(ContextPay);

  if (!cartContext || !payContext) {
    return <Typography align="center" color="error">Error: Context not available!</Typography>;
  }

  const { getProductsCart, deleteProductCart, updateProductCart, setCart, cart } = cartContext;

  // 2. تحديد نوع productsCart بدقة
  const [productsCart, setProductsCart] = useState<CartData | null>(null);
  const [isCheckOut, setIsCheckOut] = useState(false);

  const formik = useFormik({
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

  // 3. تحسين أنواع الدوال
  async function getItems() {
    try {
      const response = await getProductsCart();
      setProductsCart(response || null);
    } catch (error) {
      toast.error("Failed to load cart items.");
    }
  }

  async function deleteItem(productId: string) {
    try {
      await deleteProductCart(productId);
      getItems();
      toast.success("Product deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete product.");
    }
  }

  // 4. إصلاح أنواع المعلمات في updateItems
  async function updateItems(productId: string, count: number) {
    if (count < 1) return;
    try {
      await updateProductCart(productId, count);
      getItems();
    } catch (error) {
      toast.error("Failed to update quantity.");
    }
  }

  // 5. إصلاح الرابط واستخدام النصوص القالبية
  async function handleCheckOut(cartId: string, url: string) {
    try {
      const token = localStorage.getItem("userToken");
      if (!token) {
        toast.error("You are not logged in. Please log in first.");
        return;
      }

      const response = await fetch(
        `https://ecommerce.routemisr.com/api/v1/orders/checkout-session/${cartId}?url=${url}`,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            token: token,
          },
          body: JSON.stringify({
            shippingAddress: {
              details: formik.values.floating_details,
              phone: formik.values.floating_phone,
              city: formik.values.floating_city,
            },
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Payment failed");

      if (data.status === "success") {
        window.open(data.session.url, "_blank");
      }
    } catch (error: any) {
      toast.error(error.message || "Checkout request failed");
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
            {productsCart?.data?.products?.map((product) => (
              <TableRow key={product.product.id} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                <TableCell align="center">
                  <img
                    src={product.product.imageCover}
                    alt={product.product.title}
                    style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: '8px' }}
                  />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 500 }}>
                  {product.product.title}
                </TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                    <IconButton
                      size="small"
                      onClick={() => updateItems(product.product.id, product.count - 1)}
                      disabled={product.count <= 1}
                    >
                      <Remove />
                    </IconButton>
                    <TextField
                      value={product.count}
                      inputProps={{ style: { textAlign: "center" } }}
                      variant="outlined"
                      size="small"
                      sx={{ width: 50 }}
                      disabled
                    />
                    <IconButton
                      size="small"
                      onClick={() => updateItems(product.product.id, product.count + 1)}
                    >
                      <Add />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  ${(product.price * product.count).toFixed(2)}
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => deleteItem(product.product.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {isCheckOut && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 4 }}>
              <TextField
                label="Address"
                name="floating_details"
                value={formik.values.floating_details}
                onChange={formik.handleChange}
                fullWidth
                required
              />
              <TextField
                label="Phone number"
                name="floating_phone"
                value={formik.values.floating_phone}
                onChange={formik.handleChange}
                fullWidth
                required
              />
              <FormControl fullWidth required>
                <InputLabel>City</InputLabel>
                <Select
                  name="floating_city"
                  value={formik.values.floating_city}
                  onChange={formik.handleChange}
                  label="City"
                >
                  <MenuItem value="Cairo">Cairo</MenuItem>
                  <MenuItem value="Alexandria">Alexandria</MenuItem>
                  <MenuItem value="Giza">Giza</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Confirm Order
            </Button>
          </form>
        </motion.div>
      )}

      <Button
        variant="contained"
        sx={{ mt: 2, backgroundColor: isCheckOut ? "#B71C1C" : "primary.main" }}
        onClick={() => setIsCheckOut(!isCheckOut)}
        fullWidth
      >
        {isCheckOut ? "Cancel Checkout" : "Proceed to Checkout"}
      </Button>
    </Box>
  );
}