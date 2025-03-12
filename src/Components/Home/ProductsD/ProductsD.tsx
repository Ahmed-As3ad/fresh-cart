import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Box, Button, Card, CardContent, CardMedia, IconButton, Typography } from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import InfoIcon from "@mui/icons-material/Info";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { Link } from "react-router-dom";

interface Product {
  _id: string;
  imageCover: string;
  category: {
    name: string;
  };
  title: string;
  price: number;
}

export default function ProductCard({ prod }: { prod: Product }) {
  const { _id, imageCover, category, title, price } = prod;
  const queryClient = useQueryClient();
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const storedWishlist: Product[] = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setIsLiked(storedWishlist.some((item) => item._id === _id));
  }, [_id]);

  const addToWishlist = async (): Promise<void> => {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("يجب تسجيل الدخول أولاً");

    const response = await fetch("https://ecommerce.routemisr.com/api/v1/wishlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: token,
      },
      body: JSON.stringify({ productId: _id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "فشل إضافة المنتج إلى المفضلة");
    }
  };

  const mutation = useMutation({
    mutationFn: addToWishlist,
    onSuccess: () => {
      const storedWishlist: Product[] = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const updatedWishlist = [...storedWishlist, prod];
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      setIsLiked(true);
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("تمت الإضافة إلى المفضلة");
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع";
      toast.error(errorMessage);
    },
  });

  const handleLikeClick = () => {
    if (!localStorage.getItem("userToken")) {
      toast.error("يجب تسجيل الدخول أولاً");
      return;
    }
    if (isLiked) return;
    mutation.mutate();
  };

  return (
    <Card
    sx={{
      borderRadius: "16px",
      boxShadow: 6,
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      "&:hover": { transform: "scale(1.05)", boxShadow: 10 },
      position: "relative",
      bgcolor: "white",
      overflow: "hidden",
    }}
  >
    <IconButton
      sx={{
        position: "absolute",
        top: 8,
        left: 8,
        zIndex: 2,
        color: isLiked ? "#FF3D00" : "#BDBDBD",
        bgcolor: "rgba(255,255,255,0.8)",
        transition: "color 0.3s ease, transform 0.2s ease",
        "&:hover": {
          color: isLiked ? "#D32F2F" : "error.main",
          transform: "scale(1.2)",
        },
      }}
      onClick={handleLikeClick}
    >
      {isLiked ? <FavoriteIcon fontSize="medium" /> : <FavoriteBorderIcon fontSize="medium" />}
    </IconButton>

    <Link to={`/productdetails/${_id}/${category.name}`} style={{ textDecoration: "none" }}>
      <CardMedia
        component="img"
        height="220"
        image={imageCover}
        alt={title}
        sx={{
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          objectFit: "cover",
          transition: "opacity 0.3s ease",
          "&:hover": { opacity: 0.9 },
        }}
      />
    </Link>
  
    <CardContent sx={{ p: 2, position: "relative" }}>
      <Box
        sx={{
          position: "absolute",
          top: 10,
          right: 10,
          bgcolor: "#FF5722",
          color: "white",
          px: 2,
          py: 0.5,
          borderRadius: "8px",
          fontSize: "0.875rem",
          fontWeight: "bold",
          boxShadow: 3,
        }}
      >
        {category.name || "عام"}
      </Box>
  
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          color: "text.primary",
          height: "3em",
          mt: 3,
          overflow: "hidden",
          textOverflow: "ellipsis",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          transition: "color 0.3s ease",
          "&:hover": { color: "#FF5722" },
        }}
      >
        {title.split(" ").slice(0, 3).join(" ")}
      </Typography>
  
      <Typography
        variant="h5"
        sx={{
          color: "#388E3C",
          fontWeight: "bold",
          transition: "color 0.3s ease",
          "&:hover": { color: "#2E7D32" },
        }}
      >
        {price.toLocaleString()} جنيه
      </Typography>
    </CardContent>

    <Button
      component={Link}
      to={`/productdetails/${_id}/${category.name}`}
      fullWidth
      sx={{
        backgroundColor: "#FF5722",
        color: "white",
        borderRadius: "0 0 16px 16px",
        py: 1.5,
        fontSize: "1rem",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        transition: "background 0.3s ease",
        "&:hover": { bgcolor: "#E64A19" },
      }}
    >
      <InfoIcon fontSize="medium" />
      تفاصيل المنتج
    </Button>
  </Card>
  
  );
}
