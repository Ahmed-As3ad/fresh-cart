import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCartAction  } from "../../libs/Cart/cartSlice";
import {
  Box,
  Button,
  Typography,
  Chip,
  Rating,
  Card,
  CardMedia,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Container,
} from "@mui/material";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import toast from "react-hot-toast";
import { AppDispatch, RootState } from "../../libs/store";

const arrowButtonStyle = (position: { left?: number; right?: number }) => ({
  position: "absolute",
  top: "50%",
  transform: "translateY(-50%)",
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  color: "white",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  ...position,
});

interface ProductCategory {
  name?: string;
}

interface Product {
  id: string;
  title: string;
  category?: ProductCategory;
  imageCover: string;
  price: number;
  description?: string;
  ratingsAverage?: number;
  images?: string[];
}

interface ApiResponse {
  data: Product;
}

export default function ProductDetails() {
  const { id, category } = useParams<{ id?: string; category?: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.cart);
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["productsDetails", id],
    queryFn: async () => {
      const res = await axios.get<ApiResponse>(
        `https://ecommerce.routemisr.com/api/v1/products/${id}`
      );
      return res.data.data;
    },
    enabled: !!id,
  });

  const { data: relatedProducts } = useQuery<Product[]>({
    queryKey: ["productsRelated", category],
    queryFn: async () => {
      const { data } = await axios.get<{ data: Product[] }>(
        "https://ecommerce.routemisr.com/api/v1/products"
      );
      return data.data.filter((p) => p.category?.name === category);
    },
    enabled: !!category,
  });

  const handleAddToCart = async () => {
    if (!product) {
      toast.error("حدث خطأ أثناء إضافة المنتج إلى السلة!");
      return;
    }
  
    try {
      await dispatch(addToCartAction(product.id)).unwrap();
    } catch {
//
    }
  };
  const handleNext = () => {
    const imagesLength = product?.images?.length || 1;
    setCurrentSlide((prev) => (prev + 1) % imagesLength);
  };

  const handlePrevious = () => {
    const imagesLength = product?.images?.length || 1;
    setCurrentSlide((prev) => (prev - 1 + imagesLength) % imagesLength);
  };

  if (isLoading)
    return <CircularProgress sx={{ display: "block", margin: "auto", mt: 5 }} />;
  if (!product)
    return (
      <Alert severity="error" sx={{ mt: 5, textAlign: "center" }}>
        لم يتم العثور على المنتج!
      </Alert>
    );

  return (
    <Container sx={{ pt: 5, pb: 6 }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          alignItems: "center",
          justifyContent: "center",
          p: 4,
        }}
      >
        <Card sx={{ maxWidth: 450, boxShadow: 4, borderRadius: 3, overflow: "hidden" }}>
          <Box sx={{ position: "relative", bgcolor: "#f8f9fa" }}>
            <CardMedia
              component="img"
              image={product.images?.[currentSlide] || ""}
              alt={product.title}
              sx={{
                width: "100%",
                height: 400,
                objectFit: "cover",
                transition: "opacity 0.3s",
                "&:hover": { opacity: 0.9 },
              }}
            />
            {(product.images?.length || 0) > 1 && (
              <>
                <IconButton onClick={handlePrevious} sx={arrowButtonStyle({ left: 10 })}>
                  <ArrowBackIosIcon />
                </IconButton>
                <IconButton onClick={handleNext} sx={arrowButtonStyle({ right: 10 })}>
                  <ArrowForwardIosIcon />
                </IconButton>
              </>
            )}
          </Box>
        </Card>

        <Box
          sx={{
            maxWidth: 450,
            textAlign: "start",
            p: 3,
            bgcolor: "#ffffff",
            borderRadius: 3,
            boxShadow: 3,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#2c3e50", mb: 1 }}>
            {product.title}
          </Typography>
          <Chip
            label={product.category?.name || "غير محدد"}
            color="primary"
            sx={{ my: 1, fontSize: "1rem", bgcolor: "#3498db", color: "white" }}
          />
          <Typography variant="body1" sx={{ mb: 2, color: "#7f8c8d", lineHeight: 1.8 }}>
            {product.description || "لا يوجد وصف"}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "#e74c3c", mb: 1 }}>
            {product.price} EGP
          </Typography>
          <Rating
            value={product.ratingsAverage || 0}
            precision={0.1}
            readOnly
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleAddToCart}
            disabled={loading}
            sx={{
              fontWeight: "bold",
              bgcolor: "#e74c3c",
              color: "white",
              py: 1.5,
              fontSize: "1.1rem",
              transition: "background 0.3s",
              "&:hover": { bgcolor: "#c0392b" },
              position: "relative",
            }}
            startIcon={<ShoppingCartIcon />}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ position: "absolute" }} />
            ) : (
              "إضافة إلى السلة"
            )}
          </Button>
        </Box>
      </Box>

      <Typography
        variant="h4"
        sx={{ my: 4, textAlign: "center", fontWeight: "bold", color: "#2c3e50" }}
      >
        منتجات ذات صلة
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {relatedProducts?.map((relatedProduct) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={relatedProduct.id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 4,
                overflow: "hidden",
                transition: "transform 0.3s, box-shadow 0.3s",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "8px 8px 20px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              <Link
                to={`/productdetails/${relatedProduct.id}/${
                  relatedProduct.category?.name ?? "uncategorized"
                }`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <CardMedia
                  component="img"
                  height="250"
                  image={relatedProduct.imageCover || ""}
                  alt={relatedProduct.title}
                  sx={{
                    transition: "opacity 0.3s",
                    "&:hover": { opacity: 0.85 },
                  }}
                />
                <CardContent sx={{ textAlign: "center", bgcolor: "#f8f9fa" }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#2c3e50" }}
                  >
                    {relatedProduct.title.split(" ").slice(0, 3).join(" ")}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="#e74c3c"
                    sx={{ fontWeight: "bold", mt: 1 }}
                  >
                    {relatedProduct.price} EGP
                  </Typography>
                </CardContent>
              </Link>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}