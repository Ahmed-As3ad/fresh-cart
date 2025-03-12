import { useContext, useEffect, useState } from "react";
import { ContextCart } from "../../Context/ContextCart.tsx";
import toast, { Toaster } from "react-hot-toast";
import { ContextPay } from "../../Context/ContextPay.tsx";
import { useFormik } from "formik";
import { motion } from "framer-motion";
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, MenuItem, Select, InputLabel, FormControl, Box, Typography, IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { Add, Remove } from '@mui/icons-material';

// 🛠️ تعريف أنواع البيانات المستخدمة في التطبيق
interface Product {
  id: string;
  title: string;
  imageCover: string;
  price: number;
}

interface CartProduct {
  product: Product;
  count: number;
}

interface CartData {
  _id: string;
  products: CartProduct[];
}

export default function Cart() {
  const cartContext = useContext(ContextCart);
  const payContext = useContext(ContextPay);

  if (!cartContext || !payContext) {
    return <Typography align="center" color="error">Error: Context not available!</Typography>;
  }

  const { getProductsCart, deleteProductCart, updateProductCart, setCart, cart } = cartContext;

  const [productsCart, setProductsCart] = useState<CartData | null>(null);
  const [isCheckOut, setIsCheckOut] = useState(false);

  let formik = useFormik({
    initialValues: {
      floating_details: "",
      floating_phone: "",
      floating_city: "",
    },
    onSubmit: () => {
      if (!cart?._id) {
        toast.error("Cart ID is missing. Please reload the page.");
        return;
      }
      handleCheckOut(cart._id, "http://localhost:5173");
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
      await updateProductCart(productId, count);

      setCart((prevCart: CartData | null) => {
        if (!prevCart?.products) return prevCart;

        const updatedCart: CartData = {
          ...prevCart,
          products: prevCart.products.map((item) =>
            item.product.id === productId ? { ...item, count } : item
          ),
        };

        return updatedCart;
      });

      setProductsCart((prevProducts: CartData | null) => {
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
        `https://ecommerce.routemisr.com/api/v1/orders/checkout-session/${cartId}?url=${url}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            token: `${token}`
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
            {productsCart?.products?.map((product: CartProduct) => (
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
                    ${(product.product.price * product.count).toFixed(2)}
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
    </Box>
  );
}
