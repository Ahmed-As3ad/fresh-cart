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
  const { loading } = useSelector((state: RootState) => state.cart);

  const { data: product, isLoading } = useQuery({
    queryKey: ["productsDetails", id],
    queryFn: async () => {
      const res = await axios.get(`https://ecommerce.routemisr.com/api/v1/products/${id}`);
      return res.data.data;
    },
    enabled: !!id, // تجنب الاستعلام إذا لم يكن `id` موجودًا
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ["productsRelated", category],
    queryFn: async () => {
      const { data } = await axios.get("https://ecommerce.routemisr.com/api/v1/products");
      return data.data.filter((p: any) => p.category?.name === category);
    },
    enabled: !!category, // تجنب الاستعلام إذا لم يكن `category` موجودًا
  });

  const handleAddToCart = () => {
    if (!product) {
      toast.error("حدث خطأ أثناء إضافة المنتج إلى السلة!");
      return;
    }
    dispatch(addToCart(product));
    toast.success("تمت إضافة المنتج إلى السلة بنجاح!");
  };

  const [currentSlide, setCurrentSlide] = useState(0);
  const handleNext = () => setCurrentSlide((prev) => (prev + 1) % (product?.images?.length || 1));
  const handlePrevious = () => setCurrentSlide((prev) => (prev - 1 + (product?.images?.length || 1)) % (product?.images?.length || 1));

  if (isLoading) return <CircularProgress sx={{ display: "block", margin: "auto", mt: 5 }} />;
  if (!product) return <Alert severity="error" sx={{ mt: 5, textAlign: "center" }}>لم يتم العثور على المنتج!</Alert>;

  return (
    <Box sx={{ bgcolor: "background.paper", pt: 5, pb: 6 }}>
      <ProductContainer>
        <Card sx={{ maxWidth: 450, boxShadow: 6, borderRadius: 4, overflow: "hidden", position: "relative" }}>
          <Box sx={{ position: "relative" }}>
            <CardMedia
              component="img"
              image={product?.images?.[currentSlide] || ""}
              alt={product?.title || "Product image"}
              sx={{ width: "100%", height: 400, objectFit: "cover" }}
            />
            {product?.images?.length > 1 && (
              <>
                <IconButton onClick={handlePrevious} sx={{ position: "absolute", top: "50%", left: "10px", backgroundColor: "rgba(255, 255, 255, 0.7)" }}>
                  <ArrowBackIosIcon sx={{ color: "black" }} />
                </IconButton>
                <IconButton onClick={handleNext} sx={{ position: "absolute", top: "50%", right: "10px", backgroundColor: "rgba(255, 255, 255, 0.7)" }}>
                  <ArrowForwardIosIcon sx={{ color: "black" }} />
                </IconButton>
              </>
            )}
          </Box>
        </Card>

        <Box sx={{ maxWidth: 500, flex: 1 }}>
          <Typography variant="h3" sx={{ fontWeight: "bold" }}>{product?.title}</Typography>
          <Chip label={product?.category?.name || "غير محدد"} color="primary" variant="outlined" sx={{ mb: 2 }} />
          <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.8, mb: 3 }}>{product?.description}</Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "primary.main" }}>{product?.price} EGP</Typography>
            <Rating value={product?.ratingsAverage || 0} precision={0.1} readOnly />
          </Box>
          <Button 
            variant="contained" 
            size="large" 
            fullWidth 
            onClick={handleAddToCart} 
            disabled={loading} 
            sx={{ fontWeight: "bold", position: "relative" }}
          >
            {loading ? <CircularProgress size={24} sx={{ position: "absolute" }} /> : "إضافة إلى السلة"}
          </Button>
        </Box>
      </ProductContainer>

      <Typography variant="h4" sx={{ px: 4, mb: 3, fontWeight: "bold" }}>منتجات ذات صلة</Typography>
      <Grid container spacing={4}>
        {relatedProducts?.map((relatedProduct: any) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={relatedProduct.id}>
            <Card sx={{ borderRadius: 3, boxShadow: 4, transition: "transform 0.3s" }}>
              <Link to={`/productdetails/${relatedProduct.id}/${relatedProduct.category?.name}`} style={{ textDecoration: "none" }}>
                <CardMedia component="img" height="250" image={relatedProduct.imageCover || ""} alt={relatedProduct.title} />
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>{relatedProduct.title}</Typography>
                  <Typography variant="h6" color="primary.main">{relatedProduct.price} EGP</Typography>
                </CardContent>
              </Link>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
