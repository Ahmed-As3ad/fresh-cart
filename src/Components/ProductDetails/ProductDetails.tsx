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
import { AppDispatch, RootState } from "../../libs/store";
import toast from "react-hot-toast";

const ProductContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  [theme.breakpoints.up("md")]: {
    flexDirection: "row",
  },
  gap: theme.spacing(4),
  padding: theme.spacing(4),
}));

export default function ProductDetails() {
  const { id, category } = useParams<{ id: string; category: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.cart);

  const { data: product, isLoading } = useQuery({
    queryKey: ["productsDetails", id],
    queryFn: async () => {
      const res = await axios.get(`https://ecommerce.routemisr.com/api/v1/products/${id}`);
      return res.data.data;
    },
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ["productsRelated", category],
    queryFn: async () => {
      const { data } = await axios.get("https://ecommerce.routemisr.com/api/v1/products");
      return data.data.filter((p: any) => p.category.name === category);
    },
  });

  const handleAddToCart = () => {
    if (id) {
      dispatch(addToCart());
      toast.success("تمت إضافة المنتج إلى السلة بنجاح!");
    } else {
      toast.error("حدث خطأ أثناء إضافة المنتج إلى السلة!");
    }
  };

  const [currentSlide, setCurrentSlide] = useState(0);
  const handleNext = () => setCurrentSlide((prev) => (prev + 1) % (product?.images.length || 1));
  const handlePrevious = () => setCurrentSlide((prev) => (prev - 1 + (product?.images.length || 1)) % (product?.images.length || 1));

  if (isLoading) return <CircularProgress />;
  if (!product) return <Alert severity="error">لم يتم العثور على المنتج!</Alert>;

  return (
    <Box sx={{ bgcolor: "background.paper", pt: 5, pb: 6 }}>
      <ProductContainer>
        <Card sx={{ maxWidth: 450, boxShadow: 6, borderRadius: 4, overflow: "hidden", position: "relative" }}>
          <Box sx={{ position: "relative" }}>
            <CardMedia
              component="img"
              image={product.images[currentSlide] || ""}
              alt={product.title || "Product image"}
              sx={{ width: "100%", height: 400, objectFit: "cover" }}
            />
            <IconButton onClick={handlePrevious} sx={{ position: "absolute", top: "50%", left: "10px", backgroundColor: "rgba(255, 255, 255, 0.7)" }}>
              <ArrowBackIosIcon sx={{ color: "black" }} />
            </IconButton>
            <IconButton onClick={handleNext} sx={{ position: "absolute", top: "50%", right: "10px", backgroundColor: "rgba(255, 255, 255, 0.7)" }}>
              <ArrowForwardIosIcon sx={{ color: "black" }} />
            </IconButton>
          </Box>
        </Card>

        <Box sx={{ maxWidth: 500, flex: 1 }}>
          <Typography variant="h3" sx={{ fontWeight: "bold" }}>{product.title}</Typography>
          <Chip label={product.category.name} color="primary" variant="outlined" sx={{ mb: 2 }} />
          <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, mb: 3 }}>{product.description}</Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "primary.main" }}>{product.price} EGP</Typography>
            <Rating value={product.ratingsAverage || 0} precision={0.1} readOnly />
          </Box>
          <Button variant="contained" size="large" fullWidth onClick={handleAddToCart} disabled={loading} sx={{ fontWeight: "bold" }}>
            {loading ? <CircularProgress size={20} /> : "Add to Cart"}
          </Button>
        </Box>
      </ProductContainer>

      <Typography variant="h4" sx={{ px: 4, mb: 3, fontWeight: "bold" }}>Related Products</Typography>
      <Grid container spacing={4}>
        {relatedProducts?.map((product: any) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 4, transition: "transform 0.3s" }}>
              <Link to={`/productdetails/${product.id}/${product.category.name}`} style={{ textDecoration: "none" }}>
                <CardMedia component="img" height="250" image={product.imageCover || ""} alt={product.title} />
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>{product.title}</Typography>
                  <Typography variant="h6" color="primary.main">{product.price} EGP</Typography>
                </CardContent>
              </Link>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}