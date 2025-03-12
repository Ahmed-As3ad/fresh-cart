import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Button, Grid, CircularProgress, Divider, Alert } from "@mui/material";
import { motion } from "framer-motion";
import { CheckCircle, Cancel } from '@mui/icons-material';

// تعريف الواجهات لتجنب أخطاء TypeScript
interface Product {
  _id: string;
  product: {
    title: string;
  };
  count: number;
  price: number;
}

interface Order {
  _id: string;
  status: string;
  createdAt: string;
  totalPrice: number;
  products: Product[];
}

const AllOrders = () => {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('userToken');

  const fetchUserData = async () => {
    try {
      const response = await fetch(`https://ecommerce.routemisr.com/api/v1/users/getMe`, {
        headers: {
          'token': `${token}`, 
        },
      });
      const data = await response.json();
      
      if (data?.data?._id) {
        setUserId(data.data._id);
      } else {
        setError("Failed to get user data");
      }
    } catch (error) {
      setError("Connection error");
      console.error("Error:", error);
    }
  };

  const fetchOrders = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const response = await fetch(`https://ecommerce.routemisr.com/api/v1/orders`, {
        headers: {
          'token': `${token}`, 
        },
      });
      const data = await response.json();
      
      if (data?.status === "success") {
        setOrders(data?.data || []);
      } else {
        setError("No orders found");
        setOrders([]);
      }
      setLoading(false);
    } catch (error) {
      setError("Error fetching orders");
      setOrders([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUserData();
    } else {
      setError("Please login first");
    }
  }, [token]);

  useEffect(() => {
    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  return (
    <Box sx={{ padding: 4, maxWidth: '1200px', margin: 'auto' }}>
      <Typography variant="h4" align="center" color="primary" gutterBottom>
        All Your Orders
      </Typography>

      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <CircularProgress />
        </Box>
      ) : orders && orders.length === 0 ? (
        <Typography variant="h6" align="center" color="textSecondary">
          You have no orders yet.
        </Typography>
      ) : (
        <Grid container spacing={4}>
          {orders?.map((order) => (
            <Grid item xs={12} sm={6} md={4} key={order._id}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card sx={{ borderRadius: 2, boxShadow: 3, padding: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Order ID: {order._id}
                    </Typography>
                    <Divider sx={{ marginBottom: 2 }} />

                    <Typography variant="body2" color="textSecondary">
                      <strong>Status:</strong> {order.status}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      <strong>Total Price:</strong> ${order.totalPrice}
                    </Typography>

                    {Array.isArray(order.products) && order.products.length > 0 ? (
                      order.products.map((product) => (
                        <Box key={product._id} sx={{ marginBottom: 2 }}>
                          <Typography variant="body2" color="textPrimary">
                            <strong>{product.product.title}</strong> x {product.count} - ${product.price * product.count}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No products in this order.
                      </Typography>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        sx={{ textTransform: 'none' }}
                      >
                        Delivered
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<Cancel />}
                        sx={{ textTransform: 'none' }}
                      >
                        Cancelled
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AllOrders;
