import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../libs/Cart/cartSlice";
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
} from "@mui/material";
import { styled } from "@mui/system";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import CardMedia from '@mui/material/CardMedia';
import { AppDispatch, RootState } from "../../libs/store";

const ProductContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  [theme.breakpoints.up("md")]: {
    flexDirection: "row",
  },
  gap: theme.spacing(4),
  padding: theme.spacing(4),
}));

const ProductImage = styled(CardMedia)({
  height: 400,
  objectFit: "contain",
});

const RelatedProductsGrid = styled(Grid)(({ theme }) => ({
  padding: theme.spacing(4),
}));

export default function ProductDetails() {
  const { id, category } = useParams<{ id: string; category: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.cart);

  const { data: product } = useQuery({
    queryKey: ["productsDetails", id],
    queryFn: () =>
      axios.get(`https://ecommerce.routemisr.com/api/v1/products/${id}`),
    select: (res) => res.data.data,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ["productsRelated", category],
    queryFn: async () => {
      const { data } = await axios.get(
        "https://ecommerce.routemisr.com/api/v1/products"
      );
      return data.data.filter((p: any) => p.category.name === category);
    },
  });

  const handleAddToCart = () => {
    if (id) {
      dispatch(addToCart());
    }
  };

  const [currentSlide, setCurrentSlide] = useState(0);
  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % product.images.length);
  };

  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  if (!product) return <CircularProgress />;

  return (
    <Box sx={{ bgcolor: "background.paper", pt: 5, pb: 6 }}>
    <ProductContainer sx={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 6 }}>
      <Card sx={{ maxWidth: 450, boxShadow: 6, borderRadius: 4, overflow: "hidden", position: "relative" }}>
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            image={product?.images?.[currentSlide] || ""}
            alt={product?.title || "Product image"}
            sx={{
              width: "100%",
              height: 400,
              objectFit: "cover",
              transition: "transform 0.3s ease-in-out",
            }}
          />
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: "absolute",
              top: "50%",
              left: "10px",
              transform: "translateY(-50%)",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              zIndex: 1,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              },
            }}
          >
            <ArrowBackIosIcon sx={{ color: "black" }} />
          </IconButton>
  
          <IconButton
            onClick={handleNext}
            sx={{
              position: "absolute",
              top: "50%",
              right: "10px",
              transform: "translateY(-50%)",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              zIndex: 1,
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              },
            }}
          >
            <ArrowForwardIosIcon sx={{ color: "black" }} />
          </IconButton>
        </Box>
      </Card>
  
      <Box sx={{ maxWidth: 500, flex: 1 }}>
        <Typography variant="h3" sx={{ fontWeight: "bold", color: "text.primary", mb: 3 }}>
          {product?.title || "Unknown Product"}
        </Typography>
  
        <Chip
          label={product?.category?.name || "Unknown Category"}
          color="primary"
          variant="outlined"
          sx={{
            mb: 2,
            borderRadius: 2,
            fontWeight: "bold",
            fontSize: "1.1rem",
            letterSpacing: 1.2,
            paddingX: 2,
            paddingY: 0.5,
          }}
        />
  
        <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, mb: 3 }}>
          {product?.description || "No description available"}
        </Typography>
  
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", color: "primary.main" }}>
            {product?.price ? `${product.price} EGP` : "Price not available"}
          </Typography>
          <Box display="flex" alignItems="center">
            <Rating value={product?.ratingsAverage || 0} precision={0.1} readOnly sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              ({product?.ratingsAverage || "0"})
            </Typography>
          </Box>
        </Box>
  
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={handleAddToCart}
          disabled={loading}
          sx={{
            bgcolor: "primary.main",
            "&:hover": {
              bgcolor: "primary.dark",
            },
            fontWeight: "bold",
            borderRadius: 2,
            py: 1.5,
            boxShadow: 3,
            transition: "all 0.3s ease",
          }}
        >
          {loading ? (
            <Typography variant="h6">
              adding <CircularProgress size={20} />{" "}
            </Typography>
          ) : (
            "Add to Cart"
          )}
        </Button>
  
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </Box>
    </ProductContainer>
  
    <Typography variant="h4" sx={{ px: 4, mb: 3, fontWeight: "bold", color: "text.primary" }}>
      Related Products
    </Typography>
  
    <Grid container spacing={4}>
      {relatedProducts?.map((product: any) => (
        <RelatedProductsGrid item xs={12} sm={6} md={4} lg={3} key={product?.id || Math.random()}>
          <Card
            sx={{
              position: "relative",
              height: "100%",
              borderRadius: 3,
              boxShadow: 4,
              overflow: "hidden",
              transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                boxShadow: 6,
              },
            }}
          >
            <Link to={`/productdetails/${product?.id || "unknown"}/${product?.category?.name || "uncategorized"}`} style={{ textDecoration: "none" }}>
              <CardMedia
                component="img"
                height="250"
                image={product?.imageCover || ""}
                alt={product?.title || "Product image"}
                sx={{
                  objectFit: "cover",
                }}
              />
              <CardContent sx={{ padding: 2, backgroundColor: "background.default" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "text.primary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {product?.title || "Unknown title"}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {product?.category?.name || "Unknown Category"}
                </Typography>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: "bold" }}>
                  {product?.price ? `${product.price} EGP` : "Price not available"}
                </Typography>
              </CardContent>
            </Link>
          </Card>
        </RelatedProductsGrid>
      ))}
    </Grid>
  </Box>
  );
}
