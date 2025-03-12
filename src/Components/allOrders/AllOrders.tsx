import { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Button, Grid, CircularProgress, Divider, Alert, IconButton } from "@mui/material";
import { motion } from "framer-motion";
import { CheckCircle, Cancel, Refresh } from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";

interface Order {
  _id: string;
  status: string;
  createdAt: string;
  totalOrderPrice: number;
  paymentMethodType: string;
  isPaid: boolean;
}

const AllOrders = () => {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem("userToken");

  let userId: string | null = null;
  if (token) {
    try {
      const decoded: any = jwtDecode(token);
      userId = decoded.id || decoded.userId;
    } catch (err) {
      console.error("Invalid token:", err);
      setError("Invalid token. Please login again.");
    }
  }

  const fetchOrders = async () => {
    if (!userId) {
      setError("Please login first");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://ecommerce.routemisr.com/api/v1/orders/user/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setError("No orders found");
        setOrders([]);
      }
    } catch (error) {
      setError("Error fetching orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchOrders();
    }
  }, [userId]);

  return (
    <Box sx={{ padding: 4, maxWidth: "1200px", margin: "auto" }}>
    <Typography variant="h4" align="center" color="primary" gutterBottom sx={{ fontWeight: "bold" }}>
      🛍️ Your Orders
    </Typography>
  
    {error && (
      <Alert severity="error" sx={{ marginBottom: 2, display: "flex", alignItems: "center" }}>
        {error}
        <IconButton onClick={fetchOrders} sx={{ marginLeft: "auto" }} color="inherit">
          <Refresh />
        </IconButton>
      </Alert>
    )}
  
    {loading ? (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
        <CircularProgress sx={{ color: "primary.main", animation: "pulse 1.5s infinite" }} />
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: 5,
                  padding: 2,
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "scale(1.05)",
                    boxShadow: 10,
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Order ID: {order._id}
                  </Typography>
                  <Divider sx={{ marginBottom: 2 }} />
  
                  <Typography variant="body2" color="textSecondary">
                    <strong>Status:</strong>{" "}
                    <Typography
                      component="span"
                      sx={{
                        fontWeight: "bold",
                        color: order.status === "Delivered" ? "green" : "red",
                      }}
                    >
                      {order.status}
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Total Price:</strong>{" "}
                    <Typography component="span" sx={{ fontWeight: "bold", color: "primary.main" }}>
                      ${order.totalOrderPrice}
                    </Typography>
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Payment Method:</strong> {order.paymentMethodType}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    <strong>Paid:</strong>{" "}
                    <Typography component="span" sx={{ fontWeight: "bold", color: order.isPaid ? "green" : "red" }}>
                      {order.isPaid ? "Yes" : "No"}
                    </Typography>
                  </Typography>
  
                  <Box sx={{ display: "flex", justifyContent: "center", gap: 2, marginTop: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        transition: "background 0.3s",
                        "&:hover": { background: "green" },
                      }}
                    >
                      Delivered
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Cancel />}
                      sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        transition: "background 0.3s",
                        "&:hover": { background: "red" },
                      }}
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