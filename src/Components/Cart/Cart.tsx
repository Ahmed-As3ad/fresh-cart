import { useContext, useEffect, useState } from "react";
import { ContextCart } from "../../Context/ContextCart.tsx";
import toast, { Toaster } from "react-hot-toast";
import { ContextPay } from "../../Context/ContextPay.tsx";
import { useFormik } from "formik";
import { motion } from "framer-motion";
import { useNavigate } from 'react-router-dom';

import { 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TextField, 
  MenuItem, 
  Select, 
  InputLabel, 
  FormControl, 
  Box, 
  Typography, 
  IconButton, 
  Card, 
  CardContent, 
  Divider,
  InputAdornment,
  FormHelperText,
  Chip
} from "@mui/material";

import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import PaymentIcon from '@mui/icons-material/Payment';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Product {
  id: string;
  title: string;
  imageCover: string;
  price: number;
  category?: {
    name: string;
  };
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
  const navigate = useNavigate();

  if (!cartContext || !payContext) {
    return <Typography align="center" color="error">Error: Context not available!</Typography>;
  }

  const { getProductsCart, deleteProductCart, updateProductCart, cart } = cartContext;

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
    } catch (error) {
      toast.error("Failed to delete product.");
    }
  }

  async function handleClearCart() {
    try {
      // If you have a dedicated API endpoint for clearing the cart, use that
      // Otherwise, delete each item individually
      if (productsCart?.data?.products) {
        const deletePromises = productsCart.data.products.map(item => 
          deleteProductCart(item.product.id)
        );
        await Promise.all(deletePromises);
        getItems();
        toast.success("Cart cleared successfully");
      }
    } catch (error) {
      toast.error("Failed to clear cart");
    }
  }

  async function updateItems(productId: string, count: number) {
    if (count < 1) return;
    try {
      await updateProductCart(productId, count);
      getItems();
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
    <Box 
      sx={{ 
        width: '95%', 
        maxWidth: '1200px',
        margin: '2rem auto', 
        padding: { xs: 2, md: 4 }, 
        backgroundColor: 'white', 
        borderRadius: 3, 
        boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}
    >
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" color="primary" fontWeight="600" sx={{ display: 'flex', alignItems: 'center' }}>
          <ShoppingCartIcon sx={{ mr: 1.5 }} /> Your Cart
          <Chip 
            label={`${productsCart?.data?.products?.length || 0} items`} 
            size="small" 
            color="primary" 
            sx={{ ml: 2, fontWeight: 500 }} 
          />
        </Typography>
        
        {(productsCart?.data?.products ?? []).length > 0 && (
  <Button 
    startIcon={<DeleteSweepIcon />} 
    color="error" 
    variant="text" 
    size="small"
    onClick={() => handleClearCart()}
  >
    Clear Cart
  </Button>
)}

      </Box>

      {!productsCart?.data?.products?.length ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <RemoveShoppingCartIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>Your cart is empty</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Looks like you haven't added anything to your cart yet.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<LocalMallIcon />}
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </Button>
        </Box>
      ) : (
        <>
          {/* Product List - Desktop */}
          <TableContainer 
            sx={{ 
              display: { xs: 'none', md: 'block' },
              marginBottom: 4,
              '& .MuiTableCell-root': {
                borderBottom: '1px solid rgba(0,0,0,0.08)'
              }
            }}
          >
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                <TableRow>
                  <TableCell align="left" sx={{ fontWeight: 600 }}>Product</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Price</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Quantity</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Subtotal</TableCell>
                  <TableCell align="right" width="60px"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productsCart?.data?.products?.map((product) => (
                  <TableRow key={product.product.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <img
                          src={product.product.imageCover}
                          alt={product.product.title}
                          style={{ 
                            width: 70, 
                            height: 70, 
                            objectFit: 'cover', 
                            borderRadius: '8px',
                            marginRight: '16px'
                          }}
                        />
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5 }}>
                            {product.product.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {product.product.category?.name || 'General Category'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body1">${product.price.toFixed(2)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        border: '1px solid rgba(0,0,0,0.12)', 
                        borderRadius: 1,
                        overflow: 'hidden'
                      }}>
                        <IconButton
                          size="small"
                          onClick={() => updateItems(product.product.id, product.count - 1)}
                          disabled={product.count <= 1}
                          sx={{ 
                            borderRadius: 0,
                            '&.Mui-disabled': {
                              color: 'rgba(0,0,0,0.26)',
                              bgcolor: 'rgba(0,0,0,0.02)'
                            }
                          }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography 
                          variant="body2" 
                          component="div" 
                          sx={{ 
                            minWidth: '40px', 
                            textAlign: 'center',
                            fontWeight: 500 
                          }}
                        >
                          {product.count}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateItems(product.product.id, product.count + 1)}
                          sx={{ borderRadius: 0 }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        ${(product.price * product.count).toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        onClick={() => deleteItem(product.product.id)} 
                        color="error"
                        size="small"
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: 'rgba(211, 47, 47, 0.04)'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Product List - Mobile */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4 }}>
            {productsCart?.data?.products?.map((product) => (
              <Card 
                key={product.product.id} 
                sx={{ 
                  mb: 2, 
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  overflow: 'visible'
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <img
                      src={product.product.imageCover}
                      alt={product.product.title}
                      style={{ 
                        width: 80, 
                        height: 80, 
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        marginRight: '12px'
                      }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5 }}>
                        {product.product.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        ${product.price.toFixed(2)} each
                      </Typography>
                      
                      <Box sx={{ 
                        mt: 1,
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Box sx={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          border: '1px solid rgba(0,0,0,0.12)', 
                          borderRadius: 1,
                          overflow: 'hidden'
                        }}>
                          <IconButton
                            size="small"
                            onClick={() => updateItems(product.product.id, product.count - 1)}
                            disabled={product.count <= 1}
                            sx={{ 
                              borderRadius: 0,
                              padding: '4px',
                              '&.Mui-disabled': {
                                color: 'rgba(0,0,0,0.26)',
                                bgcolor: 'rgba(0,0,0,0.02)'
                              }
                            }}
                          >
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography 
                            variant="body2" 
                            component="div" 
                            sx={{ 
                              minWidth: '32px', 
                              textAlign: 'center',
                              fontWeight: 500 
                            }}
                          >
                            {product.count}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => updateItems(product.product.id, product.count + 1)}
                            sx={{ borderRadius: 0, padding: '4px' }}
                          >
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          ${(product.price * product.count).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton 
                      onClick={() => deleteItem(product.product.id)} 
                      color="error"
                      size="small"
                      sx={{ 
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        '&:hover': { 
                          backgroundColor: 'rgba(211, 47, 47, 0.04)'
                        }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Order Summary */}
          <Box 
            sx={{ 
              borderTop: '1px solid rgba(0,0,0,0.08)',
              pt: 3,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4
            }}
          >
            <Box sx={{ flex: 1 }}>
              {isCheckOut && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    Shipping Information
                  </Typography>
                  <form onSubmit={formik.handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3 }}>
                      <TextField
                        label="Delivery Address"
                        name="floating_details"
                        value={formik.values.floating_details}
                        onChange={formik.handleChange}
                        error={formik.touched.floating_details && Boolean(formik.errors.floating_details)}
                        helperText={formik.touched.floating_details && formik.errors.floating_details}
                        fullWidth
                        required
                        placeholder="Enter your complete address"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <HomeIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        label="Phone Number"
                        name="floating_phone"
                        value={formik.values.floating_phone}
                        onChange={formik.handleChange}
                        error={formik.touched.floating_phone && Boolean(formik.errors.floating_phone)}
                        helperText={formik.touched.floating_phone && formik.errors.floating_phone}
                        fullWidth
                        required
                        placeholder="For delivery coordination"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <FormControl 
                        fullWidth 
                        required
                        error={formik.touched.floating_city && Boolean(formik.errors.floating_city)}
                      >
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
                          <MenuItem value="Sharm El Sheikh">Sharm El Sheikh</MenuItem>
                          <MenuItem value="Luxor">Luxor</MenuItem>
                          <MenuItem value="Aswan">Aswan</MenuItem>
                        </Select>
                        {formik.touched.floating_city && formik.errors.floating_city && (
                          <FormHelperText>{formik.errors.floating_city}</FormHelperText>
                        )}
                      </FormControl>
                    </Box>
                  </form>
                </motion.div>
              )}
            </Box>

            <Box sx={{ 
              width: { xs: '100%', md: '380px' },
              bgcolor: 'rgba(0,0,0,0.02)',
              p: 3,
              borderRadius: 2
            }}>
              <Typography variant="h6" gutterBottom>
                Order Summary
              </Typography>
              
              <Box sx={{ 
                mb: 3,
                '& > div': {
                  display: 'flex',
                  justifyContent: 'space-between',
                  py: 1
                }
              }}>
                <div>
                  <Typography variant="body1">Subtotal</Typography>
                  <Typography variant="body1" fontWeight="600">
                    ${productsCart?.data?.totalCartPrice?.toFixed(2) || '0.00'}
                  </Typography>
                </div>
                
                <div>
                  <Typography variant="body1">Shipping</Typography>
                  <Typography variant="body1">
                    {(productsCart?.data?.totalCartPrice ?? 0) > 100 ? 'Free' : '$5.99'}
                  </Typography>
                </div>
                
                {(productsCart?.data?.totalCartPrice ?? 0) > 100 && (
                  <div>
                    <Typography variant="body2" color="success.main">
                      Free shipping discount
                    </Typography>
                    <Typography variant="body2" color="success.main">
                      -$5.99
                    </Typography>
                  </div>
                )}
                
                <Divider sx={{ my: 1 }} />
                
                <div>
                  <Typography variant="h6">Total</Typography>
                  <Typography variant="h6" color="primary.main" fontWeight="600">
                    ${((productsCart?.data?.totalCartPrice || 0) + 
                        ((productsCart?.data?.totalCartPrice || 0) > 100 ? 0 : 5.99)).toFixed(2)}
                  </Typography>
                </div>
              </Box>

              {isCheckOut ? (
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  fullWidth
                  startIcon={<CheckCircleIcon />}
                  onClick={() => formik.handleSubmit()}
                  sx={{ 
                    py: 1.5,
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                  }}
                >
                  Complete Order
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  startIcon={<PaymentIcon />}
                  onClick={() => setIsCheckOut(true)}
                  sx={{ 
                    py: 1.5,
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
                  }}
                >
                  Proceed to Checkout
                </Button>
              )}
              
              {isCheckOut && (
                <Button
                  variant="text"
                  color="inherit"
                  size="medium"
                  fullWidth
                  onClick={() => setIsCheckOut(false)}
                  sx={{ mt: 2 }}
                >
                  Back to Cart
                </Button>
              )}
              
              <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed rgba(0,0,0,0.08)' }}>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1 
                  }}
                >
                  <LockIcon fontSize="small" /> Secure Checkout
                </Typography>
              </Box>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}