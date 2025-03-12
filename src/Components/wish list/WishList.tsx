import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { Box, Grid, Card, CardContent, CardMedia, Typography, Button, CircularProgress } from "@mui/material";
import Loading from "../Loading/Loading";
import { toast } from "react-hot-toast";

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

  try {
    const response = await axios.get<ApiResponse>(
      "https://ecommerce.routemisr.com/api/v1/wishlist",
      {
        headers: { token },
      }
    );
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem("userToken");
      window.location.href = "/login";
    }
    throw new Error("حدث خطأ أثناء جلب قائمة الرغبات");
  }
};

const removeFromWishlist = async (productId: string): Promise<void> => {
  const token = localStorage.getItem("userToken");
  if (!token) throw new Error("الرجاء تسجيل الدخول أولاً");

  try {
    await axios.delete(
      `https://ecommerce.routemisr.com/api/v1/wishlist/${productId}`,
      { headers: { token } }
    );
  } catch (error) {
    throw new Error("تعذر حذف المنتج من قائمة الرغبات");
  }
};

export default function Wishlist() {
  const queryClient = useQueryClient();

  const {
    data: wishlistItems = [],
    isLoading,
    isError,
    error,
  } = useQuery<Product[]>({
    queryKey: ["wishlist"],
    queryFn: fetchWishlist,
  });

  const mutation = useMutation<void, AxiosError, string>({
    mutationFn: removeFromWishlist,
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries(["wishlist"]);
      
      const storedWishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const updatedWishlist = storedWishlist.filter((item: Product) => item._id !== productId);
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      
      toast.success("تم حذف المنتج بنجاح");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "حدث خطأ أثناء الحذف");
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", minHeight: "50vh", textAlign: "center" }}>
        <Typography color="error">{error instanceof Error ? error.message : "حدث خطأ غير متوقع"}</Typography>
      </Box>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", minHeight: "50vh", textAlign: "center" }}>
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
    </Box>
  );
}
