import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import Loading from "../Loading/Loading";

interface Product {
  _id: string;
  name: string;
  price: number;
  imageCover: string;
}

interface ApiResponse {
  data: Product[];
}

const fetchWishlist = async (): Promise<Product[]> => {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("الرجاء تسجيل الدخول أولاً");

  const response = await axios.get<ApiResponse>(
    "https://ecommerce.routemisr.com/api/v1/wishlist",
    {
      headers: { token: `${token}` },
    }
  );
  return response.data.data;
};

const removeFromWishlist = async (productId: string): Promise<void> => {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("الرجاء تسجيل الدخول أولاً");

  await axios.delete(
    `https://ecommerce.routemisr.com/api/v1/wishlist/${productId}`,
    { headers: { token: `${token}` } }
  );
};

export default function Wishlist() {
  const [openSnackbar, setOpenSnackbar] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState("");
  const queryClient = useQueryClient();

  const {
    data: wishlistItems,
    isLoading,
    isError,
    error,
  } = useQuery<Product[]>({
    queryKey: ["wishlist"],
    queryFn: fetchWishlist,
    onError: (err: AxiosError) => {
      if (err.response?.status === 401) {
        localStorage.removeItem("userToken");
        window.location.href = "/login";
      }
    },
  });

  const mutation = useMutation<void, AxiosError, string>({
    mutationFn: removeFromWishlist,
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries(["wishlist"]);
      const storedWishlist = localStorage.getItem("wishlist")
        ? JSON.parse(localStorage.getItem("wishlist") || "[]")
        : [];

      const updatedWishlist = storedWishlist.filter(
        (item: Product) => item._id !== productId
      );

      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));

      setSnackbarMessage("تم حذف المنتج بنجاح");
      setOpenSnackbar(true);
    },
    onError: (err) => {
      setSnackbarMessage(
        err.response?.data?.message || "حدث خطأ أثناء الحذف"
      );
      setOpenSnackbar(true);
    },
  });

  if (isLoading) {
    return (
     <Loading />
    );
  }

  if (isError) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", minHeight: "50vh" }}>
        <Alert severity="error">
          {error instanceof Error ? error.message : "حدث خطأ غير متوقع"}
        </Alert>
      </Box>
    );
  }

  if (!wishlistItems?.length) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", minHeight: "50vh" }}>
        <Typography variant="h6">قائمة الرغبات فارغة</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        قائمة رغباتي
      </Typography>
      <Grid container spacing={3}>
        {wishlistItems.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product._id}>
            <Card sx={{ borderRadius: 2, boxShadow: 3, transition: "transform 0.2s" }}>
              <CardMedia
                component="img"
                height="200"
                image={product.imageCover}
                alt={product.name}
                sx={{ objectFit: "cover" }}
              />
              <CardContent>
                <Typography gutterBottom variant="h6">
                  {product.name}
                </Typography>
                <Typography variant="body1" color="primary" sx={{ fontWeight: "bold" }}>
                  {product.price} جنيه
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => mutation.mutate(product._id)}
                  disabled={mutation.isLoading}
                >
                  {mutation.isLoading ? <CircularProgress size={24} /> : "حذف من القائمة"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          severity={mutation.isError ? "error" : "success"}
          onClose={() => setOpenSnackbar(false)}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
